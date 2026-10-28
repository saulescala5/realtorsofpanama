// Saved homes, kept in the visitor's browser (no account needed).
import { useEffect, useState } from 'react'

const KEY = 'rop:saved'
const read = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const listeners = new Set<(ids: string[]) => void>()

export function useSaved() {
  const [ids, setIds] = useState<string[]>(read)
  useEffect(() => { listeners.add(setIds); return () => { listeners.delete(setIds) } }, [])
  const toggle = (id: string) => {
    const next = read().includes(id) ? read().filter((x) => x !== id) : [...read(), id]
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode */ }
    listeners.forEach((l) => l(next))
  }
  return { ids, has: (id: string) => ids.includes(id), toggle }
}
