/**
 * useAuth hook — provides current user, loading state, and auth status.
 *
 * Replaces the Manus-provided useAuth hook.
 * Uses the auth.me tRPC query to check session state.
 */

import { trpc } from "@/lib/trpc";

export function useAuth() {
  const { data: user, isLoading: loading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  return {
    user: user ?? null,
    loading,
    isAuthenticated: !!user,
  };
}
