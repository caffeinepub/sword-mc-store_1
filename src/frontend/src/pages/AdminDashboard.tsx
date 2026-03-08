import type { UserProfile } from "@/backend.d";
import { OrderStatus } from "@/backend.d";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import {
  useAdminDeleteOrder,
  useAdminOrderCount,
  useAdminOrders,
  useAdminUpdateOrderStatus,
} from "@/hooks/useQueries";
import {
  CheckCircle2,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";

interface AdminDashboardProps {
  navigate: (page: Page) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

type FilterTab = "all" | "pending" | "completed" | "rejected";

export default function AdminDashboard({
  navigate,
  currentUser,
  onLogout,
}: AdminDashboardProps) {
  const { clear } = useAuth();
  const ordersQuery = useAdminOrders();
  const countQuery = useAdminOrderCount();
  const updateStatus = useAdminUpdateOrderStatus();
  const deleteOrder = useAdminDeleteOrder();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [pendingActionIndex, setPendingActionIndex] = useState<number | null>(
    null,
  );

  const currentYear = new Date().getFullYear();
  const orders = ordersQuery.data ?? [];
  const orderCount = countQuery.data ?? BigInt(0);
  const isLoading = ordersQuery.isLoading || countQuery.isLoading;
  const error = ordersQuery.error ?? countQuery.error;

  const pendingCount = orders.filter(
    (o) => o.status === OrderStatus.pending,
  ).length;
  const completedCount = orders.filter(
    (o) => o.status === OrderStatus.completed,
  ).length;
  const rejectedCount = orders.filter(
    (o) => o.status === OrderStatus.rejected,
  ).length;

  const filteredOrders =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  function handleRefresh() {
    void ordersQuery.refetch();
    void countQuery.refetch();
  }

  function handleLogout() {
    clear();
    onLogout();
    navigate("home");
  }

  function formatTimestamp(ts: bigint): string {
    try {
      const ms = Number(ts);
      return new Date(ms).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  }

  async function handleApprove(realIndex: number) {
    setPendingActionIndex(realIndex);
    try {
      await updateStatus.mutateAsync({
        index: BigInt(realIndex),
        status: OrderStatus.completed,
      });
      toast.success("✅ Order approved successfully!");
    } catch {
      toast.error("Failed to approve order. Try again.");
    } finally {
      setPendingActionIndex(null);
    }
  }

  async function handleReject(realIndex: number) {
    setPendingActionIndex(realIndex);
    try {
      await updateStatus.mutateAsync({
        index: BigInt(realIndex),
        status: OrderStatus.rejected,
      });
      toast.success("❌ Order rejected.");
    } catch {
      toast.error("Failed to reject order. Try again.");
    } finally {
      setPendingActionIndex(null);
    }
  }

  async function handleConfirmDelete() {
    if (deleteIndex === null) return;
    try {
      await deleteOrder.mutateAsync(BigInt(deleteIndex));
      toast.success("🗑️ Order deleted.");
    } catch {
      toast.error("Failed to delete order. Try again.");
    } finally {
      setDeleteIndex(null);
    }
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "ALL", count: orders.length },
    { key: "pending", label: "PENDING", count: pendingCount },
    { key: "completed", label: "COMPLETED", count: completedCount },
    { key: "rejected", label: "REJECTED", count: rejectedCount },
  ];

  function getStatusBadge(status: OrderStatus) {
    switch (status) {
      case OrderStatus.pending:
        return (
          <Badge
            className="font-pixel text-[9px] rounded-sm px-2 py-0.5 border-0"
            style={{
              background: "oklch(0.22 0.08 75)",
              color: "oklch(0.88 0.22 75)",
            }}
          >
            PENDING
          </Badge>
        );
      case OrderStatus.completed:
        return (
          <Badge
            className="font-pixel text-[9px] rounded-sm px-2 py-0.5 border-0"
            style={{
              background: "oklch(0.18 0.08 142)",
              color: "oklch(0.78 0.22 142)",
            }}
          >
            DONE
          </Badge>
        );
      case OrderStatus.rejected:
        return (
          <Badge
            className="font-pixel text-[9px] rounded-sm px-2 py-0.5 border-0"
            style={{
              background: "oklch(0.18 0.08 25)",
              color: "oklch(0.78 0.22 25)",
            }}
          >
            REJECTED
          </Badge>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col page-enter mc-bg mc-grid">
      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteIndex(null);
        }}
      >
        <AlertDialogContent
          data-ocid="admin.dialog"
          style={{
            background: "oklch(0.1 0.03 145)",
            border: "1px solid oklch(0.35 0.12 25)",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className="font-pixel text-sm leading-loose"
              style={{ color: "oklch(0.78 0.22 25)" }}
            >
              ⚠ DELETE ORDER?
            </AlertDialogTitle>
            <AlertDialogDescription
              className="font-sans text-xs"
              style={{ color: "oklch(0.55 0.05 145)" }}
            >
              Are you sure you want to delete this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.cancel_button"
              className="font-pixel text-[10px] rounded-sm"
              style={{
                background: "oklch(0.14 0.03 145)",
                border: "1px solid oklch(0.28 0.04 145)",
                color: "oklch(0.6 0.06 145)",
              }}
            >
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.confirm_button"
              onClick={() => void handleConfirmDelete()}
              disabled={deleteOrder.isPending}
              className="font-pixel text-[10px] rounded-sm"
              style={{
                background: "oklch(0.2 0.1 25)",
                border: "1px solid oklch(0.55 0.22 25)",
                color: "oklch(0.88 0.2 25)",
              }}
            >
              {deleteOrder.isPending ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin inline" />
              ) : null}
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
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
            ADMIN PANEL
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {currentUser && (
            <span
              className="text-xs font-sans"
              style={{ color: "oklch(0.6 0.05 145)" }}
            >
              👤 {currentUser.username}
            </span>
          )}
          <motion.button
            data-ocid="admin.editor_button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("editor")}
            className="font-pixel text-[10px] transition-colors"
            style={{ color: "oklch(0.78 0.18 72)" }}
          >
            ✏ EDITOR
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("home")}
            className="font-pixel text-[10px] transition-colors"
            style={{ color: "oklch(0.6 0.15 250)" }}
          >
            ← HOME
          </motion.button>
          <Button
            data-ocid="admin.logout_button"
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

      {/* Main */}
      <main className="flex-1 px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">
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
              color: "oklch(0.85 0.22 142)",
              textShadow: "0 0 20px oklch(0.72 0.22 142 / 0.5)",
            }}
          >
            ⚔ ORDERS DASHBOARD
          </h1>
          <p className="text-[oklch(0.5_0.03_145)] text-xs font-sans mt-1">
            Manage all player purchases — approve, reject, or delete orders
          </p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          {[
            {
              label: "TOTAL ORDERS",
              value: orderCount.toString(),
              color: "oklch(0.72 0.22 142)",
            },
            {
              label: "PENDING",
              value: isLoading ? "..." : pendingCount.toString(),
              color: "oklch(0.88 0.22 75)",
              highlight: true,
            },
            {
              label: "COMPLETED",
              value: isLoading ? "..." : completedCount.toString(),
              color: "oklch(0.75 0.2 142)",
            },
            {
              label: "ADMIN",
              value: currentUser?.username ?? "—",
              color: "oklch(0.6 0.22 250)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-sm p-4"
              style={{
                background: stat.highlight
                  ? "oklch(0.14 0.06 75 / 0.6)"
                  : "oklch(0.12 0.03 145)",
                border: stat.highlight
                  ? "1px solid oklch(0.4 0.12 75)"
                  : "1px solid oklch(0.25 0.04 145)",
                boxShadow: stat.highlight
                  ? "0 0 12px oklch(0.72 0.22 75 / 0.15)"
                  : "none",
              }}
            >
              <p
                className="font-pixel text-sm sm:text-base leading-loose truncate"
                style={{ color: stat.color }}
              >
                {isLoading ? "..." : stat.value}
              </p>
              <p className="text-[oklch(0.45_0.03_145)] text-[9px] font-pixel mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Filter tabs + Refresh row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.key}
                data-ocid="admin.tab"
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 font-pixel text-[9px] px-3 py-1.5 rounded-sm transition-all"
                style={
                  activeTab === tab.key
                    ? {
                        background: "oklch(0.18 0.08 142)",
                        border: "1px solid oklch(0.45 0.18 142)",
                        color: "oklch(0.85 0.22 142)",
                        boxShadow: "0 0 8px oklch(0.65 0.2 142 / 0.3)",
                      }
                    : {
                        background: "oklch(0.12 0.02 145)",
                        border: "1px solid oklch(0.22 0.03 145)",
                        color: "oklch(0.5 0.05 145)",
                      }
                }
              >
                {tab.label}
                <span
                  className="rounded-full px-1.5 text-[8px]"
                  style={{
                    background:
                      activeTab === tab.key
                        ? "oklch(0.28 0.1 142)"
                        : "oklch(0.18 0.03 145)",
                    color:
                      activeTab === tab.key
                        ? "oklch(0.78 0.18 142)"
                        : "oklch(0.45 0.04 145)",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Refresh */}
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 font-pixel text-[10px] rounded-sm px-3 py-1.5 w-fit"
            style={{
              background: "oklch(0.13 0.04 145)",
              border: "1px solid oklch(0.3 0.06 145)",
              color: "oklch(0.65 0.1 145)",
            }}
          >
            <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} />
            REFRESH
          </Button>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            data-ocid="admin.error_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-sm p-4 mb-4 text-center"
            style={{
              background: "oklch(0.1 0.04 25 / 0.5)",
              border: "1px solid oklch(0.45 0.2 25 / 0.5)",
            }}
          >
            <p className="text-xs" style={{ color: "oklch(0.65 0.22 25)" }}>
              ⚠ Failed to load admin data. Check your permissions.
            </p>
          </motion.div>
        )}

        {/* Orders table */}
        {isLoading ? (
          <div
            data-ocid="admin.loading_state"
            className="flex items-center justify-center py-16"
          >
            <Loader2
              className="animate-spin mr-2"
              size={20}
              style={{ color: "oklch(0.72 0.22 142)" }}
            />
            <span
              className="font-pixel text-xs"
              style={{ color: "oklch(0.65 0.1 145)" }}
            >
              LOADING...
            </span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              data-ocid="admin.empty_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-sm p-12 text-center"
              style={{
                background: "oklch(0.11 0.02 145)",
                border: "1px solid oklch(0.22 0.04 145)",
              }}
            >
              <p className="text-4xl mb-4">📋</p>
              <p
                className="font-pixel text-xs leading-loose"
                style={{ color: "oklch(0.55 0.08 142)" }}
              >
                {`NO ${activeTab === "all" ? "" : `${activeTab.toUpperCase()} `}ORDERS`}
              </p>
              <p className="text-[oklch(0.4_0.03_145)] text-xs font-sans mt-2">
                {activeTab === "all"
                  ? "Orders will appear here once players make purchases."
                  : `No ${activeTab} orders at the moment.`}
              </p>
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="rounded-sm overflow-hidden"
              style={{
                border: "1px solid oklch(0.25 0.04 145)",
              }}
            >
              <div className="overflow-x-auto">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow
                      style={{
                        background: "oklch(0.13 0.04 145)",
                        borderBottom: "1px solid oklch(0.25 0.04 145)",
                      }}
                    >
                      {[
                        "#",
                        "PLAYER",
                        "ITEM",
                        "PRICE",
                        "MC USERNAME",
                        "SCREENSHOT",
                        "DATE",
                        "STATUS",
                        "ACTIONS",
                      ].map((h) => (
                        <TableHead
                          key={h}
                          className="font-pixel text-[9px] py-3 whitespace-nowrap"
                          style={{ color: "oklch(0.65 0.15 142)" }}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order, displayIdx) => {
                      // Find real index in original orders array for mutations
                      const realIndex = orders.indexOf(order);
                      const isActing = pendingActionIndex === realIndex;

                      return (
                        <TableRow
                          key={`${order.username}-${order.minecraftUsername}-${realIndex}`}
                          data-ocid="admin.row"
                          style={{
                            background:
                              displayIdx % 2 === 0
                                ? "oklch(0.11 0.02 145)"
                                : "oklch(0.13 0.02 145)",
                            borderBottom: "1px solid oklch(0.2 0.03 145)",
                          }}
                        >
                          {/* # */}
                          <TableCell className="text-[oklch(0.45_0.05_145)] text-xs font-pixel py-3">
                            {displayIdx + 1}
                          </TableCell>

                          {/* PLAYER */}
                          <TableCell
                            className="font-sans text-sm font-medium py-3 whitespace-nowrap"
                            style={{ color: "oklch(0.72 0.22 142)" }}
                          >
                            {order.username}
                          </TableCell>

                          {/* ITEM */}
                          <TableCell
                            className="font-sans text-xs py-3 whitespace-nowrap"
                            style={{ color: "oklch(0.78 0.18 72)" }}
                          >
                            {order.itemName}
                          </TableCell>

                          {/* PRICE */}
                          <TableCell
                            className="font-pixel text-xs py-3 whitespace-nowrap"
                            style={{ color: "oklch(0.88 0.2 72)" }}
                          >
                            {order.price}
                          </TableCell>

                          {/* MC USERNAME */}
                          <TableCell
                            className="font-sans text-xs py-3 whitespace-nowrap"
                            style={{ color: "oklch(0.72 0.22 142)" }}
                          >
                            {order.minecraftUsername || "—"}
                          </TableCell>

                          {/* SCREENSHOT */}
                          <TableCell className="py-3">
                            {order.screenshotUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(order.screenshotUrl, "_blank")
                                }
                                className="p-0 bg-transparent border-0 cursor-pointer transition-opacity hover:opacity-80"
                                title="Click to view full screenshot"
                              >
                                <img
                                  src={order.screenshotUrl}
                                  alt="Payment screenshot"
                                  className="rounded-sm object-cover block"
                                  style={{
                                    width: 40,
                                    height: 40,
                                    border: "1px solid oklch(0.35 0.08 145)",
                                  }}
                                />
                              </button>
                            ) : (
                              <span
                                className="text-xs"
                                style={{ color: "oklch(0.4 0.03 145)" }}
                              >
                                —
                              </span>
                            )}
                          </TableCell>

                          {/* DATE */}
                          <TableCell
                            className="font-sans text-xs py-3 whitespace-nowrap"
                            style={{ color: "oklch(0.55 0.05 145)" }}
                          >
                            {formatTimestamp(order.timestamp)}
                          </TableCell>

                          {/* STATUS */}
                          <TableCell className="py-3">
                            {getStatusBadge(order.status)}
                          </TableCell>

                          {/* ACTIONS */}
                          <TableCell className="py-3">
                            <div className="flex items-center gap-1.5">
                              {/* Approve */}
                              {order.status !== OrderStatus.completed && (
                                <button
                                  type="button"
                                  data-ocid="admin.approve_button"
                                  disabled={isActing}
                                  onClick={() => void handleApprove(realIndex)}
                                  title="Approve"
                                  className="flex items-center gap-1 font-pixel text-[9px] px-2 py-1 rounded-sm transition-all disabled:opacity-40"
                                  style={{
                                    background: "oklch(0.15 0.08 142)",
                                    border: "1px solid oklch(0.4 0.18 142)",
                                    color: "oklch(0.78 0.22 142)",
                                  }}
                                >
                                  {isActing ? (
                                    <Loader2
                                      size={9}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <CheckCircle2 size={9} />
                                  )}
                                  OK
                                </button>
                              )}

                              {/* Reject */}
                              {order.status !== OrderStatus.rejected && (
                                <button
                                  type="button"
                                  data-ocid="admin.reject_button"
                                  disabled={isActing}
                                  onClick={() => void handleReject(realIndex)}
                                  title="Reject"
                                  className="flex items-center gap-1 font-pixel text-[9px] px-2 py-1 rounded-sm transition-all disabled:opacity-40"
                                  style={{
                                    background: "oklch(0.15 0.06 55)",
                                    border: "1px solid oklch(0.45 0.18 50)",
                                    color: "oklch(0.8 0.2 50)",
                                  }}
                                >
                                  {isActing ? (
                                    <Loader2
                                      size={9}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <XCircle size={9} />
                                  )}
                                  NO
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                type="button"
                                data-ocid="admin.delete_button"
                                disabled={isActing}
                                onClick={() => setDeleteIndex(realIndex)}
                                title="Delete"
                                className="flex items-center gap-1 font-pixel text-[9px] px-2 py-1 rounded-sm transition-all disabled:opacity-40"
                                style={{
                                  background: "oklch(0.14 0.06 25)",
                                  border: "1px solid oklch(0.45 0.2 25)",
                                  color: "oklch(0.78 0.2 25)",
                                }}
                              >
                                <Trash2 size={9} />
                                DEL
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
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
