"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { IntegrationCardProps, INTEGRATIONS } from "../constants";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";

export const IntegrationsList = () => {
  return (
    <div className="space-y-2">
      {INTEGRATIONS.map((integration) => (
        <IngtegrationCard
          key={integration.title}
          title={integration.title}
          description={integration.description}
          icon={integration.icon}
          strategy={integration.strategy}
        />
      ))}
    </div>
  );
};

export const IngtegrationCard = ({
  title,
  description,
  icon,
  strategy,
}: IntegrationCardProps) => {
  const Icon = icon;
  return (
    <Item size="sm" variant="outline">
      <ItemMedia>
        <Icon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button>Conectar</Button>
      </ItemActions>
    </Item>
  );
};

export const IntegrationsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <>
      <EntityHeader
        title="Integrações"
        description="Gerencie suas integrações"
        disabled={disabled}
        isCreating={false}
      />
    </>
  );
};

export const IntegrationsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer header={<IntegrationsHeader />}>
      {children}
    </EntityContainer>
  );
};
