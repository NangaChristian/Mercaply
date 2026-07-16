// @ts-nocheck
import { useCategories } from '../../contexts/CategoriesContext';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Star, MapPin, ShieldCheck, Heart, Share2, Flag, ShoppingCart, MessageCircle, Minus, Plus, Store as StoreIcon, Package, Truck, CheckCircle2 } from 'lucide-react';
import { useProduct } from '../../hooks/useProduct';
import { useSeller } from '../../hooks/useSeller';
import { useProducts } from '../../hooks/useProducts';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../store/useAuth';
import { useCart } from '../../store/useCart';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductReviews } from '../../components/product/ProductReviews';
import { ShippingEstimator } from '../../components/product/ShippingEstimator';
import { useReviews } from '../../hooks/useReviews';


import { cn } from '../../utils/cn';

export function ProductDetailPage() {
  const { productCategories: PRODUCT_CATEGORIES, serviceCategories: SERVICE_CATEGORIES } = useCategories();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversation } = useMessages();
  const { product, isLoading: isProductLoading } = useProduct(id);
  const { seller, isLoading: isSellerLoading } = useSeller(product?.sellerId);
  const { addToCart } = useCart();
  
  // Fetch similar products (same category)
  const { products: similarProducts } = useProducts({ 
    category: product?.categoryId,
    limitCount: 6
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(product?.minOrder || 1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product?.variations && product.variations.length > 0) {
      const initialVars: Record<string, string> = {};
      product.variations.forEach(v => {
        if (v.options && v.options.length > 0) {
          initialVars[v.name] = v.options[0];
        }
      });
      setSelectedVariations(initialVars);
    }
  }, [product]);

  if (isProductLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-6 w-64 bg-surface rounded mb-8"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[55%]">
            <div className="aspect-square bg-surface rounded-2xl mb-4"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-20 bg-surface rounded-xl"></div>)}
            </div>
          </div>
          <div className="w-full lg:w-[45%] space-y-6">
            <div className="h-10 w-3/4 bg-surface rounded"></div>
            <div className="h-6 w-1/2 bg-surface rounded"></div>
            <div className="h-24 w-full bg-surface rounded-2xl"></div>
            <div className="h-12 w-full bg-surface rounded-xl"></div>
            <div className="h-32 w-full bg-surface rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Produit introuvable</h2>
        <p className="text-text-secondary mb-8">Le produit que vous recherchez n'existe pas ou a été retiré.</p>
        <Link to="/products" className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const category = PRODUCT_CATEGORIES.find(c => c.id === product.categoryId);
  const images = product.images && product.images.length > 0 ? product.images : ['https://picsum.photos/seed/placeholder/800/800'];
  
  // Real data usage (defaulting to 0 since properties don't exist yet)
  const rating = 0;
  const { reviews, averageRating } = useReviews(id);
  const reviewsCount = reviews.length;
  const soldCount = 0;
  const isPromo = false;
  const oldPrice = null;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= product.minOrder && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <nav className="flex items-center text-sm text-text-secondary whitespace-nowrap overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
          <Link to="/" className="hover:text-text-primary transition-colors">Accueil</Link>
          <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
          <Link to="/products" className="hover:text-text-primary transition-colors">Produits</Link>
          <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
          {category && (
            <>
              <Link to={`/products?category=${category.id}`} className="hover:text-text-primary transition-colors">{category.name}</Link>
              <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
            </>
          )}
          <span className="text-text-primary font-medium truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="flex items-center space-x-4 flex-shrink-0">
          <button className="flex items-center text-sm text-text-secondary hover:text-text-primary transition-colors">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </button>
          <button className="flex items-center text-sm text-text-secondary hover:text-danger transition-colors">
            <Flag className="h-4 w-4 mr-2" />
            Signaler
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 mb-12">
        {/* Left Column: Image Gallery (55%) */}
        <div className="w-full lg:w-[55%] flex flex-col gap-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-surface rounded-3xl overflow-hidden border border-border-light group cursor-zoom-in">
            <img 
              src={images[activeImageIndex]} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            {isPromo && (
              <div className="absolute top-4 left-4 bg-danger text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                -15%
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                    activeImageIndex === idx ? "border-accent" : "border-transparent hover:border-border-light"
                  )}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details (45%) */}
        <div className="w-full lg:w-[45%] flex flex-col pt-4">
          <div className="mb-4 inline-flex">
            <span className="px-5 py-2 rounded-full border border-black text-sm font-semibold">
              {category?.name || 'Catégorie'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-[1.1] mb-6 tracking-tight">
            {product.title}
          </h1>

          {/* Price & Quantity Box */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-text-primary tracking-tight">
                {(product.price).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            
            {/* Quantity Selector Pill */}
            <div className="flex items-center border border-border-light rounded-full bg-white px-1 shadow-sm">
              <button 
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= product.minOrder}
                className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-black disabled:opacity-50 transition-colors"
                title="Diminuer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input 
                type="text" 
                value={quantity}
                readOnly
                className="w-8 text-center text-sm font-bold bg-transparent border-none py-1 focus:outline-none pointer-events-none"
              />
              <button 
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
                className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-black disabled:opacity-50 transition-colors"
                title="Augmenter"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Variations Selector */}
          {product.variations && product.variations.length > 0 && (
            <div className="mb-6 space-y-4">
              {product.variations.map((variation) => (
                <div key={variation.name}>
                  <p className="text-sm font-medium text-text-primary mb-2">
                    {variation.name}: <span className="text-text-secondary">{selectedVariations[variation.name] || ''}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variation.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedVariations(prev => ({ ...prev, [variation.name]: option }))}
                        className={cn(
                          "px-4 py-2 border rounded-xl text-sm font-medium transition-colors",
                          selectedVariations[variation.name] === option
                            ? "border-black bg-black text-white"
                            : "border-border-light bg-surface text-text-secondary hover:border-black hover:text-black"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Description summary */}
          <p className="text-[15px] text-text-secondary leading-relaxed mb-6 font-medium">
             {product.description ? product.description.substring(0, 150) + "..." : "Consultez cet article unique sur notre boutique avec une excellente qualité."}
          </p>

          <ShippingEstimator />

          {/* Buy Action */}
          <div className="mt-8 space-y-4">
            <button 
              onClick={() => addToCart(product, quantity, selectedVariations)}
              className="w-full sm:w-[80%] bg-black text-white py-4 sm:py-5 px-8 rounded-full font-bold text-lg hover:bg-black/90 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Ajouter au panier
            </button>
            <div className="w-full sm:w-[80%] pt-6 mt-6 border-t border-border-light">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center font-bold text-black border border-border-light">
                        {seller?.name ? seller.name.charAt(0).toUpperCase() : <StoreIcon className="w-5 h-5" />}
                     </div>
                     <div>
                        <p className="font-bold text-text-primary mb-0.5">{seller?.name || 'Vendeur Inconnu'}</p>
                        <p className="text-xs text-text-tertiary flex items-center">
                           <MapPin className="w-3 h-3 mr-1" /> {seller?.region || 'Cameroun'}
                        </p>
                     </div>
                  </div>
                  <button 
                    onClick={async () => {
                       if (!user) {
                          navigate('/auth/login');
                          return;
                       }
                       if (product.sellerId) {
                         const convId = await startConversation(product.sellerId, `Bonjour, je suis intéressé par votre produit: ${product.title}`);
                         if (convId) {
                            navigate('/messages');
                         }
                       }
                    }}
                    className="flex text-sm font-bold items-center gap-2 px-4 py-2 rounded-full border border-border-light hover:bg-surface transition-colors"
                  >
                     <MessageCircle className="w-4 h-4" />
                     Contacter
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-16">
        <div className="flex border-b border-border-light mb-6 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('description')}
            className={cn(
              "px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors",
              activeTab === 'description' ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            Description du produit
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors",
              activeTab === 'reviews' ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            Avis clients ({reviewsCount})
          </button>
          <button 
            onClick={() => setActiveTab('shipping')}
            className={cn(
              "px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors",
              activeTab === 'shipping' ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            Expédition & Retours
          </button>
        </div>

        <div className="bg-background rounded-3xl border border-border-light p-6 sm:p-8">
          {activeTab === 'description' && (
            <div className="prose prose-sm sm:prose-base max-w-none text-text-secondary">
              <p className="mb-6 leading-relaxed">
                {product.description || "Aucune description détaillée n'a été fournie par le vendeur pour ce produit."}
              </p>
              
              <h3 className="text-lg font-bold text-text-primary mb-4">Caractéristiques principales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex border-b border-border-light py-3">
                  <span className="w-1/3 text-text-tertiary">Origine</span>
                  <span className="w-2/3 font-medium text-text-primary">{product.region}, Cameroun</span>
                </div>
                <div className="flex border-b border-border-light py-3">
                  <span className="w-1/3 text-text-tertiary">Catégorie</span>
                  <span className="w-2/3 font-medium text-text-primary">{category?.name}</span>
                </div>
                <div className="flex border-b border-border-light py-3">
                  <span className="w-1/3 text-text-tertiary">Disponibilité</span>
                  <span className="w-2/3 font-medium text-text-primary">En stock ({product.stock})</span>
                </div>
                <div className="flex border-b border-border-light py-3">
                  <span className="w-1/3 text-text-tertiary">Commande Min.</span>
                  <span className="w-2/3 font-medium text-text-primary">{product.minOrder} {product.unit}s</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ProductReviews productId={product.id} />
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-accent" />
                  Options de livraison
                </h3>
                <div className="bg-surface rounded-xl p-4 border border-border-light">
                  <div className="flex justify-between items-center py-3 border-b border-border-light last:border-0">
                    <div>
                      <p className="font-medium text-text-primary">Livraison Standard (Douala & Yaoundé)</p>
                      <p className="text-sm text-text-secondary">2 à 3 jours ouvrables</p>
                    </div>
                    <span className="font-bold text-text-primary">2 000 FCFA</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border-light last:border-0">
                    <div>
                      <p className="font-medium text-text-primary">Livraison Express</p>
                      <p className="text-sm text-text-secondary">24 heures (Douala uniquement)</p>
                    </div>
                    <span className="font-bold text-text-primary">5 000 FCFA</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border-light last:border-0">
                    <div>
                      <p className="font-medium text-text-primary">Autres Régions</p>
                      <p className="text-sm text-text-secondary">3 à 5 jours via agence de voyage</p>
                    </div>
                    <span className="font-bold text-text-primary">À partir de 3 500 FCFA</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-accent" />
                  Politique de retour
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed bg-surface p-4 rounded-xl border border-border-light">
                  Ce vendeur accepte les retours dans un délai de <strong>7 jours</strong> suivant la réception de la commande, à condition que le produit soit dans son état d'origine et non utilisé. Les frais de retour sont à la charge de l'acheteur sauf en cas de produit défectueux ou non conforme à la description.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Produits similaires</h2>
            <Link to={`/products?category=${product.categoryId}`} className="text-sm font-medium text-accent hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {similarProducts.slice(0, 6).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
