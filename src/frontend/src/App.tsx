import type { UserProfile } from "@/backend.d";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCallerProfile, useIsCallerAdmin } from "@/hooks/useQueries";
import { useCallback, useEffect, useState } from "react";
import AdminDashboard from "./pages/AdminDashboard";
import CoinsPage from "./pages/CoinsPage";
import ContentEditorPage from "./pages/ContentEditorPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RanksPage from "./pages/RanksPage";
import RegisterPage from "./pages/RegisterPage";

export type Page =
  | "home"
  | "ranks"
  | "coins"
  | "login"
  | "register"
  | "admin"
  | "editor";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { identity } = useInternetIdentity();

  const profileQuery = useCallerProfile();
  const adminQuery = useIsCallerAdmin();

  // Sync React Query results into local state
  useEffect(() => {
    if (profileQuery.data !== undefined) {
      setCurrentUser(profileQuery.data);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (adminQuery.data !== undefined) {
      setIsAdmin(adminQuery.data);
    }
  }, [adminQuery.data]);

  // Clear local state when identity is lost
  useEffect(() => {
    if (!identity || identity.getPrincipal().isAnonymous()) {
      setCurrentUser(null);
      setIsAdmin(false);
    }
  }, [identity]);

  const handleLogin = useCallback(
    (profile: UserProfile, adminStatus: boolean) => {
      setCurrentUser(profile);
      setIsAdmin(adminStatus);
    },
    [],
  );

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setIsAdmin(false);
  }, []);

  return (
    <div className="min-h-screen mc-bg mc-grid">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#0e1a0e",
            border: "2px solid #4ade80",
            color: "#d4ffd4",
            fontFamily: '"Segoe UI", system-ui, sans-serif',
          },
        }}
      />
      {page === "home" && (
        <HomePage
          navigate={setPage}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}
      {page === "ranks" && (
        <RanksPage
          navigate={setPage}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}
      {page === "coins" && (
        <CoinsPage
          navigate={setPage}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}
      {page === "login" && (
        <LoginPage navigate={setPage} onLogin={handleLogin} />
      )}
      {page === "register" && (
        <RegisterPage navigate={setPage} onLogin={handleLogin} />
      )}
      {page === "admin" && isAdmin && (
        <AdminDashboard
          navigate={setPage}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
      {page === "admin" && !isAdmin && (
        <div className="min-h-screen flex items-center justify-center">
          <p
            className="font-pixel text-xs"
            style={{ color: "oklch(0.62 0.25 25)" }}
          >
            Access Denied
          </p>
        </div>
      )}
      {page === "editor" && isAdmin && (
        <ContentEditorPage
          navigate={setPage}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
      {page === "editor" && !isAdmin && (
        <div className="min-h-screen flex items-center justify-center">
          <p
            className="font-pixel text-xs"
            style={{ color: "oklch(0.62 0.25 25)" }}
          >
            Access Denied
          </p>
        </div>
      )}
    </div>
  );
}
