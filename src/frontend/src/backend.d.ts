import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface SiteConfig {
    discordLink: string;
    serverIp: string;
    coinPackages: Array<CoinPackageConfig>;
    ranks: Array<RankConfig>;
}
export interface CoinPackageConfig {
    perks: Array<string>;
    price: string;
    amount: bigint;
    packageLabel: string;
}
export interface RankConfig {
    name: string;
    perks: Array<string>;
    price: string;
}
export interface Order {
    status: OrderStatus;
    username: string;
    screenshotUrl: string;
    minecraftUsername: string;
    timestamp: Time;
    itemName: string;
    price: string;
}
export interface UserProfile {
    username: string;
    email: string;
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminDeleteOrder(index: bigint): Promise<void>;
    adminGetAllOrders(): Promise<Array<Order>>;
    adminGetOrderCount(): Promise<bigint>;
    adminGetSiteConfig(): Promise<SiteConfig>;
    adminGetUsers(): Promise<Array<[Principal, UserProfile]>>;
    adminUpdateOrderStatus(index: bigint, status: OrderStatus): Promise<void>;
    adminUpdateSiteConfig(config: SiteConfig): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPublicSiteConfig(): Promise<SiteConfig>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitOrder(order: Order): Promise<void>;
}
