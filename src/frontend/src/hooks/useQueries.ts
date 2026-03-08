import type {
  CoinPackageConfig,
  Order,
  RankConfig,
  SiteConfig,
  UserProfile,
} from "@/backend.d";
import { OrderStatus } from "@/backend.d";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ── User profile hooks ──────────────────────────────────────────────────────

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Admin hooks ─────────────────────────────────────────────────────────────

export function useAdminOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminOrderCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["adminOrderCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.adminGetOrderCount();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutation hooks ──────────────────────────────────────────────────────────

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useSubmitOrder() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (order: Order) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.submitOrder(order);
    },
  });
}

export function useAdminUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      index,
      status,
    }: {
      index: bigint;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.adminUpdateOrderStatus(index, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      void queryClient.invalidateQueries({ queryKey: ["adminOrderCount"] });
    },
  });
}

export function useAdminDeleteOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.adminDeleteOrder(index);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      void queryClient.invalidateQueries({ queryKey: ["adminOrderCount"] });
    },
  });
}

// ── Site config hooks ────────────────────────────────────────────────────────

export function usePublicSiteConfig() {
  const { actor } = useActor();
  return useQuery<SiteConfig | null>({
    queryKey: ["publicSiteConfig"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPublicSiteConfig();
    },
    enabled: !!actor,
    staleTime: 30000,
  });
}

export function useAdminSiteConfig() {
  const { actor, isFetching } = useActor();
  return useQuery<SiteConfig | null>({
    queryKey: ["adminSiteConfig"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.adminGetSiteConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminUpdateSiteConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: SiteConfig) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.adminUpdateSiteConfig(config);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminSiteConfig"] });
      void queryClient.invalidateQueries({ queryKey: ["publicSiteConfig"] });
    },
  });
}

// Re-export OrderStatus for convenience
export { OrderStatus };
export type { SiteConfig, RankConfig, CoinPackageConfig };
