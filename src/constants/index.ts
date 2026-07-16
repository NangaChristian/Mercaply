export const CAMEROON_REGIONS = [
  { id: 'centre', name: 'Centre', mainCity: 'Yaoundé' },
  { id: 'littoral', name: 'Littoral', mainCity: 'Douala' },
  { id: 'ouest', name: 'Ouest', mainCity: 'Bafoussam' },
  { id: 'nord-ouest', name: 'Nord-Ouest', mainCity: 'Bamenda' },
  { id: 'sud-ouest', name: 'Sud-Ouest', mainCity: 'Buéa' },
  { id: 'adamaoua', name: 'Adamaoua', mainCity: 'Ngaoundéré' },
  { id: 'est', name: 'Est', mainCity: 'Bertoua' },
  { id: 'nord', name: 'Nord', mainCity: 'Garoua' },
  { id: 'extreme-nord', name: 'Extrême-Nord', mainCity: 'Maroua' },
  { id: 'sud', name: 'Sud', mainCity: 'Ebolowa' },
];

export const PRODUCT_CATEGORIES = [
  { id: 'agriculture', name: 'Agriculture', icon: 'tractor' },
  { id: 'electronique', name: 'Électronique', icon: 'smartphone' },
  { id: 'mode-textile', name: 'Mode & Textile', icon: 'shirt' },
  { id: 'alimentation', name: 'Alimentation', icon: 'utensils' },
  { id: 'construction-btp', name: 'Construction & BTP', icon: 'hard-hat' },
  { id: 'cosmetiques', name: 'Cosmétiques', icon: 'sparkles' },
  { id: 'electromenager', name: 'Électroménager', icon: 'tv' },
  { id: 'automobile', name: 'Automobile', icon: 'car' },
  { id: 'informatique', name: 'Informatique', icon: 'laptop' },
  { id: 'services', name: 'Services', icon: 'briefcase' },
  { id: 'artisanat', name: 'Artisanat', icon: 'palette' },
  { id: 'autre', name: 'Autre', icon: 'box' },
];

export const SERVICE_CATEGORIES = [
  { id: 'informatique-tech', name: 'Informatique & Tech', icon: 'laptop' },
  { id: 'design-creation', name: 'Design & Création', icon: 'palette' },
  { id: 'marketing-vente', name: 'Marketing & Vente', icon: 'trending-up' },
  { id: 'redaction-traduction', name: 'Rédaction & Traduction', icon: 'pen-tool' },
  { id: 'services-personne', name: 'Services à la personne', icon: 'users' },
  { id: 'artisanat-bricolage', name: 'Artisanat & Bricolage', icon: 'hammer' },
  { id: 'conseil-entreprise', name: 'Conseil & Entreprise', icon: 'briefcase' },
  { id: 'education-formation', name: 'Éducation & Formation', icon: 'book-open' },
];

export const CURRENCY = {
  code: 'XAF',
  symbol: 'FCFA',
  locale: 'fr-CM',
};

export const PAYMENT_METHODS = [
  { id: 'mtn-momo', name: 'MTN Mobile Money', icon: 'smartphone' },
  { id: 'orange-money', name: 'Orange Money', icon: 'smartphone' },
  { id: 'bank-transfer', name: 'Virement bancaire', icon: 'building-2' },
];

export const ORDER_STATUSES = [
  { id: 'pending', name: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'confirmed', name: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  { id: 'processing', name: 'En traitement', color: 'bg-purple-100 text-purple-800' },
  { id: 'shipped', name: 'Expédiée', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'delivered', name: 'Livrée', color: 'bg-green-100 text-green-800' },
  { id: 'cancelled', name: 'Annulée', color: 'bg-red-100 text-red-800' },
  { id: 'refunded', name: 'Remboursée', color: 'bg-gray-100 text-gray-800' },
];
