import { handleComment } from "./handler/comment.handler";
import { handleMessageEvent } from "./handler/message.handler";
import { NormalizedEvent } from "./parser";

export async function routeEvent(event: NormalizedEvent) {
  switch (event.type) {
    case "MESSAGE":
      console.log("Message");
      console.dir(event, { depth: null });
      return handleMessageEvent(event);
      //
      break;
    case "COMMENT":
      console.log("Comment");
      console.dir(event, { depth: null });
      return handleComment(event);
    default:
      console.log("Unknown event type", event);
      return;
  }
}
