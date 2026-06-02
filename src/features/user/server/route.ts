import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { InstagramPostProps } from "@/features/automations/types";
import prisma from "@/lib/db";
import { generateTokens, refreshToken } from "@/lib/fetch";
import { instagramFetch } from "@/lib/instagram-api";
import {
  createTRPCRouter,
  protectedOrgProcedure,
  protectedProcedure,
} from "@/trpc/init";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.update({
        where: {
          id: ctx.auth.user.id,
        },
        data: {
          name: input.name,
          image: input.image,
        },
      });

      return user;
    }),
  refreshTokens: protectedOrgProcedure.mutation(async ({ ctx }) => {
    const integration = await prisma.integration.findFirst({
      where: {
        organizationId: ctx.organizationId,
        name: "INSTAGRAM",
        status: "ACTIVE",
      },
    });
    if (!integration) {
      return { refreshed: false };
    }

    const ageMs = Date.now() - integration.createdAt.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (ageMs < oneDayMs) return { refreshed: false };

    const refreshed = await refreshToken(integration.token);

    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        token: refreshed.access_token,
        expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
        lastRefreshedAt: new Date(),
        lastRefreshError: null,
      },
    });

    return { refreshed: true };
  }),
  getPosts: protectedOrgProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const instagram = await prisma.integration.findFirst({
        where: {
          organizationId: ctx.organizationId,
          name: "INSTAGRAM",
        },
      });

      if (!instagram) {
        return {
          items: [],
          nextCursor: undefined as string | undefined,
          status: 200,
          needsReconnect: false,
        };
      }

      if (instagram.status === "NEEDS_RECONNECT") {
        return {
          items: [],
          nextCursor: undefined as string | undefined,
          status: 401,
          needsReconnect: true,
        };
      }

      const url =
        input.cursor ||
        `${process.env.INSTAGRAM_BASE_URL}/me/media?fields=id,caption,media_url,media_type,timestamp&limit=10&access_token=${instagram.token}`;

      const result = await instagramFetch<{
        data?: unknown;
        paging?: { next?: unknown };
      }>(instagram.id, url);

      if (!result.ok) {
        return {
          items: [],
          nextCursor: undefined as string | undefined,
          status: result.status,
          needsReconnect: result.authError,
        };
      }

      const rawItems = Array.isArray(result.data?.data) ? result.data.data : [];
      const items = rawItems.filter((item): item is InstagramPostProps => {
        if (!item || typeof item !== "object") return false;
        const obj = item as Partial<InstagramPostProps>;
        return (
          typeof obj.id === "string" &&
          typeof obj.media_url === "string" &&
          (obj.media_type === "IMAGE" ||
            obj.media_type === "VIDEO" ||
            obj.media_type === "CAROUSEL_ALBUM")
        );
      });

      return {
        items,
        nextCursor:
          typeof result.data?.paging?.next === "string"
            ? result.data.paging.next
            : undefined,
        status: result.status,
      };
    }),
  onIntegration: protectedOrgProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.integration.findFirst({
        where: {
          organizationId: ctx.organizationId,
          name: "INSTAGRAM",
        },
      });

      if (existing && existing.status === "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Instagram já está conectado",
        });
      }

      const tokenResult = await generateTokens(input.code);
      if (!tokenResult) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Falha ao obter token do Instagram",
        });
      }

      const get_insta_id = await fetch(
        `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${tokenResult.access_token}`,
      );
      const instaId = await get_insta_id.json();

      const expiresAt = new Date(Date.now() + tokenResult.expires_in * 1000);

      if (existing) {
        await prisma.integration.update({
          where: { id: existing.id },
          data: {
            token: tokenResult.access_token,
            expiresAt,
            instagramId: instaId.user_id,
            status: "ACTIVE",
            lastRefreshedAt: new Date(),
            lastRefreshError: null,
          },
        });
      } else {
        await prisma.integration.create({
          data: {
            userId: ctx.auth.user.id,
            organizationId: ctx.organizationId,
            token: tokenResult.access_token,
            expiresAt,
            instagramId: instaId.user_id,
            lastRefreshedAt: new Date(),
          },
        });
      }

      return { name: ctx.auth.user.name };
    }),
});
