# VISUALIZ - BACK OFFICE ENTERPRISE ARCHITECTURE

## 1. VISION & OBJECTIFS
Le Back Office de Mercaply doit devenir l'outil de pilotage central, surpassant les standards de Shopify Plus, Mirakl ou VTEX.
Absolument aucune opération ne doit nécessiter un accès direct à la base de données. L'interface doit être conçue pour un scale massif (millions d'utilisateurs, centaines de milliers de vendeurs) avec un niveau de granularité absolu sur les permissions, la sécurité, et l'auditabilité.

## 2. ARCHITECTURE TECHNIQUE SAAS
- **Layout** : Sidebar escamotable avec multi-niveaux, Topbar de commandes (Global Search CMD+K, Notifications, Profil).
- **Data Fetching** : Tanstack Query pour le caching lourd. Pagination cursor-based côté serveur pour éviter les crashs sur des millions de lignes.
- **Tableaux (DataGrid)** : Utilisation de grilles virtuelles, filtres avancés multi-critères, tris sur chaque colonne, exports natifs (CSV/JSON/PDF) asynchrones.
- **Sécurité & Audit** : Middleware vérifiant les RBAC à chaque requête. Toute mutation (POST/PUT/DELETE) ajoute une entrée dans `audit_logs` avec l'IP et le payload.

---

## 3. STRUCTURE DU MENU & WIREFRAMES

### Section 1 : OVERVIEW (Vue globale)
- **Dashboard Executive** : KPI vitaux temps réel (GMV, Revenus, Actifs, Signups). Graphiques de conversion.

### Section 2 : UTILISATEURS & ENTREPRISES
- **Utilisateurs** : Liste, Profil 360°, Logs de co, Suspendre/Bannir.
- **Entreprises (Boutiques)** : Performances, Wallets, Équipe, Produits.
- **Validation KYC** : Interface "Split-Screen" (Doc à gauche avec Zoom/Rotation, Formulaire de validation à droite avec OCR/IA et Chat interne).

### Section 3 : CATALOGUE & FLUX
- **Produits** : Modération, Gestion des stocks globaux, Variations.
- **Services** : Modération des fiches, Validation des prestataires.
- **Commandes** : Pipeline global (de Panier à Livré/Litige).
- **Devis (B2B)** : Monitoring des devis en cours, Taux de transfo.

### Section 4 : FINANCES & WALLETS
- **Transactions** : Ledger global, historique immutable.
- **Paiements** : Logs des passerelles (Stripe, MTN, Orange).
- **Retraits (Payouts)** : File d'attente des demandes, Validation manuelle ou auto selon le score de risque (Fraud Detection).
- **Comptabilité** : Export TVA, Factures de commissions.

### Section 5 : MODÉRATION & SUPPORT
- **Signalements** : File de traitement priorisée (Priorité haute pour fraudes).
- **Avis** : Modération a posteriori (sauf mots clés interdits).
- **Messagerie** : "God mode" pour lire les chats en cas de litige (avec trace d'audit d'accès).

### Section 6 : CMS & MARKETING
- **Pages & Menus** : Drag & drop des blocs de la Landing.
- **Bannières & Pubs** : Programmation des campagnes avec ciblage.
- **Catégories** : Arborescence N-niveaux.

### Section 7 : SYSTÈME & SÉCURITÉ
- **Rôles & Permissions** : Grille de cases à cocher super granulaires (ex: "Peut rembourser < 50k", "Peut suspendre KYC").
- **Sécurité (Security Center)** : IPs bloquées, Logs de tentatives 2FA, Détection d'anomalies (connexion depuis nouveau pays).
- **API & Webhooks** : Gestion des clés API externes.
- **Configuration** : Settings globaux, pourcentages de commission, emails transactionnels.

---

## 4. INTÉGRATION IA (ARCHITECTURE FUTURE)
- **Modération Automatique** : API Vision pour détecter la nudité ou les armes dans les fiches produits/messages. NLP pour détecter les tentatives de contournement de commission (envoi de numéros).
- **Smart KYC** : Détection des faux documents (analyse des polices, métadonnées, tampons).
- **Fraud Detection Engine** : Modèle évaluant le risque d'une transaction (Velocity checks, IP Proxy, Comportement).

## 5. DESIGN SYSTEM BACK-OFFICE
- **Couleurs** : Strict. Zinc/Slate pour les structures. Noir absolu pour la navigation. Vert/Rouge uniquement pour les états sémantiques.
- **Densité** : "Compact" par défaut pour afficher un maximum de données.
- **Accessibilité** : Full support clavier pour les "Power Users" (agents de support, comptables) qui ne doivent pas utiliser la souris.
