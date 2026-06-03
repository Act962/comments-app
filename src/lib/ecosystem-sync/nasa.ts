import { buildSyncHeaders } from "@/lib/ecosystem-sync/cred";
import type {
  SyncAccountPayload,
  SyncMemberPayload,
  SyncOrgPayload,
  SyncType,
  SyncUserPayload,
} from "@/lib/ecosystem-sync/payloads";

/**
 * Sincronização entre ecossistemas — alvo: NASA.
 * Cliente OUTBOUND do sync de auth comments-app → NASA.
 *
 * Espelho de `src/http/ecosystem-sync/comments.ts` do NASA: assina com a
 * credencial de SISTEMA (`SYNC_SHARED_SECRET` / `SYNC_API_KEY`) e entrega no
 * endpoint inbound do NASA (base + `/api/sync/comments`). A base vem de
 * `NASA_SYNC_BASE_URL` (override) ou `NASA_BASE_URL`.
 */

const INBOUND_PATH = "/api/sync/comments";
const TIMEOUT_MS = Number(process.env.SYNC_REQUEST_TIMEOUT_MS ?? 10_000);

function baseUrl(): string {
  const b = process.env.NASA_SYNC_BASE_URL ?? process.env.NASA_BASE_URL;
  if (!b) {
    throw new Error("Missing env NASA_SYNC_BASE_URL (ou NASA_BASE_URL)");
  }
  return b.replace(/\/$/, "");
}

async function send(type: SyncType, data: unknown): Promise<void> {
  const body = JSON.stringify({ type, data });
  const headers = buildSyncHeaders({
    method: "POST",
    path: INBOUND_PATH,
    body,
  });

  const res = await fetch(`${baseUrl()}${INBOUND_PATH}`, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Lança para a função Inngest fazer retry/backoff.
    throw new Error(`sync→nasa ${type} failed: HTTP ${res.status} ${text}`);
  }
}

export const ecosystemSyncNasa = {
  upsertUser: (data: SyncUserPayload) => send("user", data),
  upsertAccount: (data: SyncAccountPayload) => send("account", data),
  upsertOrg: (data: SyncOrgPayload) => send("org", data),
  upsertMember: (data: SyncMemberPayload) => send("member", data),
};
