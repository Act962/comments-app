"use server";

import axios from "axios";
export const refresshToken = async (token: string) => {
  const refresh_token = await axios.get(
    `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`,
  );

  return refresh_token.data;
};

export const sendDM = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string,
) => {
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/${userId}/messages`,
    {
      recipient: {
        id: recieverId,
      },
      message: {
        text: prompt,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
};

export const sendPrivateMessage = async (
  userId: string,
  commentId: string,
  prompt: string,
  token: string,
) => {
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/${userId}/messages`,
    {
      recipient: {
        comment_id: commentId,
      },
      message: {
        text: prompt,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
};

export const sendCommentReply = async (
  commentId: string,
  prompt: string,
  token: string,
) => {
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/${commentId}/replies`,
    {
      message: prompt,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
};

export type InstagramComment = {
  id: string;
  text: string;
  timestamp: string;
  from?: { id: string; username?: string };
  username?: string;
};

export const getMediaComments = async (
  mediaId: string,
  token: string,
  after?: string,
) => {
  const url = new URL(`${process.env.INSTAGRAM_BASE_URL}/${mediaId}/comments`);
  url.searchParams.set("fields", "id,text,timestamp,from,username");
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "100");
  if (after) url.searchParams.set("after", after);

  const res = await axios.get<{
    data: InstagramComment[];
    paging?: { cursors?: { after?: string }; next?: string };
  }>(url.toString());

  return res.data;
};

export const getAllMediaComments = async (mediaId: string, token: string) => {
  const all: InstagramComment[] = [];
  let after: string | undefined;

  do {
    const page = await getMediaComments(mediaId, token, after);
    all.push(...(page.data ?? []));
    after = page.paging?.next ? page.paging.cursors?.after : undefined;
  } while (after);

  return all;
};

export type InstagramMedia = {
  id: string;
  caption?: string;
  media_url: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnail_url?: string;
  timestamp: string;
  permalink?: string;
};

export const getUserMedia = async (igUserId: string, token: string) => {
  const url = new URL(`${process.env.INSTAGRAM_BASE_URL}/${igUserId}/media`);
  url.searchParams.set(
    "fields",
    "id,caption,media_url,media_type,thumbnail_url,timestamp,permalink",
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "50");

  const res = await axios.get<{ data: InstagramMedia[] }>(url.toString());
  return res.data.data ?? [];
};

export const getCommentFrom = async (commentId: string, token: string) => {
  const url = new URL(`${process.env.INSTAGRAM_BASE_URL}/${commentId}`);
  url.searchParams.set("fields", "from{id,username}");
  url.searchParams.set("access_token", token);

  const res = await axios.get<{
    from?: { id: string; username?: string };
  }>(url.toString());
  return res.data.from;
};

export const generateTokens = async (code: string) => {
  const insta_form = new FormData();
  insta_form.append("client_id", process.env.INSTAGRAM_CLIENT_ID as string);
  insta_form.append(
    "client_secret",
    process.env.INSTAGRAM_CLIENT_SECRET as string,
  );
  insta_form.append("grant_type", "authorization_code");
  insta_form.append(
    "redirect_uri",
    `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`,
  );
  insta_form.append("code", code);

  const shortTokenRes = await fetch(process.env.INSTAGRAM_TOKEN_URL as string, {
    method: "POST",
    body: insta_form,
  });

  const token = await shortTokenRes.json();

  if (token.permissions.length > 0) {
    const longToken = await fetch(
      `https://graph.instagram.com/access_token` +
        `?grant_type=ig_exchange_token` +
        `&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}` +
        `&access_token=${token.access_token}`,
      { method: "GET" },
    );

    const long_token = await longToken.json();

    return long_token.access_token;
  }
};
