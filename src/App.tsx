import React, { useState } from 'react';
import { useStore } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import ShopView from './components/ShopView';
import ProductDetailsView from './components/ProductDetailsView';
import SearchOverlay from './components/SearchOverlay';
import SEOHandler from './components/SEOHandler';
import PhoneOTPLogin from './components/PhoneOTPLogin';
import {
  WishlistView,
  CartView,
  CheckoutView,
  OrderConfirmationView,
  AboutView,
  BlogView,
  AccountView,
  AuthView,
  FAQView
} from './components/SecondaryViews';
import { AdminView, ReturnsView } from './components/AdminAndSupportViews';

export default function App() {
  const { currentRoute, user } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);

  // If not logged in, render the standalone Phone/OTP login screen ONLY
  if (!user) {
    return (
      <div id="app-viewport-container" className="min-h-screen bg-[#ffffff] text-brand-black antialiased">
        <SEOHandler />
        <PhoneOTPLogin />
      </div>
    );
  }

  // Render correct route views based on application state router
  const renderView = () => {
    switch (currentRoute.path) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ShopView />;
      case 'product':
        return <ProductDetailsView productId={currentRoute.params?.id} />;
      case 'cart':
        return <CartView />;
      case 'wishlist':
        return <WishlistView />;
      case 'checkout':
        return <CheckoutView />;
      case 'confirmation':
        return <OrderConfirmationView />;
      case 'about':
        return <AboutView />;
      case 'blog':
        return <BlogView />;
      case 'account':
        return <AccountView />;
      case 'auth':
        return <AuthView />;
      case 'faq':
        return <FAQView />;
      case 'returns':
        return <ReturnsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div id="app-viewport-container" className="min-h-screen bg-[#ffffff] flex flex-col selection:bg-black selection:text-white text-brand-black antialiased">
      
      {/* Dynamic SEO Head & Schema injection */}
      <SEOHandler />

      {/* Search overlay portal */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Primary header (Announcement, Navigation & drawers) */}
      <Header onSearchOpen={() => setSearchOpen(true)} />



      {/* Main route viewport with fade-in animation */}
      <main id="main-content-viewport" className="flex-grow animate-fade-in">
        {renderView()}
      </main>

      {/* Secondary footer columns & newsletter signups */}
      <Footer />

    </div>
  );
}
