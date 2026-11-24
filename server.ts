import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import {
  DEFAULT_SITE_CONFIG,
  sanitizeExternalUrl,
  sanitizeMediaUrl,
  type SiteConfig,
} from './src/data/gamingData.ts';

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const ROOT_DIR = process.cwd();
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const CONFIG_FILE = path.resolve(DATA_DIR, 'site-config.json');
const ADMIN_AUTH_FILE = path.resolve(DATA_DIR, 'admin-auth.json');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Keep session signing secret strictly in server process memory / env
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'monarch@admin.app').trim().toLowerCase();

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

const MAX_UPLOAD_BYTES = 30 * 1024 * 1024; // 30MB

interface StoredAdminAuth {
  email: string;
  salt: string;
  passwordHash: string;
  claimedAt: string;
}

function safeEqualText(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function readStoredAdminAuth(): StoredAdminAuth | null {
  try {
    if (!fs.existsSync(ADMIN_AUTH_FILE)) return null;
    const raw = fs.readFileSync(ADMIN_AUTH_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as StoredAdminAuth;
    if (parsed && parsed.email && parsed.salt && parsed.passwordHash) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function getEnvAdminCredentials(): { email: string; password: string } | null {
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!envPassword) return null;
  return {
    email: DEFAULT_ADMIN_EMAIL,
    password: envPassword,
  };
}

function getAuthState(): { needsSetup: boolean; configuredEmail: string } {
  const envCreds = getEnvAdminCredentials();
  if (envCreds) {
    return { needsSetup: false, configuredEmail: envCreds.email };
  }
  const stored = readStoredAdminAuth();
  if (stored) {
    return { needsSetup: false, configuredEmail: stored.email };
  }
  return { needsSetup: true, configuredEmail: DEFAULT_ADMIN_EMAIL };
}

function signSessionToken(email: string): string {
  const payload = {
    email,
    exp: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sigB64 = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${sigB64}`;
}

function verifySessionToken(token: string): { email: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  if (!safeEqualText(sigB64, expectedSig)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as {
      email?: string;
      exp?: number;
    };
    if (!decoded.email || typeof decoded.exp !== 'number' || Date.now() > decoded.exp) {
      return null;
    }
    return { email: decoded.email };
  } catch {
    return null;
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  const verified = verifySessionToken(token);
  if (!verified) {
    res.status(401).json({ error: 'Invalid or expired admin session' });
    return;
  }
  next();
}

function readSiteConfig(): SiteConfig {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_SITE_CONFIG, null, 2), 'utf-8');
      return structuredClone(DEFAULT_SITE_CONFIG);
    }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    return normalizeConfig(parsed);
  } catch {
    return structuredClone(DEFAULT_SITE_CONFIG);
  }
}

function normalizeConfig(input: Partial<SiteConfig>): SiteConfig {
  const d = DEFAULT_SITE_CONFIG;
  const stats = Array.isArray(input.stats) && input.stats.length > 0 ? input.stats : d.stats;
  const featuredGames = (
    Array.isArray(input.featuredGames) ? input.featuredGames : d.featuredGames
  ).map((g, idx) => {
    const photos = Array.isArray(g.photos)
      ? g.photos.map((u) => sanitizeMediaUrl(u)).filter((u): u is string => Boolean(u)).slice(0, 20)
      : g.mediaUrl && g.mediaType !== 'video' && sanitizeMediaUrl(g.mediaUrl)
        ? [sanitizeMediaUrl(g.mediaUrl)!]
        : [];
    const videos = Array.isArray(g.videos)
      ? g.videos.map((u) => sanitizeMediaUrl(u)).filter((u): u is string => Boolean(u)).slice(0, 10)
      : g.mediaUrl && g.mediaType === 'video' && sanitizeMediaUrl(g.mediaUrl)
        ? [sanitizeMediaUrl(g.mediaUrl)!]
        : [];
    const primaryMedia = sanitizeMediaUrl(g.mediaUrl) ?? videos[0] ?? photos[0];
    const primaryType =
      g.mediaType === 'video' || (!g.mediaUrl && videos.length > 0)
        ? ('video' as const)
        : primaryMedia
          ? ('image' as const)
          : undefined;

    return {
      id: String(g.id || `game-${idx + 1}`).slice(0, 60),
      title: String(g.title || 'UNTITLED PROFILE').slice(0, 80),
      genre: String(g.genre || 'Esports').slice(0, 50),
      mode: String(g.mode || 'Mobile').slice(0, 50),
      playersBadge: String(g.playersBadge || '').slice(0, 40),
      prizePool: String(g.prizePool || '$1,000').slice(0, 30),
      nextMatchIn: String(g.nextMatchIn || '05m 00s').slice(0, 30),
      activeRooms: Number.isFinite(Number(g.activeRooms)) ? Math.max(0, Number(g.activeRooms)) : 0,
      description: String(g.description || '').slice(0, 500),
      status: g.status === 'pending' ? ('pending' as const) : ('active' as const),
      photos,
      videos,
      mediaUrl: primaryMedia,
      mediaType: primaryType,
      tournaments: Array.isArray(g.tournaments)
        ? g.tournaments.slice(0, 10).map((t) => ({
            name: String(t.name || 'Open Bracket').slice(0, 80),
            format: String(t.format || 'Squad').slice(0, 60),
            entry: String(t.entry || 'Free Entry').slice(0, 40),
            prize: String(t.prize || '$500').slice(0, 30),
            slots: String(t.slots || '0 / 32').slice(0, 30),
          }))
        : [],
    };
  });

  const leaderboard = (
    Array.isArray(input.leaderboard) ? input.leaderboard : d.leaderboard
  ).map((p, idx) => {
    const numeric = Number.isFinite(Number(p.pointsNumeric))
      ? Math.max(0, Math.round(Number(p.pointsNumeric)))
      : 0;
    return {
      rank: idx + 1,
      name: String(p.name || `Player_${idx + 1}`).slice(0, 40),
      points: `${numeric.toLocaleString('en-US')} PTS`,
      pointsNumeric: numeric,
      winRate: Number.isFinite(Number(p.winRate))
        ? Math.min(100, Math.max(0, Math.round(Number(p.winRate))))
        : 50,
      primaryGame: String(p.primaryGame || 'free-fire').slice(0, 60),
      region: String(p.region || 'GLOBAL').slice(0, 20),
      matches: Number.isFinite(Number(p.matches)) ? Math.max(0, Math.round(Number(p.matches))) : 0,
      bio: p.bio ? String(p.bio).slice(0, 300) : '',
      mediaUrl: sanitizeMediaUrl(p.mediaUrl),
      mediaType: p.mediaType === 'video' ? ('video' as const) : p.mediaType === 'image' ? ('image' as const) : undefined,
    };
  });

  const socialLinksMap = new Map(
    (Array.isArray(input.socialLinks) ? input.socialLinks : d.socialLinks).map((item) => [
      item.id,
      item,
    ])
  );

  const socialLinks = d.socialLinks.map((base) => {
    const incoming = socialLinksMap.get(base.id);
    if (!incoming) return base;
    const rawUrl = typeof incoming.url === 'string' ? incoming.url.trim() : '';
    const safeUrl = rawUrl ? sanitizeExternalUrl(rawUrl) ?? '' : '';
    return {
      id: base.id,
      label: String(incoming.label || base.label).slice(0, 40),
      url: safeUrl,
      enabled: typeof incoming.enabled === 'boolean' ? incoming.enabled : true,
    };
  });

  return {
    brand: {
      topName: String(input.brand?.topName ?? d.brand.topName).slice(0, 30),
      bottomName: String(input.brand?.bottomName ?? d.brand.bottomName).slice(0, 30),
      domainSuffix: String(input.brand?.domainSuffix ?? d.brand.domainSuffix).slice(0, 20),
      profileUrl:
        input.brand?.profileUrl !== undefined
          ? sanitizeExternalUrl(input.brand.profileUrl) ?? ''
          : d.brand.profileUrl,
    },
    hero: {
      headline: String(input.hero?.headline ?? d.hero.headline).slice(0, 60),
      subtitle: String(input.hero?.subtitle ?? d.hero.subtitle).slice(0, 60),
      description: String(input.hero?.description ?? d.hero.description).slice(0, 400),
      primaryCtaText: String(input.hero?.primaryCtaText ?? d.hero.primaryCtaText).slice(0, 40),
      secondaryCtaText: String(input.hero?.secondaryCtaText ?? d.hero.secondaryCtaText).slice(0, 40),
      downloadUrl:
        input.hero?.downloadUrl !== undefined
          ? sanitizeExternalUrl(input.hero.downloadUrl) ?? ''
          : d.hero.downloadUrl,
      androidVersion: String(input.hero?.androidVersion ?? d.hero.androidVersion).slice(0, 60),
      androidSize: String(input.hero?.androidSize ?? d.hero.androidSize).slice(0, 60),
      iosLabel: String(input.hero?.iosLabel ?? d.hero.iosLabel).slice(0, 60),
      iosSize: String(input.hero?.iosSize ?? d.hero.iosSize).slice(0, 60),
    },
    stats: stats.slice(0, 3).map((s, idx) => ({
      id: String(s.id || `stat-${idx}`).slice(0, 30),
      value: String(s.value || '0').slice(0, 20),
      label: String(s.label || 'Metric').slice(0, 30),
      badge: String(s.badge || 'Active').slice(0, 30),
      icon:
        s.icon === 'tournaments' || s.icon === 'support' || s.icon === 'players'
          ? s.icon
          : 'players',
    })),
    featuredGamesTitle: String(input.featuredGamesTitle ?? d.featuredGamesTitle).slice(0, 60),
    featuredGames,
    about: {
      enabled: typeof input.about?.enabled === 'boolean' ? input.about.enabled : d.about.enabled,
      title: String(input.about?.title ?? d.about.title).slice(0, 80),
      subtitle: String(input.about?.subtitle ?? d.about.subtitle).slice(0, 120),
      body: String(input.about?.body ?? d.about.body).slice(0, 3000),
    },
    leaderboardTitle: String(input.leaderboardTitle ?? d.leaderboardTitle).slice(0, 60),
    leaderboardSubtitle: String(input.leaderboardSubtitle ?? d.leaderboardSubtitle).slice(0, 120),
    leaderboardCtaText: String(input.leaderboardCtaText ?? d.leaderboardCtaText).slice(0, 50),
    leaderboard,
    footer: {
      copyright: String(input.footer?.copyright ?? d.footer.copyright).slice(0, 140),
      followHeading: String(input.footer?.followHeading ?? d.footer.followHeading).slice(0, 40),
    },
    socialLinks,
    updatedAt: new Date().toISOString(),
  };
}

function writeSiteConfig(config: SiteConfig): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '45mb' }));

  // Public site configuration
  app.get('/api/config', (_req, res) => {
    res.json(readSiteConfig());
  });

  // Safe uploaded media streaming (supports Range headers for <video>)
  app.get('/api/media/:filename', (req, res) => {
    const filename = String(req.params.filename || '');
    if (!/^[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|webm|mov)$/i.test(filename)) {
      res.status(400).json({ error: 'Invalid media identifier' });
      return;
    }

    const resolved = path.resolve(UPLOADS_DIR, filename);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(resolved)) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(resolved);
  });

  // Admin Auth Status (checks if initial claim is required)
  app.get('/api/admin/auth-status', (req, res) => {
    const state = getAuthState();
    let authenticated = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authenticated = Boolean(verifySessionToken(authHeader.slice('Bearer '.length).trim()));
    }
    res.json({
      needsSetup: state.needsSetup,
      configuredEmail: state.configuredEmail,
      authenticated,
    });
  });

  // One-time Admin Setup / Claim when env password is not configured yet
  app.post('/api/admin/claim', (req, res) => {
    const state = getAuthState();
    if (!state.needsSetup) {
      res.status(403).json({ error: 'Admin access has already been configured.' });
      return;
    }

    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Please enter a valid admin email address.' });
      return;
    }
    if (email !== DEFAULT_ADMIN_EMAIL) {
      res.status(403).json({ error: `Admin setup is restricted to ${DEFAULT_ADMIN_EMAIL}.` });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters.' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const record: StoredAdminAuth = {
      email,
      salt,
      passwordHash,
      claimedAt: new Date().toISOString(),
    };
    fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(record, null, 2), 'utf-8');

    const token = signSessionToken(email);
    res.json({ token, email });
  });

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const state = getAuthState();
    if (state.needsSetup) {
      res.status(409).json({ error: 'Initial admin setup is required first.', needsSetup: true });
      return;
    }

    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const envCreds = getEnvAdminCredentials();
    if (envCreds) {
      const emailOk = safeEqualText(email, envCreds.email);
      const passOk = safeEqualText(password, envCreds.password);
      if (!emailOk || !passOk) {
        res.status(401).json({ error: 'Invalid admin email or password.' });
        return;
      }
      res.json({ token: signSessionToken(envCreds.email), email: envCreds.email });
      return;
    }

    const stored = readStoredAdminAuth();
    if (!stored || !safeEqualText(email, stored.email)) {
      res.status(401).json({ error: 'Invalid admin email or password.' });
      return;
    }

    const candidateHash = crypto.scryptSync(password, stored.salt, 64);
    const storedHashBuf = Buffer.from(stored.passwordHash, 'hex');
    if (
      candidateHash.length !== storedHashBuf.length ||
      !crypto.timingSafeEqual(candidateHash, storedHashBuf)
    ) {
      res.status(401).json({ error: 'Invalid admin email or password.' });
      return;
    }

    res.json({ token: signSessionToken(stored.email), email: stored.email });
  });

  // Protected: Update full site config (hero, stats, games, leaderboard, social links)
  app.put('/api/admin/config', requireAdminAuth, (req, res) => {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ error: 'Invalid configuration payload.' });
      return;
    }

    // Explicitly validate any provided social link URLs before normalizing
    if (Array.isArray(req.body.socialLinks)) {
      for (const link of req.body.socialLinks) {
        const raw = typeof link?.url === 'string' ? link.url.trim() : '';
        if (raw && !sanitizeExternalUrl(raw)) {
          res.status(400).json({
            error: `Social link for "${String(link?.label || link?.id || 'channel')}" must start with http:// or https://`,
          });
          return;
        }
      }
    }

    const normalized = normalizeConfig(req.body as Partial<SiteConfig>);
    writeSiteConfig(normalized);
    res.json(normalized);
  });

  // Protected: Reset site config to defaults
  app.post('/api/admin/reset', requireAdminAuth, (_req, res) => {
    const fresh = structuredClone(DEFAULT_SITE_CONFIG);
    fresh.updatedAt = new Date().toISOString();
    writeSiteConfig(fresh);
    res.json(fresh);
  });

  // Protected: Upload photo or video for profile cards & game cards
  app.post('/api/admin/upload', requireAdminAuth, (req, res) => {
    const mimeType = String(req.body?.mimeType || '').toLowerCase().trim();
    const dataBase64 = String(req.body?.dataBase64 || '');

    const ext = ALLOWED_MIME_TO_EXT[mimeType];
    if (!ext) {
      res.status(400).json({
        error: 'Unsupported file type. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV.',
      });
      return;
    }

    if (!dataBase64) {
      res.status(400).json({ error: 'Missing media payload.' });
      return;
    }

    // Strip optional data URL prefix if sent
    const commaIdx = dataBase64.indexOf(',');
    const cleanB64 = commaIdx !== -1 ? dataBase64.slice(commaIdx + 1) : dataBase64;
    const buffer = Buffer.from(cleanB64, 'base64');

    if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
      res.status(400).json({ error: 'Media file must be between 1 byte and 30 MB.' });
      return;
    }

    const safeFilename = `${crypto.randomUUID()}${ext}`;
    const resolved = path.resolve(UPLOADS_DIR, safeFilename);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid upload path.' });
      return;
    }

    fs.writeFileSync(resolved, buffer);
    const mediaType = mimeType.startsWith('video/') ? 'video' : 'image';

    res.json({
      mediaUrl: `/api/media/${safeFilename}`,
      mediaType,
      bytes: buffer.length,
    });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Monarch Gaming server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
