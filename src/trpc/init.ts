import { auth } from "@/lib/auth";
import type { S2SContext } from "@/lib/comments-s2s-verify";
import prisma from "@/lib/db";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";

type ContextExtras = {
  s2s?: S2SContext | null;
};

export const createTRPCContext = async (extras?: ContextExtras) => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { s2s: extras?.s2s ?? null };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (ctx.s2s?.user) {
    const now = new Date();
    return next({
      ctx: {
        ...ctx,
        auth: {
          session: {
            id: `s2s-${ctx.s2s.user.id}`,
            userId: ctx.s2s.user.id,
            token: "s2s",
            createdAt: now,
            updatedAt: now,
            expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
            ipAddress: null,
            userAgent: "comments-app-s2s",
            activeOrganizationId: null as string | null,
          },
          user: ctx.s2s.user,
        },
        s2sScopes: ctx.s2s.scopes,
      },
    });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: session,
    },
  });
});

export const protectedOrgProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const activeOrganizationId: string | null =
      ctx.s2s?.organizationId ??
      (ctx.auth.session as { activeOrganizationId?: string | null })
        .activeOrganizationId ??
      null;

    if (!activeOrganizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Selecione uma empresa",
      });
    }

    const membership = await prisma.member.findFirst({
      where: {
        organizationId: activeOrganizationId,
        userId: ctx.auth.user.id,
      },
      select: { id: true, role: true, organizationId: true, userId: true },
    });

    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Sem acesso a esta empresa",
      });
    }

    return next({
      ctx: {
        ...ctx,
        organizationId: activeOrganizationId,
        membership,
      },
    });
  },
);
