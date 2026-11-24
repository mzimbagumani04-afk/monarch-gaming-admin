import React, { useState } from 'react';
import {
  X,
  Download,
  ShieldCheck,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import {
  sanitizeExternalUrl,
  type SiteConfig,
} from '../data/gamingData';
import { MonarchCrownLogo } from './GameArtwork';

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenDownload: () => void;
  config: SiteConfig;
}

export const NavDrawer: React.FC<NavDrawerProps> = ({
  open,
  onClose,
  onNavigate,
  onOpenDownload,
  config,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative z-10 w-72 max-w-[82vw] h-full bg-[#0F0B1A] border-r border-[#4B3470]/60 p-5 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <MonarchCrownLogo className="w-8 h-8" />
              <span className="font-display font-extrabold text-lg monarch-gold-text tracking-wide">
                {config.brand.topName} {config.brand.bottomName}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-5 space-y-1.5">
            <button
              type="button"
              onClick={() => {
                onNavigate('hero-top');
                onClose();
              }}
              className="w-full min-h-[44px] px-3 rounded-xl text-left text-sm font-semibold text-white hover:bg-[#1D1530] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Platform Home</span>
              <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('featured-games');
                onClose();
              }}
              className="w-full min-h-[44px] px-3 rounded-xl text-left text-sm font-semibold text-white hover:bg-[#1D1530] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>{config.featuredGamesTitle}</span>
              <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
            </button>
            {config.about?.enabled && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('about');
                  onClose();
                }}
                className="w-full min-h-[44px] px-3 rounded-xl text-left text-sm font-semibold text-white hover:bg-[#1D1530] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{config.about.title}</span>
                <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
              </button>
            )}
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          {sanitizeExternalUrl(config.hero.downloadUrl) ? (
            <a
              href={sanitizeExternalUrl(config.hero.downloadUrl)!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full min-h-[44px] rounded-xl bg-gradient-to-b from-[#FCE18D] to-[#DC9A2E] text-[#171122] font-extrabold text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{config.hero.primaryCtaText}</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDownload();
              }}
              className="w-full min-h-[44px] rounded-xl bg-gradient-to-b from-[#FCE18D] to-[#DC9A2E] text-[#171122] font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{config.hero.primaryCtaText}</span>
            </button>
          )}
          <p className="text-[11px] text-center text-slate-400">
            Season 12 Live • 24/7 Anti-Cheat Protection
          </p>
        </div>
      </aside>
    </div>
  );
};

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
  config: SiteConfig;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  open,
  onClose,
  onNotify,
  config,
}) => {
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-[#120D1E] border border-[#F4C867]/40 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-[#F4C867]" />
            <h3 className="text-lg font-extrabold text-white">Download Monarch App</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close download modal"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Get instant match alerts, one-tap room codes, live tournament brackets, and automated Season 12 prize payouts.
        </p>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0A0712] border border-white/10 mb-4">
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`min-h-[40px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              platform === 'android'
                ? 'bg-[#9346F5] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Android (APK)
          </button>
          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`min-h-[40px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              platform === 'ios'
                ? 'bg-[#9346F5] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            iOS (App Store)
          </button>
        </div>

        <div className="rounded-xl bg-[#19122A] border border-white/10 p-3.5 mb-4 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-white">
              {platform === 'android' ? config.hero.androidVersion : config.hero.iosLabel}
            </p>
            <p className="text-slate-400 mt-0.5">
              {platform === 'android' ? config.hero.androidSize : config.hero.iosSize}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Verified
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            onNotify(
              platform === 'android'
                ? `Started ${config.hero.androidVersion} download.`
                : `Opening ${config.hero.iosLabel} on App Store.`
            );
            onClose();
          }}
          className="w-full min-h-[46px] rounded-xl bg-gradient-to-b from-[#FCE18D] to-[#DC9A2E] text-[#171122] font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{platform === 'android' ? 'Download APK Now' : 'Open App Store'}</span>
        </button>
      </div>
    </div>
  );
};
