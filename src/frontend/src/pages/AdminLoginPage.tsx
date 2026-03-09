import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";

interface AdminLoginPageProps {
  navigate: (page: Page) => void;
  onAdminVerified: () => void;
}

const ADMIN_PASSWORD = "arpit2010";

export default function AdminLoginPage({
  navigate,
  onAdminVerified,
}: AdminLoginPageProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const currentYear = new Date().getFullYear();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Password daalo.");
      return;
    }

    setIsChecking(true);
    // Small delay for UX feel
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (password === ADMIN_PASSWORD) {
      onAdminVerified();
      navigate("admin");
    } else {
      setError("Galat password. Dobara try karo.");
    }
    setIsChecking(false);
  }

  return (
    <div className="min-h-screen flex flex-col page-enter mc-bg mc-grid">
      {/* Header */}
      <header
        className="flex items-center gap-4 px-6 py-4 border-b border-[oklch(0.25_0.04_145)]"
        style={{
          background: "oklch(0.09 0.02 145 / 0.96)",
          backdropFilter: "blur(12px)",
        }}
      >
        <motion.button
          data-ocid="adminlogin.back_button"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("home")}
          className="flex items-center gap-2 font-pixel text-[10px] transition-colors"
          style={{ color: "oklch(0.72 0.22 142)" }}
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
              border: "2px solid oklch(0.42 0.18 250)",
              boxShadow:
                "0 0 30px oklch(0.6 0.22 250 / 0.3), 0 0 80px oklch(0.6 0.22 250 / 0.1)",
            }}
          >
            {/* Purple top accent */}
            <div
              className="h-1 w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.6 0.22 250), transparent)",
              }}
            />

            <div className="px-7 py-8">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{
                    filter: [
                      "drop-shadow(0 0 8px oklch(0.6 0.22 250 / 0.6))",
                      "drop-shadow(0 0 16px oklch(0.6 0.22 250 / 0.9))",
                      "drop-shadow(0 0 8px oklch(0.6 0.22 250 / 0.6))",
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="flex justify-center mb-4"
                >
                  <ShieldCheck
                    size={44}
                    style={{ color: "oklch(0.65 0.22 250)" }}
                  />
                </motion.div>
                <h1
                  className="font-pixel text-sm leading-loose tracking-widest"
                  style={{
                    color: "oklch(0.82 0.2 250)",
                    textShadow: "0 0 12px oklch(0.6 0.22 250 / 0.6)",
                  }}
                >
                  ADMIN ACCESS
                </h1>
                <p className="text-[oklch(0.5_0.03_145)] text-xs mt-2 font-sans">
                  Enter admin password to continue
                </p>
              </motion.div>

              {/* Scanline divider */}
              <div
                className="h-px w-full mb-6"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.35 0.1 250), transparent)",
                }}
              />

              {/* Form */}
              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="admin-password"
                    className="block font-pixel text-[10px] mb-2"
                    style={{ color: "oklch(0.62 0.15 250)" }}
                  >
                    ADMIN PASSWORD
                  </label>
                  <Input
                    id="admin-password"
                    data-ocid="adminlogin.password_input"
                    type="password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={isChecking}
                    autoComplete="current-password"
                    autoFocus
                    className="rounded-sm font-sans text-sm"
                    style={{
                      background: "oklch(0.08 0.02 145)",
                      border: "1px solid oklch(0.35 0.1 250)",
                      color: "oklch(0.88 0.02 145)",
                    }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    data-ocid="adminlogin.error_state"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-pixel text-[10px] text-center leading-loose"
                    style={{ color: "oklch(0.65 0.22 25)" }}
                  >
                    ⚠ {error}
                  </motion.p>
                )}

                {/* Submit */}
                <Button
                  data-ocid="adminlogin.submit_button"
                  type="submit"
                  disabled={isChecking}
                  className="w-full py-3 font-pixel text-xs tracking-wider rounded-sm mt-2"
                  style={{
                    background: isChecking
                      ? "oklch(0.18 0.08 250)"
                      : "oklch(0.15 0.08 250)",
                    border: "2px solid oklch(0.5 0.22 250)",
                    color: "oklch(0.88 0.18 250)",
                    boxShadow: isChecking
                      ? "none"
                      : "0 0 12px oklch(0.6 0.22 250 / 0.3)",
                  }}
                >
                  {isChecking ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>CHECKING...</span>
                    </span>
                  ) : (
                    "ENTER ▶"
                  )}
                </Button>
              </form>

              {/* Bottom divider */}
              <div
                className="mt-7 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.25 0.05 145), transparent)",
                }}
              />

              <p className="text-[oklch(0.35_0.03_145)] text-[10px] text-center mt-4 font-sans">
                Admin-only access panel
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
