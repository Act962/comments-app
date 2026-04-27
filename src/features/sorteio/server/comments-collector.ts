import "server-only";

import { getInstagramToken } from "@/actions/sorteio";
import prisma from "@/lib/db";
import {
  getAllMediaComments,
  getCommentFrom,
  type InstagramComment,
} from "@/lib/fetch";

export type BackfillStats = {
  perPost: Array<{
    postId: string;
    fetched: number;
    upserted: number;
    error?: string;
  }>;
  totalUpserted: number;
};

export async function backfillCommentsFromInstagram(
  sorteioId: string,
): Promise<BackfillStats> {
  const sorteio = await prisma.sorteio.findUnique({
    where: { id: sorteioId },
    include: { posts: true },
  });

  if (!sorteio) {
    throw new Error(`Sorteio ${sorteioId} não encontrado`);
  }

  const token = await getInstagramToken(sorteio.userId);
  const stats: BackfillStats = { perPost: [], totalUpserted: 0 };

  if (!token) {
    for (const post of sorteio.posts) {
      stats.perPost.push({
        postId: post.postId,
        fetched: 0,
        upserted: 0,
        error: "Sem integração Instagram ativa",
      });
    }
    return stats;
  }

  for (const post of sorteio.posts) {
    try {
      const comments = await getAllMediaComments(post.postId, token);
      const upserted = await upsertComments(
        sorteio.id,
        post.id,
        comments,
        token,
      );
      stats.perPost.push({
        postId: post.postId,
        fetched: comments.length,
        upserted,
      });
      stats.totalUpserted += upserted;
    } catch (error: any) {
      stats.perPost.push({
        postId: post.postId,
        fetched: 0,
        upserted: 0,
        error:
          error?.response?.data?.error?.message ?? error?.message ?? "erro",
      });
    }
  }

  return stats;
}

async function upsertComments(
  sorteioId: string,
  sorteioPostId: string,
  comments: InstagramComment[],
  token: string,
) {
  let upserted = 0;

  for (const c of comments) {
    let fromId = c.from?.id;
    let fromUsername = c.from?.username ?? c.username;

    if (!fromId) {
      try {
        const enriched = await getCommentFrom(c.id, token);
        fromId = enriched?.id;
        fromUsername = fromUsername ?? enriched?.username;
      } catch {
        continue;
      }
    }

    if (!fromId) continue;

    await prisma.sorteioComment.upsert({
      where: {
        sorteioId_commentId: { sorteioId, commentId: c.id },
      },
      create: {
        sorteioId,
        sorteioPostId,
        commentId: c.id,
        fromId,
        fromUsername,
        text: c.text ?? "",
        commentedAt: new Date(c.timestamp),
      },
      update: {
        fromUsername: fromUsername ?? undefined,
      },
    });

    upserted += 1;
  }

  return upserted;
}

export async function upsertCommentFromWebhook(params: {
  accountId: string;
  mediaId: string;
  commentId: string;
  fromId: string;
  fromUsername?: string;
  text: string;
}) {
  const posts = await prisma.sorteioPost.findMany({
    where: {
      postId: params.mediaId,
      sorteio: {
        status: "COLLECTING",
        user: {
          integrations: {
            some: {
              name: "INSTAGRAM",
              instagramId: params.accountId,
            },
          },
        },
      },
    },
    select: { id: true, sorteioId: true },
  });

  if (posts.length === 0) return;

  for (const post of posts) {
    await prisma.sorteioComment.upsert({
      where: {
        sorteioId_commentId: {
          sorteioId: post.sorteioId,
          commentId: params.commentId,
        },
      },
      create: {
        sorteioId: post.sorteioId,
        sorteioPostId: post.id,
        commentId: params.commentId,
        fromId: params.fromId,
        fromUsername: params.fromUsername,
        text: params.text,
        commentedAt: new Date(),
      },
      update: {
        fromUsername: params.fromUsername ?? undefined,
      },
    });
  }
}
