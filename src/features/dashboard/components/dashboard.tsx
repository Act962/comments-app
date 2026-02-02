"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";

export const DashboardHeader = () => {
  return (
    <EntityHeader
      title="Dashboard"
      description="Visão geral"
      disabled={false}
      isCreating={false}
    />
  );
};

export const DashboardContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer header={<DashboardHeader />}>{children}</EntityContainer>
  );
};
