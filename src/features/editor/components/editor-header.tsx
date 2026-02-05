"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import {
  useDeleteAutomation,
  useSuspenseAutomation,
  useUpdateActiveAutomation,
  useUpdateAutomationName,
} from "../../automations/hooks/use-automations";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteAutomationModal } from "@/components/modal/delete-automation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  const { data: automation } = useSuspenseAutomation(workflowId);
  const updateAutomation = useUpdateAutomationName();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(automation?.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (automation?.name) {
      setName(automation.name);
    }
  }, [automation?.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (name === automation?.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateAutomation.mutateAsync({
        id: workflowId,
        name: name || "",
      });
    } catch {
      setName(automation?.name);
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setName(automation?.name);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        disabled={updateAutomation.isPending}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 w-auto min-w-25 px-2"
      />
    );
  }

  return (
    <BreadcrumbItem
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:text-foreground transition-colors"
    >
      {automation?.name}
    </BreadcrumbItem>
  );
};

export const EditorBreadcrumbs = ({ workflowId }: { workflowId: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/workflows`}>Automações</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const EditorOption = ({ workflowId }: { workflowId: string }) => {
  const router = useRouter();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const deleteWorkflow = useDeleteAutomation();

  const onDelete = () => {
    deleteWorkflow.mutate(
      {
        id: workflowId,
      },
      {
        onSuccess: () => {
          router.push("/workflows");
          setOpenDeleteModal(false);
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              role="button"
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setOpenDeleteModal(true)}
            >
              <Trash2Icon className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteAutomationModal
        open={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        onDelete={onDelete}
      />
    </>
  );
};

export const EditorActiveToggle = ({ workflowId }: { workflowId: string }) => {
  const { data: automation } = useSuspenseAutomation(workflowId);
  const [active, setActive] = useState(automation?.active);
  const updateAutomation = useUpdateActiveAutomation();

  const handleToggleActive = (checked: boolean) => {
    setActive(checked);
    updateAutomation.mutate(
      {
        id: workflowId,
        active: checked,
      },
      {
        onError: () => {
          setActive(false);
        },
      },
    );
  };

  useEffect(() => {
    if (automation?.active) {
      setActive(automation.active);
    }
  }, [automation?.active]);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="active">{active ? "Ativo" : "Inativo"}</Label>
      <Switch
        id="active"
        checked={active}
        onCheckedChange={handleToggleActive}
        disabled={updateAutomation.isPending}
      />
    </div>
  );
};

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  return (
    <div className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background">
      <EditorBreadcrumbs workflowId={workflowId} />
      <div className="flex items-center gap-2">
        <EditorActiveToggle workflowId={workflowId} />
        <EditorOption workflowId={workflowId} />
      </div>
    </div>
  );
};
