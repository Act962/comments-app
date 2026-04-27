import { TRPCError } from "@trpc/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  type PublicSorteio,
  SorteioStage,
} from "@/features/sorteio/components/sorteio-stage";
import { caller } from "@/trpc/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const sorteio = await caller.sorteioPublic.getPublicBySlug({ slug });
    return {
      title: sorteio.prizeName
        ? `${sorteio.title} — ${sorteio.prizeName}`
        : sorteio.title,
      description:
        sorteio.prizeDescription ?? "Acompanhe o sorteio em tempo real.",
      openGraph: {
        title: sorteio.title,
        description: sorteio.prizeDescription ?? undefined,
        images: sorteio.prizeImage ? [sorteio.prizeImage] : undefined,
      },
    };
  } catch {
    return { title: "Sorteio" };
  }
}

export default async function PublicSorteioPage({ params }: Props) {
  const { slug } = await params;

  let sorteio: Awaited<ReturnType<typeof caller.sorteioPublic.getPublicBySlug>>;
  try {
    sorteio = await caller.sorteioPublic.getPublicBySlug({ slug });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  }

  const initial: PublicSorteio = {
    ...sorteio,
    lastDrawnAt: sorteio.lastDrawnAt ? sorteio.lastDrawnAt.toISOString() : null,
    winners: sorteio.winners.map((w) => ({
      id: w.id,
      position: w.position,
      drawnAt: w.drawnAt.toISOString(),
      comment: {
        text: w.comment.text,
        fromUsername: w.comment.fromUsername,
        commentedAt: w.comment.commentedAt.toISOString(),
      },
    })),
  };

  return <SorteioStage initial={initial} />;
}
