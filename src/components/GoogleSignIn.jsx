import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { completeGoogleSignIn } from "../services/authService";

export default function GoogleSignIn() {
  const [error, setError] = useState("");
  const requestStarted = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (requestStarted.current) return;
    requestStarted.current = true;

    async function finishSignIn() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (params.get("error")) {
        setError("Google sign-in was cancelled or denied.");
        return;
      }

      if (!code || !state) {
        setError("Google's response is missing its code or state.");
        return;
      }

      try {
        await completeGoogleSignIn(code, state);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setError(err.message || "Google sign-in failed. Please try again.");
      }
    }

    finishSignIn();
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="text-center">
        {error ? (
          <>
            <h1 className="text-lg font-semibold text-red-600">
              Sign-in could not be completed
            </h1>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <a
              href="/"
              className="mt-5 inline-block text-sm font-medium text-violet-700 hover:underline"
            >
              Return to login
            </a>
          </>
        ) : (
          <>
            <div
              className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"
              role="status"
              aria-label="Loading"
            />
            <h1 className="mt-5 text-lg font-semibold text-slate-800">
              Signing you in…
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Connecting your Google account. Please wait.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
