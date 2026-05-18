"use server";

import { randomBytes } from "node:crypto";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

const CONSENT_TTL_MS = 10 * 60 * 1000;

type AuthorizeParams = {
  state: string;
  redirectUri: string;
  scopes: string;
};

export async function approveCommentsIntegration(params: AuthorizeParams) {
  const session = await auth.api.getSession({ headers: await nextHeaders() });
  if (!session?.user) {
    throw new Error("not_authenticated");
  }

  const code = randomBytes(24).toString("base64url");
  await prisma.commentsIntegrationConsent.create({
    data: {
      code,
      userId: session.user.id,
      scopes: params.scopes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      redirectUri: params.redirectUri,
      expiresAt: new Date(Date.now() + CONSENT_TTL_MS),
    },
  });

  const url = new URL(params.redirectUri);
  url.searchParams.set("code", code);
  url.searchParams.set("state", params.state);
  redirect(url.toString());
}

export async function denyCommentsIntegration(params: {
  state: string;
  redirectUri: string;
}) {
  const url = new URL(params.redirectUri);
  url.searchParams.set("error", "user_denied");
  url.searchParams.set("state", params.state);
  redirect(url.toString());
}
