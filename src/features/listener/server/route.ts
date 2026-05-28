import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

const buttonSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(20, "Título muito longo"),
  url: z.string().url("URL inválida"),
});

const buttonsSchema = z.array(buttonSchema).max(3, "Máximo 3 botões").optional();

export const listenerRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        automationId: z.string(),
        listener: z.enum(["SMARTAI", "MESSAGE"]),
        prompt: z.string(),
        reply: z.string().optional(),
        buttons: buttonsSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const buttons = input.listener === "MESSAGE" ? input.buttons ?? [] : [];
      return await prisma.listerner.create({
        data: {
          automationId: input.automationId,
          listener: input.listener,
          prompt: input.prompt,
          commentReply: input.reply,
          buttons: {
            create: buttons.map((b, i) => ({
              order: i,
              title: b.title,
              url: b.url,
            })),
          },
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        automationId: z.string(),
        listener: z.enum(["SMARTAI", "MESSAGE"]).optional(),
        prompt: z.string().optional(),
        reply: z.string().optional(),
        buttons: buttonsSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const listener = await prisma.listerner.update({
        where: {
          automationId: input.automationId,
        },
        data: {
          listener: input.listener,
          prompt: input.prompt,
          commentReply: input.reply,
        },
      });

      if (input.buttons !== undefined) {
        const buttons =
          (input.listener ?? listener.listener) === "MESSAGE"
            ? input.buttons
            : [];
        await prisma.messageButton.deleteMany({
          where: { listenerId: listener.id },
        });
        if (buttons.length > 0) {
          await prisma.messageButton.createMany({
            data: buttons.map((b, i) => ({
              listenerId: listener.id,
              order: i,
              title: b.title,
              url: b.url,
            })),
          });
        }
      }

      return listener;
    }),
});
