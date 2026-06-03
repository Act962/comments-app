import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyEcosystemSyncRequest } from "@/lib/ecosystem-sync/cred";
import type {
  SyncAccountPayload,
  SyncEnvelope,
  SyncMemberPayload,
  SyncOrgPayload,
  SyncUserPayload,
} from "@/lib/ecosystem-sync/payloads";

/**
 * Endpoint INBOUND do sync de auth: NASA → comments-app.
 *
 * Port de `/api/sync/nerp` do NASA. Replica User/Account/Organization/Member.
 *
 * INVARIANTE (alto risco): este caminho NUNCA usa APIs do better-auth (`auth.api.*`)
 * — só Prisma cru via `@/lib/db`. O `databaseHooks.user.create.after` do
 * comments-app cria `Empresa de <nome>` + Member + Subscription a cada user
 * criado pelo better-auth; usar Prisma cru não dispara esse hook, evitando
 * empresa-fantasma + membro/subscription duplicados por usuário sincronizado.
 * Todo upsert é por `id` (idempotente) — o mesmo cuid vem do NASA.
 *
 * Respostas:
 *  - 200 → aplicado (ou pulado por colisão de identidade, logado).
 *  - 401 → assinatura inválida.
 *  - 409 `{ retryable: true }` → pré-requisito de FK ausente (ex.: member antes
 *    de org/user). O NASA reenfileira/retry; quando o pré-requisito chegar, converge.
 *  - 500 `{ retryable: true }` → erro inesperado, o NASA tenta de novo.
 */

export async function POST(request: Request) {
  const isSignatureValid = await verifyEcosystemSyncRequest(request);
  if (!isSignatureValid) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let envelope: SyncEnvelope;
  try {
    envelope = (await request.json()) as SyncEnvelope;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    switch (envelope.type) {
      case "user":
        return await upsertUser(envelope.data);
      case "account":
        return await upsertAccount(envelope.data);
      case "org":
        return await upsertOrg(envelope.data);
      case "member":
        return await upsertMember(envelope.data);
      default:
        return NextResponse.json({ error: "unknown_type" }, { status: 400 });
    }
  } catch (error) {
    console.error("[sync inbound nasa] upsert failed:", error);
    return NextResponse.json(
      { error: "internal", retryable: true },
      { status: 500 },
    );
  }
}

function toDateOrNull(isoString: string | null): Date | null {
  return isoString ? new Date(isoString) : null;
}

async function upsertUser(userPayload: SyncUserPayload) {
  // Colisão de e-mail (unique) com id diferente → loga e pula.
  const userWithSameEmail = await prisma.user.findUnique({
    where: { email: userPayload.email },
    select: { id: true },
  });
  if (userWithSameEmail && userWithSameEmail.id !== userPayload.id) {
    console.warn(
      `[sync inbound nasa] user email collision: ${userPayload.email} (incoming ${userPayload.id} != local ${userWithSameEmail.id}) — skipping`,
    );
    return NextResponse.json({ ok: true, skipped: "email_collision" });
  }

  // comments-app User NÃO tem `phone` — campo extra ignorado por design.
  const userData = {
    name: userPayload.name,
    email: userPayload.email,
    emailVerified: userPayload.emailVerified,
    image: userPayload.image,
    createdAt: new Date(userPayload.createdAt),
    updatedAt: new Date(userPayload.updatedAt),
  };
  await prisma.user.upsert({
    where: { id: userPayload.id },
    create: { id: userPayload.id, ...userData },
    update: userData,
  });
  return NextResponse.json({ ok: true });
}

async function upsertAccount(accountPayload: SyncAccountPayload) {
  // Pré-requisito: o User precisa existir (FK). Se não, retryable.
  const ownerUser = await prisma.user.findUnique({
    where: { id: accountPayload.userId },
    select: { id: true },
  });
  if (!ownerUser) {
    return NextResponse.json(
      { error: "user_not_found", retryable: true },
      { status: 409 },
    );
  }

  const accountData = {
    accountId: accountPayload.accountId,
    providerId: accountPayload.providerId,
    userId: accountPayload.userId,
    accessToken: accountPayload.accessToken,
    refreshToken: accountPayload.refreshToken,
    idToken: accountPayload.idToken,
    accessTokenExpiresAt: toDateOrNull(accountPayload.accessTokenExpiresAt),
    refreshTokenExpiresAt: toDateOrNull(accountPayload.refreshTokenExpiresAt),
    scope: accountPayload.scope,
    password: accountPayload.password,
    createdAt: new Date(accountPayload.createdAt),
    updatedAt: new Date(accountPayload.updatedAt),
  };
  await prisma.account.upsert({
    where: { id: accountPayload.id },
    create: { id: accountPayload.id, ...accountData },
    update: accountData,
  });
  return NextResponse.json({ ok: true });
}

async function upsertOrg(orgPayload: SyncOrgPayload) {
  // `slug` é unique (nullable) no comments. Se outra org já usa esse slug,
  // grava SEM slug (null) — não pula a org inteira (pular faria o Member
  // 409ar pra sempre por FK ausente).
  let resolvedSlug = orgPayload.slug;
  if (resolvedSlug) {
    const orgWithSameSlug = await prisma.organization.findUnique({
      where: { slug: resolvedSlug },
      select: { id: true },
    });
    if (orgWithSameSlug && orgWithSameSlug.id !== orgPayload.id) {
      console.warn(
        `[sync inbound nasa] org slug collision: ${resolvedSlug} (incoming ${orgPayload.id} != local ${orgWithSameSlug.id}) — gravando sem slug`,
      );
      resolvedSlug = null;
    }
  }

  const orgData = {
    name: orgPayload.name,
    slug: resolvedSlug,
    logo: orgPayload.logo,
    metadata: orgPayload.metadata,
    createdAt: new Date(orgPayload.createdAt),
  };
  await prisma.organization.upsert({
    where: { id: orgPayload.id },
    create: { id: orgPayload.id, ...orgData },
    update: orgData,
  });
  return NextResponse.json({ ok: true });
}

async function upsertMember(memberPayload: SyncMemberPayload) {
  // Pré-requisitos: org + user existem (FK). Se não, retryable.
  const [parentOrg, memberUser] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: memberPayload.organizationId },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: memberPayload.userId },
      select: { id: true },
    }),
  ]);
  if (!parentOrg || !memberUser) {
    return NextResponse.json(
      { error: "prerequisite_missing", retryable: true },
      { status: 409 },
    );
  }

  // Colisão do par único [organizationId, userId] com id diferente → pula.
  const existingMembership = await prisma.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: memberPayload.organizationId,
        userId: memberPayload.userId,
      },
    },
    select: { id: true },
  });
  if (existingMembership && existingMembership.id !== memberPayload.id) {
    console.warn(
      `[sync inbound nasa] member pair collision (incoming ${memberPayload.id} != local ${existingMembership.id}) — skipping`,
    );
    return NextResponse.json({ ok: true, skipped: "member_collision" });
  }

  const memberData = {
    organizationId: memberPayload.organizationId,
    userId: memberPayload.userId,
    role: memberPayload.role,
    createdAt: new Date(memberPayload.createdAt),
  };
  await prisma.member.upsert({
    where: { id: memberPayload.id },
    create: { id: memberPayload.id, ...memberData },
    update: memberData,
  });
  return NextResponse.json({ ok: true });
}
