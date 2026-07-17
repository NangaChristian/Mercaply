import { CategoriesProvider } from './contexts/CategoriesContext';
import { TopProgressBar } from './components/layout/TopProgressBar';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { MainLayout } from './components/layout/MainLayout';
import { BuyerLayout } from './components/layout/BuyerLayout';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CallbackPage } from './pages/auth/CallbackPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { ProductDetailPage } from './pages/product/ProductDetailPage';
import { ServicesPage } from './pages/services/ServicesPage';
import { ServiceDetailPage } from './pages/services/ServiceDetailPage';
import { VendorsDirectoryPage } from './pages/vendors/VendorsDirectoryPage';
import { VendorProfilePage } from './pages/vendors/VendorProfilePage';

// Buyer Pages
import { BuyerDashboardPage } from './pages/buyer/BuyerDashboardPage';
import { BuyerOrdersPage } from './pages/buyer/BuyerOrdersPage';
import { BuyerOrderDetailPage } from './pages/buyer/BuyerOrderDetailPage';
import { BuyerFavoritesPage } from './pages/buyer/BuyerFavoritesPage';
import { BuyerProfilePage } from './pages/buyer/BuyerProfilePage';
import { BuyerAddressesPage } from './pages/buyer/BuyerAddressesPage';

// Checkout Pages
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { CheckoutSuccessPage } from './pages/checkout/CheckoutSuccessPage';

// Seller Pages
import { SellerLayout } from './components/layout/SellerLayout';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { SellerProductsPage } from './pages/seller/SellerProductsPage';
import { SellerProductFormPage } from './pages/seller/SellerProductFormPage';
import { SellerServicesPage } from './pages/seller/SellerServicesPage';
import { SellerServiceFormPage } from './pages/seller/SellerServiceFormPage';
import { SellerOrdersPage } from './pages/seller/SellerOrdersPage';
import { SellerStorePage } from './pages/seller/SellerStorePage';
import { SellerStatsPage } from './pages/seller/SellerStatsPage';
import { SellerFinancesPage } from './pages/seller/SellerFinancesPage';
import { SellerSettingsPage } from './pages/seller/SellerSettingsPage';
import { SellerMessagesPage } from './pages/seller/SellerMessagesPage';
import { VerificationPage } from './pages/shared/VerificationPage';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminStoresPage } from './pages/admin/AdminStoresPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSystemLogsPage } from './pages/admin/AdminSystemLogsPage';
import { AdminContentPage } from './pages/admin/AdminContentPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { ProtectedAdminRoute } from './components/auth/ProtectedAdminRoute';
import { AdminLayout } from './components/layout/AdminLayout';

// Messages
import { MessagesPage } from './pages/messages/MessagesPage';

import { AboutPage } from './pages/info/AboutPage';
import { CareersPage } from './pages/info/CareersPage';
import { PressPage } from './pages/info/PressPage';
import { HelpCenterPage } from './pages/info/HelpCenterPage';
import { HowToBuyPage } from './pages/info/HowToBuyPage';
import { LocalPaymentsPage } from './pages/info/LocalPaymentsPage';
import { BuyerProtectionPage } from './pages/info/BuyerProtectionPage';
import { BecomeSellerPage } from './pages/info/BecomeSellerPage';
import { SellerRulesPage } from './pages/info/SellerRulesPage';
import { DistributionCentersPage } from './pages/info/DistributionCentersPage';
import { TermsPage } from './pages/info/TermsPage';
import { PrivacyPage } from './pages/info/PrivacyPage';
import { ReportAbusePage } from './pages/info/ReportAbusePage';

import { CompareModal } from './components/product/CompareModal';
import { ToastContainer } from './components/ui/Toast';
import { OrderNotifications } from './components/orders/OrderNotifications';
import { NetworkStatus } from './components/ui/NetworkStatus';
import { ScrollToTopButton } from './components/ui/ScrollToTopButton';
export default function App() {
  return (
    <AuthProvider>
      <CategoriesProvider>
      <BrowserRouter>
        <TopProgressBar />
        <NetworkStatus />
        <ToastContainer />
        <CompareModal />
        <OrderNotifications />
        <ScrollToTopButton />
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/callback" element={<CallbackPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="stores" element={<AdminStoresPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="logs" element={<AdminSystemLogsPage />} />
            <Route path="content" element={<AdminContentPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Checkout Routes (No MainLayout) */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

          {/* Seller Routes */}
          <Route path="/seller" element={<SellerLayout />}>
            <Route path="dashboard" element={<SellerDashboardPage />} />
            <Route path="products" element={<SellerProductsPage />} />
            <Route path="products/new" element={<SellerProductFormPage />} />
            <Route path="products/:id/edit" element={<SellerProductFormPage />} />
            <Route path="services" element={<SellerServicesPage />} />
            <Route path="services/new" element={<SellerServiceFormPage />} />
            <Route path="services/:id/edit" element={<SellerServiceFormPage />} />
            <Route path="orders" element={<SellerOrdersPage />} />
            <Route path="store" element={<SellerStorePage />} />
            <Route path="stats" element={<SellerStatsPage />} />
            <Route path="finances" element={<SellerFinancesPage />} />
            <Route path="settings" element={<SellerSettingsPage />} />
            <Route path="verification" element={<VerificationPage />} />
            <Route path="messages" element={<MessagesPage />} />
          </Route>

          {/* Main App Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="service/:id" element={<ServiceDetailPage />} />
            <Route path="messages" element={<MessagesPage />} />
            
            <Route path="vendors" element={<VendorsDirectoryPage />} />
            <Route path="vendors/:id" element={<VendorProfilePage />} />
            {/* Add more routes here later */}
            <Route path="about" element={<AboutPage />} />
            <Route path="careers" element={<CareersPage />} />
            <Route path="press" element={<PressPage />} />
            <Route path="help" element={<HelpCenterPage />} />
            <Route path="how-to-buy" element={<HowToBuyPage />} />
            <Route path="local-payments" element={<LocalPaymentsPage />} />
            <Route path="buyer-protection" element={<BuyerProtectionPage />} />
            <Route path="become-seller" element={<BecomeSellerPage />} />
            <Route path="seller-rules" element={<SellerRulesPage />} />
            <Route path="distribution-centers" element={<DistributionCentersPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="report-abuse" element={<ReportAbusePage />} />

          </Route>

          {/* Buyer Dashboard Routes */}
          <Route path="/buyer" element={<BuyerLayout />}>
            <Route index element={<Navigate to="/buyer/dashboard" replace />} />
            <Route path="dashboard" element={<BuyerDashboardPage />} />
            <Route path="orders" element={<BuyerOrdersPage />} />
            <Route path="orders/:id" element={<BuyerOrderDetailPage />} />
            <Route path="favorites" element={<BuyerFavoritesPage />} />
            <Route path="profile" element={<BuyerProfilePage />} />
            <Route path="addresses" element={<BuyerAddressesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<div className="p-8 text-center text-text-secondary">Notifications (Bientôt disponible)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CategoriesProvider>
    </AuthProvider>
  );
}
