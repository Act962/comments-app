import { handleComment } from "./handler/comment.handler";
import { handleMessageEvent } from "./handler/message.handler";
import { NormalizedEvent } from "./parser";

export async function routeEvent(event: NormalizedEvent) {
  switch (event.type) {
    case "MESSAGE":
      return handleMessageEvent(event);
      //
      break;
    case "COMMENT":
      return handleComment(event);
      break;
    default:
      return;
  }
}
