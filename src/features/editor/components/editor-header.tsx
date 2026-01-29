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
  useSuspenseAutomation,
  useUpdateAutomationName,
} from "../../automations/hooks/use-automations";
import { useEffect, useRef, useState } from "react";

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
            <Link href={`/workflows`}>Workflows</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const EditorOption = ({ workflowId }: { workflowId: string }) => {
  return <div></div>;
};

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background">
      <EditorBreadcrumbs workflowId={workflowId} />
      <EditorOption workflowId={workflowId} />
    </div>
  );
};
