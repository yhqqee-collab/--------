const svgProps = {
  viewBox: '0 0 100 100',
  className: 'block size-full',
  'aria-hidden': true,
} as const

const PETAL_COLORS = [
  '#FDCB3E',
  '#F7953A',
  '#EE4B4A',
  '#C64C9A',
  '#8A5BC5',
  '#3E8CE5',
  '#4AC2C8',
  '#8CCB4E',
]

function WhiteBackground({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EEEEF1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id})`} />
    </>
  )
}

function SoftShadow({ id }: { id: string }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.6" stdDeviation="1.6" floodColor="#000" floodOpacity="0.22" />
    </filter>
  )
}

export function PhotosArt() {
  return (
    <svg {...svgProps}>
      <WhiteBackground id="photos-bg" />
      {PETAL_COLORS.map((color, i) => (
        <ellipse
          key={color}
          cx="50"
          cy="31"
          rx="11"
          ry="18.5"
          fill={color}
          opacity="0.85"
          transform={`rotate(${i * 45} 50 50)`}
          style={{ mixBlendMode: 'multiply' }}
        />
      ))}
    </svg>
  )
}

export function KakaoArt() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="kakao-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFEC5C" />
          <stop offset="100%" stopColor="#F7D21E" />
        </linearGradient>
        <linearGradient id="kakao-bubble" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A2B25" />
          <stop offset="100%" stopColor="#2F1714" />
        </linearGradient>
        <SoftShadow id="kakao-shadow" />
      </defs>
      <rect width="100" height="100" fill="url(#kakao-bg)" />
      <g filter="url(#kakao-shadow)">
        <ellipse cx="50" cy="46" rx="34" ry="26" fill="url(#kakao-bubble)" />
        <path d="M30 64 L27.5 81 L47 70.5 Z" fill="#311915" />
      </g>
      <text
        x="50"
        y="53.5"
        textAnchor="middle"
        fontSize="20"
        fontWeight="900"
        fill="#FAD83A"
        fontFamily="'SF Pro Rounded', ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif"
        letterSpacing="-0.6"
      >
        TALK
      </text>
    </svg>
  )
}

export function InstagramArt() {
  return (
    <svg {...svgProps}>
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
        <SoftShadow id="ig-shadow" />
      </defs>
      <rect width="100" height="100" fill="url(#ig-grad)" />
      <g filter="url(#ig-shadow)">
        <rect x="22" y="22" width="56" height="56" rx="16" fill="none" stroke="#fff" strokeWidth="6.5" />
        <circle cx="50" cy="50" r="13" fill="none" stroke="#fff" strokeWidth="6.5" />
        <circle cx="66.5" cy="33.5" r="4" fill="#fff" />
      </g>
    </svg>
  )
}

export function HotelArt() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/hotel-logo.png"
      alt=""
      aria-hidden
      draggable={false}
      className="size-full object-cover"
    />
  )
}

export function XArt() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="x-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2A2C" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#x-bg)" />
      <g transform="translate(27 27) scale(1.92)">
        <path
          fill="#fff"
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      </g>
    </svg>
  )
}

function GreenBackground({ id }: { id: string }) {
  return (
    <>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8EF79B" />
        <stop offset="100%" stopColor="#37CD53" />
      </linearGradient>
      <linearGradient id={`${id}-glyph`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E2FBE4" />
      </linearGradient>
      <SoftShadow id={`${id}-shadow`} />
    </>
  )
}

export function MessagesArt() {
  return (
    <svg {...svgProps}>
      <defs>
        <GreenBackground id="msg" />
      </defs>
      <rect width="100" height="100" fill="url(#msg-bg)" />
      <g filter="url(#msg-shadow)" fill="url(#msg-glyph)">
        <ellipse cx="50" cy="47" rx="33" ry="27" />
        <path d="M24 75 C31 73.5 34.5 69 35.5 64 L45 70.5 C39.5 74.5 31.5 76.5 24 75 Z" />
      </g>
    </svg>
  )
}

  export function PhoneArt() {
  return (
  <svg {...svgProps}>
  <defs>
  <GreenBackground id="phone" />
  </defs>
  <rect width="100" height="100" fill="url(#phone-bg)" />
  <g filter="url(#phone-shadow)" fill="url(#phone-glyph)">
  <path
  transform="translate(20 20) scale(2.5)"
  d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
  />
  </g>
  </svg>
  )
  }
  
  export function SafariArt() {
  const ticks = Array.from({ length: 48 }, (_, i) => i)
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="safari-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5CCBFF" />
          <stop offset="100%" stopColor="#1A64EE" />
        </linearGradient>
        <SoftShadow id="safari-shadow" />
      </defs>
      <WhiteBackground id="safari-bg-fill" />
      <circle cx="50" cy="50" r="39" fill="url(#safari-grad)" />
      <circle cx="50" cy="50" r="38.5" fill="none" stroke="#0B4FC7" strokeOpacity="0.25" strokeWidth="1" />
      {ticks.map((i) => (
        <line
          key={i}
          x1="50"
          y1="15"
          x2="50"
          y2={i % 4 === 0 ? 21 : 18.5}
          stroke="#fff"
          strokeWidth={i % 4 === 0 ? 1.3 : 0.75}
          opacity="0.85"
          transform={`rotate(${i * 7.5} 50 50)`}
        />
      ))}
      <g transform="rotate(45 50 50)" filter="url(#safari-shadow)">
        <polygon points="50,21 55,50 45,50" fill="#FF3B30" />
        <polygon points="45,50 55,50 50,79" fill="#fff" />
      </g>
      <circle cx="50" cy="50" r="2.2" fill="#fff" />
      <circle cx="50" cy="50" r="1.1" fill="#C9C9CE" />
    </svg>
  )
}

export function YouTubeMusicArt() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="ytm-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF4A4F" />
          <stop offset="100%" stopColor="#E0202E" />
        </linearGradient>
        <SoftShadow id="ytm-shadow" />
      </defs>
      <WhiteBackground id="ytm-bg" />
      <circle cx="50" cy="50" r="35" fill="url(#ytm-red)" filter="url(#ytm-shadow)" />
      <circle cx="50" cy="50" r="21" fill="none" stroke="#fff" strokeWidth="2.6" />
      <path d="M44 40.5 L60 50 L44 59.5 Z" fill="#fff" strokeLinejoin="round" stroke="#fff" strokeWidth="1.5" />
    </svg>
  )
}
