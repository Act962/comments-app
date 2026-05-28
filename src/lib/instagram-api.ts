import prisma from "@/lib/db";

const isAuthError = (status: number) => status === 401 || status === 403;

const extractErrorMessage = (body: unknown): string => {
  if (!body || typeof body !== "object") return "Unknown error";
  const obj = body as { error?: { message?: string; code?: number } };
  if (obj.error?.message) {
    return obj.error.code
      ? `[${obj.error.code}] ${obj.error.message}`
      : obj.error.message;
  }
  try {
    return JSON.stringify(body).slice(0, 500);
  } catch {
    return "Unknown error";
  }
};

export async function markIntegrationBroken(
  integrationId: string,
  errorMessage: string,
) {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: { id: true, userId: true, status: true },
  });

  if (!integration || integration.status === "NEEDS_RECONNECT") return;

  await prisma.integration.update({
    where: { id: integrationId },
    data: {
      status: "NEEDS_RECONNECT",
      lastRefreshError: errorMessage.slice(0, 500),
    },
  });

  if (integration.userId) {
    await prisma.notification.create({
      data: {
        userId: integration.userId,
        type: "INTEGRATION_EXPIRED",
        title: "Conexão com Instagram expirou",
        message:
          "Sua integração com o Instagram precisa ser renovada. Clique para reconectar.",
        link: "/integrations",
      },
    });
  }
}

/**
 * Inspects a thrown error from axios (or fetch wrappers) and, if the response
 * was a 401/403, marks the integration broken. Always rethrows for the caller
 * to decide whether to swallow — webhook handlers should call this and then
 * let the event drop silently.
 */
export async function handleTokenError(
  err: unknown,
  integrationId: string,
): Promise<boolean> {
  const status =
    (err as { response?: { status?: number }; status?: number })?.response
      ?.status ?? (err as { status?: number })?.status;
  if (status === 401 || status === 403) {
    const message =
      (err as { response?: { data?: unknown } })?.response?.data !== undefined
        ? extractErrorMessage(
            (err as { response: { data: unknown } }).response.data,
          )
        : err instanceof Error
          ? err.message
          : String(err);
    await markIntegrationBroken(integrationId, message);
    return true;
  }
  return false;
}

export type InstagramFetchResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; status: number; error: string; authError: boolean };

/**
 * Fetches a Graph API URL using `integration.token`. On 401/403, marks the
 * integration as NEEDS_RECONNECT and emits a notification — but never throws.
 * Callers should handle `result.ok === false` (typically by returning an empty
 * result to the UI, which will already be showing the "Reconectar" banner).
 */
export async function instagramFetch<T>(
  integrationId: string,
  url: string,
  init?: RequestInit,
): Promise<InstagramFetchResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, error: message, authError: false };
  }

  const body = (await res.json().catch(() => null)) as unknown;

  if (!res.ok) {
    const message = extractErrorMessage(body);
    if (isAuthError(res.status)) {
      await markIntegrationBroken(integrationId, message);
      return {
        ok: false,
        status: res.status,
        error: message,
        authError: true,
      };
    }
    return {
      ok: false,
      status: res.status,
      error: message,
      authError: false,
    };
  }

  return { ok: true, data: body as T, status: res.status };
}
