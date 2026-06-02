"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Observa a empresa ativa via Better Auth e, sempre que ela trocar, invalida
 * todo o cache do React Query e dispara `router.refresh()` para que os RSCs
 * voltem a ser renderizados com os dados da nova empresa.
 *
 * Funciona para todas as origens de troca (switcher na sidebar, aceite de
 * convite, criação de empresa nova) porque depende apenas do estado reativo
 * de `useActiveOrganization`.
 */
export function InvalidateOnOrgChange() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const orgId = activeOrg?.id ?? null;
  const previousIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (previousIdRef.current === undefined) {
      previousIdRef.current = orgId;
      return;
    }

    if (previousIdRef.current === orgId) return;

    previousIdRef.current = orgId;
    queryClient.invalidateQueries();
    router.refresh();
  }, [orgId, queryClient, router]);

  return null;
}
