"use client";
import { Separator } from "@/components/ui/separator";
import { useSuspenseAutomation } from "@/features/automations/hooks/use-automations";
import { cn } from "@/lib/utils";
import { BadgeAlertIcon, InstagramIcon } from "lucide-react";
import Image from "next/image";

export function PostNode({ automationId }: { automationId: string }) {
  const { data: automation } = useSuspenseAutomation(automationId);

  return (
    automation &&
    automation.posts.length > 0 && (
      <div className="w-10/12 lg:w-8/12 relative xl:w-4/12 p-5 rounded-xl flex flex-col bg-card gap-y-3">
        <div className="absolute h-20 left-1/2 bottom-full flex flex-col items-center z-50">
          <span className="size-[3px] bg-accent rounded-full" />
          <Separator
            orientation="vertical"
            className="bottom-full flex-1 border border-accent"
          />
          <span className="size-[3px] bg-accent rounded-full" />
        </div>

        <div className="flex gap-x-2 items-center">
          <BadgeAlertIcon className="size-4" />
          {/* Se este post receber comentários... */}
          Se comentárem...
        </div>
        <div className="bg-background p-3 rounded-xl flex flex-col gap-y-2">
          <div className="flex gap-x-2 items-center">
            <InstagramIcon />
            <p className="font-bold text-lg">Nestes posts</p>
          </div>
          <div className="flex gap-x-2 flex-wrap mt-3">
            {automation.posts.map((post) => (
              <div
                className="relative w-4/12 aspect-square rounded-lg cursor-pointer overflow-hidden"
                key={post.id}
              >
                {/* <Image
                  fill
                  sizes="100vw"
                  src={post.media}
                  alt="image"
                /> */}
                <img
                  src={post.media}
                  alt="image"
                  className="size-full object-fill"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
}
