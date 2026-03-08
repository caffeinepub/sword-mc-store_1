import type { UserProfile } from "@/backend.d";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import { useAuth } from "@/hooks/useAuth";
import { usePublicSiteConfig } from "@/hooks/useQueries";
import { type Variants, motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";

interface CoinsPageProps {
  navigate: (page: Page) => void;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  onLogout: () => void;
}

interface CoinPackageData {
  amount: number;
  label: string;
  price: string;
  badge?: string;
  bonusCoins?: number;
  perks: string[];
  size: "sm" | "md" | "lg";
}

const coinPackages: CoinPackageData[] = [
  {
    amount: 50,
    label: "50 Coins",
    price: "₹39",
    perks: ["50 server coins", "Use in in-game shop", "Never expires"],
    size: "sm",
  },
  {
    amount: 100,
    label: "100 Coins",
    price: "₹89",
    badge: "BEST VALUE",
    bonusCoins: 10,
    perks: ["100 coins + 10 bonus", "Use in in-game shop", "Never expires"],
    size: "md",
  },
  {
    amount: 200,
    label: "200 Coins",
    price: "₹169",
    bonusCoins: 30,
    perks: ["200 coins + 30 bonus", "Use in in-game shop", "Priority support"],
    size: "lg",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.93 },
  show: { opacity: 1, y: 0, scale: 1 },
};

// Helper to get coin size styles
function getCoinScale(size: "sm" | "md" | "lg") {
  return size === "sm" ? "text-5xl" : size === "md" ? "text-6xl" : "text-7xl";
}

export default function CoinsPage({
  navigate,
  currentUser,
  isAdmin,
  onLogout,
}: CoinsPageProps) {
  const currentYear = new Date().getFullYear();
  const { clear } = useAuth();
  const { data: siteConfig } = usePublicSiteConfig();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<{
    label: string;
    price: string;
  } | null>(null);

  // Merge dynamic config with static fallback
  const displayPackages: CoinPackageData[] = siteConfig?.coinPackages?.length
    ? siteConfig.coinPackages.map((p, idx) => ({
        amount: Number(p.amount),
        label: p.packageLabel,
        price: p.price,
        perks: p.perks,
        badge: coinPackages[idx]?.badge,
        bonusCoins: coinPackages[idx]?.bonusCoins,
        size: (["sm", "md", "lg"] as const)[idx] ?? "sm",
      }))
    : coinPackages;

  function handleLogout() {
    clear();
    onLogout();
  }

  function handleBuy(label: string, price: string) {
    setSelectedPkg({ label, price });
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
          data-ocid="coins.back_button"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-[oklch(0.78_0.18_72)] hover:text-[oklch(0.92_0.18_72)] transition-colors font-pixel text-[10px]"
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
      <main className="flex-1 px-4 sm:px-6 py-10 max-w-5xl mx-auto w-full">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-4"
        >
          <h1
            className="font-pixel text-2xl sm:text-4xl"
            style={{
              color: "oklch(0.88 0.18 72)",
              textShadow:
                "0 0 20px oklch(0.78 0.18 72 / 0.7), 0 0 60px oklch(0.78 0.18 72 / 0.3)",
            }}
          >
            🪙 COINS 🪙
          </h1>
          <p className="mt-3 text-[oklch(0.55_0.1_72)] text-xs font-pixel tracking-widest">
            POWER YOUR GAMEPLAY
          </p>
          <div
            className="mt-3 h-px w-48 mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.78 0.18 72 / 0.6), transparent)",
            }}
          />
        </motion.div>

        {/* What are coins section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-10 max-w-xl mx-auto text-center"
        >
          <p className="text-[oklch(0.58_0.05_145)] text-sm leading-relaxed">
            Use coins to unlock exclusive items, cosmetics, custom kits, and
            more in the SWORD MC in-game store.
          </p>
        </motion.div>

        {/* Coin packages */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end"
        >
          {displayPackages.map((pkg, idx) => {
            const isFeatured = !!pkg.badge;
            return (
              <motion.div
                key={pkg.label}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                data-ocid={`coins.item.${idx + 1}`}
                className={`relative flex flex-col rounded-sm overflow-hidden animate-glow-gold ${isFeatured ? "mt-0" : "mt-4"}`}
                style={{
                  background: isFeatured
                    ? "oklch(0.14 0.06 72)"
                    : "oklch(0.11 0.04 72)",
                  border: isFeatured
                    ? "2px solid oklch(0.72 0.2 72)"
                    : "2px solid oklch(0.42 0.12 72)",
                  boxShadow: isFeatured
                    ? "0 0 30px oklch(0.78 0.18 72 / 0.5), 0 0 80px oklch(0.78 0.18 72 / 0.2)"
                    : "0 0 12px oklch(0.78 0.18 72 / 0.2)",
                }}
              >
                {/* Top gradient line */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: isFeatured
                      ? "linear-gradient(90deg, oklch(0.55 0.15 72), oklch(0.88 0.2 72), oklch(0.55 0.15 72))"
                      : "linear-gradient(90deg, transparent, oklch(0.65 0.15 72 / 0.6), transparent)",
                  }}
                />

                {/* Badge */}
                {pkg.badge && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <span
                      className="font-pixel text-[9px] px-3 py-1 rounded-b-sm"
                      style={{
                        background: "oklch(0.78 0.2 72)",
                        color: "oklch(0.12 0.05 72)",
                        boxShadow: "0 2px 8px oklch(0.78 0.18 72 / 0.5)",
                      }}
                    >
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div className="flex flex-col flex-1 p-6 pt-5 items-center">
                  {/* Coin icon */}
                  <div
                    className={`${getCoinScale(pkg.size)} animate-float mb-4`}
                  >
                    🪙
                  </div>

                  {/* Coins amount */}
                  <h2
                    className="font-pixel text-xl mb-1 text-center"
                    style={{
                      color: "oklch(0.88 0.2 72)",
                      textShadow: "0 0 12px oklch(0.78 0.18 72 / 0.6)",
                    }}
                  >
                    {pkg.amount}
                  </h2>
                  <p
                    className="font-pixel text-xs mb-1 text-center"
                    style={{ color: "oklch(0.68 0.15 72)" }}
                  >
                    COINS
                  </p>

                  {/* Bonus badge */}
                  {pkg.bonusCoins && (
                    <div
                      className="mt-1 mb-3 px-2 py-0.5 rounded-sm text-xs font-sans font-medium"
                      style={{
                        background: "oklch(0.18 0.1 72 / 0.8)",
                        color: "oklch(0.88 0.2 72)",
                        border: "1px solid oklch(0.55 0.18 72 / 0.5)",
                      }}
                    >
                      +{pkg.bonusCoins} BONUS COINS
                    </div>
                  )}

                  {/* Price */}
                  <div className="mt-3 mb-5 text-center">
                    <span
                      className="font-pixel text-3xl"
                      style={{ color: "oklch(0.88 0.2 72)" }}
                    >
                      {pkg.price}
                    </span>
                    <div className="text-[oklch(0.45_0.05_72)] text-xs font-sans mt-1">
                      one-time payment
                    </div>
                  </div>

                  {/* Perks */}
                  <ul className="w-full space-y-2 mb-6">
                    {pkg.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-start gap-2 text-sm text-[oklch(0.65_0.05_145)]"
                      >
                        <span className="text-[oklch(0.72_0.18_72)] flex-shrink-0 text-xs mt-0.5">
                          ■
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  {/* Buy button */}
                  <motion.button
                    data-ocid={`coins.buy_button.${idx + 1}`}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97, y: 2 }}
                    onClick={() => handleBuy(pkg.label, pkg.price)}
                    className="mc-btn w-full py-3 rounded-sm font-pixel text-xs tracking-wider"
                    style={{
                      background: isFeatured
                        ? "oklch(0.72 0.2 72)"
                        : "oklch(0.18 0.08 72)",
                      border: "2px solid oklch(0.72 0.2 72)",
                      color: isFeatured
                        ? "oklch(0.1 0.05 72)"
                        : "oklch(0.92 0.18 72)",
                      boxShadow: isFeatured
                        ? "0 0 16px oklch(0.78 0.18 72 / 0.6)"
                        : "0 0 8px oklch(0.78 0.18 72 / 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      if (isFeatured) {
                        el.style.background = "oklch(0.85 0.2 72)";
                      } else {
                        el.style.background = "oklch(0.25 0.12 72)";
                      }
                      el.style.boxShadow = "0 0 24px oklch(0.78 0.18 72 / 0.7)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = isFeatured
                        ? "oklch(0.72 0.2 72)"
                        : "oklch(0.18 0.08 72)";
                      el.style.boxShadow = isFeatured
                        ? "0 0 16px oklch(0.78 0.18 72 / 0.6)"
                        : "0 0 8px oklch(0.78 0.18 72 / 0.3)";
                    }}
                  >
                    BUY NOW
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Coins usage note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-10 mx-auto max-w-xl rounded-sm p-4"
          style={{
            background: "oklch(0.1 0.03 72 / 0.4)",
            border: "1px solid oklch(0.35 0.1 72 / 0.4)",
          }}
        >
          <p className="text-center text-[oklch(0.6_0.08_72)] text-xs font-sans leading-relaxed">
            💡 Coins can be used to purchase kits, cosmetics, and exclusive
            items in-game. Type{" "}
            <span className="font-pixel text-[10px] text-[oklch(0.78_0.18_72)]">
              /shop
            </span>{" "}
            after joining to browse the store.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center text-[oklch(0.4_0.03_145)] text-xs mt-6 font-sans"
        >
          All coin purchases are permanent and will be credited within 5
          minutes.
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
      {selectedPkg && (
        <UpiPaymentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          itemName={selectedPkg.label}
          price={selectedPkg.price}
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
