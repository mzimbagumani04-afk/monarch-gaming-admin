import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  ImagePlus,
  LayoutDashboard,
  Lock,
  LogOut,
  Plus,
  Save,
  Share2,
  ShieldCheck,
  UserCheck,
  Video,
  X,
} from 'lucide-react';
import {
  sanitizeExternalUrl,
  type FeaturedGame,
  type MediaType,
  type SiteConfig,
} from '../data/gamingData';
import {
  GameThumbnailArt,
  MonarchCrownLogo,
  SocialGlyph,
} from './GameArtwork';

type BottomTab = 'about' | 'social';

interface AdminDashboardProps {
  config: SiteConfig;
  onConfigUpdated: (nextConfig: SiteConfig) => void;
  onExit: () => void;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(file);
  });
}

function getGamePhotos(game: FeaturedGame): string[] {
  if (Array.isArray(game.photos) && game.photos.length > 0) {
    return game.photos;
  }
  if (game.mediaUrl && game.mediaType !== 'video') {
    return [game.mediaUrl];
  }
  return [];
}

function getGameVideos(game: FeaturedGame): string[] {
  if (Array.isArray(game.videos) && game.videos.length > 0) {
    return game.videos;
  }
  if (game.mediaUrl && game.mediaType === 'video') {
    return [game.mediaUrl];
  }
  return [];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  config,
  onConfigUpdated,
  onExit,
}) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('monarch@admin.app');
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const [emailInput, setEmailInput] = useState('monarch@admin.app');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [bottomTab, setBottomTab] = useState<BottomTab>('about');
  const [draft, setDraft] = useState<SiteConfig>(() => structuredClone(config));
  const [cardsDirty, setCardsDirty] = useState(false);
  const [aboutDirty, setAboutDirty] = useState(false);
  const [socialDirty, setSocialDirty] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/auth-status')
      .then((res) => res.json())
      .then((data: { needsSetup?: boolean; configuredEmail?: string }) => {
        if (!active) return;
        setNeedsSetup(Boolean(data.needsSetup));
        if (data.configuredEmail) {
          setEmailInput(data.configuredEmail);
        }
      })
      .catch(() => {
        if (active) setAuthError('Unable to reach server authentication status.');
      })
      .finally(() => {
        if (active) setCheckingAuth(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!cardsDirty && !aboutDirty && !socialDirty) {
      setDraft(structuredClone(config));
    }
  }, [config, cardsDirty, aboutDirty, socialDirty]);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (needsSetup && passwordInput !== confirmPasswordInput) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const endpoint = needsSetup ? '/api/admin/claim' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput,
        }),
      });
      const data = (await res.json()) as { token?: string; email?: string; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }

      setAuthToken(data.token);
      setAdminEmail(data.email || emailInput.trim());
      setNeedsSetup(false);
      setPasswordInput('');
      setConfirmPasswordInput('');
    } catch {
      setAuthError('Network error while contacting admin server.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const persistConfig = async (
    nextConfig: SiteConfig,
    section: 'cards' | 'about' | 'social' | 'all',
    successMessage: string
  ): Promise<boolean> => {
    if (!authToken) return false;
    setSavingSection(section);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(nextConfig),
      });
      const data = (await res.json()) as SiteConfig & { error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          setAuthToken(null);
          setAuthError('Session expired. Please sign in again.');
        } else {
          showStatus('error', data.error || 'Failed to save changes.');
        }
        return false;
      }

      setDraft(structuredClone(data));
      onConfigUpdated(data);
      if (section === 'cards' || section === 'all') setCardsDirty(false);
      if (section === 'about' || section === 'all') setAboutDirty(false);
      if (section === 'social' || section === 'all') setSocialDirty(false);
      showStatus('success', successMessage);
      return true;
    } catch {
      showStatus('error', 'Unable to save configuration.');
      return false;
    } finally {
      setSavingSection(null);
    }
  };

  const handleBatchUpload = async (
    files: FileList | null,
    gameIndex: number,
    kind: MediaType
  ) => {
    if (!files || files.length === 0 || !authToken) return;

    const allowedList = kind === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    const validFiles = Array.from(files).filter((file) => {
      if (!allowedList.includes(file.type.toLowerCase())) {
        showStatus(
          'error',
          kind === 'image'
            ? `Skipped "${file.name}". Allowed photo formats: JPG, PNG, WEBP, GIF.`
            : `Skipped "${file.name}". Allowed video formats: MP4, WEBM, MOV.`
        );
        return false;
      }
      if (file.size > 30 * 1024 * 1024) {
        showStatus('error', `Skipped "${file.name}" (exceeds 30 MB limit).`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const uploadKey = `${kind}-${gameIndex}`;
    setUploadingKey(uploadKey);

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        const dataBase64 = await readFileAsBase64(file);
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            mimeType: file.type,
            dataBase64,
          }),
        });
        const data = (await res.json()) as {
          mediaUrl?: string;
          mediaType?: MediaType;
          error?: string;
        };

        if (!res.ok || !data.mediaUrl) {
          if (res.status === 401) {
            setAuthToken(null);
            setAuthError('Session expired. Please sign in again.');
            return;
          }
          showStatus('error', data.error || `Failed to upload ${file.name}.`);
          continue;
        }

        uploadedUrls.push(data.mediaUrl);
      }

      if (uploadedUrls.length === 0) return;

      const nextDraft = structuredClone(draft);
      const targetGame = nextDraft.featuredGames[gameIndex];
      if (!targetGame) return;

      const currentPhotos = getGamePhotos(targetGame);
      const currentVideos = getGameVideos(targetGame);

      if (kind === 'image') {
        targetGame.photos = [...currentPhotos, ...uploadedUrls].slice(0, 20);
        targetGame.videos = currentVideos;
      } else {
        targetGame.photos = currentPhotos;
        targetGame.videos = [...currentVideos, ...uploadedUrls].slice(0, 10);
      }

      // Feature the newly uploaded asset immediately on the card
      targetGame.mediaUrl = uploadedUrls[0];
      targetGame.mediaType = kind;

      await persistConfig(
        nextDraft,
        'cards',
        `${uploadedUrls.length} ${kind === 'image' ? 'photo' : 'video'}${uploadedUrls.length > 1 ? 's' : ''} uploaded & published to ${targetGame.title}.`
      );
    } catch {
      showStatus('error', 'Upload failed due to a network error.');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSetPrimaryMedia = async (
    gameIndex: number,
    mediaUrl: string,
    mediaType: MediaType
  ) => {
    const nextDraft = structuredClone(draft);
    const target = nextDraft.featuredGames[gameIndex];
    if (!target) return;
    target.mediaUrl = mediaUrl;
    target.mediaType = mediaType;
    await persistConfig(
      nextDraft,
      'cards',
      `Updated featured ${mediaType} on ${target.title}.`
    );
  };

  const handleRemoveMediaItem = async (
    gameIndex: number,
    mediaUrl: string,
    mediaType: MediaType
  ) => {
    const nextDraft = structuredClone(draft);
    const target = nextDraft.featuredGames[gameIndex];
    if (!target) return;

    const nextPhotos = getGamePhotos(target).filter(
      (url) => !(mediaType === 'image' && url === mediaUrl)
    );
    const nextVideos = getGameVideos(target).filter(
      (url) => !(mediaType === 'video' && url === mediaUrl)
    );

    target.photos = nextPhotos;
    target.videos = nextVideos;

    if (target.mediaUrl === mediaUrl) {
      if (nextVideos[0]) {
        target.mediaUrl = nextVideos[0];
        target.mediaType = 'video';
      } else if (nextPhotos[0]) {
        target.mediaUrl = nextPhotos[0];
        target.mediaType = 'image';
      } else {
        target.mediaUrl = undefined;
        target.mediaType = undefined;
      }
    }

    await persistConfig(
      nextDraft,
      'cards',
      `Removed ${mediaType} from ${target.title}.`
    );
  };

  const handleToggleCardStatus = async (gameIndex: number) => {
    const nextDraft = structuredClone(draft);
    const target = nextDraft.featuredGames[gameIndex];
    if (!target) return;
    target.status = target.status === 'pending' ? 'active' : 'pending';
    await persistConfig(
      nextDraft,
      'cards',
      `${target.title} marked as ${target.status === 'active' ? 'Active' : 'Pending'}.`
    );
  };

  const handleSaveSocialLinks = async () => {
    for (const link of draft.socialLinks) {
      const trimmed = link.url.trim();
      if (trimmed && !sanitizeExternalUrl(trimmed)) {
        showStatus(
          'error',
          `${link.label} URL must start with https:// or http://`
        );
        return;
      }
    }
    await persistConfig(draft, 'social', 'Social links saved and published.');
  };

  const scrollToSection = (id: string, tab?: BottomTab) => {
    if (tab) {
      setBottomTab(tab);
    }
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  };

  // Auth Gate Screen
  if (!authToken) {
    return (
      <div className="min-h-screen w-full bg-[#090B15] text-white cosmic-particles flex flex-col">
        <header className="h-16 px-4 sm:px-6 border-b border-white/[0.08] bg-[#0D101D]/90 backdrop-blur-md flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="min-h-[40px] px-3 rounded-xl border border-white/15 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main App</span>
          </button>
          <div className="flex items-center gap-2.5">
            <MonarchCrownLogo className="w-8 h-8" />
            <span className="font-display font-extrabold text-lg monarch-gold-text tracking-wide">
              MONARCH ADMIN
            </span>
          </div>
          <div className="w-24 hidden sm:block" />
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md monarch-card-border rounded-2xl shadow-2xl">
            <div className="monarch-card-inner rounded-[15px] p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#241640] border border-[#F4C867]/60 flex items-center justify-center text-[#F4C867]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-white">
                    {checkingAuth
                      ? 'Checking Admin Access...'
                      : needsSetup
                        ? 'Activate Admin Access'
                        : 'Admin Dashboard Sign In'}
                  </h1>
                  <p className="text-xs text-[#B794F4]">
                    {needsSetup
                      ? 'First-time setup for Monarch Gaming Console'
                      : 'Sign in to manage profile cards, about & social links'}
                  </p>
                </div>
              </div>

              {checkingAuth ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  Verifying server configuration...
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {needsSetup && (
                    <div className="rounded-xl bg-[#1D1333] border border-[#8B5CF6]/50 p-3 text-xs text-slate-200 leading-relaxed">
                      Enter your admin password for{' '}
                      <strong className="text-[#F6C866]">{emailInput}</strong> to lock and initialize the Admin Dashboard.
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="admin-email"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      Admin Email
                    </label>
                    <input
                      id="admin-email"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="monarch@admin.app"
                      required
                      className="w-full min-h-[44px] rounded-xl bg-[#090611] border border-[#4B3470] px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F4C867]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-password"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={
                          needsSetup
                            ? 'Choose admin password (min 8 chars)'
                            : 'Enter admin password'
                        }
                        required
                        minLength={needsSetup ? 8 : 1}
                        className="w-full min-h-[44px] rounded-xl bg-[#090611] border border-[#4B3470] pl-3.5 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F4C867]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {needsSetup && (
                    <div>
                      <label
                        htmlFor="admin-confirm-password"
                        className="block text-xs font-semibold text-slate-300 mb-1.5"
                      >
                        Confirm Password
                      </label>
                      <input
                        id="admin-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Re-enter admin password"
                        required
                        minLength={8}
                        className="w-full min-h-[44px] rounded-xl bg-[#090611] border border-[#4B3470] px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F4C867]"
                      />
                    </div>
                  )}

                  {authError && (
                    <div className="rounded-xl bg-red-500/15 border border-red-400/40 px-3.5 py-2.5 text-xs font-semibold text-red-200">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full min-h-[46px] rounded-xl bg-gradient-to-b from-[#FCE18D] to-[#DC9A2E] text-[#171122] font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-105 disabled:opacity-60 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {authSubmitting
                        ? 'Verifying...'
                        : needsSetup
                          ? 'Claim & Open Admin Dashboard'
                          : 'Sign In to Admin Dashboard'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#090B15] text-white flex flex-col">
      {/* Top Admin Bar matching mockup */}
      <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 bg-[#0F1221]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <MonarchCrownLogo className="w-9 h-9 shrink-0 shadow-[0_0_16px_rgba(244,200,103,0.28)]" />
          <div className="min-w-0">
            <p className="font-bold text-base sm:text-lg text-white leading-tight truncate">
              Monarch Gaming
            </p>
            <p className="text-[11px] font-semibold text-[#F4C867] leading-tight truncate">
              Admin Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onExit}
            className="min-h-[38px] px-3 rounded-xl border border-white/15 bg-[#161A2E] text-xs font-semibold text-slate-200 hover:bg-[#1E233D] flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live App</span>
            <span className="sm:hidden">App</span>
          </button>

          <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-white/10">
            <MonarchCrownLogo className="w-8 h-8" />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-white truncate max-w-[160px]">
                {adminEmail}
              </p>
              <p className="text-[11px] text-slate-400">Administrator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAuthToken(null)}
            title="Sign Out"
            aria-label="Sign out of Admin Dashboard"
            className="min-h-[38px] px-3 rounded-xl border border-white/15 bg-[#161A2E] text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1E233D] flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Feedback Banner */}
      {statusBanner && (
        <div
          role="status"
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold text-center border-b ${
            statusBanner.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
              : 'bg-red-500/15 border-red-500/30 text-red-200'
          }`}
        >
          {statusBanner.text}
        </div>
      )}

      {/* Body Layout: Streamlined Sidebar + Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1440px] mx-auto">
        {/* Left Sidebar — strictly real Admin Dashboard navigation */}
        <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.07] bg-[#0D101D] p-3 md:p-4 flex flex-col justify-between gap-4">
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => scrollToSection('admin-profiles')}
              className="min-h-[42px] px-3.5 rounded-xl bg-gradient-to-r from-[#FCE18D] to-[#DC9A2E] text-[#171122] text-xs sm:text-sm font-extrabold flex items-center gap-2.5 whitespace-nowrap shrink-0 shadow-[0_4px_16px_rgba(244,200,103,0.22)] cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('admin-profiles')}
              className="min-h-[40px] px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#A78BFA] shrink-0" />
              <span>Profile Cards</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('admin-bottom-panel', 'about')}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer ${
                bottomTab === 'about'
                  ? 'bg-white/[0.06] text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#F4C867] shrink-0" />
              <span>Write About</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('admin-bottom-panel', 'social')}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer ${
                bottomTab === 'social'
                  ? 'bg-white/[0.06] text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Share2 className="w-4 h-4 text-[#A78BFA] shrink-0" />
              <span>Social Links</span>
            </button>
          </nav>

          <div className="hidden md:flex flex-col gap-2 pt-4 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={onExit}
              className="min-h-[40px] px-3 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View Live App</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace matching the mockup */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-6">
          {/* Page Header */}
          <div
            id="admin-profiles"
            className="flex flex-wrap items-start justify-between gap-3 scroll-mt-20"
          >
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Profile Cards — Content & Socials
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/85 mt-0.5">
                Manage four profile cards: upload videos & photos, write about, and add social links
              </p>
            </div>

            {cardsDirty && (
              <button
                type="button"
                onClick={() =>
                  persistConfig(draft, 'cards', 'Profile card edits saved live.')
                }
                disabled={savingSection === 'cards'}
                className="min-h-[40px] px-4 rounded-xl bg-gradient-to-b from-[#FCE18D] to-[#DC9A2E] text-[#171122] font-extrabold text-xs flex items-center gap-1.5 shadow-[0_4px_18px_rgba(244,200,103,0.3)] hover:brightness-105 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {savingSection === 'cards' ? 'Saving...' : 'Save Card Edits'}
                </span>
              </button>
            )}
          </div>

          {/* 2x2 Grid of 4 Profile Cards */}
          <section
            aria-label="Profile cards manager"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {draft.featuredGames.map((card, idx) => {
              const photos = getGamePhotos(card);
              const videos = getGameVideos(card);
              const isUploadingPhoto = uploadingKey === `image-${idx}`;
              const isUploadingVideo = uploadingKey === `video-${idx}`;
              const isPending = card.status === 'pending';

              return (
                <div
                  key={card.id}
                  className="rounded-2xl bg-[#131626] border border-[#2C314D] p-4 sm:p-5 flex flex-col gap-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.3)]"
                >
                  {/* Card Top Header: Circular Avatar + Title/Subtitle + Status Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[#1B1F36] border-2 border-[#F4C867]/60">
                        <GameThumbnailArt
                          gameId={card.id}
                          title={card.title}
                          mediaUrl={card.mediaUrl}
                          mediaType={card.mediaType}
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          type="text"
                          value={card.title}
                          aria-label={`Profile card ${idx + 1} title`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = structuredClone(prev);
                              next.featuredGames[idx].title = val;
                              return next;
                            });
                            setCardsDirty(true);
                          }}
                          className="w-full bg-transparent border-b border-transparent hover:border-white/15 focus:border-[#F4C867] focus:outline-none text-base sm:text-lg font-extrabold text-white tracking-tight py-0.5"
                        />

                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <input
                            type="text"
                            value={card.genre}
                            aria-label={`Profile card ${idx + 1} category`}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraft((prev) => {
                                const next = structuredClone(prev);
                                next.featuredGames[idx].genre = val;
                                return next;
                              });
                              setCardsDirty(true);
                            }}
                            className="w-24 sm:w-28 bg-[#0D101D] border border-[#2C314D] focus:border-[#8B5CF6] focus:outline-none rounded-md px-2 py-0.5 text-xs font-medium text-[#C4B5FD]"
                          />
                          <span className="text-slate-500">•</span>
                          <input
                            type="text"
                            value={card.mode}
                            aria-label={`Profile card ${idx + 1} mode`}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraft((prev) => {
                                const next = structuredClone(prev);
                                next.featuredGames[idx].mode = val;
                                return next;
                              });
                              setCardsDirty(true);
                            }}
                            className="w-24 sm:w-28 bg-[#0D101D] border border-[#2C314D] focus:border-[#8B5CF6] focus:outline-none rounded-md px-2 py-0.5 text-xs font-medium text-slate-200"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCardStatus(idx)}
                      title="Click to toggle Active / Pending status"
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold shrink-0 transition-colors cursor-pointer ${
                        isPending
                          ? 'bg-[#FDE047] text-[#1C1917]'
                          : 'bg-[#6EE7B7] text-[#064E3B]'
                      }`}
                    >
                      {isPending ? 'Pending' : 'Active'}
                    </button>
                  </div>

                  {/* Dual Upload Buttons matching mockup */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="min-h-[42px] px-3 rounded-xl bg-[#16192C] border border-[#7C4DFF]/75 hover:bg-[#1E223B] text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors">
                      <ImagePlus className="w-4 h-4 text-[#C4B5FD] shrink-0" />
                      <span className="truncate">
                        {isUploadingPhoto ? 'Uploading...' : 'Upload Photos'}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={isUploadingPhoto}
                        onChange={(e) => {
                          handleBatchUpload(e.target.files, idx, 'image');
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>

                    <label className="min-h-[42px] px-3 rounded-xl bg-[#16192C] border border-[#F4C867]/75 hover:bg-[#222030] text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors">
                      <Video className="w-4 h-4 text-[#F4C867] shrink-0" />
                      <span className="truncate">
                        {isUploadingVideo ? 'Uploading...' : 'Upload Videos'}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="video/mp4,video/webm,video/quicktime"
                        className="sr-only"
                        disabled={isUploadingVideo}
                        onChange={(e) => {
                          handleBatchUpload(e.target.files, idx, 'video');
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>

                  {/* Media Summary Counter */}
                  <p className="text-xs font-medium text-slate-300">
                    Media: <span className="text-white font-semibold">{photos.length}</span> photos •{' '}
                    <span className="text-white font-semibold">{videos.length}</span> videos
                  </p>

                  {/* Media Thumbnail Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {photos.map((url) => {
                      const isPrimary = card.mediaUrl === url && card.mediaType !== 'video';
                      return (
                        <div
                          key={url}
                          className={`relative group w-16 h-10 rounded-lg overflow-hidden shrink-0 border transition-all ${
                            isPrimary
                              ? 'border-[#F4C867] ring-1 ring-[#F4C867]/60'
                              : 'border-white/15 hover:border-white/40'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryMedia(idx, url, 'image')}
                            title="Set as main card photo"
                            className="w-full h-full block cursor-pointer"
                          >
                            <img
                              src={url}
                              alt={`${card.title} upload`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaItem(idx, url, 'image')}
                            aria-label={`Remove photo from ${card.title}`}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })}

                    {videos.map((url) => {
                      const isPrimary = card.mediaUrl === url && card.mediaType === 'video';
                      return (
                        <div
                          key={url}
                          className={`relative group w-16 h-10 rounded-lg overflow-hidden shrink-0 border bg-black transition-all ${
                            isPrimary
                              ? 'border-[#F4C867] ring-1 ring-[#F4C867]/60'
                              : 'border-white/15 hover:border-white/40'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryMedia(idx, url, 'video')}
                            title="Set as main card video"
                            className="w-full h-full block relative cursor-pointer"
                          >
                            <video
                              src={url}
                              muted
                              playsInline
                              className="w-full h-full object-cover opacity-85"
                            />
                            <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/75 text-[9px] font-bold text-[#F4C867]">
                              VID
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaItem(idx, url, 'video')}
                            aria-label={`Remove video from ${card.title}`}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Quick + Add more trigger */}
                    <label className="h-10 px-2.5 rounded-lg border border-dashed border-[#3B4263] hover:border-[#F4C867]/70 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 shrink-0 cursor-pointer transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add more</span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) => {
                          handleBatchUpload(e.target.files, idx, 'image');
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Bottom Tabbed Panel — ONLY About & Social Links */}
          <section id="admin-bottom-panel" className="scroll-mt-20">
            {/* Folder-style tabs matching mockup */}
            <div className="flex items-end gap-1.5">
              <button
                type="button"
                onClick={() => setBottomTab('about')}
                className={`min-h-[42px] px-6 rounded-t-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  bottomTab === 'about'
                    ? 'bg-[#131626] text-[#F4C867] border-t border-x border-[#2C314D]'
                    : 'bg-[#25293E]/80 text-slate-300 hover:text-white'
                }`}
              >
                About
              </button>

              <button
                type="button"
                onClick={() => setBottomTab('social')}
                className={`min-h-[42px] px-6 rounded-t-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  bottomTab === 'social'
                    ? 'bg-[#131626] text-[#F4C867] border-t border-x border-[#2C314D]'
                    : 'bg-[#25293E]/80 text-slate-300 hover:text-white'
                }`}
              >
                Social Links
              </button>
            </div>

            <div className="rounded-b-2xl rounded-tr-2xl bg-[#131626] border border-[#2C314D] p-4 sm:p-6 shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
              {/* TAB 1: WRITE ABOUT */}
              {bottomTab === 'about' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-extrabold text-white">
                          Write About
                        </h2>
                        <span className="text-xs font-semibold text-slate-400 tabular-nums">
                          {draft.about.body.length}/3000 characters
                        </span>
                      </div>
                      <p className="text-xs text-slate-300/85 mt-1">
                        Enter details about Monarch Gaming, tournament info, community story, and platform highlights. Displayed in the public About section below the profile cards.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none px-3 py-2 rounded-xl bg-[#0D101D] border border-[#2C314D]">
                        <input
                          type="checkbox"
                          checked={draft.about.enabled}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setDraft((prev) => ({
                              ...prev,
                              about: { ...prev.about, enabled: checked },
                            }));
                            setAboutDirty(true);
                          }}
                          className="accent-[#F4C867] w-3.5 h-3.5"
                        />
                        <span>Visible</span>
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          persistConfig(
                            draft,
                            'about',
                            'About section saved and published live.'
                          )
                        }
                        disabled={savingSection === 'about'}
                        className="min-h-[40px] px-4 rounded-xl bg-gradient-to-b from-[#FCE18D] to-[#DC9A2E] text-[#171122] font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_4px_16px_rgba(244,200,103,0.25)] hover:brightness-105 cursor-pointer disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {savingSection === 'about' ? 'Saving...' : 'Save About'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="about-title-input"
                        className="block text-xs font-semibold text-slate-300 mb-1"
                      >
                        About Heading
                      </label>
                      <input
                        id="about-title-input"
                        type="text"
                        value={draft.about.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) => ({
                            ...prev,
                            about: { ...prev.about, title: val },
                          }));
                          setAboutDirty(true);
                        }}
                        placeholder="About Monarch Gaming"
                        className="w-full min-h-[42px] rounded-xl bg-[#0D101D] border border-[#2C314D] focus:border-[#F4C867] focus:outline-none px-3.5 text-sm text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="about-subtitle-input"
                        className="block text-xs font-semibold text-slate-300 mb-1"
                      >
                        Subtitle
                      </label>
                      <input
                        id="about-subtitle-input"
                        type="text"
                        value={draft.about.subtitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) => ({
                            ...prev,
                            about: { ...prev.about, subtitle: val },
                          }));
                          setAboutDirty(true);
                        }}
                        placeholder="Competitive Mobile Esports Arena"
                        className="w-full min-h-[42px] rounded-xl bg-[#0D101D] border border-[#2C314D] focus:border-[#F4C867] focus:outline-none px-3.5 text-sm text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="about-body-textarea"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      About Story / Description
                    </label>
                    <textarea
                      id="about-body-textarea"
                      rows={5}
                      maxLength={3000}
                      value={draft.about.body}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraft((prev) => ({
                          ...prev,
                          about: { ...prev.about, body: val },
                        }));
                        setAboutDirty(true);
                      }}
                      placeholder="Write about Monarch Gaming..."
                      className="w-full rounded-xl bg-[#0D101D] border border-[#2C314D] focus:border-[#F4C867] focus:outline-none p-3.5 text-sm text-white placeholder:text-slate-500 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SOCIAL LINKS */}
              {bottomTab === 'social' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-white">
                        Social Links
                      </h2>
                      <p className="text-xs text-slate-300/85 mt-0.5">
                        These links connect directly to the footer social network icons on the main app.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSocialLinks}
                      disabled={savingSection === 'social'}
                      className="min-h-[40px] px-4 rounded-xl bg-gradient-to-b from-[#FCE18D] to-[#DC9A2E] text-[#171122] font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_4px_16px_rgba(244,200,103,0.25)] hover:brightness-105 cursor-pointer disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {savingSection === 'social' ? 'Saving...' : 'Save Social Links'}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {draft.socialLinks.map((social, sIdx) => (
                      <div
                        key={social.id}
                        className="rounded-xl bg-[#0D101D] border border-[#2C314D] p-3 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-[#FCE192] to-[#DDA23E] text-[#181123] flex items-center justify-center shrink-0">
                          <SocialGlyph id={social.id} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-white">
                              {social.label}
                            </span>
                            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={social.enabled}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setDraft((prev) => {
                                    const next = structuredClone(prev);
                                    next.socialLinks[sIdx].enabled = checked;
                                    return next;
                                  });
                                  setSocialDirty(true);
                                }}
                                className="accent-[#F4C867] w-3.5 h-3.5"
                              />
                              <span>{social.enabled ? 'Active' : 'Hidden'}</span>
                            </label>
                          </div>

                          <input
                            type="url"
                            value={social.url}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraft((prev) => {
                                const next = structuredClone(prev);
                                next.socialLinks[sIdx].url = val;
                                return next;
                              });
                              setSocialDirty(true);
                            }}
                            placeholder={`https://${social.id === 'x' ? 'x.com' : `${social.id}.com`}/...`}
                            className="w-full min-h-[36px] rounded-lg bg-[#22263B] border border-[#353B5B] focus:border-[#F4C867] focus:outline-none px-3 text-xs text-white placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
