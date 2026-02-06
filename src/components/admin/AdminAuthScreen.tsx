type AuthStatus = 'checking' | 'authed' | 'unauth'

type AdminAuthScreenProps = {
  authStatus: AuthStatus
  password: string
  authError: string
  onPasswordChange: (value: string) => void
  onSubmit: () => void
}

// Full-screen login gate for the admin dashboard.
export default function AdminAuthScreen({
  authStatus,
  password,
  authError,
  onPasswordChange,
  onSubmit,
}: AdminAuthScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100/40 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl border border-amber-100 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1 border border-amber-100">
              Admin Portal
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {authStatus === 'checking' ? 'Checking...' : 'Secure access'}
            </h1>
            <p className="text-sm text-zinc-500">
              {authStatus === 'checking'
                ? 'Verifying your session credentials.'
                : 'Enter the admin password to continue managing interns.'}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Password</label>
            <input
              type="password"
              className="border border-amber-200 rounded-xl px-4 py-3 text-sm text-zinc-800 w-full focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="********"
              value={password}
              onChange={event => onPasswordChange(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') onSubmit()
              }}
              disabled={authStatus === 'checking'}
            />
            {authError ? (
              <div className="text-xs text-red-600">{authError}</div>
            ) : null}
          </div>
          <button
            className="w-full bg-amber-500 hover:bg-amber-600 transition text-white px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-70"
            onClick={onSubmit}
            disabled={authStatus === 'checking'}
          >
            {authStatus === 'checking' ? 'Checking...' : 'Unlock Admin'}
          </button>
          <div className="text-[11px] text-zinc-400">
            Contact your admin for credentials.
          </div>
        </div>
      </div>
    </div>
  )
}
