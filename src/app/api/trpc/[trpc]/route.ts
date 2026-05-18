import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { verifyCommentsS2S } from "@/lib/comments-s2s-verify";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = async (req: Request) => {
  let s2s = null;
  try {
    s2s = await verifyCommentsS2S(req);
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ s2s }),
  });
};
export { handler as GET, handler as POST };
