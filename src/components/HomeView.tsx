import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import ProductCard from './ProductCard';

interface HeroSlide {
  id: string;
  type: 'product-offer' | 'advertisement';
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  price?: number;
  mrp?: number;
  image: string;
  couponCode?: string;
  promoLabel?: string;
  actionText: string;
  targetRoute: { path: string; params?: { id: string } };
  simpleCouponStyle?: boolean;
}

export default function HomeView() {
  const { navigate, products } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Construct dynamic versatile slides for offers, ads, and product promotions
  const slideData: HeroSlide[] = [
    {
      id: 'slide-bestsellers',
      type: 'advertisement',
      badge: 'BEST SELLERS',
      title: 'UP TO 50% OFF',
      subtitle: 'USE CODE: BEST50',
      description: 'Our top-rated hoodies, sweatpants, and luxury athletic wear. Loved by thousands, crafted to perfection. Grab yours at up to half-price today.',
      image: 'https://wittering-crimson-zmeumpuu.edgeone.dev/Screenshot%202026-07-21%20141225.png',
      couponCode: 'BEST50',
      promoLabel: 'TOP RATED PICKS - SAVE 50%',
      actionText: 'EXPLORE BEST SELLERS',
      targetRoute: { path: 'shop' }
    }
  ];

  // Filter products for display carousels
  const bestSellers = (products || []).filter((p) => p.badge === 'BEST SELLER');
  const newArrivals = (products || []).filter((p) => p.badge === 'NEW');
  const featuredCollection = (products || []).filter((p) => p.price >= 2000 && p.badge !== 'BEST SELLER');

  // Auto-play timer for Hero slideshow
  useEffect(() => {
    if (slideData.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideData.length);
    }, 10000); // 10s auto rotation for comfortable coupon copying
    return () => clearInterval(timer);
  }, [slideData.length]);

  const handleShowcaseClick = (category: string, subcategory: string) => {
    navigate('shop');
    setTimeout(() => {
      const event = new CustomEvent('filter-shop', { 
        detail: { 
          category: category || 'all', 
          subcategory: subcategory || 'all',
          sort: category === 'sale' ? 'featured' : undefined
        } 
      });
      window.dispatchEvent(event);
    }, 80);
  };

  const handleSlideAction = (slide: HeroSlide) => {
    if (slide.targetRoute.path === 'product' && slide.targetRoute.params) {
      navigate('product', { id: slide.targetRoute.params.id });
    } else {
      if (slide.couponCode === 'WOMEN40') {
        handleShowcaseClick('women', 'all');
      } else if (slide.couponCode === 'MEN30') {
        handleShowcaseClick('men', 'all');
      } else if (slide.couponCode === 'BEST50') {
        handleShowcaseClick('bestseller', 'all');
      } else if (slide.couponCode === 'STREET3') {
        handleShowcaseClick('sale', 'all');
      } else {
        navigate('shop');
      }
    }
  };

  const activeSlide = slideData[currentSlide] || slideData[0];

  const showcaseCategories = [
    {
      label: 'HOODIES',
      category: 'all',
      subcategory: 'Hoodies',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80'
    },
    {
      label: 'T-SHIRTS',
      category: 'all',
      subcategory: 'T-Shirts',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'
    },
    {
      label: 'SWEATSHIRTS',
      category: 'all',
      subcategory: 'Sweatshirts',
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80'
    },
    {
      label: 'JACKETS',
      category: 'all',
      subcategory: 'Jackets',
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div id="home-view-root" className="space-y-0 bg-brand-white">

      {/* Versatile Promotional Offer & Advertisement Hero Banner */}
      <section 
        id="hero-banner" 
        className="relative bg-[#D81A60] text-brand-white overflow-hidden min-h-[380px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[500px] flex items-center justify-center"
      >
        {/* Full Width Content Container */}
        <div className="w-full max-w-4xl mx-auto flex flex-col justify-center items-start px-8 sm:px-16 md:px-24 py-12 md:py-16 relative z-10">
          
          {/* Script Font Overlap Wrapper */}
          <div className="relative mb-2">
            {/* Absolute overlapping "Fashion" text */}
            <span className="font-script text-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl absolute left-0 -top-6 sm:-top-8 md:-top-10 lg:-top-12 opacity-95 transform -rotate-3 select-none leading-none z-10">
              Fashion
            </span>
            {/* Massive Display COLLECTION Heading */}
            <h1 className="font-sans font-black text-white text-3xl sm:text-4xl md:text-5xl lg:text-[4.8rem] xl:text-[5.5rem] uppercase tracking-wider leading-none pt-4 sm:pt-6">
              COLLECTION
            </h1>
          </div>

          {/* Thin horizontal line separator with "EXTRA" */}
          <div className="flex items-center gap-3 w-40 sm:w-48 my-4">
            <div className="h-[1px] bg-white/70 flex-grow"></div>
            <span className="font-sans font-extrabold text-white text-[10px] sm:text-xs tracking-widest uppercase">
              EXTRA
            </span>
            <div className="h-[1px] bg-white/70 flex-grow"></div>
          </div>

          {/* Large dynamic Skewed "40% OFF" heading */}
          <h2 className="font-sans font-black text-white text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6rem] uppercase tracking-tight transform -skew-x-6 origin-left leading-none mb-6">
            40% OFF
          </h2>

          {/* High Contrast CTA "SHOP NOW" Button */}
          <button
            onClick={() => handleSlideAction(activeSlide)}
            className="bg-white hover:bg-black hover:text-white text-black font-sans font-black uppercase text-[11px] sm:text-xs tracking-widest px-8 py-3.5 border border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-300 cursor-pointer"
          >
            SHOP NOW
          </button>
        </div>
      </section>

      {/* Category Showcase Grid Section - Scrollable compact layout on mobile, grid on desktop */}
      <section id="showcase-grid-section" className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-6 overflow-hidden">
        <div className="text-center md:text-left mb-4">
          <span className="inline-block text-[10px] md:text-xs font-sans font-extrabold tracking-widest text-brand-black uppercase bg-stone-100 px-3.5 py-1 rounded-full border border-stone-200/60 shadow-xs">
            SHOP BY
          </span>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-3 px-4 -mx-4 scrollbar-none md:grid md:grid-cols-4 md:gap-5 md:pb-0 md:mx-0 md:px-0 md:overflow-visible">
          {showcaseCategories.map((item) => (
            <div 
              key={item.label}
              onClick={() => handleShowcaseClick(item.category, item.subcategory)}
              className="flex flex-col items-center cursor-pointer group shrink-0 w-[78px] sm:w-[110px] md:w-auto"
            >
              {/* Responsive fluid Image Card - adjusts based on viewport */}
              <div className="w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] md:w-full md:aspect-square overflow-hidden rounded-lg sm:rounded-xl border border-stone-200/60 bg-stone-50 transition-all duration-300 group-hover:shadow-md">
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Centered Category Label Below Card */}
              <div className="text-center mt-1.5 sm:mt-2">
                <h3 className="font-sans font-bold tracking-widest text-[8px] sm:text-xs text-stone-800 uppercase group-hover:text-brand-accent transition-colors">
                  {item.label}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="best-sellers" className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="section-title text-brand-black text-left">
            Best Sellers
          </h2>
        </div>

        {/* Clean Code-Level Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="new-arrivals" className="bg-white py-6 md:py-8 border-t border-stone-100/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-4">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="section-title text-brand-black text-left">
              New Arrivals
            </h2>
          </div>

          {/* Clean Code-Level Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="featured-collection" className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="section-title text-brand-black text-left">
            Featured Collection
          </h2>
        </div>

        {/* Clean Code-Level Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredCollection.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
