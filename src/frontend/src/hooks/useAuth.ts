import { useInternetIdentity } from "./useInternetIdentity";

/**
 * Re-exports the internet identity hook under a simpler alias.
 * Use login() to authenticate, clear() to logout.
 */
export function useAuth() {
  return useInternetIdentity();
}
