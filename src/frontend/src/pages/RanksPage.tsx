import type { UserProfile } from "@/backend.d";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import { useAuth } from "@/hooks/useAuth";
import { usePublicSiteConfig } from "@/hooks/useQueries";
import { Loader2 } from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";

interface RanksPageProps {
  navigate: (page: Page) => void;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  onLogout: () => void;
}

interface RankData {
  name: string;
  price: string;
  icon: string;
  badge: string;
  perks: string[];
  theme: {
    accentColor: string;
    glowClass: string;
    borderColor: string;
    bgColor: string;
    btnBg: string;
    btnBorder: string;
    btnText: string;
    badgeBg: string;
  };
}

const ranks: RankData[] = [
  {
    name: "VIP",
    price: "₹49",
    icon: "⭐",
    badge: "STARTER",
    perks: [
      "Custom /nick command",
      "Access to VIP kit",
      "Green name color in chat",
    ],
    theme: {
      accentColor: "oklch(0.72 0.22 142)",
      glowClass: "animate-glow-green",
      borderColor: "oklch(0.55 0.22 142)",
      bgColor: "oklch(0.11 0.04 142)",
      btnBg: "oklch(0.15 0.08 142)",
      btnBorder: "oklch(0.65 0.22 142)",
      btnText: "oklch(0.92 0.22 142)",
      badgeBg: "oklch(0.18 0.1 142 / 0.8)",
    },
  },
  {
    name: "MVP",
    price: "₹79",
    icon: "💎",
    badge: "POPULAR",
    perks: ["Everything in VIP", "Extra /home slots (×3)", "Blue glowing name"],
    theme: {
      accentColor: "oklch(0.6 0.22 250)",
      glowClass: "animate-glow-blue",
      borderColor: "oklch(0.48 0.2 250)",
      bgColor: "oklch(0.11 0.04 250)",
      btnBg: "oklch(0.14 0.06 250)",
      btnBorder: "oklch(0.55 0.22 250)",
      btnText: "oklch(0.9 0.18 250)",
      badgeBg: "oklch(0.16 0.08 250 / 0.8)",
    },
  },
  {
    name: "GOD",
    price: "₹129",
    icon: "🔱",
    badge: "ELITE",
    perks: [
      "Everything in MVP",
      "Custom join/leave messages",
      "Gold glowing name + prefix",
    ],
    theme: {
      accentColor: "oklch(0.78 0.18 72)",
      glowClass: "animate-glow-gold",
      borderColor: "oklch(0.62 0.18 72)",
      bgColor: "oklch(0.12 0.05 72)",
      btnBg: "oklch(0.16 0.08 72)",
      btnBorder: "oklch(0.68 0.18 72)",
      btnText: "oklch(0.92 0.18 72)",
      badgeBg: "oklch(0.18 0.1 72 / 0.8)",
    },
  },
  {
    name: "SWORD",
    price: "₹149",
    icon: "⚔️",
    badge: "LEGENDARY",
    perks: [
      "Everything in GOD",
      "Access to exclusive SWORD kit",
      "Red fire particle effects",
    ],
    theme: {
      accentColor: "oklch(0.62 0.25 25)",
      glowClass: "animate-glow-red",
      borderColor: "oklch(0.5 0.25 25)",
      bgColor: "oklch(0.11 0.05 25)",
      btnBg: "oklch(0.15 0.08 25)",
      btnBorder: "oklch(0.58 0.25 25)",
      btnText: "oklch(0.92 0.2 25)",
      badgeBg: "oklch(0.18 0.1 25 / 0.8)",
    },
  },
  {
    name: "IMMORTAL",
    price: "₹199",
    icon: "🌌",
    badge: "ULTIMATE",
    perks: [
      "ALL rank perks combined",
      "Purple shimmer trail effect",
      "Custom chat prefix + colour",
    ],
    theme: {
      accentColor: "oklch(0.72 0.25 305)",
      glowClass: "animate-glow-purple",
      borderColor: "oklch(0.55 0.25 305)",
      bgColor: "oklch(0.12 0.05 305)",
      btnBg: "oklch(0.16 0.08 305)",
      btnBorder: "oklch(0.65 0.25 305)",
      btnText: "oklch(0.92 0.2 305)",
      badgeBg: "oklch(0.18 0.12 305 / 0.8)",
    },
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function RanksPage({
  navigate,
  currentUser,
  isAdmin,
  onLogout,
}: RanksPageProps) {
  const currentYear = new Date().getFullYear();
  const { clear } = useAuth();
  const { data: siteConfig, isLoading: configLoading } = usePublicSiteConfig();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<{
    name: string;
    price: string;
  } | null>(null);

  // Merge dynamic config with static rank themes
  const displayRanks: RankData[] = siteConfig?.ranks?.length
    ? siteConfig.ranks.map((r, idx) => ({
        name: r.name,
        price: r.price,
        perks: r.perks,
        icon: ranks[idx]?.icon ?? "⭐",
        badge: ranks[idx]?.badge ?? "RANK",
        theme: ranks[idx]?.theme ?? ranks[0].theme,
      }))
    : ranks;

  function handleLogout() {
    clear();
    onLogout();
  }

  function handleBuy(rankName: string, price: string) {
    setSelectedRank({ name: rankName, price });
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col page-enter">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b border-[oklch(0.25_0.04_145)]"
        style={{
          background: "oklch(0.09 0.02 145 / 0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <motion.button
          data-ocid="ranks.back_button"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-[oklch(0.72_0.22_142)] hover:text-[oklch(0.85_0.22_142)] transition-colors font-pixel text-[10px]"
        >
          ◀ BACK
        </motion.button>

        <div className="flex-1" />

        <div className="font-pixel text-[oklch(0.72_0.22_142)] text-xs hidden sm:block tracking-widest">
          SWORD MC
        </div>

        {/* Auth nav */}
        <div className="flex items-center gap-3 font-pixel text-[10px]">
          {currentUser ? (
            <>
              <span
                className="hidden sm:inline"
                style={{ color: "oklch(0.65 0.1 145)" }}
              >
                👤 {currentUser.username}
              </span>
              {isAdmin && (
                <motion.button
                  data-ocid="nav.admin_button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("admin")}
                  style={{ color: "oklch(0.6 0.22 250)" }}
                >
                  ADMIN
                </motion.button>
              )}
              <motion.button
                data-ocid="nav.logout_button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
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
                style={{ color: "oklch(0.72 0.22 142)" }}
              >
                LOGIN
              </motion.button>
              <span className="text-[oklch(0.3_0.04_145)]">|</span>
              <motion.button
                data-ocid="nav.register_button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("register")}
                style={{ color: "oklch(0.78 0.18 72)" }}
              >
                REGISTER
              </motion.button>
            </>
          )}
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h1
            className="font-pixel text-2xl sm:text-4xl"
            style={{
              color: "oklch(0.85 0.22 142)",
              textShadow:
                "0 0 20px oklch(0.72 0.22 142 / 0.7), 0 0 60px oklch(0.72 0.22 142 / 0.3)",
            }}
          >
            ⚔ RANKS ⚔
          </h1>
          <p className="mt-3 text-[oklch(0.5_0.05_142)] text-xs font-pixel tracking-widest">
            CHOOSE YOUR DESTINY
          </p>
          <div
            className="mt-3 h-px w-48 mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.72 0.22 142 / 0.6), transparent)",
            }}
          />
        </motion.div>

        {/* Loading spinner while config fetches */}
        {configLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2
              className="animate-spin mr-2"
              size={18}
              style={{ color: "oklch(0.72 0.22 142)" }}
            />
            <span
              className="font-pixel text-xs"
              style={{ color: "oklch(0.6 0.1 145)" }}
            >
              LOADING...
            </span>
          </div>
        )}

        {/* Rank cards grid */}
        {!configLoading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {displayRanks.map((rank, idx) => (
              <motion.div
                key={rank.name}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`relative rounded-sm overflow-hidden flex flex-col ${rank.theme.glowClass} ${rank.name === "IMMORTAL" ? "lg:col-span-1" : ""}`}
                style={{
                  background: rank.theme.bgColor,
                  border: `2px solid ${rank.theme.borderColor}`,
                }}
                data-ocid={`ranks.item.${idx + 1}`}
              >
                {/* Top accent stripe */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${rank.theme.accentColor}, transparent)`,
                  }}
                />

                {/* Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className="font-pixel text-[9px] px-2 py-1 rounded-sm"
                    style={{
                      background: rank.theme.badgeBg,
                      color: rank.theme.accentColor,
                      border: `1px solid ${rank.theme.borderColor}`,
                    }}
                  >
                    {rank.badge}
                  </span>
                </div>

                {/* Card body */}
                <div className="flex flex-col flex-1 p-5 pt-4">
                  {/* Icon */}
                  <div
                    className="text-4xl mb-3 animate-float"
                    style={{ display: "inline-block" }}
                  >
                    {rank.icon}
                  </div>

                  {/* Rank name */}
                  <h2
                    className="font-pixel text-xl mb-1"
                    style={{
                      color: rank.theme.accentColor,
                      textShadow: `0 0 12px ${rank.theme.accentColor}`,
                    }}
                  >
                    {rank.name}
                  </h2>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mt-1 mb-4">
                    <span
                      className="font-pixel text-3xl"
                      style={{ color: rank.theme.accentColor }}
                    >
                      {rank.price}
                    </span>
                    <span className="text-[oklch(0.45_0.03_145)] text-xs font-sans">
                      one-time
                    </span>
                  </div>

                  {/* Perks */}
                  <ul className="flex-1 space-y-2 mb-5">
                    {rank.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-start gap-2 text-sm text-[oklch(0.7_0.03_145)]"
                      >
                        <span
                          style={{ color: rank.theme.accentColor }}
                          className="mt-0.5 flex-shrink-0 text-xs"
                        >
                          ■
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  {/* IMMORTAL shimmer overlay */}
                  {rank.name === "IMMORTAL" && (
                    <div
                      className="absolute inset-0 pointer-events-none animate-shimmer opacity-50"
                      style={{ mixBlendMode: "screen" }}
                    />
                  )}

                  {/* Buy button */}
                  <motion.button
                    data-ocid={`ranks.buy_button.${idx + 1}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97, y: 2 }}
                    onClick={() => handleBuy(`${rank.name} Rank`, rank.price)}
                    className="mc-btn w-full py-3 rounded-sm font-pixel text-xs tracking-wider"
                    style={{
                      background: rank.theme.btnBg,
                      border: `2px solid ${rank.theme.btnBorder}`,
                      color: rank.theme.btnText,
                      boxShadow: `0 0 12px ${rank.theme.accentColor}40`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        rank.theme.btnBorder;
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        `0 0 20px ${rank.theme.accentColor}80`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        rank.theme.btnBg;
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        `0 0 12px ${rank.theme.accentColor}40`;
                    }}
                  >
                    BUY NOW
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center text-[oklch(0.4_0.03_145)] text-xs mt-8 font-sans"
        >
          All ranks are permanent. Contact support on Discord for assistance.
        </motion.p>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
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

      {/* UPI Payment Modal */}
      {selectedRank && (
        <UpiPaymentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          itemName={selectedRank.name}
          price={selectedRank.price}
          currentUser={currentUser}
          onSuccess={() => setModalOpen(false)}
          onLoginRequired={() => {
            setModalOpen(false);
            navigate("login");
          }}
        />
      )}
    </div>
  );
}
