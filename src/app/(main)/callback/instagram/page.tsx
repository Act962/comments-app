import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{
    code: string;
  }>;
}

export default async function Page({ searchParams }: Props) {
  const { code } = await searchParams;

  if (code) {
    console.log(code);
    const user = await caller.user.onIntegration({
      code: code.split("#_")[0],
    });
    if (user) {
      return redirect(`/integrations`);
    }
  }

  return redirect("/dashboard");
}
