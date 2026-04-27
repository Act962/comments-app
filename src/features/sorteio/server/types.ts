import type { MEDIA_TYPE, SORTEIO_STATUS } from "@/generated/prisma/enums";

export type SorteioListItem = {
  id: string;
  userId: string;
  title: string;
  prizeName: string | null;
  prizeDescription: string | null;
  prizeImage: string | null;
  winnersCount: number;
  status: SORTEIO_STATUS;
  slug: string;
  lastDrawnAt: Date | null;
  rules: unknown;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    comments: number;
    posts: number;
    winners: number;
  };
};

export type SorteioDetailWinner = {
  id: string;
  sorteioId: string;
  sorteioCommentId: string;
  position: number;
  drawnAt: Date;
  comment: {
    id: string;
    sorteioId: string;
    sorteioPostId: string;
    commentId: string;
    fromId: string;
    fromUsername: string | null;
    text: string;
    commentedAt: Date;
    createdAt: Date;
  };
};

export type SorteioDetailPost = {
  id: string;
  sorteioId: string;
  postId: string;
  caption: string | null;
  media: string;
  mediaUrl: string | null;
  permalink: string | null;
  mediaType: MEDIA_TYPE;
  createdAt: Date;
};

export type SorteioDetail = {
  id: string;
  userId: string;
  title: string;
  prizeName: string | null;
  prizeDescription: string | null;
  prizeImage: string | null;
  winnersCount: number;
  status: SORTEIO_STATUS;
  slug: string;
  lastDrawnAt: Date | null;
  rules: unknown;
  createdAt: Date;
  updatedAt: Date;
  posts: SorteioDetailPost[];
  winners: SorteioDetailWinner[];
  _count: { comments: number };
};
