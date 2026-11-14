function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.4l7.8 6.1C12.3 13.7 17.7 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.6 2.9-2.2 5.3-4.6 7l7.4 5.7c4.3-4 6.9-9.9 6.9-17.2Z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.6l7.8-6.1Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.4-5.7c-2.1 1.4-4.7 2.2-7.9 2.2-6.3 0-11.7-4.2-13.6-10l-7.8 6.1C6.5 43 14.6 48 24 48Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
        <header className="mb-9 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-xl font-bold text-white shadow-lg shadow-violet-200">
            T
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
            AI-powered productivity
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to TaskPilot
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Plan your day, organize your tasks, and make steady progress toward
            your goals.
          </p>
        </header>

        <a
          href="http://localhost:3000/auth/google"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-100"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </a>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Sign in securely with your Google account to access your workspace.
        </p>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span>
              Organize tasks
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span>
              Track progress
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span>
              Stay focused
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
