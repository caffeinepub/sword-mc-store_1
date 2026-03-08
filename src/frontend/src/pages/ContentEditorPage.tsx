import type {
  CoinPackageConfig,
  RankConfig,
  SiteConfig,
  UserProfile,
} from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  useAdminSiteConfig,
  useAdminUpdateSiteConfig,
} from "@/hooks/useQueries";
import {
  Coins,
  Edit3,
  Loader2,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";

interface ContentEditorPageProps {
  navigate: (page: Page) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

// Rank visual themes keyed by index
const rankThemes = [
  {
    color: "oklch(0.72 0.22 142)",
    border: "oklch(0.45 0.18 142)",
    bg: "oklch(0.11 0.04 142)",
    icon: "⭐",
  },
  {
    color: "oklch(0.6 0.22 250)",
    border: "oklch(0.42 0.18 250)",
    bg: "oklch(0.11 0.04 250)",
    icon: "💎",
  },
  {
    color: "oklch(0.78 0.18 72)",
    border: "oklch(0.55 0.18 72)",
    bg: "oklch(0.12 0.05 72)",
    icon: "🔱",
  },
  {
    color: "oklch(0.62 0.25 25)",
    border: "oklch(0.45 0.22 25)",
    bg: "oklch(0.11 0.05 25)",
    icon: "⚔️",
  },
  {
    color: "oklch(0.72 0.25 305)",
    border: "oklch(0.48 0.22 305)",
    bg: "oklch(0.12 0.05 305)",
    icon: "🌌",
  },
];

type ActiveTab = "server" | "ranks" | "coins";

export default function ContentEditorPage({
  navigate,
  currentUser,
  onLogout,
}: ContentEditorPageProps) {
  const { clear } = useAuth();
  const configQuery = useAdminSiteConfig();
  const updateConfig = useAdminUpdateSiteConfig();
  const currentYear = new Date().getFullYear();

  const [activeTab, setActiveTab] = useState<ActiveTab>("server");

  // Server info state
  const [serverIp, setServerIp] = useState("");
  const [discordLink, setDiscordLink] = useState("");

  // Ranks state (editable copy)
  const [ranks, setRanks] = useState<RankConfig[]>([]);

  // Coin packages state (editable copy, amount as number for UI)
  const [coinPackages, setCoinPackages] = useState<
    Array<{
      packageLabel: string;
      amount: number;
      price: string;
      perks: string[];
    }>
  >([]);

  // Sync from backend
  useEffect(() => {
    const cfg = configQuery.data;
    if (!cfg) return;
    setServerIp(cfg.serverIp);
    setDiscordLink(cfg.discordLink);
    setRanks(cfg.ranks.map((r) => ({ ...r, perks: [...r.perks] })));
    setCoinPackages(
      cfg.coinPackages.map((p) => ({
        packageLabel: p.packageLabel,
        amount: Number(p.amount),
        price: p.price,
        perks: [...p.perks],
      })),
    );
  }, [configQuery.data]);

  function handleLogout() {
    clear();
    onLogout();
    navigate("home");
  }

  // ── Save server info ──────────────────────────────────────────────────────
  async function handleSaveServerInfo() {
    const existing = configQuery.data;
    if (!existing) return;
    const payload: SiteConfig = {
      serverIp: serverIp.trim(),
      discordLink: discordLink.trim(),
      ranks: existing.ranks,
      coinPackages: existing.coinPackages,
    };
    try {
      await updateConfig.mutateAsync(payload);
      toast.success("✅ Server info saved!");
    } catch {
      toast.error("❌ Failed to save server info.");
    }
  }

  // ── Ranks helpers ─────────────────────────────────────────────────────────
  function updateRankField(
    idx: number,
    field: keyof Omit<RankConfig, "perks">,
    value: string,
  ) {
    setRanks((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    );
  }

  function updateRankPerk(rankIdx: number, perkIdx: number, value: string) {
    setRanks((prev) =>
      prev.map((r, i) =>
        i === rankIdx
          ? {
              ...r,
              perks: r.perks.map((p, pi) => (pi === perkIdx ? value : p)),
            }
          : r,
      ),
    );
  }

  function addRankPerk(rankIdx: number) {
    setRanks((prev) =>
      prev.map((r, i) =>
        i === rankIdx ? { ...r, perks: [...r.perks, "New perk"] } : r,
      ),
    );
  }

  function removeRankPerk(rankIdx: number, perkIdx: number) {
    setRanks((prev) =>
      prev.map((r, i) =>
        i === rankIdx
          ? { ...r, perks: r.perks.filter((_, pi) => pi !== perkIdx) }
          : r,
      ),
    );
  }

  async function handleSaveRanks() {
    const existing = configQuery.data;
    if (!existing) return;
    const payload: SiteConfig = {
      serverIp: existing.serverIp,
      discordLink: existing.discordLink,
      ranks: ranks,
      coinPackages: existing.coinPackages,
    };
    try {
      await updateConfig.mutateAsync(payload);
      toast.success("✅ Ranks saved!");
    } catch {
      toast.error("❌ Failed to save ranks.");
    }
  }

  // ── Coin package helpers ──────────────────────────────────────────────────
  function updateCoinField(
    idx: number,
    field: "packageLabel" | "amount" | "price",
    value: string,
  ) {
    setCoinPackages((prev) =>
      prev.map((p, i) =>
        i === idx
          ? {
              ...p,
              [field]:
                field === "amount"
                  ? Number.isNaN(Number(value))
                    ? p.amount
                    : Number(value)
                  : value,
            }
          : p,
      ),
    );
  }

  function updateCoinPerk(pkgIdx: number, perkIdx: number, value: string) {
    setCoinPackages((prev) =>
      prev.map((p, i) =>
        i === pkgIdx
          ? {
              ...p,
              perks: p.perks.map((pk, pi) => (pi === perkIdx ? value : pk)),
            }
          : p,
      ),
    );
  }

  function addCoinPerk(pkgIdx: number) {
    setCoinPackages((prev) =>
      prev.map((p, i) =>
        i === pkgIdx ? { ...p, perks: [...p.perks, "New perk"] } : p,
      ),
    );
  }

  function removeCoinPerk(pkgIdx: number, perkIdx: number) {
    setCoinPackages((prev) =>
      prev.map((p, i) =>
        i === pkgIdx
          ? { ...p, perks: p.perks.filter((_, pi) => pi !== perkIdx) }
          : p,
      ),
    );
  }

  async function handleSaveCoins() {
    const existing = configQuery.data;
    if (!existing) return;
    const converted: CoinPackageConfig[] = coinPackages.map((p) => ({
      packageLabel: p.packageLabel,
      amount: BigInt(Math.round(p.amount)),
      price: p.price,
      perks: p.perks,
    }));
    const payload: SiteConfig = {
      serverIp: existing.serverIp,
      discordLink: existing.discordLink,
      ranks: existing.ranks,
      coinPackages: converted,
    };
    try {
      await updateConfig.mutateAsync(payload);
      toast.success("✅ Coin packages saved!");
    } catch {
      toast.error("❌ Failed to save coin packages.");
    }
  }

  const isLoading = configQuery.isLoading;
  const hasError = !!configQuery.error;
  const isSaving = updateConfig.isPending;

  // Tab config
  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: "server", label: "SERVER INFO", icon: <Edit3 size={11} /> },
    {
      key: "ranks",
      label: "RANKS",
      icon: <span className="text-[10px]">👑</span>,
    },
    { key: "coins", label: "COIN PACKAGES", icon: <Coins size={11} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col page-enter mc-bg mc-grid">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b border-[oklch(0.25_0.04_145)]"
        style={{
          background: "oklch(0.09 0.02 145 / 0.96)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} style={{ color: "oklch(0.72 0.22 142)" }} />
          <span
            className="font-pixel text-xs"
            style={{ color: "oklch(0.72 0.22 142)" }}
          >
            CONTENT EDITOR
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {currentUser && (
            <span
              className="text-xs font-sans hidden sm:inline"
              style={{ color: "oklch(0.6 0.05 145)" }}
            >
              👤 {currentUser.username}
            </span>
          )}
          <motion.button
            data-ocid="editor.admin_link"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("admin")}
            className="font-pixel text-[10px] transition-colors"
            style={{ color: "oklch(0.6 0.15 250)" }}
          >
            ← ADMIN
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("home")}
            className="font-pixel text-[10px] transition-colors"
            style={{ color: "oklch(0.55 0.12 142)" }}
          >
            HOME
          </motion.button>
          <Button
            data-ocid="editor.logout_button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 font-pixel text-[10px] rounded-sm px-3 py-1.5"
            style={{
              background: "oklch(0.14 0.06 25)",
              border: "1px solid oklch(0.5 0.22 25)",
              color: "oklch(0.88 0.18 25)",
              boxShadow: "0 0 8px oklch(0.62 0.25 25 / 0.25)",
            }}
          >
            <LogOut size={10} />
            LOGOUT
          </Button>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1
            className="font-pixel text-xl sm:text-2xl leading-loose"
            style={{
              color: "oklch(0.88 0.2 72)",
              textShadow: "0 0 20px oklch(0.78 0.18 72 / 0.5)",
            }}
          >
            ✏ WEBSITE EDITOR
          </h1>
          <p className="text-[oklch(0.5_0.03_145)] text-xs font-sans mt-1">
            Edit server info, ranks, and coin packages — changes go live
            instantly
          </p>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div
            data-ocid="editor.loading_state"
            className="flex items-center justify-center py-20"
          >
            <Loader2
              className="animate-spin mr-2"
              size={22}
              style={{ color: "oklch(0.72 0.22 142)" }}
            />
            <span
              className="font-pixel text-xs"
              style={{ color: "oklch(0.65 0.1 145)" }}
            >
              LOADING CONFIG...
            </span>
          </div>
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <div
            data-ocid="editor.error_state"
            className="rounded-sm p-6 text-center mb-6"
            style={{
              background: "oklch(0.1 0.04 25 / 0.5)",
              border: "1px solid oklch(0.45 0.2 25 / 0.5)",
            }}
          >
            <p
              className="text-xs font-pixel"
              style={{ color: "oklch(0.65 0.22 25)" }}
            >
              ⚠ Failed to load site config. Check your admin permissions.
            </p>
          </div>
        )}

        {!isLoading && !hasError && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 flex-wrap">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.key}
                  data-ocid={`editor.${tab.key}.tab` as `editor.${string}.tab`}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 font-pixel text-[10px] px-4 py-2 rounded-sm transition-all"
                  style={
                    activeTab === tab.key
                      ? {
                          background: "oklch(0.16 0.07 72)",
                          border: "1px solid oklch(0.55 0.18 72)",
                          color: "oklch(0.88 0.2 72)",
                          boxShadow: "0 0 10px oklch(0.78 0.18 72 / 0.3)",
                        }
                      : {
                          background: "oklch(0.12 0.02 145)",
                          border: "1px solid oklch(0.22 0.03 145)",
                          color: "oklch(0.5 0.05 145)",
                        }
                  }
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── SERVER INFO TAB ──────────────────────────────────────── */}
            {activeTab === "server" && (
              <motion.section
                data-ocid="editor.server_info.section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-sm p-6"
                style={{
                  background: "oklch(0.12 0.03 145)",
                  border: "1px solid oklch(0.25 0.05 142)",
                }}
              >
                <h2
                  className="font-pixel text-sm mb-6 leading-loose"
                  style={{ color: "oklch(0.72 0.22 142)" }}
                >
                  🌐 SERVER INFO
                </h2>

                <div className="space-y-5 max-w-lg">
                  {/* Server IP */}
                  <div className="space-y-2">
                    <span
                      className="block font-pixel text-[10px]"
                      style={{ color: "oklch(0.62 0.1 145)" }}
                    >
                      SERVER IP
                    </span>
                    <Input
                      data-ocid="editor.server_ip.input"
                      id="editor-server-ip"
                      value={serverIp}
                      onChange={(e) => setServerIp(e.target.value)}
                      placeholder="e.g. swordmc.zenithcloud.fun"
                      className="font-sans text-sm rounded-sm"
                      style={{
                        background: "oklch(0.09 0.02 145)",
                        border: "1px solid oklch(0.3 0.06 142)",
                        color: "oklch(0.82 0.12 142)",
                      }}
                    />
                  </div>

                  {/* Discord Link */}
                  <div className="space-y-2">
                    <span
                      className="block font-pixel text-[10px]"
                      style={{ color: "oklch(0.62 0.1 145)" }}
                    >
                      DISCORD LINK
                    </span>
                    <Input
                      data-ocid="editor.discord_link.input"
                      id="editor-discord-link"
                      value={discordLink}
                      onChange={(e) => setDiscordLink(e.target.value)}
                      placeholder="e.g. https://discord.gg/..."
                      className="font-sans text-sm rounded-sm"
                      style={{
                        background: "oklch(0.09 0.02 145)",
                        border: "1px solid oklch(0.3 0.06 270)",
                        color: "oklch(0.82 0.12 270)",
                      }}
                    />
                  </div>

                  <motion.button
                    data-ocid="editor.server_info.save_button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleSaveServerInfo()}
                    disabled={isSaving}
                    className="flex items-center gap-2 font-pixel text-[11px] px-6 py-3 rounded-sm transition-all disabled:opacity-50"
                    style={{
                      background: "oklch(0.16 0.08 142)",
                      border: "2px solid oklch(0.55 0.22 142)",
                      color: "oklch(0.88 0.22 142)",
                      boxShadow: "0 0 12px oklch(0.65 0.2 142 / 0.3)",
                    }}
                  >
                    {isSaving ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : null}
                    SAVE SERVER INFO
                  </motion.button>
                </div>
              </motion.section>
            )}

            {/* ── RANKS TAB ────────────────────────────────────────────── */}
            {activeTab === "ranks" && (
              <motion.section
                data-ocid="editor.ranks.section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="font-pixel text-sm leading-loose"
                    style={{ color: "oklch(0.85 0.22 142)" }}
                  >
                    👑 RANKS EDITOR
                  </h2>
                  <motion.button
                    data-ocid="editor.ranks.save_button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleSaveRanks()}
                    disabled={isSaving}
                    className="flex items-center gap-2 font-pixel text-[10px] px-5 py-2.5 rounded-sm transition-all disabled:opacity-50"
                    style={{
                      background: "oklch(0.16 0.08 142)",
                      border: "2px solid oklch(0.55 0.22 142)",
                      color: "oklch(0.88 0.22 142)",
                      boxShadow: "0 0 12px oklch(0.65 0.2 142 / 0.3)",
                    }}
                  >
                    {isSaving ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : null}
                    SAVE ALL RANKS
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ranks.map((rank, rankIdx) => {
                    const theme = rankThemes[rankIdx] ?? rankThemes[0];
                    return (
                      <motion.div
                        // biome-ignore lint/suspicious/noArrayIndexKey: editor form uses rank index as stable position key
                        key={`rank-card-${rankIdx}`}
                        data-ocid={
                          `editor.rank.item.${rankIdx + 1}` as `editor.rank.item.${number}`
                        }
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: rankIdx * 0.05, duration: 0.3 }}
                        className="rounded-sm p-5 space-y-4"
                        style={{
                          background: theme.bg,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        {/* Rank header */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{theme.icon}</span>
                          <span
                            className="font-pixel text-xs"
                            style={{ color: theme.color }}
                          >
                            RANK {rankIdx + 1}
                          </span>
                        </div>

                        {/* Name input */}
                        <div className="space-y-1.5">
                          <span
                            className="block font-pixel text-[9px]"
                            style={{ color: "oklch(0.5 0.04 145)" }}
                          >
                            RANK NAME
                          </span>
                          <Input
                            data-ocid={
                              `editor.rank.name.input.${rankIdx + 1}` as `editor.rank.name.input.${number}`
                            }
                            value={rank.name}
                            onChange={(e) =>
                              updateRankField(rankIdx, "name", e.target.value)
                            }
                            className="font-pixel text-xs rounded-sm"
                            style={{
                              background: "oklch(0.08 0.02 145)",
                              border: `1px solid ${theme.border}`,
                              color: theme.color,
                            }}
                          />
                        </div>

                        {/* Price input */}
                        <div className="space-y-1.5">
                          <span
                            className="block font-pixel text-[9px]"
                            style={{ color: "oklch(0.5 0.04 145)" }}
                          >
                            PRICE
                          </span>
                          <Input
                            data-ocid={
                              `editor.rank.price.input.${rankIdx + 1}` as `editor.rank.price.input.${number}`
                            }
                            value={rank.price}
                            onChange={(e) =>
                              updateRankField(rankIdx, "price", e.target.value)
                            }
                            className="font-sans text-sm rounded-sm"
                            placeholder="e.g. ₹49"
                            style={{
                              background: "oklch(0.08 0.02 145)",
                              border: `1px solid ${theme.border}`,
                              color: "oklch(0.88 0.2 72)",
                            }}
                          />
                        </div>

                        {/* Perks */}
                        <div className="space-y-2">
                          <span
                            className="block font-pixel text-[9px]"
                            style={{ color: "oklch(0.5 0.04 145)" }}
                          >
                            PERKS
                          </span>
                          {rank.perks.map((perk, perkIdx) => (
                            <div
                              // biome-ignore lint/suspicious/noArrayIndexKey: editor perk list position is the stable identity
                              key={`rank-${rankIdx}-perk-${perkIdx}`}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={perk}
                                onChange={(e) =>
                                  updateRankPerk(
                                    rankIdx,
                                    perkIdx,
                                    e.target.value,
                                  )
                                }
                                className="font-sans text-xs rounded-sm flex-1"
                                style={{
                                  background: "oklch(0.08 0.02 145)",
                                  border: "1px solid oklch(0.22 0.04 145)",
                                  color: "oklch(0.72 0.04 145)",
                                }}
                              />
                              <button
                                type="button"
                                data-ocid={
                                  `editor.rank.delete_button.${rankIdx + 1}` as `editor.rank.delete_button.${number}`
                                }
                                onClick={() => removeRankPerk(rankIdx, perkIdx)}
                                className="p-1.5 rounded-sm transition-colors flex-shrink-0"
                                style={{
                                  background: "oklch(0.12 0.04 25)",
                                  border: "1px solid oklch(0.35 0.14 25)",
                                  color: "oklch(0.65 0.2 25)",
                                }}
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            data-ocid={
                              `editor.rank.add_button.${rankIdx + 1}` as `editor.rank.add_button.${number}`
                            }
                            onClick={() => addRankPerk(rankIdx)}
                            className="flex items-center gap-1.5 font-pixel text-[9px] px-3 py-1.5 rounded-sm transition-all w-full justify-center"
                            style={{
                              background: "oklch(0.1 0.02 145)",
                              border: `1px dashed ${theme.border}`,
                              color: theme.color,
                            }}
                          >
                            <Plus size={9} />
                            ADD PERK
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* ── COIN PACKAGES TAB ────────────────────────────────────── */}
            {activeTab === "coins" && (
              <motion.section
                data-ocid="editor.coins.section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="font-pixel text-sm leading-loose"
                    style={{ color: "oklch(0.88 0.2 72)" }}
                  >
                    🪙 COIN PACKAGES EDITOR
                  </h2>
                  <motion.button
                    data-ocid="editor.coins.save_button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleSaveCoins()}
                    disabled={isSaving}
                    className="flex items-center gap-2 font-pixel text-[10px] px-5 py-2.5 rounded-sm transition-all disabled:opacity-50"
                    style={{
                      background: "oklch(0.16 0.08 72)",
                      border: "2px solid oklch(0.58 0.2 72)",
                      color: "oklch(0.92 0.18 72)",
                      boxShadow: "0 0 12px oklch(0.72 0.18 72 / 0.3)",
                    }}
                  >
                    {isSaving ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : null}
                    SAVE ALL PACKAGES
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {coinPackages.map((pkg, pkgIdx) => (
                    <motion.div
                      // biome-ignore lint/suspicious/noArrayIndexKey: editor form uses package index as stable position key
                      key={`coin-pkg-${pkgIdx}`}
                      data-ocid={
                        `editor.coin.item.${pkgIdx + 1}` as `editor.coin.item.${number}`
                      }
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: pkgIdx * 0.07, duration: 0.3 }}
                      className="rounded-sm p-5 space-y-4"
                      style={{
                        background: "oklch(0.12 0.04 72)",
                        border: "1px solid oklch(0.45 0.14 72)",
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🪙</span>
                        <span
                          className="font-pixel text-[10px]"
                          style={{ color: "oklch(0.78 0.18 72)" }}
                        >
                          PACKAGE {pkgIdx + 1}
                        </span>
                      </div>

                      {/* Label */}
                      <div className="space-y-1.5">
                        <span
                          className="block font-pixel text-[9px]"
                          style={{ color: "oklch(0.5 0.04 145)" }}
                        >
                          LABEL
                        </span>
                        <Input
                          data-ocid={
                            `editor.coin.label.input.${pkgIdx + 1}` as `editor.coin.label.input.${number}`
                          }
                          value={pkg.packageLabel}
                          onChange={(e) =>
                            updateCoinField(
                              pkgIdx,
                              "packageLabel",
                              e.target.value,
                            )
                          }
                          className="font-pixel text-xs rounded-sm"
                          placeholder="e.g. 50 Coins"
                          style={{
                            background: "oklch(0.08 0.02 145)",
                            border: "1px solid oklch(0.42 0.14 72)",
                            color: "oklch(0.88 0.18 72)",
                          }}
                        />
                      </div>

                      {/* Amount */}
                      <div className="space-y-1.5">
                        <span
                          className="block font-pixel text-[9px]"
                          style={{ color: "oklch(0.5 0.04 145)" }}
                        >
                          COIN AMOUNT
                        </span>
                        <Input
                          data-ocid={
                            `editor.coin.amount.input.${pkgIdx + 1}` as `editor.coin.amount.input.${number}`
                          }
                          type="number"
                          value={pkg.amount}
                          onChange={(e) =>
                            updateCoinField(pkgIdx, "amount", e.target.value)
                          }
                          className="font-sans text-sm rounded-sm"
                          style={{
                            background: "oklch(0.08 0.02 145)",
                            border: "1px solid oklch(0.42 0.14 72)",
                            color: "oklch(0.88 0.2 72)",
                          }}
                        />
                      </div>

                      {/* Price */}
                      <div className="space-y-1.5">
                        <span
                          className="block font-pixel text-[9px]"
                          style={{ color: "oklch(0.5 0.04 145)" }}
                        >
                          PRICE
                        </span>
                        <Input
                          data-ocid={
                            `editor.coin.price.input.${pkgIdx + 1}` as `editor.coin.price.input.${number}`
                          }
                          value={pkg.price}
                          onChange={(e) =>
                            updateCoinField(pkgIdx, "price", e.target.value)
                          }
                          className="font-sans text-sm rounded-sm"
                          placeholder="e.g. ₹39"
                          style={{
                            background: "oklch(0.08 0.02 145)",
                            border: "1px solid oklch(0.42 0.14 72)",
                            color: "oklch(0.88 0.2 72)",
                          }}
                        />
                      </div>

                      {/* Perks */}
                      <div className="space-y-2">
                        <span
                          className="block font-pixel text-[9px]"
                          style={{ color: "oklch(0.5 0.04 145)" }}
                        >
                          PERKS
                        </span>
                        {pkg.perks.map((perk, perkIdx) => (
                          <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: editor perk list position is the stable identity
                            key={`coin-${pkgIdx}-perk-${perkIdx}`}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={perk}
                              onChange={(e) =>
                                updateCoinPerk(pkgIdx, perkIdx, e.target.value)
                              }
                              className="font-sans text-xs rounded-sm flex-1"
                              style={{
                                background: "oklch(0.08 0.02 145)",
                                border: "1px solid oklch(0.22 0.04 145)",
                                color: "oklch(0.72 0.04 145)",
                              }}
                            />
                            <button
                              type="button"
                              data-ocid={
                                `editor.coin.delete_button.${pkgIdx + 1}` as `editor.coin.delete_button.${number}`
                              }
                              onClick={() => removeCoinPerk(pkgIdx, perkIdx)}
                              className="p-1.5 rounded-sm transition-colors flex-shrink-0"
                              style={{
                                background: "oklch(0.12 0.04 25)",
                                border: "1px solid oklch(0.35 0.14 25)",
                                color: "oklch(0.65 0.2 25)",
                              }}
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          data-ocid={
                            `editor.coin.add_button.${pkgIdx + 1}` as `editor.coin.add_button.${number}`
                          }
                          onClick={() => addCoinPerk(pkgIdx)}
                          className="flex items-center gap-1.5 font-pixel text-[9px] px-3 py-1.5 rounded-sm transition-all w-full justify-center"
                          style={{
                            background: "oklch(0.1 0.02 145)",
                            border: "1px dashed oklch(0.45 0.14 72)",
                            color: "oklch(0.72 0.18 72)",
                          }}
                        >
                          <Plus size={9} />
                          ADD PERK
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a0d0a] border-t border-[oklch(0.2_0.03_145)] px-6 py-4 text-center mt-8">
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
