export type Role = 'buyer' | 'seller' | 'admin';

export interface User {
  uid: string;
  email: string;
  phone?: string;
  role: Role;
  region?: string;
  createdAt: string;
  isVerified: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationDocuments?: {
    cniFront?: string;
    cniBack?: string;
    companyDoc?: string;
  };
}

export interface ProductVariation {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  minOrder: number;
  category: string;
  subcategory?: string;
  images: string[];
  region: string;
  stock: number;
  unit: string;
  isActive: boolean;
  variations?: ProductVariation[];
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  variants?: Record<string, string>;
}

export interface Order {
  id: string;
  userId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    region: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  logo?: string;
  banner?: string;
  description: string;
  region: string;
  rating: number;
  totalSales: number;
  isVerified: boolean;
  categories: string[];
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories?: string[];
}

export interface Promotion {
  id: string;
  sellerId: string;
  productId: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
}

export interface Service {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'starting_at';
  category: string;
  images: string[];
  region: string;
  deliveryTime: string; // e.g. "2 jours"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  buyerId: string;
  sellerId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  price: number; // Final agreed price
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface StorePortfolio {
  id: string;
  store_id: string;
  title: string;
  description?: string;
  image_url: string;
  created_at: string;
}
