import { createHmac, timingSafeEqual } from "node:crypto";
import type { User } from "@/generated/prisma/client";
import prisma from "./db";
import { decryptSecret } from "./comments-s2s-crypto";

const DRIFT_MS = 5 * 60 * 1000;
const API_KEY_HEADER = "x-comments-api-key";
const USER_ID_HEADER = "x-comments-user-id";
const TIMESTAMP_HEADER = "x-comments-timestamp";
const SIGNATURE_HEADER = "x-comments-signature";

export type S2SContext = {
  user: User;
  scopes: string[];
  organizationId: string | null;
};

function hexEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length === 0 || ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function verifyCommentsS2S(request: Request): Promise<S2SContext | null> {
  const apiKey = request.headers.get(API_KEY_HEADER);
  if (!apiKey) return null;

  const userIdHeader = request.headers.get(USER_ID_HEADER);
  const timestampHeader = request.headers.get(TIMESTAMP_HEADER);
  const signatureHeader = request.headers.get(SIGNATURE_HEADER);

  if (!userIdHeader || !timestampHeader || !signatureHeader) {
    throw new Response(JSON.stringify({ error: "missing_s2s_headers" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const ts = Number(timestampHeader);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > DRIFT_MS) {
    throw new Response(JSON.stringify({ error: "timestamp_drift" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const key = await prisma.commentsIntegrationKey.findUnique({
    where: { apiKey },
    select: {
      id: true,
      userId: true,
      organizationId: true,
      secretCiphertext: true,
      revokedAt: true,
      scopes: true,
    },
  });
  if (!key || key.revokedAt) {
    throw new Response(JSON.stringify({ error: "invalid_key" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  if (key.userId !== userIdHeader) {
    throw new Response(JSON.stringify({ error: "user_mismatch" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let secret: string;
  try {
    secret = decryptSecret(key.secretCiphertext);
  } catch {
    throw new Response(JSON.stringify({ error: "decrypt_failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const rawBody = await request.clone().text();
  const url = new URL(request.url);
  const canonical = `${request.method.toUpperCase()}\n${url.pathname}\n${rawBody}\n${timestampHeader}`;
  const expected = createHmac("sha256", secret).update(canonical).digest("hex");

  if (!hexEqual(expected, signatureHeader)) {
    throw new Response(JSON.stringify({ error: "invalid_signature" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const user = await prisma.user.findUnique({ where: { id: key.userId } });
  if (!user) {
    throw new Response(JSON.stringify({ error: "user_not_found" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

  prisma.commentsIntegrationKey
    .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
    .catch(() => undefined);

  return { user, scopes: key.scopes, organizationId: key.organizationId };
}
