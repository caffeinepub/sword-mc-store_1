import type { UserProfile } from "@/backend.d";
import { useAuth } from "@/hooks/useAuth";
import { usePublicSiteConfig } from "@/hooks/useQueries";
import { motion } from "motion/react";
import type { Page } from "../App";

interface HomePageProps {
  navigate: (page: Page) => void;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function HomePage({
  navigate,
  currentUser,
  isAdmin,
  onLogout,
}: HomePageProps) {
  const currentYear = new Date().getFullYear();
  const { clear } = useAuth();
  const { data: siteConfig } = usePublicSiteConfig();

  function handleLogout() {
    clear();
    onLogout();
  }

  return (
    <div className="min-h-screen flex flex-col page-enter">
      {/* ── Header nav ──────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[oklch(0.25_0.04_145)]">
        <div className="font-pixel text-[oklch(0.72_0.22_142)] text-xs sm:text-sm tracking-widest">
          SWORD MC
        </div>
        <div className="flex gap-3 text-xs font-pixel flex-wrap items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("ranks")}
            className="text-[oklch(0.72_0.22_142)] hover:text-[oklch(0.85_0.22_142)] transition-colors"
          >
            RANKS
          </motion.button>
          <span className="text-[oklch(0.3_0.04_145)]">|</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("coins")}
            className="text-[oklch(0.78_0.18_72)] hover:text-[oklch(0.9_0.18_72)] transition-colors"
          >
            COINS
          </motion.button>
          <span className="text-[oklch(0.3_0.04_145)]">|</span>

          {currentUser ? (
            <>
              <span
                className="font-pixel text-[10px] hidden sm:inline"
                style={{ color: "oklch(0.72 0.22 142)" }}
              >
                👤 {currentUser.username}
              </span>
              {isAdmin && (
                <>
                  <span className="text-[oklch(0.3_0.04_145)] hidden sm:inline">
                    |
                  </span>
                  <motion.button
                    data-ocid="nav.admin_button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("admin")}
                    className="transition-colors font-pixel text-[10px]"
                    style={{ color: "oklch(0.6 0.22 250)" }}
                  >
                    ADMIN
                  </motion.button>
                  <span className="text-[oklch(0.3_0.04_145)] hidden sm:inline">
                    |
                  </span>
                </>
              )}
              <motion.button
                data-ocid="nav.logout_button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="transition-colors font-pixel text-[10px]"
                style={{ color: "oklch(0.62 0.25 25)" }}
              >
                LOGOUT
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                data-ocid="nav.login_button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("login")}
                className="text-[oklch(0.72_0.22_142)] hover:text-[oklch(0.85_0.22_142)] transition-colors"
              >
                LOGIN
              </motion.button>
              <span className="text-[oklch(0.3_0.04_145)]">|</span>
              <motion.button
                data-ocid="nav.register_button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("register")}
                className="text-[oklch(0.78_0.18_72)] hover:text-[oklch(0.9_0.18_72)] transition-colors"
              >
                REGISTER
              </motion.button>
            </>
          )}
        </div>
      </header>

      {/* ── Main hero ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center">
        {/* Logo section */}
        <section className="w-full flex flex-col items-center pt-12 pb-8 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <img
              src="/assets/generated/swordmc-logo.dim_600x200.png"
              alt="SWORD MC"
              className="max-w-[420px] sm:max-w-[500px] w-full h-auto"
              style={{
                imageRendering: "pixelated",
                filter:
                  "drop-shadow(0 0 20px oklch(0.72 0.22 142 / 0.6)) drop-shadow(0 0 60px oklch(0.72 0.22 142 / 0.3))",
              }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-pixel text-[oklch(0.78_0.18_72)] text-xs sm:text-sm mt-6 text-center leading-loose"
          >
            THE ULTIMATE MINECRAFT PVP EXPERIENCE
          </motion.p>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-4 max-w-xl text-center text-[oklch(0.65_0.03_145)] text-sm leading-relaxed"
          >
            <p>
              Join thousands of players on India's premier PvP Minecraft server.
              Epic battles, custom kits, and exclusive ranks await you.
            </p>
            <p className="mt-2 text-[oklch(0.55_0.03_145)] text-xs">
              🌍 24/7 Online &nbsp;·&nbsp; ⚔️ Custom PvP &nbsp;·&nbsp; 🏆
              Tournaments &nbsp;·&nbsp; 💎 Exclusive Perks
            </p>
          </motion.div>

          {/* Server IP */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-8 flex flex-col items-center gap-2"
          >
            <p className="text-[oklch(0.5_0.03_145)] text-xs font-pixel tracking-widest">
              SERVER IP
            </p>
            <div className="mc-ip-box px-6 py-3 rounded cursor-default select-all animate-glow-green">
              {siteConfig?.serverIp ?? "swordmc.zenithcloud.fun"}
            </div>
            <p className="text-[oklch(0.42_0.05_142)] text-xs mt-1">
              Click to copy
            </p>
          </motion.div>
        </section>

        {/* ── Navigation buttons ──────────────────────────────────────────── */}
        <section className="w-full max-w-3xl px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Ranks button */}
            <motion.button
              data-ocid="home.ranks_button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("ranks")}
              className="mc-btn group relative overflow-hidden rounded px-6 py-5
                bg-[oklch(0.12_0.05_142)] border-[oklch(0.55_0.22_142)]
                text-[oklch(0.85_0.22_142)]
                hover:bg-[oklch(0.18_0.08_142)] hover:border-[oklch(0.72_0.22_142)]
                animate-glow-green"
              style={{
                boxShadow:
                  "0 0 20px oklch(0.72 0.22 142 / 0.3), inset 0 1px 0 oklch(0.72 0.22 142 / 0.2)",
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <span className="text-3xl">👑</span>
                <span className="font-pixel text-sm tracking-wider">RANKS</span>
                <span className="text-xs text-[oklch(0.6_0.12_142)] font-sans not-italic">
                  From ₹49
                </span>
              </div>
              {/* Scan line effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background:
                    "linear-gradient(0deg, transparent 45%, oklch(0.72 0.22 142 / 0.05) 50%, transparent 55%)",
                  backgroundSize: "100% 8px",
                }}
              />
            </motion.button>

            {/* Coins button */}
            <motion.button
              data-ocid="home.coins_button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("coins")}
              className="mc-btn group relative overflow-hidden rounded px-6 py-5
                bg-[oklch(0.14_0.06_72)] border-[oklch(0.6_0.18_72)]
                text-[oklch(0.88_0.18_72)]
                hover:bg-[oklch(0.2_0.1_72)] hover:border-[oklch(0.78_0.18_72)]
                animate-glow-gold"
              style={{
                boxShadow:
                  "0 0 20px oklch(0.78 0.18 72 / 0.3), inset 0 1px 0 oklch(0.78 0.18 72 / 0.2)",
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <span className="text-3xl animate-float">🪙</span>
                <span className="font-pixel text-sm tracking-wider">COINS</span>
                <span className="text-xs text-[oklch(0.65_0.12_72)] font-sans">
                  From ₹39
                </span>
              </div>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background:
                    "linear-gradient(0deg, transparent 45%, oklch(0.78 0.18 72 / 0.05) 50%, transparent 55%)",
                  backgroundSize: "100% 8px",
                }}
              />
            </motion.button>

            {/* Discord button */}
            <motion.a
              data-ocid="home.discord_button"
              href={siteConfig?.discordLink ?? "https://discord.gg/wgKXAYYqD"}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="mc-btn group relative overflow-hidden rounded px-6 py-5
                bg-[oklch(0.12_0.05_270)] border-[oklch(0.5_0.2_270)]
                text-[oklch(0.82_0.2_270)]
                hover:bg-[oklch(0.18_0.08_270)] hover:border-[oklch(0.65_0.22_270)]
                block text-center"
              style={{
                boxShadow:
                  "0 0 20px oklch(0.6 0.22 270 / 0.3), inset 0 1px 0 oklch(0.6 0.22 270 / 0.2)",
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <span className="text-3xl">💬</span>
                <span className="font-pixel text-sm tracking-wider">
                  DISCORD
                </span>
                <span className="text-xs text-[oklch(0.6_0.12_270)] font-sans">
                  Join Community
                </span>
              </div>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background:
                    "linear-gradient(0deg, transparent 45%, oklch(0.6 0.22 270 / 0.05) 50%, transparent 55%)",
                  backgroundSize: "100% 8px",
                }}
              />
            </motion.a>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="w-full max-w-3xl px-6 mb-8"
        >
          <div className="grid grid-cols-3 gap-2 rounded border border-[oklch(0.22_0.04_145)] bg-[oklch(0.1_0.02_145)]">
            {[
              {
                label: "PLAYERS ONLINE",
                value: "247",
                color: "oklch(0.72 0.22 142)",
              },
              {
                label: "TOTAL PLAYERS",
                value: "12,450",
                color: "oklch(0.78 0.18 72)",
              },
              { label: "UPTIME", value: "99.9%", color: "oklch(0.6 0.22 250)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-4 px-2"
              >
                <span
                  className="font-pixel text-lg sm:text-xl"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 10px ${stat.color}`,
                  }}
                >
                  {stat.value}
                </span>
                <span className="text-[oklch(0.45_0.03_145)] text-[9px] sm:text-[10px] font-pixel mt-1 text-center leading-tight">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Minecraft grass/dirt footer decoration ───────────────────────── */}
        <div className="w-full mt-auto">
          {/* Grass top */}
          <div
            className="w-full h-4 bg-[#4a7c3f]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #3d6b33 0px, #3d6b33 16px, #4a7c3f 16px, #4a7c3f 32px)",
            }}
          />
          {/* Dirt */}
          <div
            className="w-full h-8 bg-[#5a3a1a]"
            style={{
              backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(0,0,0,0.2) 7px, rgba(0,0,0,0.2) 8px),
              repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0,0,0,0.15) 15px, rgba(0,0,0,0.15) 16px)
            `,
            }}
          />
          {/* Dark dirt */}
          <div className="w-full h-4 bg-[#3d2810]" />
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
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
