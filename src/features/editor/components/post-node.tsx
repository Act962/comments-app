"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  useDeletePost,
  useSuspenseAutomation,
} from "@/features/automations/hooks/use-automations";
import { MEDIA_TYPE } from "@/generated/prisma/enums";
import { BadgeAlertIcon, InstagramIcon } from "lucide-react";
import { useState } from "react";

export function PostNode({ automationId }: { automationId: string }) {
  const { data: automation } = useSuspenseAutomation(automationId);
  const [openPost, setOpenPost] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);

  const handelOpenPost = (post: Post) => {
    setOpenPost(post);
    setOpen(true);
  };

  return (
    automation &&
    automation.posts.length > 0 && (
      <>
        <div className="w-10/12 lg:w-8/12 relative xl:w-4/12 p-5 rounded-xl flex flex-col bg-card gap-y-3 border">
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
            Se comentárem...
          </div>
          <div className="bg-background p-3 rounded-xl flex flex-col gap-y-2">
            <div className="flex gap-x-2 items-center">
              <InstagramIcon />
              <p className="font-bold text-lg">Nestes posts</p>
            </div>
            <div className="flex gap-x-2 flex-wrap mt-3">
              {automation.posts.map((post) => {
                return (
                  <div
                    className="relative w-4/12 aspect-square rounded-lg cursor-pointer overflow-hidden"
                    key={post.id}
                    onClick={() => handelOpenPost(post)}
                  >
                    {post.mediaType === "IMAGE" && (
                      <img
                        src={post.media}
                        alt="image"
                        className="size-full object-fill"
                      />
                    )}
                    {post.mediaType === "VIDEO" && (
                      <video
                        src={post.media}
                        muted
                        className="size-full object-fill"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <PostView open={open} onOpenChange={setOpen} post={openPost} />
      </>
    )
  );
}

interface Post {
  automationId: string | null;
  id: string;
  postId: string;
  caption: string | null;
  media: string;
  mediaType: MEDIA_TYPE;
}

interface PostViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
}

export const PostView = ({ open, onOpenChange, post }: PostViewProps) => {
  const deletePost = useDeletePost();
  if (!post) return null;

  const handelDeletePost = () => {
    deletePost.mutate(
      {
        id: post.id,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full min-w-auto ">
        <DialogHeader>
          <DialogTitle className="sr-only">Post</DialogTitle>
        </DialogHeader>
        <div className=" aspect-square rounded-lg overflow-hidden mx-auto">
          {post.mediaType === "IMAGE" && (
            <img
              src={post.media}
              alt="image"
              className="size-full object-fill"
            />
          )}
          {post.mediaType === "VIDEO" && (
            <video
              src={post.media}
              muted
              controls
              autoPlay
              className="size-full object-fill"
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handelDeletePost}>
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
