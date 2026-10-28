import type { Lang } from './types'

const locale = (lang: Lang) => (lang === 'es' ? 'es-PA' : 'en-US')

export const money = (n: number, lang: Lang = 'en') =>
  new Intl.NumberFormat(lang === 'es' ? 'es-US' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const compact = (n: number, lang: Lang = 'en') =>
  new Intl.NumberFormat(locale(lang), { notation: 'compact', maximumFractionDigits: 1 }).format(n)

export const dateTime = (iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) =>
  new Intl.DateTimeFormat(locale(lang), opts).format(new Date(iso))

export function timeAgo(iso: string, lang: Lang) {
  const rtf = new Intl.RelativeTimeFormat(locale(lang), { numeric: 'auto' })
  const diff = (new Date(iso).getTime() - Date.now()) / 1000
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [[60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.35, 'week'], [12, 'month']]
  let v = diff
  for (const [k, unit] of steps) {
    if (Math.abs(v) < k) return rtf.format(Math.round(v), unit)
    v /= k
  }
  return rtf.format(Math.round(v), 'year')
}

export const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
