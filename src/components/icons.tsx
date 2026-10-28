// Brand icons. WhatsApp mark + duotone "spot" icons (gold shape behind an ink line drawing),
// drawn for Realtors of Panama so the site doesn't look like a stock icon pack.
import type { SVGProps } from 'react'

export function WhatsAppIcon({ size = 18, ...p }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden {...p}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.7C5.8.7.7 5.79.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.3l5.72-1.5a11.33 11.33 0 0 0 5.42 1.38h.01c6.25 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02" />
    </svg>
  )
}

type SpotName =
  | 'chat' | 'agent' | 'verified' | 'key' | 'calendar' | 'compass' | 'chart' | 'passport' | 'home' | 'coins'
  | 'camera' | 'document' | 'pin' | 'family' | 'palm' | 'building' | 'handshake' | 'sun' | 'wave' | 'leaf' | 'cup' | 'school' | 'car' | 'bag'

const PATHS: Record<SpotName, { blob: string; line: string }> = {
  chat: { blob: 'M10 30a14 12 0 1 1 6 9l-7 3 2-6a12 12 0 0 1-1-6Z', line: 'M14 14h20a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H22l-7 6v-6h-1a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Zm5 9h.01M24 23h.01M29 23h.01' },
  agent: { blob: 'M8 40c2-10 10-14 18-14s14 4 16 14Z', line: 'M24 24a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm-12 16c1.5-7 6.5-11 12-11s10.5 4 12 11M31 31l3 3 6-7' },
  verified: { blob: 'M24 6l14 5v11c0 9-6 16-14 20C16 38 10 31 10 22V11Z', line: 'M24 8l13 4.5V22c0 8-5.5 14.5-13 18-7.5-3.5-13-10-13-18v-9.5ZM18 24l4.5 4.5L31 20' },
  key: { blob: 'M16 32a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z', line: 'M18 30a8 8 0 1 1 7.4-11H40v5h-4v4h-5v-4h-5.6A8 8 0 0 1 18 30Zm-3-8h.01' },
  calendar: { blob: 'M8 16h32v24H8Z', line: 'M11 13h26a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V15a2 2 0 0 1 2-2Zm-2 8h30M17 9v7M31 9v7M19 30l3 3 7-7' },
  compass: { blob: 'M24 40a16 16 0 1 1 0-32 16 16 0 0 1 0 32Z', line: 'M24 39a15 15 0 1 0 0-30 15 15 0 0 0 0 30Zm6.5-21.5L27 27l-9.5 3.5L21 21Z' },
  chart: { blob: 'M8 40V24l10-6 8 6 14-12v28Z', line: 'M9 39h31M13 33v-6M21 33V21M29 33v-9M37 33V15M12 21l9-7 8 5 9-8' },
  passport: { blob: 'M12 8h20a4 4 0 0 1 4 4v28H12Z', line: 'M14 8h18a3 3 0 0 1 3 3v26a3 3 0 0 1-3 3H14a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Zm9 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-6 9h12' },
  home: { blob: 'M8 22 24 9l16 13v18H8Z', line: 'M9 22 24 10l15 12M13 19v20h22V19M21 39V29h6v10' },
  coins: { blob: 'M18 26a10 6 0 1 1 0-12 10 6 0 0 1 0 12Z', line: 'M8 17c0-3 4.5-5 10-5s10 2 10 5-4.5 5-10 5-10-2-10-5Zm0 0v6c0 3 4.5 5 10 5m-10-5v6c0 3 4.5 5 10 5m2-11c0-3 4.5-5 10-5s10 2 10 5-4.5 5-10 5-10-2-10-5Zm0 0v8c0 3 4.5 5 10 5s10-2 10-5v-8' },
  camera: { blob: 'M8 18h32v20H8Z', line: 'M10 16h6l3-4h10l3 4h6a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2Zm14 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z' },
  document: { blob: 'M12 8h16l8 8v24H12Z', line: 'M14 7h14l8 8v24a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm14 0v8h8M18 23h12M18 29h12M18 35h7' },
  pin: { blob: 'M24 42s-13-11-13-21a13 13 0 0 1 26 0c0 10-13 21-13 21Z', line: 'M24 41s-12-10.5-12-20a12 12 0 0 1 24 0c0 9.5-12 20-12 20Zm0-15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z' },
  family: { blob: 'M6 40c1-8 6-12 12-12s9 3 10 6c1-3 4-5 8-5 5 0 7 4 8 11Z', line: 'M17 24a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm16 2a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM6 40c1-8 5.5-12 11-12s10 4 11 12m1-9c1-2 2.5-3 4.5-3 4 0 7 3.5 8 12' },
  palm: { blob: 'M6 40h36v-6H6Z', line: 'M24 40c0-9 1-17 4-22M28 18c-4-5-10-6-16-3 5 0 9 1 12 4m4-1c3-5 9-6 14-3-4 0-8 1-11 4m-3-1c0-5-3-8-7-9 3 3 4 6 4 9m3 0c4-3 8-3 11 0-3-1-6 0-8 2M6 40h36' },
  building: { blob: 'M14 8h20v32H14Z', line: 'M14 40V9h20v31M8 40h32M19 14h3M26 14h3M19 20h3M26 20h3M19 26h3M26 26h3M21 40v-7h6v7' },
  handshake: { blob: 'M6 22l10-8 8 4 8-4 10 8-18 16Z', line: 'M5 21l7-6 6 3M43 21l-7-6-8 3-7 5a3 3 0 0 0 4 4l5-3 9 8M12 15l-4 12 9 9a3 3 0 0 0 4-4m-4-1 4 4a3 3 0 0 0 4-4m-3-2 3 3a3 3 0 0 0 4-4' },
  sun: { blob: 'M24 34a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z', line: 'M24 32a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM24 6v4M24 38v4M6 24h4M38 24h4M11 11l3 3M34 34l3 3M11 37l3-3M34 14l3-3' },
  wave: { blob: 'M6 30c6-6 12-6 18 0s12 6 18 0v10H6Z', line: 'M6 22c4-4 8-4 12 0s8 4 12 0 8-4 12 0M6 30c4-4 8-4 12 0s8 4 12 0 8-4 12 0M6 38c4-4 8-4 12 0s8 4 12 0 8-4 12 0' },
  leaf: { blob: 'M10 38C10 20 22 10 40 10c0 18-10 28-30 28Z', line: 'M11 37C11 21 22 11 39 11c0 17-10 27-28 26Zm0 0 15-15' },
  cup: { blob: 'M10 18h24v12a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10Z', line: 'M11 18h22v11a10 10 0 0 1-10 10h-2a10 10 0 0 1-10-10Zm22 3h3a4 4 0 0 1 0 8h-3M17 8c-1 2 1 3 0 5M23 8c-1 2 1 3 0 5M29 8c-1 2 1 3 0 5' },
  school: { blob: 'M4 18 24 9l20 9-20 9Z', line: 'M4 18 24 10l20 8-20 8Zm8 4v9c3 3 7 4 12 4s9-1 12-4v-9M44 18v10' },
  car: { blob: 'M6 26l5-10h26l5 10v10H6Z', line: 'M8 27l4-10h24l4 10M7 27h34v8H7ZM12 35v4M36 35v4M13 31h.01M35 31h.01' },
  bag: { blob: 'M10 16h28l-2 24H12Z', line: 'M11 16h26l-1.8 22a2 2 0 0 1-2 2H14.8a2 2 0 0 1-2-2ZM18 20v-6a6 6 0 0 1 12 0v6' },
}

/** Duotone spot icon. `tone` picks the shape color behind the drawing. */
export function Spot({ name, size = 48, tone = 'gold', className = '' }: { name: SpotName; size?: number; tone?: 'gold' | 'mint' | 'sky' | 'rose' | 'light'; className?: string }) {
  const fill = { gold: '#E3C46E', mint: '#9BE3C0', sky: '#B9D7F2', rose: '#F3C3B8', light: 'rgba(255,255,255,.18)' }[tone]
  const p = PATHS[name]
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden className={className}>
      <path d={p.blob} fill={fill} transform="translate(2 2)" />
      <path d={p.line} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export type { SpotName }
