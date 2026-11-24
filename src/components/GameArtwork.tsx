import React from 'react';
import type { GameId, MediaType, SocialChannelId } from '../data/gamingData';

export const MonarchCrownLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <span
    className={`inline-flex items-center justify-center rounded-full overflow-hidden border border-[#F4C867]/65 bg-black shrink-0 ${className}`}
  >
    <img
      src="/assets/aistudio/Screenshot_20261123_022705_Gallery_62cbfd67.jpg"
      alt="Monarch Gaming logo"
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover object-center scale-[1.06]"
    />
  </span>
);

export const SocialGlyph: React.FC<{ id: SocialChannelId }> = ({ id }) => {
  switch (id) {
    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <path d="M9.5 9.5c.3 1.2 1.8 3.1 3.7 4 .4.2.9.1 1.2-.2l.7-.7c.2-.2.6-.2.8 0l1.1.8c.3.2.4.6.2.9-.5.9-1.5 1.4-2.5 1.3-2.9-.3-5.9-3.2-6.3-6.1-.1-1 .4-2 1.3-2.5.3-.2.7-.1.9.2l.8 1.1c.2.2.2.6 0 .8l-.7.7c-.3.3-.4.8-.2 1.2" strokeWidth="1.4" />
        </svg>
      );
    case 'discord':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M21.58 7.19a2.75 2.75 0 0 0-1.94-1.95C17.93 4.75 12 4.75 12 4.75s-5.93 0-7.64.49A2.75 2.75 0 0 0 2.42 7.2 28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .42 4.81 2.75 2.75 0 0 0 1.94 1.95c1.71.49 7.64.49 7.64.49s5.93 0 7.64-.49a2.75 2.75 0 0 0 1.94-1.95A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.42-4.81zM10 15.12V8.88L15.4 12 10 15.12z" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
  }
};

export const PlayerProfileAvatar: React.FC<{
  rank: number;
  name: string;
  mediaUrl?: string;
  mediaType?: MediaType;
}> = ({ rank, name, mediaUrl, mediaType }) => {
  if (mediaUrl) {
    const ringClass =
      rank === 1
        ? 'border-[#F5C358]'
        : rank === 2
          ? 'border-[#CBD5E1]'
          : rank === 3
            ? 'border-[#D97736]'
            : 'border-[#8B5CF6]/70';

    return (
      <div className={`relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 ${ringClass} bg-[#181128]`}>
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={`${name} profile`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  if (rank <= 3) {
    return <RankMedalBadge rank={rank} />;
  }

  return (
    <div className="w-11 h-11 rounded-full bg-[#1C152E] border border-white/15 flex items-center justify-center text-xs font-bold text-[#B794F4] shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};

export const RankMedalBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="goldRing" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="50%" stopColor="#F5C358" />
              <stop offset="100%" stopColor="#B8771E" />
            </linearGradient>
          </defs>
          <path d="M16 11L13 5L19 8.5L24 3L29 8.5L35 5L32 11H16Z" fill="url(#goldRing)" />
          <circle cx="24" cy="27" r="16" fill="#1C142B" stroke="url(#goldRing)" strokeWidth="2.8" />
          <circle cx="24" cy="27" r="12" fill="#2A1C40" />
          <path d="M16 37C17 32 20 30 24 30C28 30 31 32 32 37" fill="#4C1D95" />
          <path d="M18 27C18 21.5 20.5 18 24 18C27.5 18 30 21.5 30 27C29 29 26.5 30.5 24 30.5C21.5 30.5 19 29 18 27Z" fill="#F5C358" />
          <path d="M20 24C20 21 21.8 19.5 24 19.5C26.2 19.5 28 21 28 24V27C28 28.5 26.2 29.8 24 29.8C21.8 29.8 20 28.5 20 27V24Z" fill="#181226" />
          <path d="M21.5 24.5H23.2M24.8 24.5H26.5" stroke="#FDE68A" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="silverShield" x1="24" y1="6" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="55%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>
          <path d="M16 11L13.5 6L19.5 9L24 4.5L28.5 9L34.5 6L32 11H16Z" fill="url(#silverShield)" />
          <path
            d="M11 14H37V27C37 35 24 42 24 42C24 42 11 35 11 27V14Z"
            fill="#1F2433"
            stroke="url(#silverShield)"
            strokeWidth="2.4"
          />
          <path
            d="M14.5 17H33.5V26.5C33.5 32.5 24 38 24 38C24 38 14.5 32.5 14.5 26.5V17Z"
            fill="url(#silverShield)"
            fillOpacity="0.22"
          />
          <text
            x="24"
            y="31"
            textAnchor="middle"
            fill="#F1F5F9"
            fontSize="15"
            fontWeight="800"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            2
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="bronzeShield" x1="24" y1="6" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="55%" stopColor="#D97736" />
            <stop offset="100%" stopColor="#7C3412" />
          </linearGradient>
        </defs>
        <path d="M16 11L13.5 6L19.5 9L24 4.5L28.5 9L34.5 6L32 11H16Z" fill="url(#bronzeShield)" />
        <path
          d="M11 14H37V27C37 35 24 42 24 42C24 42 11 35 11 27V14Z"
          fill="#261714"
          stroke="url(#bronzeShield)"
          strokeWidth="2.4"
        />
        <path
          d="M14.5 17H33.5V26.5C33.5 32.5 24 38 24 38C24 38 14.5 32.5 14.5 26.5V17Z"
          fill="url(#bronzeShield)"
          fillOpacity="0.22"
        />
        <text
          x="24"
          y="31"
          textAnchor="middle"
          fill="#FED7AA"
          fontSize="15"
          fontWeight="800"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          3
        </text>
      </svg>
    </div>
  );
};

export const GameThumbnailArt: React.FC<{
  gameId: GameId;
  title?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  controls?: boolean;
}> = ({ gameId, title = 'Game artwork', mediaUrl, mediaType, controls = false }) => {
  if (mediaUrl) {
    if (mediaType === 'video') {
      return (
        <video
          src={mediaUrl}
          autoPlay
          muted={!controls}
          loop
          playsInline
          controls={controls}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <img
        src={mediaUrl}
        alt={title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
      />
    );
  }

  if (gameId === 'free-fire') {
    return (
      <svg viewBox="0 0 320 200" className="w-full h-full object-cover" aria-hidden="true">
        <defs>
          <linearGradient id="ffSky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1A365D" />
            <stop offset="48%" stopColor="#2B6CB0" />
            <stop offset="80%" stopColor="#ED8936" />
            <stop offset="100%" stopColor="#C53030" />
          </linearGradient>
          <radialGradient id="ffFire" cx="0.78" cy="0.72" r="0.45">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#F97316" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7C2D12" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="url(#ffSky)" />
        <path d="M0 142 Q90 132 180 144 T320 138 V200 H0 Z" fill="#0F172A" fillOpacity="0.85" />
        <path d="M0 155 Q70 120 145 152 L210 160 L320 135 V200 H0 Z" fill="#111827" />
        <circle cx="255" cy="145" r="75" fill="url(#ffFire)" />
        <path d="M58 46 Q74 28 90 46 Z" fill="#E2E8F0" fillOpacity="0.85" />
        <path d="M60 46 L73 66 M88 46 L75 66" stroke="#CBD5E1" strokeWidth="1.2" />
        <circle cx="74" cy="68" r="3" fill="#1E293B" />
        <path d="M224 38 Q242 20 260 38 Z" fill="#F8FAFC" fillOpacity="0.75" />
        <path d="M226 38 L241 58 M258 38 L243 58" stroke="#CBD5E1" strokeWidth="1.2" />
        <path d="M22 168 Q28 118 42 90" stroke="#0B0F19" strokeWidth="5" fill="none" />
        <path d="M42 90 Q18 84 8 102 M42 90 Q24 68 12 72 M42 90 Q58 72 72 86 M42 90 Q66 96 70 112" stroke="#0B0F19" strokeWidth="4" strokeLinecap="round" fill="none" />
        <g transform="translate(130, 52)">
          <circle cx="32" cy="14" r="9" fill="#090D16" />
          <path d="M22 24 L42 22 L48 48 L36 74 L24 70 L28 50 L14 68 L6 62 Z" fill="#090D16" />
          <path d="M18 30 L4 22 L8 18 L24 25 Z" fill="#1E293B" />
          <path d="M38 30 L64 16 L67 21 L42 36 Z" fill="#090D16" />
          <path d="M42 22 L48 48 L36 74" stroke="#FDBA74" strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
        </g>
        <circle cx="215" cy="112" r="2" fill="#FDE047" />
        <circle cx="235" cy="96" r="1.5" fill="#FB923C" />
        <circle cx="195" cy="128" r="1.8" fill="#FDE047" />
        <circle cx="282" cy="110" r="2.2" fill="#FDBA74" />
        <rect width="320" height="200" fill="url(#ffFire)" fillOpacity="0.18" />
      </svg>
    );
  }

  if (gameId === 'pubg-mobile') {
    return (
      <svg viewBox="0 0 320 200" className="w-full h-full object-cover" aria-hidden="true">
        <defs>
          <linearGradient id="pubgSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B352D" />
            <stop offset="55%" stopColor="#7C6D58" />
            <stop offset="100%" stopColor="#D6B98C" />
          </linearGradient>
          <radialGradient id="pubgSun" cx="0.62" cy="0.4" r="0.55">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#78716C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="url(#pubgSky)" />
        <rect width="320" height="200" fill="url(#pubgSun)" />
        <path d="M0 70 H45 V160 H0 Z M52 95 H96 V160 H52 Z M215 80 H270 V160 H215 Z M278 58 H320 V160 H278 Z" fill="#292524" fillOpacity="0.72" />
        <ellipse cx="95" cy="115" rx="68" ry="28" fill="#E7E5E4" fillOpacity="0.22" />
        <ellipse cx="235" cy="125" rx="85" ry="30" fill="#D6D3D1" fillOpacity="0.24" />
        <path d="M0 156 L320 148 V200 H0 Z" fill="#1C1917" />
        <g transform="translate(52, 92)">
          <circle cx="18" cy="12" r="8" fill="#18181B" />
          <path d="M8 22 H28 L34 64 H4 Z" fill="#18181B" />
          <rect x="20" y="28" width="28" height="4" rx="1.5" fill="#09090B" />
        </g>
        <g transform="translate(228, 96)">
          <circle cx="18" cy="12" r="8" fill="#18181B" />
          <path d="M8 22 H28 L32 62 H4 Z" fill="#18181B" />
        </g>
        <g transform="translate(115, 34)">
          <path d="M26 14 C26 4 48 4 48 14 V28 H26 V14 Z" fill="#1C1917" stroke="#A8A29E" strokeWidth="1.2" />
          <rect x="30" y="13" width="14" height="7" rx="1.5" fill="#09090B" stroke="#D6D3D1" strokeWidth="1" />
          <path d="M12 36 L26 28 H48 L64 38 L60 98 H14 Z" fill="#27272A" />
          <path d="M22 36 H52 V74 H22 Z" fill="#18181B" />
          <path d="M4 60 L78 46 L80 54 L8 68 Z" fill="#09090B" />
          <rect x="34" y="42" width="16" height="5" rx="1" transform="rotate(-10 34 42)" fill="#44403C" />
          <path d="M52 62 L56 78 H48 L45 64 Z" fill="#18181B" />
          <path d="M26 28 H48 L64 38" stroke="#FDE68A" strokeWidth="1.4" strokeOpacity="0.55" fill="none" />
        </g>
      </svg>
    );
  }

  if (gameId === 'codm') {
    return (
      <svg viewBox="0 0 320 200" className="w-full h-full object-cover" aria-hidden="true">
        <defs>
          <linearGradient id="codmBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#090D1A" />
            <stop offset="50%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>
          <linearGradient id="neonGun" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="55%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#E879F9" />
          </linearGradient>
        </defs>
        <rect width="320" height="200" fill="url(#codmBg)" />
        <rect x="18" y="32" width="38" height="90" fill="#0F172A" />
        <rect x="24" y="45" width="4" height="55" fill="#EC4899" fillOpacity="0.65" />
        <rect x="260" y="25" width="44" height="120" fill="#0F172A" />
        <rect x="270" y="42" width="6" height="72" fill="#22D3EE" fillOpacity="0.7" />
        <rect x="282" y="55" width="4" height="45" fill="#A855F7" fillOpacity="0.75" />
        <path d="M0 155 H320 V200 H0 Z" fill="#050711" />
        <rect x="110" y="164" width="90" height="4" rx="2" fill="#22D3EE" fillOpacity="0.35" />
        <rect x="215" y="172" width="65" height="3" rx="1.5" fill="#E879F9" fillOpacity="0.35" />
        <text
          x="16"
          y="34"
          fill="#FFFFFF"
          fontSize="19"
          fontWeight="800"
          letterSpacing="1"
          fontFamily="Barlow Condensed, sans-serif"
        >
          CODM
        </text>
        <text x="16" y="44" fill="#94A3B8" fontSize="6.5" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
          CALL OF DUTY MOBILE
        </text>
        <g transform="translate(88, 36)">
          <circle cx="52" cy="22" r="13" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
          <path d="M44 21 H61 L58 26 H46 Z" fill="#22D3EE" />
          <path d="M24 42 L52 34 L82 44 L76 112 H28 Z" fill="#0B1120" stroke="#4F46E5" strokeWidth="1" />
          <path d="M28 74 L148 56 L154 68 L34 88 Z" fill="#020617" stroke="url(#neonGun)" strokeWidth="2" />
          <rect x="78" y="61" width="54" height="5" rx="2" transform="rotate(-8 78 61)" fill="url(#neonGun)" />
          <circle cx="148" cy="62" r="6" fill="#22D3EE" fillOpacity="0.55" />
        </g>
        <path d="M40 15 L30 55 M120 10 L110 48 M210 20 L200 60 M295 18 L285 52" stroke="#38BDF8" strokeOpacity="0.25" strokeWidth="1" />
      </svg>
    );
  }

  if (gameId === 'chess') {
    return (
      <svg viewBox="0 0 320 200" className="w-full h-full object-cover" aria-hidden="true">
        <defs>
          <linearGradient id="chessSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#453726" />
            <stop offset="48%" stopColor="#9A7E54" />
            <stop offset="100%" stopColor="#E6C98F" />
          </linearGradient>
          <linearGradient id="kingGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF7D6" />
            <stop offset="45%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
        </defs>
        <rect width="320" height="200" fill="url(#chessSky)" />
        <path
          d="M0 112 H30 V88 H42 V102 H54 V80 H68 V112 H225 V76 H240 V92 H256 V68 H274 V95 H290 V84 H320 V120 H0 Z"
          fill="#292016"
          fillOpacity="0.45"
        />
        <path d="M0 124 L320 124 L320 200 L0 200 Z" fill="#1C1510" />
        <g fill="#E7D8B9" fillOpacity="0.85">
          <polygon points="40,124 90,124 80,142 20,142" />
          <polygon points="140,124 185,124 190,142 135,142" />
          <polygon points="235,124 285,124 300,142 245,142" />
          <polygon points="75,142 135,142 128,166 55,166" />
          <polygon points="190,142 248,142 262,166 196,166" />
          <polygon points="0,166 55,166 36,200 0,200" />
          <polygon points="128,166 196,166 204,200 118,200" />
          <polygon points="262,166 320,166 320,200 282,200" />
        </g>
        <g fill="#E5DEC9" stroke="#786B53" strokeWidth="1">
          <path d="M26 142 L38 142 L35 110 H29 Z" />
          <circle cx="32" cy="106" r="5" />
          <path d="M64 150 L82 150 L78 100 H68 Z" />
          <circle cx="73" cy="95" r="7" />
        </g>
        <g fill="#171412" stroke="#574C41" strokeWidth="1">
          <path d="M214 148 L232 148 L227 104 H219 Z" />
          <circle cx="223" cy="98" r="6" />
          <path d="M254 156 L276 156 L270 98 H260 Z" />
          <circle cx="265" cy="92" r="7" />
          <path d="M288 144 L304 144 L300 108 H292 Z" />
          <circle cx="296" cy="102" r="5.5" />
        </g>
        <g transform="translate(132, 34)">
          <rect x="25" y="2" width="6" height="16" rx="1" fill="url(#kingGold)" />
          <rect x="20" y="6" width="16" height="5" rx="1" fill="url(#kingGold)" />
          <path d="M16 20 H40 L37 32 H19 Z" fill="url(#kingGold)" />
          <ellipse cx="28" cy="34" rx="13" ry="3.5" fill="#FDE047" />
          <path d="M19 36 C18 68 14 92 10 112 H46 C42 92 38 68 37 36 Z" fill="url(#kingGold)" />
          <ellipse cx="28" cy="113" rx="22" ry="6" fill="#CA8A04" stroke="#FEF08A" strokeWidth="1.2" />
          <rect x="6" y="113" width="44" height="9" rx="3" fill="url(#kingGold)" />
        </g>
      </svg>
    );
  }

  // Fallback artwork for newly created custom games without uploaded media yet
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#231442] via-[#130D22] to-[#3B2611] flex flex-col items-center justify-center p-3 text-center">
      <MonarchCrownLogo className="w-10 h-8 opacity-80 mb-1" />
      <span className="font-display font-extrabold text-sm tracking-wider uppercase text-[#F6C866]/90">
        {title}
      </span>
    </div>
  );
};
