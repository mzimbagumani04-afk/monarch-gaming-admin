import React, { useEffect, useState } from 'react';
import { Download, Users, Trophy, Headset, User } from 'lucide-react';
import {
  DEFAULT_SITE_CONFIG,
  sanitizeExternalUrl,
  type SiteConfig,
} from './data/gamingData';
import {
  MonarchCrownLogo,
  GameThumbnailArt,
  SocialGlyph,
} from './components/GameArtwork';
import {
  NavDrawer,
  DownloadModal,
} from './components/Modals';
import { AdminDashboard } from './components/AdminDashboard';

function isAdminPath(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.pathname.startsWith('/admin') ||
    window.location.hash === '#admin'
  );
}

export default function App() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [adminView, setAdminView] = useState<boolean>(() => isAdminPath());
  const [navOpen, setNavOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SiteConfig | null) => {
        if (active && data && data.hero) {
          setConfig(data);
        }
      })
      .catch(() => {
        // Fallback smoothly to DEFAULT_SITE_CONFIG
      });

    const handlePopState = () => {
      setAdminView(isAdminPath());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      active = false;
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const exitAdminDashboard = () => {
    window.history.pushState({}, '', '/');
    setAdminView(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (adminView) {
    return (
      <AdminDashboard
        config={config}
        onConfigUpdated={(next) => setConfig(next)}
        onExit={exitAdminDashboard}
      />
    );
  }

  const visibleSocials = config.socialLinks.filter((s) => s.enabled);
  const safeDownloadUrl = sanitizeExternalUrl(config.hero.downloadUrl);
  const safeProfileUrl = sanitizeExternalUrl(config.brand.profileUrl);

  return (
    <div
      id="hero-top"
      className="relative min-h-screen w-full bg-[#08060E] text-white cosmic-particles overflow-x-hidden"
    >
      {/* Atmospheric Cosmic Nebula Backdrops */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[140vw] max-w-[1100px] h-[520px]"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 24%, rgba(139, 92, 246, 0.34) 0%, rgba(109, 40, 217, 0.16) 45%, rgba(8, 6, 14, 0) 78%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-14 -left-24 w-72 h-72 rounded-full blur-3xl opacity-35 bg-[#7C3AED]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-28 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 bg-[#6D28D9]"
      />

      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-30 h-16 bg-[#08060E]/85 backdrop-blur-md border-b border-white/[0.06]">
        <div className="mx-auto max-w-[540px] md:max-w-[740px] h-full px-4 flex items-center justify-between">
          {/* Left: Custom Gold List Menu Trigger */}
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation menu"
            className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl text-[#F4C867] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="4" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
              <line x1="8.5" y1="6.5" x2="20" y2="6.5" />
              <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
              <line x1="8.5" y1="12" x2="20" y2="12" />
              <circle cx="4" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
              <line x1="8.5" y1="17.5" x2="20" y2="17.5" />
            </svg>
          </button>

          {/* Center: MG Emblem Logo + Brand Lockup */}
          <a
            href="#hero-top"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('hero-top');
            }}
            className="flex items-center gap-2.5 select-none"
          >
            <MonarchCrownLogo className="w-10 h-10 shadow-[0_0_16px_rgba(244,200,103,0.28)]" />
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-[19px] sm:text-[21px] tracking-[0.04em] monarch-gold-text leading-[0.92]">
                {config.brand.topName}
              </span>
              <span className="flex items-baseline leading-[0.95]">
                <span className="font-display font-extrabold text-[17px] sm:text-[18px] tracking-[0.04em] monarch-gold-text">
                  {config.brand.bottomName}
                </span>
                <span className="text-[12px] sm:text-[13px] font-semibold text-white/95 ml-0.5 tracking-normal">
                  {config.brand.domainSuffix}
                </span>
              </span>
            </div>
          </a>

          {/* Right: Circular Profile Avatar Button */}
          {safeProfileUrl ? (
            <a
              href={safeProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open player profile"
              className="min-w-[44px] min-h-[44px] -mr-1.5 flex items-center justify-center rounded-full"
            >
              <span className="w-9 h-9 rounded-full bg-gradient-to-b from-[#3B2667] to-[#1D1336] border-[1.5px] border-[#F4C867]/85 flex items-center justify-center text-[#F4C867] shadow-[0_0_16px_rgba(147,70,245,0.4)] hover:brightness-110 transition-all">
                <User className="w-[18px] h-[18px]" strokeWidth={2.2} />
              </span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => showToast('Profile link is not configured yet.')}
              aria-label="Open player profile"
              className="min-w-[44px] min-h-[44px] -mr-1.5 flex items-center justify-center rounded-full cursor-pointer"
            >
              <span className="w-9 h-9 rounded-full bg-gradient-to-b from-[#3B2667] to-[#1D1336] border-[1.5px] border-[#F4C867]/85 flex items-center justify-center text-[#F4C867] shadow-[0_0_16px_rgba(147,70,245,0.4)] hover:brightness-110 transition-all">
                <User className="w-[18px] h-[18px]" strokeWidth={2.2} />
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto max-w-[540px] md:max-w-[740px] px-4 pt-6 pb-10">
        {/* HERO SECTION */}
        <section className="text-center pt-1 pb-2">
          <div className="flex justify-center mb-3.5">
            <MonarchCrownLogo className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-[#F4C867]/80 shadow-[0_0_32px_rgba(244,200,103,0.3)]" />
          </div>

          <h1 className="font-display font-extrabold uppercase text-[46px] sm:text-[62px] leading-[0.94] tracking-[0.02em] monarch-gold-text drop-shadow-[0_6px_26px_rgba(244,200,103,0.22)] text-balance">
            {config.hero.headline}
          </h1>

          <p className="text-[24px] sm:text-[30px] font-extrabold text-[#B86EFF] tracking-tight mt-1.5">
            {config.hero.subtitle}
          </p>

          <p className="text-[13px] sm:text-[15px] text-slate-200/90 leading-relaxed max-w-[350px] sm:max-w-[460px] mx-auto mt-2.5">
            {config.hero.description}
          </p>

          {/* Primary Dual CTAs */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            {safeDownloadUrl ? (
              <a
                href={safeDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] px-3 sm:px-5 rounded-xl bg-gradient-to-b from-[#FCE18D] via-[#F2C15A] to-[#DC9A2E] text-[#171122] font-extrabold text-[13.5px] sm:text-[15px] flex items-center justify-center gap-2 shadow-[0_6px_22px_rgba(244,200,103,0.26)] hover:brightness-105 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <Download className="w-[17px] h-[17px] shrink-0" strokeWidth={2.4} />
                <span>{config.hero.primaryCtaText}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setDownloadOpen(true)}
                className="min-h-[46px] px-3 sm:px-5 rounded-xl bg-gradient-to-b from-[#FCE18D] via-[#F2C15A] to-[#DC9A2E] text-[#171122] font-extrabold text-[13.5px] sm:text-[15px] flex items-center justify-center gap-2 shadow-[0_6px_22px_rgba(244,200,103,0.26)] hover:brightness-105 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
              >
                <Download className="w-[17px] h-[17px] shrink-0" strokeWidth={2.4} />
                <span>{config.hero.primaryCtaText}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => scrollToSection('featured-games')}
              className="min-h-[46px] px-3 sm:px-5 rounded-xl bg-[#150F24]/85 border border-[#7E42D6] text-[#CE9EFF] font-bold text-[13.5px] sm:text-[15px] flex items-center justify-center hover:bg-[#1E1535] hover:border-[#9B5CF6] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
            >
              {config.hero.secondaryCtaText}
            </button>
          </div>
        </section>

        {/* 3-COLUMN PLATFORM STATS STRIP */}
        <section aria-label="Platform highlights" className="mt-6">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
            {config.stats.map((stat) => (
              <div key={stat.id} className="monarch-card-border rounded-xl">
                <div className="monarch-card-inner rounded-[11px] p-2.5 sm:p-3.5 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-1.5 sm:gap-2.5">
                    <div className="shrink-0 flex items-center justify-center">
                      {stat.icon === 'players' && (
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#9D5CFF]" strokeWidth={2.2} />
                      )}
                      {stat.icon === 'tournaments' && (
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#F4C867]" strokeWidth={2.2} />
                      )}
                      {stat.icon === 'support' && (
                        <Headset className="w-5 h-5 sm:w-6 sm:h-6 text-[#9D5CFF]" strokeWidth={2.2} />
                      )}
                    </div>
                    <div className="min-w-0">
                      {stat.value && (
                        <p className="text-[15px] sm:text-[18px] font-extrabold text-white leading-none tabular-nums">
                          {stat.value}
                        </p>
                      )}
                      {stat.label && (
                        <p className="text-[10px] sm:text-[12px] font-semibold text-slate-300 mt-1 truncate">
                          {stat.label}
                        </p>
                      )}
                    </div>
                  </div>

                  {stat.badge && (
                    <div className="mt-2.5 w-full rounded-md bg-gradient-to-b from-[#FAD67A] to-[#DF9F37] text-[#181123] font-extrabold text-[10px] sm:text-[11.5px] py-1 px-1.5 text-center whitespace-nowrap truncate shadow-sm">
                      {stat.badge}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED GAMES SECTION */}
        <section id="featured-games" className="mt-7 scroll-mt-20">
          <h2 className="text-[19px] sm:text-[22px] font-extrabold text-white tracking-tight mb-3">
            {config.featuredGamesTitle}
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {config.featuredGames.map((game) => (
              <div
                key={game.id}
                className="monarch-card-border rounded-xl text-left"
              >
                <div className="monarch-card-inner rounded-[11px] p-2.5 sm:p-3 flex flex-col h-full">
                  <div className="aspect-[16/10] w-full rounded-lg overflow-hidden mb-2.5 bg-[#0A0812] border border-white/[0.06]">
                    <GameThumbnailArt
                      gameId={game.id}
                      title={game.title}
                      mediaUrl={game.mediaUrl}
                      mediaType={game.mediaType}
                    />
                  </div>

                  <h3 className="font-display font-extrabold text-[17px] sm:text-[20px] text-white uppercase tracking-wide leading-tight">
                    {game.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-medium text-[#C4B5FD] mt-0.5 mb-0.5">
                    {game.genre} • {game.mode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT SECTION */}
        {config.about?.enabled && (
          <section id="about" className="mt-7 scroll-mt-20">
            <h2 className="text-[19px] sm:text-[22px] font-extrabold text-white tracking-tight">
              {config.about.title}
            </h2>
            {config.about.subtitle && (
              <p className="text-[11.5px] sm:text-[13px] font-semibold text-[#B794F4] mt-0.5 mb-3">
                {config.about.subtitle}
              </p>
            )}

            <div className="monarch-card-border rounded-2xl shadow-[0_14px_38px_rgba(0,0,0,0.35)]">
              <div className="monarch-card-inner rounded-[15px] p-4 sm:p-5">
                <p className="text-[13px] sm:text-[14.5px] text-slate-200/90 leading-relaxed whitespace-pre-line">
                  {config.about.body}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="mt-8 pt-2 pb-4 text-center">
          <p className="text-[11px] sm:text-xs text-slate-300/90 leading-relaxed">
            {config.footer.copyright}
          </p>

          <p className="text-[13.5px] font-bold text-[#A78BFA] mt-4 mb-3">
            {config.footer.followHeading}
          </p>

          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {visibleSocials.map((social) => {
              const safeUrl = sanitizeExternalUrl(social.url);
              if (safeUrl) {
                return (
                  <a
                    key={social.id}
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-b from-[#FCE192] to-[#DDA23E] text-[#181123] flex items-center justify-center shadow-[0_4px_14px_rgba(244,200,103,0.22)] hover:scale-105 active:scale-95 transition-transform"
                  >
                    <SocialGlyph id={social.id} />
                  </a>
                );
              }
              return (
                <button
                  key={social.id}
                  type="button"
                  onClick={() =>
                    showToast(`${social.label} link can be set in the Admin Social Links tab.`)
                  }
                  aria-label={social.label}
                  title={social.label}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-b from-[#FCE192] to-[#DDA23E] text-[#181123] flex items-center justify-center shadow-[0_4px_14px_rgba(244,200,103,0.22)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  <SocialGlyph id={social.id} />
                </button>
              );
            })}
          </div>
        </footer>
      </main>

      {/* Interactive Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] px-4 py-2.5 rounded-xl bg-[#1A122C]/95 border border-[#F4C867]/60 text-xs sm:text-sm font-semibold text-white shadow-2xl backdrop-blur-md whitespace-nowrap truncate"
        >
          {toastMessage}
        </div>
      )}

      {/* Modals & Drawers */}
      <NavDrawer
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onNavigate={scrollToSection}
        onOpenDownload={() => setDownloadOpen(true)}
        config={config}
      />

      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        onNotify={showToast}
        config={config}
      />
    </div>
  );
}
