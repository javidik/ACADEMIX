import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export type UnifiedUser = {
  id: number;
  name: string | null;
  email: string | null;
  avatar?: string | null;
  role: string;
  plan: string;
  generationsLeft: number | null;
  authType: "oauth" | "local";
};

export function useAuth() {
  const utils = trpc.useUtils();

  // Try OAuth first
  const {
    data: oauthUser,
    isLoading: oauthLoading,
  } = trpc.session.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Try local auth if no OAuth
  const localToken = typeof window !== "undefined"
    ? localStorage.getItem("local_auth_token")
    : null;

  const {
    data: localUser,
    isLoading: localLoading,
  } = trpc.account.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !oauthUser && !!localToken,
  });

  const logoutMutation = trpc.session.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const user: UnifiedUser | null = useMemo(() => {
    if (oauthUser) {
      return {
        id: oauthUser.id,
        name: oauthUser.name,
        email: oauthUser.email,
        avatar: oauthUser.avatar,
        role: oauthUser.role,
        plan: (oauthUser as any).plan || "free",
        generationsLeft: (oauthUser as any).generationsLeft ?? null,
        authType: "oauth" as const,
      };
    }
    if (localUser) {
      return {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        avatar: localUser.avatar,
        role: localUser.role,
        plan: (localUser as any).plan || "free",
        generationsLeft: (localUser as any).generationsLeft ?? null,
        authType: "local" as const,
      };
    }
    return null;
  }, [oauthUser, localUser]);

  const isLoading = oauthLoading || (localLoading && !!localToken);

  const logout = useCallback(() => {
    // Always clear local auth
    localStorage.removeItem("local_auth_token");
    // Always call OAuth logout
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        window.location.reload();
      },
    });
  }, [logoutMutation]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading: isLoading || logoutMutation.isPending,
      logout,
    }),
    [user, isLoading, logoutMutation.isPending, logout],
  );
}
