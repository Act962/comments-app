import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Credencial de SISTEMA da sincronização entre ecossistemas (comments ↔ NASA).
 *
 * Port de `src/features/sync/lib/system-cred.ts` do NASA. MESMO esquema canônico
 * usado em todo o ecossistema (NASA↔NERP↔comments) — precisa bater byte-a-byte:
 *
 *   canonical = `${METHOD}\n${pathname}\n${body}\n${timestamp}`   // pathname sem query
 *   signature = HMAC-SHA256(canonical, SYNC_SHARED_SECRET)        // hex
 *   headers   = x-sync-api-key, x-sync-timestamp, x-sync-signature
 *
 * `buildSyncHeaders` assina requisições OUTBOUND (comments → NASA).
 * `verifyEcosystemSyncRequest` verifica requisições INBOUND (NASA → comments).
 *
 * Distinto do consent S2S por-org (`comments-s2s-verify.ts`, headers
 * `x-comments-*` sobre `CommentsIntegrationKey`): esta é a chave master app↔app
 * (`SYNC_SHARED_SECRET` + `SYNC_API_KEY`), idêntica em todos os apps.
 */

const DRIFT_MS = 5 * 60 * 1000;

export const SYNC_API_KEY_HEADER = "x-sync-api-key";
export const SYNC_TIMESTAMP_HEADER = "x-sync-timestamp";
export const SYNC_SIGNATURE_HEADER = "x-sync-signature";

function getSharedSecret(): string {
  const sharedSecret = process.env.SYNC_SHARED_SECRET;
  if (!sharedSecret) {
    throw new Error(
      "Missing env SYNC_SHARED_SECRET. Generate with 'openssl rand -hex 32'.",
    );
  }
  return sharedSecret;
}

function getApiKey(): string {
  const apiKey = process.env.SYNC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing env SYNC_API_KEY.");
  }
  return apiKey;
}

function sign(
  method: string,
  path: string,
  body: string,
  timestamp: string,
): string {
  const canonicalString = `${method.toUpperCase()}\n${path}\n${body}\n${timestamp}`;
  return createHmac("sha256", getSharedSecret())
    .update(canonicalString)
    .digest("hex");
}

/**
 * Headers assinados para uma requisição OUTBOUND (comments → NASA).
 * `path` deve ser o `pathname` (sem query), igual ao que o verificador remoto
 * usa pra reconstruir a string canônica.
 */
export function buildSyncHeaders(args: {
  method: string;
  path: string;
  body: string;
}): Record<string, string> {
  const timestamp = String(Date.now());
  const signature = sign(args.method, args.path, args.body, timestamp);
  return {
    "content-type": "application/json",
    [SYNC_API_KEY_HEADER]: getApiKey(),
    [SYNC_TIMESTAMP_HEADER]: timestamp,
    [SYNC_SIGNATURE_HEADER]: signature,
  };
}

function hexEqual(expectedHex: string, actualHex: string): boolean {
  const expectedBuffer = Buffer.from(expectedHex, "hex");
  const actualBuffer = Buffer.from(actualHex, "hex");
  if (
    expectedBuffer.length === 0 ||
    expectedBuffer.length !== actualBuffer.length
  ) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

/**
 * Verifica a assinatura HMAC de uma requisição INBOUND (NASA → comments).
 * Retorna `true` se válida. Best-effort: nunca lança — qualquer falha vira
 * `false` e o endpoint responde 401.
 */
export async function verifyEcosystemSyncRequest(
  request: Request,
): Promise<boolean> {
  try {
    const apiKey = request.headers.get(SYNC_API_KEY_HEADER);
    const timestamp = request.headers.get(SYNC_TIMESTAMP_HEADER);
    const signature = request.headers.get(SYNC_SIGNATURE_HEADER);
    if (!apiKey || !timestamp || !signature) return false;

    if (apiKey !== getApiKey()) return false;

    const timestampMs = Number(timestamp);
    if (
      !Number.isFinite(timestampMs) ||
      Math.abs(Date.now() - timestampMs) > DRIFT_MS
    ) {
      return false;
    }

    const rawBody = await request.clone().text();
    const url = new URL(request.url);
    const expectedSignature = sign(
      request.method,
      url.pathname,
      rawBody,
      timestamp,
    );
    return hexEqual(expectedSignature, signature);
  } catch {
    return false;
  }
}
