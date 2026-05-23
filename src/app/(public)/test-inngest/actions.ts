"use server";

import { inngest } from "@/inngest/client";

export async function triggerProcessTask(formData: FormData) {
  const rawId = formData.get("id");
  const id =
    typeof rawId === "string" && rawId.trim().length > 0
      ? rawId.trim()
      : crypto.randomUUID();

  const result = await inngest.send({
    name: "app/task.created",
    data: { id },
  });

  return { id, eventIds: result.ids };
}
