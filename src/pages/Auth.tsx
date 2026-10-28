import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { Logo } from '@/components/ui'

export default function Auth() {
  const { t } = useI18n()
  const { login, user, demo } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/admin" replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    const r = await login(email.trim(), password)
    setBusy(false)
    if (r) setErr(r === 'not-admin' ? t.login.notAdmin : r)
    else nav('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <form onSubmit={submit} className="card w-full max-w-sm p-7">
        <Logo />
        <h1 className="mt-6 text-xl font-extrabold">{t.login.title}</h1>
        {demo && <p className="mt-2 rounded-xl bg-sun-400/25 px-3 py-2 text-xs font-semibold text-amber-900">{t.login.demo}</p>}
        <label className="label mt-5">{t.login.email}</label>
        <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="label mt-4">{t.login.password}</label>
        <input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}
        <button disabled={busy} className="btn-primary mt-6 w-full">{t.login.submit}</button>
      </form>
    </div>
  )
}
