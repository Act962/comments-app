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
import { onInstagramOAuth } from "@/actions/integrations";

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
  const onInstaOAuth = () => onInstagramOAuth(strategy);

  // const integrated = Integrations.find((integration) => integration.strategy === strategy);

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
        <Button onClick={onInstaOAuth}>Conectar</Button>
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
