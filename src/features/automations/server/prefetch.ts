import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.automations.getMany>;

export function prefetchAutomations(params: Input) {
  prefetch(trpc.automations.getMany.queryOptions(params));
}

type InputGetOne = inferInput<typeof trpc.automations.getOne>;

export function prefetchAutomation(params: InputGetOne) {
  prefetch(trpc.automations.getOne.queryOptions(params));
}
