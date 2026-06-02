-- Backfill: cria uma Organization padrao por usuario existente,
-- registra o usuario como owner, e migra dados de userId -> organizationId.
-- Idempotente: pode rodar varias vezes sem efeito colateral.

-- 1. Cria Organization "Empresa de <primeiro nome>" para cada usuario sem member.
INSERT INTO "organization" (id, name, slug, "createdAt", "stripeCustomerId")
SELECT
  'org_' || u.id,
  'Empresa de ' || COALESCE(NULLIF(SPLIT_PART(u.name, ' ', 1), ''), 'Voce'),
  'empresa-' || LOWER(SUBSTRING(u.id, 1, 8)),
  NOW(),
  u."stripeCustomerId"
FROM "user" u
WHERE NOT EXISTS (SELECT 1 FROM "member" m WHERE m."userId" = u.id);

-- 2. Membership: dono da empresa default.
INSERT INTO "member" (id, "organizationId", "userId", role, "createdAt")
SELECT
  'mem_' || u.id,
  'org_' || u.id,
  u.id,
  'owner',
  NOW()
FROM "user" u
WHERE NOT EXISTS (SELECT 1 FROM "member" m WHERE m."userId" = u.id);

-- 3. Backfill organizationId nas tabelas de dominio.
UPDATE "automation"
SET "organizationId" = 'org_' || "userId"
WHERE "organizationId" IS NULL;

UPDATE "integration"
SET "organizationId" = 'org_' || "userId"
WHERE "organizationId" IS NULL
  AND "userId" IS NOT NULL;

UPDATE "history"
SET "organizationId" = 'org_' || "userId"
WHERE "organizationId" IS NULL;

UPDATE "sorteio"
SET "organizationId" = 'org_' || "userId"
WHERE "organizationId" IS NULL;

UPDATE "comments_integration_consents"
SET "organizationId" = 'org_' || "userId"
WHERE "organizationId" IS NULL;

UPDATE "comments_integration_keys"
SET "organizationId" = 'org_' || "userId"
WHERE "organizationId" IS NULL;

-- 4. Flip Subscription.referenceId: userId -> orgId, somente para subscriptions
-- que ainda apontam para um user (e nao ja para uma org).
UPDATE "subscription" sub
SET "referenceId" = 'org_' || sub."referenceId"
WHERE EXISTS (SELECT 1 FROM "user" u WHERE u.id = sub."referenceId")
  AND NOT EXISTS (SELECT 1 FROM "organization" o WHERE o.id = sub."referenceId");

-- 5. Garante que Organization.stripeCustomerId esta sincronizado com a
-- subscription correspondente (caso a subscription tenha um customer mais recente).
UPDATE "organization" o
SET "stripeCustomerId" = sub."stripeCustomerId"
FROM "subscription" sub
WHERE sub."referenceId" = o.id
  AND o."stripeCustomerId" IS NULL
  AND sub."stripeCustomerId" IS NOT NULL;
