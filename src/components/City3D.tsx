import { useEffect, useRef } from 'react'
import type { Map as MLMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface CityPoint { id: string; lat: number; lng: number; label?: string }
type Theme = 'dark' | 'light'
const STYLE = 'https://tiles.openfreemap.org/styles/positron'
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function restyle(m: MLMap, theme: Theme) {
  const dark = theme === 'dark'
  for (const l of m.getStyle().layers ?? []) {
    const id = l.id.toLowerCase()
    try {
      if (l.type === 'background') m.setPaintProperty(l.id, 'background-color', dark ? '#000' : '#F4F4F2')
      else if (l.type === 'fill') {
        if (id.includes('building')) m.setLayoutProperty(l.id, 'visibility', 'none')
        else m.setPaintProperty(l.id, 'fill-color', id.includes('water') ? (dark ? '#0A0A0A' : '#E6E6E3') : dark ? '#050505' : '#F4F4F2')
      } else if (l.type === 'line') m.setPaintProperty(l.id, 'line-color', id.includes('water') ? (dark ? '#0A0A0A' : '#E6E6E3') : dark ? '#1E1E1C' : '#FFFFFF')
      else if (l.type === 'symbol') m.setLayoutProperty(l.id, 'visibility', 'none')
    } catch { /* not applicable */ }
  }
  const src = Object.keys(m.getStyle().sources).find((s) => m.getSource(s)?.type === 'vector')
  if (!src || m.getLayer('rop-3d')) return
  m.addLayer({
    id: 'rop-3d', type: 'fill-extrusion', source: src, 'source-layer': 'building', minzoom: 12,
    paint: {
      'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 0], 0, dark ? '#161615' : '#FFFFFF', 80, dark ? '#2A2926' : '#F1F0EC', 200, dark ? '#C8A24C' : '#D9C089'],
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      'fill-extrusion-opacity': dark ? 0.92 : 0.95,
    },
  })
}

export default function City3D({ theme = 'dark', points = [], focus, rotate = true, center = [-79.522, 8.983], zoom = 14.2, pitch = 62, onSelect, className = '' }: {
  theme?: Theme; points?: CityPoint[]; focus?: { lat: number; lng: number } | null; rotate?: boolean
  center?: [number, number]; zoom?: number; pitch?: number; onSelect?: (id: string) => void; className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<MLMap | null>(null)
  const markers = useRef<Marker[]>([])
  const ml = useRef<typeof import('maplibre-gl') | null>(null)
  const raf = useRef(0)
  const paused = useRef(false)

  useEffect(() => {
    let dead = false
    import('maplibre-gl').then((lib) => {
      if (dead || !box.current) return
      ml.current = lib
      const m = new lib.Map({ container: box.current, style: STYLE, center, zoom, pitch, bearing: -20, interactive: false, attributionControl: { compact: true }, antialias: true })
      map.current = m
      m.on('style.load', () => restyle(m, theme))
      const spin = () => {
        if (!paused.current && rotate && !reduced()) m.setBearing(m.getBearing() + 0.03)
        raf.current = requestAnimationFrame(spin)
      }
      m.once('load', () => { raf.current = requestAnimationFrame(spin); drawPins() })
    })
    return () => { dead = true; cancelAnimationFrame(raf.current); map.current?.remove(); map.current = null }
  }, [theme]) // eslint-disable-line react-hooks/exhaustive-deps

  const drawPins = () => {
    const m = map.current, lib = ml.current
    if (!m || !lib) return
    markers.current.forEach((x) => x.remove())
    markers.current = points.map((p) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = `city-pin ${theme}`
      el.setAttribute('aria-label', p.label ?? p.id)
      el.innerHTML = '<i></i>' + (p.label ? '<span></span>' : '')
      if (p.label) el.querySelector('span')!.textContent = p.label
      el.onclick = () => onSelect?.(p.id)
      return new lib.Marker({ element: el, anchor: 'bottom' }).setLngLat([p.lng, p.lat]).addTo(m)
    })
  }
  useEffect(() => { drawPins() }, [points]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = map.current
    if (!m || !focus) { paused.current = false; return }
    paused.current = true
    m.flyTo({ center: [focus.lng, focus.lat], zoom: 15.4, pitch: 65, speed: 0.8, essential: false })
    const t = window.setTimeout(() => { paused.current = false }, 2500)
    return () => window.clearTimeout(t)
  }, [focus?.lat, focus?.lng]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={box} className={`h-full w-full ${className}`} aria-hidden />
}
