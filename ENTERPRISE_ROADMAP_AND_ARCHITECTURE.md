# VISUALIZ - ENTERPRISE ROADMAP & ARCHITECTURE (V2 to V5)

## 1. ANALYSE DE L'ARCHITECTURE ACTUELLE
**État Actuel (Legacy & Transition) :**
- **Frontend** : React SPA classique avec Vite, stylisé via TailwindCSS. Bon point de départ, mais manque de Server-Side Rendering (SSR) pour un SEO Enterprise de classe mondiale (ex: Next.js).
- **Backend** : Monolithe ExpressJS léger, actuellement en cours de migration vers une **Clean Architecture** (dossier `src/backend`).
- **Base de données** : Supabase (PostgreSQL), très robuste, mais l'accès direct depuis le client (Frontend) limite la flexibilité pour implémenter des règles métier complexes, de l'Event-Sourcing, ou de l'IA asynchrone sécurisée.
- **Déploiement** : Conteneur unique (Cloud Run).

## 2. IDENTIFICATION DES POINTS FAIBLES
1. **Couplage Fort (Client-DB)** : Accès direct à Supabase depuis le frontend = logique métier dupliquée ou contournable, difficulté à implémenter un cache global (Redis) ou une queue (BullMQ).
2. **SEO Limité** : Les SPA React sont lents à être indexées par Google. Pas d'OpenGraph dynamique ni de balisage Schema.org complet.
3. **Absence d'Intelligence (IA)** : Pas de recherche sémantique (Vector DB), pas de détection de fraude, pas d'analyse des comportements.
4. **Synchronisation & Offline (PWA)** : Pas de Service Workers robustes pour le mode hors-ligne.
5. **Observabilité** : Manque de métriques (Prometheus), de tracing distribué (OpenTelemetry), et de logs centralisés structurés.

## 3. PROPOSITION D'ARCHITECTURE ENTERPRISE (Cible V5)

L'architecture Enterprise de Mercaply s'appuie sur le modèle **Hexagonal (Ports & Adapters)** couplé à des concepts de **CQRS (Command Query Responsibility Segregation)** et d'**Event-Driven Architecture (EDA)**.

### 3.1. Infrastructure & Couches
- **Edge Layer (Cloudflare/Vercel)** : CDN, WAF, Rate Limiting, Bot Protection, Image Optimization.
- **Presentation Layer (Web/Mobile/API)** :
  - *Web* : React (préparation migration vers SSR/Next.js) pour un SEO parfait.
  - *Mobile* : Flutter ou React Native.
  - *API Gateway* : GraphQL & REST V1 pour l'exposition externe et mobile.
- **Application Layer (Node.js/NestJS)** :
  - Implémentation CQRS : Commandes (écritures, validation stricte) / Queries (lectures rapides, cache).
- **Domain Layer (Pure TypeScript)** : Le cœur métier de Mercaply (Règles B2B, validation KYC, calculs de commissions). Totalement agnostique du framework.
- **Infrastructure Layer (Adapters)** :
  - *Database* : Supabase/PostgreSQL (Master pour les écritures, Réplicas pour les lectures).
  - *Cache* : Redis (Stockage des sessions, Query Cache, Rate Limiting).
  - *Message Broker* : BullMQ / RabbitMQ / Kafka (Traitement asynchrone, Webhooks, Envoi d'emails, Indexation IA).
  - *AI Engine* : Intégration de LLMs (Gemini) et de bases vectorielles (pgvector) pour la recherche sémantique.

### 3.2. Architecture AI & ML
- **Recherche Sémantique** : Vectorisation des descriptions de produits et services (embeddings) stockées dans `pgvector` dans PostgreSQL.
- **Modération (NLP & CV)** : Edge Functions appelant l'API Gemini pour analyser les images des produits (contrefaçons) et le texte (faux avis).
- **Recommandation** : Moteur de recommandation basé sur le filtrage collaboratif, alimenté par l'historique des transactions.

### 3.3. Architecture SEO
- **Server Components / SSR** : Pré-génération des pages catégories, produits, et services.
- **JSON-LD Dynamique** : Génération automatique de `Product`, `Offer`, `Organization`, `BreadcrumbList`.
- **Sitemap Generator** : Tâche CRON (BullMQ) générant quotidiennement un index de sitemaps.

## 4. PLAN DE MIGRATION (De l'actuel vers Enterprise)

1. **Phase 1 : Abstraction (En cours)**
   - Déplacer toute la logique métier complexe (Paiement, Commandes, KYC) dans le backend Node.js.
   - Fermer les politiques RLS (Row Level Security) sur Supabase pour n'autoriser que le rôle Service (Backend).
2. **Phase 2 : Performance & API**
   - Implémenter le cache Redis pour le catalogue et les configurations.
   - Versionner toutes les API (`/api/v1`).
3. **Phase 3 : Asynchrone & Files d'attente**
   - Intégrer BullMQ pour le traitement asynchrone (Webhooks de paiement, envois d'emails, génération de PDF).
4. **Phase 4 : SEO & Intelligence**
   - Intégration de l'IA (Embeddings, Modération automatisée).
   - Amélioration radicale du rendu côté serveur pour le SEO.

## 5. RISQUES & BÉNÉFICES

### Risques
- **Complexité Accrue** : Passer d'une architecture client-serveur simple à CQRS/Event-Driven nécessite une équipe très formée.
- **Coûts d'Infrastructure** : Redis, Workers, LLMs augmentent les coûts opérationnels.
- **Régression** : Migrer la logique du frontend vers le backend peut introduire des bugs temporaires. (Mitigation : Feature Flags).

### Bénéfices
- **Scalabilité Massive** : Le backend Node.js optimisé avec Redis peut supporter des milliers de requêtes par seconde.
- **Sécurité Bancaire** : Aucune règle métier n'est exposée sur le client.
- **Ecosystème Ouvert** : L'API v1 robuste permet de brancher facilement une App Mobile et des partenaires B2B (ERP, CRM externes).
- **Position de Leader (SEO/UX)** : Temps de réponse en ms, indexation parfaite, recommandations pertinentes.

## 6. ROADMAP COMPLÈTE

- **V2 (Fondations Enterprise & Monétisation)** : Architecture Clean, API Publique sécurisée, Wallet Vendeur, Intégration IA basique (Modération), Préparation Escrow.
- **V3 (Logistique & International)** : Support multi-devises complet, Dropshipping, Intégrations transporteurs (Tracking), Déploiement App Mobile V1.
- **V4 (Business Intelligence & ML)** : Dashboard BI avancé, Prévisions de ventes IA, Recommandations personnalisées dynamiques, Data Warehouse.
- **V5 (Microservices & Edge)** : Découpage en microservices (Order Service, Payment Service, Catalog Service), Kubernetes, Multi-Cloud / Déploiement régional (Afrique de l'Ouest, Afrique Centrale, etc.).

## 7. DIAGRAMME D'ARCHITECTURE SYSTÈME (Mermaid)

```mermaid
graph TD
    Client[Client Web/Mobile] --> CF[Cloudflare CDN / WAF]
    CF --> API[API Gateway / Node.js]
    
    subgraph Application Backend (Clean Architecture)
        API --> Auth[Auth Module]
        API --> Cat[Catalog Module]
        API --> Ord[Order Module]
        API --> Pay[Payment & Wallet Module]
        API --> AI[AI & Search Module]
    end
    
    subgraph Infrastructure
        Auth --> Supa[(Supabase Auth/DB)]
        Cat --> Supa
        Cat --> Redis[(Redis Cache)]
        Ord --> Supa
        Pay --> Supa
        
        Ord --> Queue[[BullMQ Event Bus]]
        Pay --> Queue
        Queue --> Workers[Background Workers]
        Workers --> Mail[Mailing / SMS]
        Workers --> Invoice[PDF Generator]
        Workers --> Ext[External Providers]
        
        AI --> Gemini[Gemini LLM API]
        AI --> PGVector[(Supabase pgvector)]
    end
```
