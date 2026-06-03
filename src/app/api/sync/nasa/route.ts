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
  const ok = await verifyEcosystemSyncRequest(request);
  if (!ok) {
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
  } catch (e) {
    console.error("[sync inbound nasa] upsert failed:", e);
    return NextResponse.json(
      { error: "internal", retryable: true },
      { status: 500 },
    );
  }
}

function d(iso: string | null): Date | null {
  return iso ? new Date(iso) : null;
}

async function upsertUser(p: SyncUserPayload) {
  // Colisão de e-mail (unique) com id diferente → loga e pula.
  const existingByEmail = await prisma.user.findUnique({
    where: { email: p.email },
    select: { id: true },
  });
  if (existingByEmail && existingByEmail.id !== p.id) {
    console.warn(
      `[sync inbound nasa] user email collision: ${p.email} (incoming ${p.id} != local ${existingByEmail.id}) — skipping`,
    );
    return NextResponse.json({ ok: true, skipped: "email_collision" });
  }

  // comments-app User NÃO tem `phone` — campo extra ignorado por design.
  const data = {
    name: p.name,
    email: p.email,
    emailVerified: p.emailVerified,
    image: p.image,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
  await prisma.user.upsert({
    where: { id: p.id },
    create: { id: p.id, ...data },
    update: data,
  });
  return NextResponse.json({ ok: true });
}

async function upsertAccount(p: SyncAccountPayload) {
  // Pré-requisito: o User precisa existir (FK). Se não, retryable.
  const user = await prisma.user.findUnique({
    where: { id: p.userId },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json(
      { error: "user_not_found", retryable: true },
      { status: 409 },
    );
  }

  const data = {
    accountId: p.accountId,
    providerId: p.providerId,
    userId: p.userId,
    accessToken: p.accessToken,
    refreshToken: p.refreshToken,
    idToken: p.idToken,
    accessTokenExpiresAt: d(p.accessTokenExpiresAt),
    refreshTokenExpiresAt: d(p.refreshTokenExpiresAt),
    scope: p.scope,
    password: p.password,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
  await prisma.account.upsert({
    where: { id: p.id },
    create: { id: p.id, ...data },
    update: data,
  });
  return NextResponse.json({ ok: true });
}

async function upsertOrg(p: SyncOrgPayload) {
  // `slug` é unique (nullable) no comments. Se outra org já usa esse slug,
  // grava SEM slug (null) — não pula a org inteira (pular faria o Member
  // 409ar pra sempre por FK ausente).
  let slug = p.slug;
  if (slug) {
    const bySlug = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (bySlug && bySlug.id !== p.id) {
      console.warn(
        `[sync inbound nasa] org slug collision: ${slug} (incoming ${p.id} != local ${bySlug.id}) — gravando sem slug`,
      );
      slug = null;
    }
  }

  const data = {
    name: p.name,
    slug,
    logo: p.logo,
    metadata: p.metadata,
    createdAt: new Date(p.createdAt),
  };
  await prisma.organization.upsert({
    where: { id: p.id },
    create: { id: p.id, ...data },
    update: data,
  });
  return NextResponse.json({ ok: true });
}

async function upsertMember(p: SyncMemberPayload) {
  // Pré-requisitos: org + user existem (FK). Se não, retryable.
  const [org, user] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: p.organizationId },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: p.userId },
      select: { id: true },
    }),
  ]);
  if (!org || !user) {
    return NextResponse.json(
      { error: "prerequisite_missing", retryable: true },
      { status: 409 },
    );
  }

  // Colisão do par único [organizationId, userId] com id diferente → pula.
  const existingPair = await prisma.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: p.organizationId,
        userId: p.userId,
      },
    },
    select: { id: true },
  });
  if (existingPair && existingPair.id !== p.id) {
    console.warn(
      `[sync inbound nasa] member pair collision (incoming ${p.id} != local ${existingPair.id}) — skipping`,
    );
    return NextResponse.json({ ok: true, skipped: "member_collision" });
  }

  const data = {
    organizationId: p.organizationId,
    userId: p.userId,
    role: p.role,
    createdAt: new Date(p.createdAt),
  };
  await prisma.member.upsert({
    where: { id: p.id },
    create: { id: p.id, ...data },
    update: data,
  });
  return NextResponse.json({ ok: true });
}
