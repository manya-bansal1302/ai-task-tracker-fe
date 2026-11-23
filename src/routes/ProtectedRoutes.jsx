import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { getCurrentUser } from "../services/authService";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((result) => {
        if (active) {
          if (!result?.user || typeof result.user !== "object") {
            throw new Error("The server did not return your account details.");
          }
          setUser(result.user);
          setStatus("authenticated");
        }
      })
      .catch((error) => {
        if (active) {
          setStatus(error.status === 401 ? "unauthenticated" : "error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return <main className="p-8 text-slate-600">Checking your sign-in…</main>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  if (status === "error") {
    return (
      <main className="p-8 text-red-600">
        Could not check your sign-in. Please check the Render API rewrite for
        /auth/*, then refresh the page.
      </main>
    );
  }

  return <Outlet context={{ user }} />;
}
