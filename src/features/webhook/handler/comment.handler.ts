import { getIntegration, matchKeyword } from "@/actions/webhook";
import { NormalizedEvent } from "../parser";

export async function handleComment(event: NormalizedEvent) {
  if (event.type !== "COMMENT") return;

  if (event.accountId === event.fromId) return;

  const integration = await getIntegration(event.accountId);

  console.log("Integration", integration);

  if (!integration) return;

  console.log("Integration", integration);

  //   const automation = await matchKeyword(event.text, event.accountId);
}
