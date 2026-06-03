import { serve } from "inngest/next";
import { processTask, refreshInstagramTokens } from "@/inngest/functions";
import { replicateUserToNasa } from "@/inngest/functions/sync/replicate-user-to-nasa";
import { replicateAccountToNasa } from "@/inngest/functions/sync/replicate-account-to-nasa";
import { replicateOrgToNasa } from "@/inngest/functions/sync/replicate-org-to-nasa";
import { replicateMemberToNasa } from "@/inngest/functions/sync/replicate-member-to-nasa";
import { inngest } from "../../../inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processTask,
    refreshInstagramTokens,
    // ── Sync de auth comments → NASA ──
    replicateUserToNasa,
    replicateAccountToNasa,
    replicateOrgToNasa,
    replicateMemberToNasa,
  ],
});
