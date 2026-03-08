import type { UserProfile } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActor } from "@/hooks/useActor";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Page } from "../App";

interface RegisterPageProps {
  navigate: (page: Page) => void;
  onLogin: (profile: UserProfile, isAdmin: boolean) => void;
}

export default function RegisterPage({ navigate, onLogin }: RegisterPageProps) {
  const { login, isLoggingIn, identity, isLoginSuccess } = useAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [waitingForIdentity, setWaitingForIdentity] = useState(false);
  const processedRef = useRef(false);
  const currentYear = new Date().getFullYear();

  const processRegister = useCallback(
    async (actorInstance: NonNullable<typeof actor>) => {
      setIsProcessing(true);
      setError("");
      try {
        // Register as regular user
        try {
          await actorInstance._initializeAccessControlWithSecret("user_secret");
        } catch {
          // Already initialized -- continue
        }
        const profile: UserProfile = {
          username: username.trim(),
          email: email.trim(),
        };
        await actorInstance.saveCallerUserProfile(profile);
        const isAdmin = await actorInstance.isCallerAdmin();
        onLogin(profile, isAdmin);
        navigate(isAdmin ? "admin" : "home");
      } catch {
        setError("Registration failed. Please try again.");
      } finally {
        setIsProcessing(false);
        processedRef.current = false;
      }
    },
    [username, email, onLogin, navigate],
  );

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
      void processRegister(actor);
    }
  }, [
    waitingForIdentity,
    isLoginSuccess,
    identity,
    actor,
    actorFetching,
    processRegister,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) return setError("Please enter a username.");
    if (username.trim().length < 3)
      return setError("Username must be at least 3 characters.");
    if (!email.trim()) return setError("Please enter an email address.");
    if (!email.includes("@")) return setError("Please enter a valid email.");
    if (!password) return setError("Please enter a password.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    // If already authenticated
    if (
      identity &&
      !identity.getPrincipal().isAnonymous() &&
      actor &&
      !actorFetching
    ) {
      await processRegister(actor);
      return;
    }

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
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-[oklch(0.78_0.18_72)] hover:text-[oklch(0.92_0.18_72)] transition-colors font-pixel text-[10px]"
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
          <div
            className="rounded-sm overflow-hidden"
            style={{
              background: "oklch(0.12 0.03 145)",
              border: "2px solid oklch(0.62 0.18 72)",
              boxShadow:
                "0 0 30px oklch(0.78 0.18 72 / 0.25), 0 0 80px oklch(0.78 0.18 72 / 0.08)",
            }}
          >
            {/* Gold top accent */}
            <div
              className="h-1 w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.78 0.18 72), transparent)",
              }}
            />

            <div className="px-7 py-8">
              {/* Title */}
              <div className="text-center mb-7">
                <div className="text-4xl mb-3">📜</div>
                <h1
                  className="font-pixel text-sm leading-loose"
                  style={{
                    color: "oklch(0.88 0.18 72)",
                    textShadow: "0 0 12px oklch(0.78 0.18 72 / 0.5)",
                  }}
                >
                  REGISTER
                </h1>
                <p className="text-[oklch(0.5_0.03_145)] text-xs mt-2 font-sans">
                  Create your SWORD MC account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label
                    htmlFor="reg-username"
                    className="block font-pixel text-[10px] mb-1.5"
                    style={{ color: "oklch(0.65 0.12 72)" }}
                  >
                    USERNAME
                  </label>
                  <Input
                    id="reg-username"
                    data-ocid="register.username_input"
                    type="text"
                    placeholder="Choose a username"
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
                    htmlFor="reg-email"
                    className="block font-pixel text-[10px] mb-1.5"
                    style={{ color: "oklch(0.65 0.12 72)" }}
                  >
                    EMAIL
                  </label>
                  <Input
                    id="reg-email"
                    data-ocid="register.email_input"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isBusy}
                    autoComplete="email"
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
                    htmlFor="reg-password"
                    className="block font-pixel text-[10px] mb-1.5"
                    style={{ color: "oklch(0.65 0.12 72)" }}
                  >
                    PASSWORD
                  </label>
                  <Input
                    id="reg-password"
                    data-ocid="register.password_input"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isBusy}
                    autoComplete="new-password"
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
                    htmlFor="reg-confirm"
                    className="block font-pixel text-[10px] mb-1.5"
                    style={{ color: "oklch(0.65 0.12 72)" }}
                  >
                    CONFIRM PASSWORD
                  </label>
                  <Input
                    id="reg-confirm"
                    data-ocid="register.confirm_input"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isBusy}
                    autoComplete="new-password"
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
                    data-ocid="register.error_state"
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
                  data-ocid="register.submit_button"
                  type="submit"
                  disabled={isBusy}
                  className="w-full mc-btn py-3 font-pixel text-xs tracking-wider rounded-sm mt-1"
                  style={{
                    background: isBusy
                      ? "oklch(0.22 0.08 72)"
                      : "oklch(0.2 0.1 72)",
                    border: "2px solid oklch(0.68 0.18 72)",
                    color: "oklch(0.92 0.18 72)",
                    boxShadow: "0 0 12px oklch(0.78 0.18 72 / 0.3)",
                  }}
                >
                  {isBusy ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>CREATING...</span>
                    </span>
                  ) : (
                    "CREATE ACCOUNT ▶"
                  )}
                </Button>

                <p className="text-[oklch(0.4_0.03_145)] text-[10px] text-center font-sans leading-relaxed">
                  Uses Internet Identity for secure authentication
                </p>
              </form>

              <div
                className="my-5 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.3 0.04 145), transparent)",
                }}
              />

              {/* Login link */}
              <p className="text-center text-xs text-[oklch(0.5_0.03_145)]">
                Already have an account?{" "}
                <button
                  type="button"
                  data-ocid="register.login_link"
                  onClick={() => navigate("login")}
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
                  LOGIN
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
