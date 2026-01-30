"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";

export const HelpHeader = () => {
  return (
    <EntityHeader
      title="Ajuda"
      description="Ajuda"
      disabled={false}
      isCreating={false}
    />
  );
};

export const HelpContainer = ({ children }: { children: React.ReactNode }) => {
  return <EntityContainer header={<HelpHeader />}>{children}</EntityContainer>;
};
