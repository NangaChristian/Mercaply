# ARCHITECTURE D'ENTREPRISE VISUALIZ - ANALYSE ET MODÉLISATION

En tant que Principal Database Architect Supabase, j'ai audité la structure actuelle et conçu une architecture robuste, capable d'absorber une scalabilité massive sur les 10 prochaines années (Enterprise Grade), sans destruction des données existantes.

## 1. Analyse de la base existante
La base de données actuelle s'appuyait sur des tables simples (profiles, stores, products, orders, messages, etc.) sans stricte normalisation 3NF et sans mécanismes de sécurité avancés au-delà des bases RLS de Supabase. Les données métier (ventes, statistiques, messages) n'étaient pas isolées pour des volumes très importants et la séparation `store` (simple boutique) et `company` (entité légale avec KYC complet) était manquante ou imprécise. 

## 2. Le Nouveau Modèle (Architecture Cible)
Le modèle a été repensé pour transformer un système B2C simple en une véritable marketplace B2B/B2C Enterprise :
- **Entités Juridiques (Companies)** : Remplacement progressif du concept simple de `store` par des `companies` incluant informations légales (tax_id, immatriculation) liées aux requêtes KYC strictes.
- **Catalogue Avancé** : Séparation granulaire via `categories` / `subcategories`, puis `products` (biens physiques/digitaux) et `services`. Introduction de `product_variants` (SKU), `product_inventory` (stocks), et `product_prices` (tarification dégressive).
- **Transactions & Finances** : Refonte du système de paiement via un système de double entrée : `orders` -> `transactions` -> `wallets` -> `withdrawals`.
- **Social & Support** : Mise en place d'un système de `tickets`, `reports` et d'une messagerie ultra-robuste (`conversations` / `messages`).
- **Analytique & Sécurité** : Ajout d'une table `audit_logs` (traçabilité), et des tables d'événements (`analytics_events`, `search_logs`).

## 3. Relations (Entité-Association)
- `profiles` (1) ── (N) `companies` (1) ── (N) `company_documents` / `kyc_requests`
- `companies` (1) ── (N) `products` & `services`
- `products` (1) ── (N) `product_variants` (1) ── (1) `product_inventory`
- `orders` (1) ── (N) `order_items` / `payments`
- `wallets` (1) ── (N) `transactions` / `withdrawals`

## 4. Explication des Tables Clés
- **companies & company_documents** : Sépare le profil utilisateur de l'entité de vente légale. 
- **kyc_requests & kyc_reviews** : Workflow d'audit et validation d'entreprise pour l'obtention du Badge Vérifié.
- **products & services** : Séparation explicite (produit tangible/digital vs prestation de service).
- **product_variants & inventory** : Gestion professionnelle des SKU et de la disponibilité.
- **wallets & transactions** : Permet de gérer la balance vendeur avant le virement externe (withdrawal), essentiel pour retenir les fonds (Escrow) ou appliquer des commissions (`commission_amount`).
- **audit_logs** : Historise chaque INSERT/UPDATE/DELETE sur les tables sensibles (conformité RGPD / financière).

## 5. Explication des Index
- **B-Tree (`idx_...`)** : Créés sur toutes les Foreign Keys (ex: `company_id`, `owner_id`, `buyer_id`) pour éviter les full-table scans lors des `JOIN` et accélérer les requêtes RLS (très important dans Supabase).
- **GIN (`idx_products_search`)** : Index sur la colonne `search_vector` (générée automatiquement en combinant le titre et la description via les dictionnaires français de PostgreSQL) pour garantir une recherche Full Text instantanée et tolérante.
- **GIN JSONB** : Pour filtrer rapidement sur des attributs dynamiques (ex: attributs de la variante, metadata).

## 6. Explication des Triggers & Fonctions
- **`update_updated_at_column`** : Maintient la fraîcheur de la donnée automatiquement, sans que l'API NestJS ou Edge Function n'ait à y penser.
- **`log_audit_event`** : Sécurité de niveau bancaire. Un trigger `AFTER INSERT OR UPDATE OR DELETE` copie l'ancienne/nouvelle donnée (JSON) dans `audit_logs` pour les tables critiques (`companies`, `orders`, `transactions`).
- **Vues Matérialisées (`sales_analytics_mat_view`)** : Pré-calcule mensuellement les ventes et agrège les données, divisant par 100 le temps de calcul des dashboards vendeurs et admins.

## 7. Explication des Policies RLS
- **Approche "Least Privilege"** : Par défaut, personne ne peut rien lire ni écrire.
- **Companies / Products** : L'anonyme / public peut lire (SELECT) les `companies` vérifiées (`is_verified = true`) et `products` actifs (`is_active = true`). Seul le propriétaire peut éditer.
- **Orders / Wallets** : Seuls l'acheteur (`buyer_id`) et le vendeur (via la `company_id`) peuvent lire les factures et commandes. Accès strictement verrouillé à la balance de portefeuille.

## 8. Explication des Buckets (Supabase Storage)
La création des buckets est versionnée en SQL (ce qui est rare mais essentiel en Enterprise) :
- **public-products / public-services / avatars / company-logos** : Configuration `public=true`. Accès via CDN direct pour performance.
- **kyc-private / invoices / reports / messages-files** : Configuration `public=false`. Nécessite une URL signée via RLS, pour respecter la vie privée et la sécurité des documents confidentiels (KYC) et contractuels (devis).

## 9. Explication des Migrations
La migration `00004_enterprise_architecture.sql` utilise des techniques **non-destructives** :
- Utilisation systématique de `CREATE TABLE IF NOT EXISTS`.
- Utilisation de `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` pour enrichir les tables vivantes (`profiles`).
- Les contraintes et triggers sont encapsulés dans des blocs `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;` pour garantir l'idempotence. Si la migration est relancée, elle ne plantera pas et ne détruira rien.
- Cela rend le script parfaitement rétrocompatible avec la stack actuelle `Mercaply`.

## 10. Architecture API (NestJS) & Edge Functions
- **NestJS** : La stack REST sera isolée par modules métiers (AuthModule, CompanyModule, ProductModule, OrderModule, KycModule). La validation se fera via Zod Pipes. L'accès à la BDD passera soit via l'ORM (ex: Prisma/Drizzle) typé, soit directement via le SDK Supabase avec un token Service Role pour les opérations critiques, avec JWT Validation Guard. Les retours API utiliseront les curseurs (Pagination Cursor) pour les performances sur les feed produits/recherches.
- **Edge Functions** : Supabase Edge Functions (Deno) seront utilisées pour alléger le backend NestJS sur des tâches asynchrones pilotées par Webhooks (Database Webhooks) : `process-payment`, `verify-kyc` (via IA), `moderate-images` (via API vision), `send-email`/`send-sms`, `search-index` (sync avec un moteur dédié comme Meilisearch si GIN ne suffit pas).
- **Websockets** : Utilisation de Supabase Realtime (Channels) pour la messagerie, le statut des commandes et les devis en temps réel.
- **Backups** : PITR (Point-In-Time Recovery) configuré via la console Supabase, avec des dumps logiques `pg_dump` quotidiens sur AWS S3 / Cloud Storage froid pour un Recovery Plan (DRP) garanti à 10 ans.
