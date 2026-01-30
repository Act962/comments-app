"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";

export const SettingsHeader = () => {
  return (
    <EntityHeader
      title="Configurações"
      description="Gerencie suas configurações"
      disabled={false}
      isCreating={false}
    />
  );
};

export const SettingsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer header={<SettingsHeader />}>{children}</EntityContainer>
  );
};
