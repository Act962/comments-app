import { InstagramPostProps } from "@/features/automations/types";
import prisma from "@/lib/db";
import { generateTokens, refresshToken } from "@/lib/fetch";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  refreshTokens: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.auth.user.id,
      },
      include: {
        integrations: true,
      },
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.integrations.length > 0) {
      const today = new Date();
      const time_left =
        user.integrations[0].expiresAt?.getTime()! - today.getTime();

      const days = Math.floor(time_left / (1000 * 3600 * 24));

      if (days < 5) {
        console.log("Refresh");

        const refresh = await refresshToken(user.integrations[0].token);

        const today = new Date();
        const expiresAt = today.setDate(today.getDate() + 60);

        const update_token = await prisma.integration.update({
          where: {
            id: user.integrations[0].id,
          },
          data: {
            token: refresh.access_token,
            expiresAt: new Date(expiresAt),
          },
        });

        if (!update_token) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update token",
          });
        }
      }
    }

    return user;
  }),
  getPosts: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.auth.user.id,
      },
      include: {
        integrations: true,
        automations: true,
      },
    });

    const instagram = user?.integrations.find(
      (integration) => integration.name === "INSTAGRAM",
    );

    const posts = await fetch(
      `${process.env.INSTAGRAM_BASE_URL}/me/media?fields=id,caption,media_url,media_type,timestamp&limit=10&access_token=${instagram?.token}`,
    );

    // if (!posts.ok) {
    //   throw new TRPCError({
    //     code: "INTERNAL_SERVER_ERROR",
    //     message: "Failed to fetch posts",
    //   });
    // }

    const parsed = await posts.json();

    return {
      data: parsed.data as InstagramPostProps[],
      status: posts.status,
    };
  }),
  onIntegration: protectedProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const integration = await prisma.user.findUnique({
        where: {
          id: ctx.auth.user.id,
        },
        include: {
          integrations: {
            where: {
              name: "INSTAGRAM",
            },
          },
        },
      });

      if (integration && integration.integrations.length === 0) {
        const token = await generateTokens(input.code);
        console.log(token);

        if (token) {
          // const insta_id = await axios.get(
          //   `${process.env.INSTAGRAM_BASE_URL}/me?fields=id&access_token=${token.access_token}`,
          // );

          const get_insta_id = await fetch(
            `${process.env.INSTAGRAM_BASE_URL}/me?fields=id&access_token=${token}`,
          );

          const instaId = await get_insta_id.json();

          const today = new Date();
          const expire_date = today.setDate(today.getDate() + 60);
          const create = await prisma.user.update({
            where: {
              id: ctx.auth.user.id,
            },
            data: {
              integrations: {
                create: {
                  token,
                  expiresAt: new Date(expire_date),
                  instagramId: instaId.id,
                },
              },
            },
            select: {
              name: true,
            },
          });

          return create;
        }
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Error on integration",
      });
    }),
});
