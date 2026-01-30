import {
  IntegrationsContainer,
  IntegrationsList,
} from "@/features/integrations/components/integrations";
import { prefetchIntegrations } from "@/features/integrations/server/prefetch";
import { HydrateClient } from "@/trpc/server";

export default function Integrations() {
  prefetchIntegrations();

  return (
    <IntegrationsContainer>
      <HydrateClient>
        <IntegrationsList />
      </HydrateClient>
    </IntegrationsContainer>
  );
}
