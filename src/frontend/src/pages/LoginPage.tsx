import type { UserProfile } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActor } from "@/hooks/useActor";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Page } from "../App";

interface LoginPageProps {
  navigate: (page: Page) => void;
  onLogin: (profile: UserProfile, isAdmin: boolean) => void;
}

export default function LoginPage({ navigate, onLogin }: LoginPageProps) {
  const { login, isLoggingIn, identity, isLoginSuccess } = useAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [waitingForIdentity, setWaitingForIdentity] = useState(false);
  const processedRef = useRef(false);
  const currentYear = new Date().getFullYear();

  const processLogin = useCallback(
    async (actorInstance: NonNullable<typeof actor>) => {
      setIsProcessing(true);
      setError("");
      try {
        const usernameVal = username.trim();
        const profile: UserProfile = { username: usernameVal, email: "" };
        await actorInstance.saveCallerUserProfile(profile);
        const isAdmin = await actorInstance.isCallerAdmin();
        onLogin(profile, isAdmin);
        navigate(isAdmin ? "admin" : "home");
      } catch {
        setError("Login failed. Please try again.");
      } finally {
        setIsProcessing(false);
        processedRef.current = false;
      }
    },
    [username, onLogin, navigate],
  );

  // Trigger login processing when identity becomes available
  useEffect(() => {
    if (
      waitingForIdentity &&
      isLoginSuccess &&
      identity &&
      !identity.getPrincipal().isAnonymous() &&
      !actorFetching &&
      actor &&
      !processedRef.current
    ) {
      processedRef.current = true;
      setWaitingForIdentity(false);
      void processLogin(actor);
    }
  }, [
    waitingForIdentity,
    isLoginSuccess,
    identity,
    actor,
    actorFetching,
    processLogin,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) return setError("Please enter a username.");
    if (!password.trim()) return setError("Please enter a password.");

    // If already authenticated with a valid identity
    if (
      identity &&
      !identity.getPrincipal().isAnonymous() &&
      actor &&
      !actorFetching
    ) {
      await processLogin(actor);
      return;
    }

    // Trigger Internet Identity login
    processedRef.current = false;
    setWaitingForIdentity(true);
    login();
  }

  const isBusy = isLoggingIn || isProcessing || waitingForIdentity;

  return (
    <div className="min-h-screen flex flex-col page-enter mc-bg mc-grid">
      {/* Header */}
      <header
        className="flex items-center gap-4 px-6 py-4 border-b border-[oklch(0.25_0.04_145)]"
        style={{
          background: "oklch(0.09 0.02 145 / 0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <motion.button
          data-ocid="login.back_button"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-[oklch(0.72_0.22_142)] hover:text-[oklch(0.85_0.22_142)] transition-colors font-pixel text-[10px]"
        >
          <ArrowLeft size={12} />
          BACK
        </motion.button>
        <div className="flex-1" />
        <div className="font-pixel text-[oklch(0.72_0.22_142)] text-xs hidden sm:block tracking-widest">
          SWORD MC
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Card */}
          <div
            className="rounded-sm overflow-hidden"
            style={{
              background: "oklch(0.12 0.03 145)",
              border: "2px solid oklch(0.55 0.22 142)",
              boxShadow:
                "0 0 30px oklch(0.72 0.22 142 / 0.3), 0 0 80px oklch(0.72 0.22 142 / 0.1)",
            }}
          >
            {/* Green top accent */}
            <div
              className="h-1 w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.72 0.22 142), transparent)",
              }}
            />

            <div className="px-7 py-8">
              {/* Title */}
              <div className="text-center mb-8">
                <div className="text-4xl mb-3">🔑</div>
                <h1
                  className="font-pixel text-sm leading-loose"
                  style={{
                    color: "oklch(0.85 0.22 142)",
                    textShadow: "0 0 12px oklch(0.72 0.22 142 / 0.6)",
                  }}
                >
                  LOGIN
                </h1>
                <p className="text-[oklch(0.5_0.03_145)] text-xs mt-2 font-sans">
                  Sign in to your SWORD MC account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-username"
                    className="block font-pixel text-[10px] mb-2"
                    style={{ color: "oklch(0.65 0.15 142)" }}
                  >
                    USERNAME
                  </label>
                  <Input
                    id="login-username"
                    data-ocid="login.username_input"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isBusy}
                    autoComplete="username"
                    className="rounded-sm font-sans text-sm"
                    style={{
                      background: "oklch(0.08 0.02 145)",
                      border: "1px solid oklch(0.35 0.06 145)",
                      color: "oklch(0.88 0.02 145)",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block font-pixel text-[10px] mb-2"
                    style={{ color: "oklch(0.65 0.15 142)" }}
                  >
                    PASSWORD
                  </label>
                  <Input
                    id="login-password"
                    data-ocid="login.password_input"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isBusy}
                    autoComplete="current-password"
                    className="rounded-sm font-sans text-sm"
                    style={{
                      background: "oklch(0.08 0.02 145)",
                      border: "1px solid oklch(0.35 0.06 145)",
                      color: "oklch(0.88 0.02 145)",
                    }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    data-ocid="login.error_state"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-center"
                    style={{ color: "oklch(0.65 0.22 25)" }}
                  >
                    ⚠ {error}
                  </motion.p>
                )}

                {/* Submit */}
                <Button
                  data-ocid="login.submit_button"
                  type="submit"
                  disabled={isBusy}
                  className="w-full mc-btn py-3 font-pixel text-xs tracking-wider rounded-sm mt-2"
                  style={{
                    background: isBusy
                      ? "oklch(0.22 0.06 142)"
                      : "oklch(0.18 0.08 142)",
                    border: "2px solid oklch(0.65 0.22 142)",
                    color: "oklch(0.92 0.22 142)",
                    boxShadow: "0 0 12px oklch(0.72 0.22 142 / 0.3)",
                  }}
                >
                  {isBusy ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>CONNECTING...</span>
                    </span>
                  ) : (
                    "LOGIN ▶"
                  )}
                </Button>

                {/* Info text for II */}
                <p className="text-[oklch(0.4_0.03_145)] text-[10px] text-center font-sans leading-relaxed">
                  Uses Internet Identity for secure authentication
                </p>
              </form>

              {/* Divider */}
              <div
                className="my-5 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.3 0.04 145), transparent)",
                }}
              />

              {/* Register link */}
              <p className="text-center text-xs text-[oklch(0.5_0.03_145)]">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  data-ocid="login.register_link"
                  onClick={() => navigate("register")}
                  className="font-pixel text-[10px] transition-colors"
                  style={{ color: "oklch(0.72 0.22 142)" }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.color =
                      "oklch(0.88 0.22 142)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.color =
                      "oklch(0.72 0.22 142)";
                  }}
                >
                  REGISTER
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0d0a] border-t border-[oklch(0.2_0.03_145)] px-6 py-4 text-center">
        <p className="text-[oklch(0.4_0.03_145)] text-xs">
          © {currentYear}. Built with{" "}
          <span className="text-[oklch(0.62_0.25_25)]">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[oklch(0.55_0.12_142)] hover:text-[oklch(0.72_0.22_142)] transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
