"use client";

import { onInstagramOAuth } from "@/actions/integrations";
import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { INTEGRATIONS, type IntegrationCardProps } from "../constants";
import { useSuspenseIntegrations } from "../hooks/use-integration";

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
  const { data } = useSuspenseIntegrations();

  const integrated = data.find((integration) => integration.name === strategy);
  const needsReconnect = integrated?.status === "NEEDS_RECONNECT";

  const Icon = icon;
  const buttonLabel = !integrated
    ? "Conectar"
    : needsReconnect
      ? "Reconectar"
      : "Conectado";
  const cardDescription = needsReconnect
    ? "Sua conexão expirou. Reconecte para retomar as automações."
    : description;

  return (
    <Item size="sm" variant="outline">
      <ItemMedia>
        <Icon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{cardDescription}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          onClick={onInstaOAuth}
          disabled={!!integrated && !needsReconnect}
          variant={needsReconnect ? "destructive" : "default"}
        >
          {buttonLabel}
        </Button>
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
