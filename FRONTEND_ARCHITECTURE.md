# 🎨 VISUALIZ - ENTERPRISE FRONTEND ARCHITECTURE & DESIGN SYSTEM

En tant qu'équipe experte (Vercel, Next.js, UI/UX, Accessibilité), nous avons audité la plateforme Mercaply actuelle pour la transformer en une marketplace premium (niveau Stripe, Linear, Airbnb, Vercel), adaptée au marché africain et mondial.

---

## 1. Analyse de l'interface actuelle de Mercaply
L'interface actuelle utilise React/Vite avec TailwindCSS, mais elle présente plusieurs axes d'amélioration pour atteindre un standard "Billion-Dollar Startup" :
- **Architecture de navigation** : La navigation est basique. Elle manque d'un "Mega Menu" pour explorer efficacement la profondeur du catalogue (produits vs services vs produits locaux).
- **Hiérarchie visuelle** : Les fiches produits, la page d'accueil et les tableaux de bord manquent d'espace (whitespace), d'une typographie forte et de contrastes marqués.
- **Micro-interactions** : Absence d'animations fluides (Framer Motion) lors des transitions de pages, d'ouvertures de modals ou d'ajouts au panier.
- **Cohérence (Design System)** : L'utilisation des composants n'est pas entièrement systématisée, entraînant des variations de padding, de border-radius ou de teintes grises.

## 2. Composants Existants Identifiés
- Layouts : `Header`, `Footer`, Layouts séparés (Acheteur, Vendeur, Admin).
- Pages de listing : Catalogue produits, Répertoire des vendeurs.
- Fonctionnalités : Barre de recherche simple, Modals basiques, Formulaires d'authentification, Formulaires d'ajout de produits.
- Tableaux de bord : Statistiques simples, listes de commandes.

## 3. Problèmes UX à résoudre
- **Friction à la recherche** : La recherche nécessite d'être instantanée (autocomplete enrichi avec suggestions, historique, et preview d'images).
- **Surcharge cognitive sur les formulaires** : Les formulaires vendeurs (création de produits/services) doivent être scindés en "Steppers" avec auto-sauvegarde.
- **Absence de feedback visuel** : Les actions (mise en favori, ajout panier) nécessitent des `Toasts` non-intrusifs et des animations de validation.
- **Mobile First incomplet** : L'expérience mobile doit ressembler à une application native (Bottom Navigation Bar, Swipe actions, Drawers plutôt que des Modals).
- **Accessibilité (A11y)** : Contraste perfectible, navigation clavier manquante sur les filtres.

---

## 4. Nouvelle Architecture Frontend (Stack & Dossiers)

**Stack Premium** :
- *Framework* : React 18/19 (Vite) avec une architecture type Next.js (Dossiers par features). *(Note: La migration vers Next.js pur nécessite un re-déploiement complet, nous utiliserons ici les patterns Next.js App Router traduits pour notre écosystème SPA/SSR actuel).*
- *Styling* : TailwindCSS + Shadcn UI.
- *State & Data Fetching* : TanStack Query (React Query) pour le cache et Zustand pour le state global.
- *Animations* : Framer Motion.
- *Formulaires* : React Hook Form + Zod.

**Structure des dossiers (Feature-Sliced Design)** :
```
src/
├── app/                  # Routes principales (react-router)
├── components/
│   ├── ui/               # Composants Shadcn UI purs (Boutons, Inputs, etc.)
│   ├── shared/           # Composants partagés (Header, Footer, MegaMenu)
│   └── layouts/          # Layouts (Auth, Dashboard, Public)
├── features/             # Logique métier isolée (Produits, Services, KYC, Messagerie)
│   └── products/
│       ├── components/   # Composants spécifiques aux produits
│       ├── hooks/        # custom hooks (useProducts)
│       └── utils/        # helpers
├── lib/                  # Configurations externes (Supabase, Utils cn)
├── stores/               # Zustand stores
├── types/                # Types globaux
└── styles/               # Global CSS
```

---

## 5. Design System Complet (Linear / Vercel Aesthetic)

### A. Typography
- **Font-Family** : *Inter* ou *Geist* pour l'UI, *Playfair Display* pour des accents éditoriaux.
- **Échelle** :
  - H1 : 48px/56px (Desktop), 36px (Mobile) - Tracking serré (-0.02em).
  - Body : 16px, Line-height 1.6.

### B. Couleurs (Mode Clair / Sombre)
- **Background** : `#FAFAFA` (Clair) / `#0A0A0A` (Sombre).
- **Surface (Cards)** : `#FFFFFF` / `#171717`.
- **Primary (Accent)** : Un bleu/violet vibrant type Stripe (`#6366F1`) ou un noir absolu (`#000000` / `#FFFFFF`) type Vercel pour un look ultra-premium.
- **Borders** : Subtiles, 1px solide `#E5E7EB` / `#262626`.

### C. Formes (Radius) & Ombres
- **Radius** : `md` (8px) pour les inputs/boutons, `xl` (16px) pour les cartes et modals.
- **Shadows** : Minimalistes. Remplacement des grosses ombres par des bordures fines 1px + `shadow-sm` ultra-douces (blur 10px, opacité 5%).

### D. Bibliothèque de Composants (Shadcn)
- **Button** : Variantes Default, Secondary, Ghost, Outline. Toujours avec effet de scale `active:scale-[0.98]` (Framer Motion).
- **Input/Select** : Hauteur 44px (touch-friendly), focus ring 2px offset.
- **Dialog/Drawer** : Drawers sur Mobile, Dialogs centrés avec overlay blur sur Desktop.

---

## 6. Wireframes & Layouts Conceptuels

### Layout Public (Accueil, Recherche)
- **Top Bar** : Promo, Changement Devise/Langue.
- **Navbar** : Logo à gauche. Recherche globale centrée (grande, CMD+K supporté). Icônes (Favoris, Messagerie, Panier, Profil) à droite. Mega Menu en dessous.
- **Hero Section** : Titre massif, barre de recherche intégrée avec tabs (Produits / Services).

### Layout Dashboard (Acheteur/Vendeur)
- **Sidebar (Gauche)** : Rétractable, icônes Lucide + texte. Indicateurs de notifications intégrés.
- **Top Bar** : Breadcrumb dynamique, Barre de commande globale, Profil.
- **Main Content** : Largeur max contrainte (`max-w-7xl`), grilles CSS bento-style pour les widgets d'analytics.

---

## 7. Maquettes & Micro-Interactions (Motion)

- **Hover Cards** : Effet de soulèvement doux (`y: -4`) + apparition d'une ombre douce.
- **Page Transitions** : Fade-in et slide-up léger (y: 20 -> 0) au montage des pages.
- **Skeletons** : Effet de vague (shimmer) élégant gris clair/blanc pendant le chargement Tanstack Query.

---

## 8. Prochaines Étapes de Développement

1. **Setup du Core UI** : Installer Shadcn UI, configurer `tailwind.config.js` avec la nouvelle palette premium, ajouter Framer Motion.
2. **Refonte Layout & Navigation** : Créer le nouveau Header (Recherche universelle), Mega Menu, et les Layouts de Dashboards.
3. **Migration par Feature** : Refondre l'accueil, puis la recherche/catalogue, puis les fiches produits, et enfin les tableaux de bord.
