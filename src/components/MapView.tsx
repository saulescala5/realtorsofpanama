import { useEffect, useRef } from 'react'
import type { Map as MLMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface MapPoint { id: string; lat: number; lng: number; label: string }

const STYLE = 'https://tiles.openfreemap.org/styles/positron'

/** Recolors the light OpenFreeMap style into a black map with quiet grey streets. */
function darken(map: MLMap) {
  for (const l of map.getStyle().layers ?? []) {
    const id = l.id.toLowerCase()
    try {
      if (l.type === 'background') map.setPaintProperty(l.id, 'background-color', '#000000')
      else if (l.type === 'fill') map.setPaintProperty(l.id, 'fill-color', id.includes('water') ? '#151513' : id.includes('building') ? '#121211' : '#070707')
      else if (l.type === 'line') map.setPaintProperty(l.id, 'line-color', id.includes('water') || id.includes('river') ? '#151513' : '#2a2926')
      else if (l.type === 'symbol') { map.setPaintProperty(l.id, 'text-color', '#6f6d68'); map.setPaintProperty(l.id, 'text-halo-color', '#000000') }
    } catch { /* layer without that property */ }
  }
}

export default function MapView({ points, dark = false, center = [-79.515, 8.99], zoom = 12.3, selected, onSelect, pinClass = 'price-pin', interactive = true, className = '' }: {
  points: MapPoint[]; dark?: boolean; center?: [number, number]; zoom?: number; selected?: string | null
  onSelect?: (id: string) => void; pinClass?: string; interactive?: boolean; className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<MLMap | null>(null)
  const markers = useRef<Map<string, Marker>>(new Map())
  const ready = useRef<Promise<typeof import('maplibre-gl')> | null>(null)

  useEffect(() => {
    let dead = false
    ready.current = import('maplibre-gl').then((ml) => {
      if (dead || !box.current) return ml
      const m = new ml.Map({ container: box.current, style: STYLE, center, zoom, attributionControl: { compact: true }, interactive, cooperativeGestures: interactive })
      if (interactive) m.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right')
      if (dark) m.on('style.load', () => darken(m))
      map.current = m
      return ml
    })
    return () => { dead = true; map.current?.remove(); map.current = null; markers.current.clear() }
  }, [dark, interactive]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    ready.current?.then((ml) => {
      const m = map.current
      if (!m) return
      markers.current.forEach((mk) => mk.remove()); markers.current.clear()
      for (const p of points) {
        const el = document.createElement('button')
        el.type = 'button'
        el.className = pinClass
        if (pinClass === 'hood-pin') { el.innerHTML = '<i></i><span></span>'; el.querySelector('span')!.textContent = p.label }
        else el.textContent = p.label
        el.setAttribute('aria-label', p.label)
        el.onclick = (e) => { e.stopPropagation(); onSelect?.(p.id) }
        markers.current.set(p.id, new ml.Marker({ element: el, anchor: pinClass === 'hood-pin' ? 'left' : 'center' }).setLngLat([p.lng, p.lat]).addTo(m))
      }
      if (points.length > 1 && pinClass !== 'hood-pin') {
        const b = new ml.LngLatBounds()
        points.forEach((p) => b.extend([p.lng, p.lat]))
        m.fitBounds(b, { padding: 60, maxZoom: 14, duration: 0 })
      } else if (points.length === 1 && pinClass !== 'hood-pin') m.jumpTo({ center: [points[0].lng, points[0].lat], zoom: 14 })
    })
  }, [points, pinClass]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    markers.current.forEach((mk, id) => mk.getElement().classList.toggle('on', id === selected))
  }, [selected, points])

  return <div ref={box} className={`h-full w-full ${className}`} />
}
