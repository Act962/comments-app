import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

export function prefetchSorteios() {
  prefetch(trpc.sorteio.getMany.queryOptions());
}

type InputGetOne = inferInput<typeof trpc.sorteio.getOne>;
export function prefetchSorteio(params: InputGetOne) {
  prefetch(trpc.sorteio.getOne.queryOptions(params));
}

type InputBySlug = inferInput<typeof trpc.sorteioPublic.getPublicBySlug>;
export function prefetchPublicSorteio(params: InputBySlug) {
  prefetch(trpc.sorteioPublic.getPublicBySlug.queryOptions(params));
}
