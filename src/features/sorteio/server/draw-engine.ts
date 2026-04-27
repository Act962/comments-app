import "server-only";

import { randomInt } from "node:crypto";
import { TRPCError } from "@trpc/server";
import prisma from "@/lib/db";

export type DrawRules = {
  dedupePerUser?: boolean;
  minWords?: number;
  requireMention?: boolean;
};

function parseRules(raw: unknown): DrawRules {
  return (raw ?? {}) as DrawRules;
}

function commentMatchesRules(text: string, rules: DrawRules): boolean {
  if (rules.minWords && rules.minWords > 0) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (words < rules.minWords) return false;
  }
  if (rules.requireMention && !text.includes("@")) return false;
  return true;
}

export type DrawnWinner = {
  id: string;
  sorteioId: string;
  sorteioCommentId: string;
  position: number;
  drawnAt: Date;
  comment: {
    id: string;
    text: string;
    fromId: string;
    fromUsername: string | null;
    commentedAt: Date;
  };
};

export async function performDraw(
  sorteioId: string,
  count: number,
): Promise<DrawnWinner[]> {
  const sorteio = await prisma.sorteio.findUnique({
    where: { id: sorteioId },
  });
  if (!sorteio) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Sorteio não encontrado",
    });
  }

  if (sorteio.status === "DRAFT") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Inicie a coleta antes de sortear",
    });
  }

  const existingWinners = await prisma.sorteioWinner.findMany({
    where: { sorteioId },
    include: { comment: { select: { fromId: true } } },
  });

  const remaining = sorteio.winnersCount - existingWinners.length;
  if (remaining <= 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Sorteio já atingiu o número total de ganhadores",
    });
  }
  if (count > remaining) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Restam apenas ${remaining} ganhador(es) a sortear`,
    });
  }

  const excluded = new Set(existingWinners.map((w) => w.comment.fromId));
  const rules = parseRules(sorteio.rules);
  const dedupePerUser = rules.dedupePerUser !== false;

  const allComments = await prisma.sorteioComment.findMany({
    where: { sorteioId },
    orderBy: { commentedAt: "asc" },
    select: {
      id: true,
      text: true,
      fromId: true,
      fromUsername: true,
      commentedAt: true,
    },
  });

  const eligibleByFromId = new Map<string, typeof allComments>();
  for (const c of allComments) {
    if (excluded.has(c.fromId)) continue;
    if (!commentMatchesRules(c.text, rules)) continue;

    if (dedupePerUser) {
      if (!eligibleByFromId.has(c.fromId)) {
        eligibleByFromId.set(c.fromId, [c]);
      }
    } else {
      const list = eligibleByFromId.get(c.fromId) ?? [];
      list.push(c);
      eligibleByFromId.set(c.fromId, list);
    }
  }

  const pool = Array.from(eligibleByFromId.values()).flat();
  if (pool.length < count) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Pool insuficiente (${pool.length}) para sortear ${count}`,
    });
  }

  const picked: typeof pool = [];
  const pickedFromIds = new Set<string>();
  while (picked.length < count) {
    const idx = randomInt(0, pool.length);
    const candidate = pool[idx];
    pool.splice(idx, 1);
    if (pickedFromIds.has(candidate.fromId)) continue;
    picked.push(candidate);
    pickedFromIds.add(candidate.fromId);
  }

  const startPosition = existingWinners.length + 1;
  return await prisma.$transaction(async (tx) => {
    const created: DrawnWinner[] = [];
    for (let i = 0; i < picked.length; i++) {
      const w = await tx.sorteioWinner.create({
        data: {
          sorteioId,
          sorteioCommentId: picked[i].id,
          position: startPosition + i,
        },
        include: { comment: true },
      });
      created.push(w as DrawnWinner);
    }

    const totalNow = existingWinners.length + created.length;
    await tx.sorteio.update({
      where: { id: sorteioId },
      data: {
        lastDrawnAt: new Date(),
        ...(totalNow >= sorteio.winnersCount
          ? { status: "DRAWN" as const }
          : {}),
      },
    });

    return created;
  });
}

export async function performReplaceWinner(
  sorteioId: string,
  winnerId: string,
): Promise<DrawnWinner> {
  const sorteio = await prisma.sorteio.findUnique({
    where: { id: sorteioId },
  });
  if (!sorteio) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Sorteio não encontrado",
    });
  }

  const winner = await prisma.sorteioWinner.findFirst({
    where: { id: winnerId, sorteioId },
    include: { comment: { select: { fromId: true } } },
  });
  if (!winner) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Ganhador não encontrado",
    });
  }

  const remainingWinners = await prisma.sorteioWinner.findMany({
    where: { sorteioId, NOT: { id: winner.id } },
    include: { comment: { select: { fromId: true } } },
  });
  const excluded = new Set([
    winner.comment.fromId,
    ...remainingWinners.map((w) => w.comment.fromId),
  ]);

  const rules = parseRules(sorteio.rules);
  const dedupePerUser = rules.dedupePerUser !== false;

  const allComments = await prisma.sorteioComment.findMany({
    where: { sorteioId },
    orderBy: { commentedAt: "asc" },
    select: {
      id: true,
      text: true,
      fromId: true,
      fromUsername: true,
      commentedAt: true,
    },
  });

  const seen = new Set<string>();
  const pool = allComments.filter((c) => {
    if (excluded.has(c.fromId)) return false;
    if (!commentMatchesRules(c.text, rules)) return false;
    if (dedupePerUser) {
      if (seen.has(c.fromId)) return false;
      seen.add(c.fromId);
    }
    return true;
  });

  if (pool.length === 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Sem candidatos elegíveis para substituição",
    });
  }

  const picked = pool[randomInt(0, pool.length)];

  return await prisma.$transaction(async (tx) => {
    await tx.sorteioWinner.delete({ where: { id: winner.id } });
    const created = await tx.sorteioWinner.create({
      data: {
        sorteioId,
        sorteioCommentId: picked.id,
        position: winner.position,
        drawnAt: new Date(),
      },
      include: { comment: true },
    });
    return created as DrawnWinner;
  });
}
