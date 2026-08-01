import React, { useState } from 'react';
import { useStore } from '../store';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';

interface HeaderProps {
  onSearchOpen: () => void;
}

const PRESET_LOGOS = [
  {
    id: 'charkha',
    name: 'Charkha (Spinning Wheel)',
    icon: (className = "w-10 h-10") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
        <circle cx="12" cy="12" r="2" />
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="6.34" y1="6.34" x2="17.66" y2="17.66" />
        <line x1="6.34" y1="17.66" x2="17.66" y2="6.34" />
      </svg>
    ),
    color: 'bg-stone-900 text-brand-accent'
  },
  {
    id: 'padma',
    name: 'Padma (Sacred Lotus)',
    icon: (className = "w-10 h-10") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21c-4.418 0-8-3.582-8-8 0-2.5 1.5-4.5 4-5.5 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c2.5 1 4 3 4 5.5 0 4.418-3.582 8-8 8z" />
        <path d="M12 3v10" />
        <path d="M12 13c1.5-2 3.5-3 5-3m-5 3c-1.5-2-3.5-3-5-3" />
      </svg>
    ),
    color: 'bg-brand-cream text-stone-900 border border-stone-300'
  },
  {
    id: 'mayura',
    name: 'Mayura (Royal Peacock)',
    icon: (className = "w-10 h-10") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a4 4 0 014 4c0 1.5-.8 2.8-2 3.5V14a2 2 0 01-4 0v-4.5C8.8 8.8 8 7.5 8 6a4 4 0 014-4z" />
        <circle cx="12" cy="6" r="1" fill="currentColor" />
        <path d="M10 16s-2 1-2 3M14 16s2 1 2 3M12 17v4" />
      </svg>
    ),
    color: 'bg-stone-800 text-amber-500'
  },
  {
    id: 'weaver',
    name: 'Tantu (Sacred Loom Grid)',
    icon: (className = "w-10 h-10") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <line x1="9" y1="4" x2="9" y2="20" />
        <line x1="15" y1="4" x2="15" y2="20" />
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
      </svg>
    ),
    color: 'bg-amber-100 text-stone-800 border border-amber-300'
  }
];

export default function Header({ onSearchOpen }: HeaderProps) {
  const { currentRoute, cartCount, cartTotal, wishlist, user, navigate, logout, coupons } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mensExpanded, setMensExpanded] = useState(false);
  const [womensExpanded, setWomensExpanded] = useState(false);

  // Dynamic Coupon and Pricing calculations inside Sliding Mini Cart
  const [couponCode, setCouponCode] = useState(() => localStorage.getItem('bluberd_coupon_code') || localStorage.getItem('rasolark_coupon_code') || '');
  const [_discount, setDiscount] = useState(() => Number(localStorage.getItem('bluberd_coupon_discount')) || Number(localStorage.getItem('rasolark_coupon_discount')) || 0);
  const [couponApplied, setCouponApplied] = useState(() => !!(localStorage.getItem('bluberd_coupon_code') || localStorage.getItem('rasolark_coupon_code')));

  const [activeHeaderTab, setActiveHeaderTab] = useState<'home' | 'men' | 'women'>('home');
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    if (window.scrollY > 10) {
      setIsScrolled(true);
    }
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    if (currentRoute?.path === 'home') {
      setActiveHeaderTab('home');
    }
  }, [currentRoute]);

  React.useEffect(() => {
    const handleFilterShop = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const cat = customEvent.detail.category;
        if (cat === 'men') {
          setActiveHeaderTab('men');
        } else if (cat === 'women') {
          setActiveHeaderTab('women');
        } else if (cat === 'all') {
          // If we filter to "all" under shop, we can keep it as is or default to 'home' tab
          if (currentRoute?.path === 'home') {
            setActiveHeaderTab('home');
          }
        }
      }
    };
    window.addEventListener('filter-shop', handleFilterShop);
    return () => window.removeEventListener('filter-shop', handleFilterShop);
  }, [currentRoute]);

  const handleHeaderTabClick = (tab: 'home' | 'men' | 'women') => {
    setActiveHeaderTab(tab);
    if (tab === 'home') {
      navigate('home');
    } else {
      navigate('shop');
      setTimeout(() => {
        let category: string = 'all';
        let sort: string = 'featured';
        if (tab === 'men') {
          category = 'men';
        } else if (tab === 'women') {
          category = 'women';
        }
        
        const event = new CustomEvent('filter-shop', { 
          detail: { 
            category, 
            subcategory: 'all',
            sort: sort
          } 
        });
        window.dispatchEvent(event);
      }, 80);
    }
  };

  React.useEffect(() => {
    if (cartDrawerOpen) {
      const code = localStorage.getItem('bluberd_coupon_code') || localStorage.getItem('rasolark_coupon_code') || '';
      const disc = Number(localStorage.getItem('bluberd_coupon_discount')) || Number(localStorage.getItem('rasolark_coupon_discount')) || 0;
      setCouponCode(code);
      setDiscount(disc);
      setCouponApplied(!!code);
    }
  }, [cartDrawerOpen, cartTotal]);

  React.useEffect(() => {
    if (couponApplied && couponCode) {
      const upperCode = couponCode.toUpperCase().trim();
      const storeCoupons = coupons || [];
      const matched = storeCoupons.find(c => c.code.toUpperCase() === upperCode && c.isActive);

      if (matched) {
        if (matched.minSpend && cartTotal < matched.minSpend) {
          setDiscount(0);
          setCouponApplied(false);
          setCouponCode('');
          localStorage.removeItem('bluberd_coupon_code');
          localStorage.removeItem('bluberd_coupon_discount');
          return;
        }
        const calculatedDiscount = Math.round((cartTotal * matched.discountPercentage) / 100);
        setDiscount(calculatedDiscount);
        localStorage.setItem('bluberd_coupon_discount', String(calculatedDiscount));
      } else {
        let calculatedDiscount = 0;
        if (upperCode === 'WELCOME10') calculatedDiscount = Math.round(cartTotal * 0.10);
        else if (upperCode === 'FASHION40') calculatedDiscount = Math.round(cartTotal * 0.40);
        else if (upperCode === 'FESTIVE20' && cartTotal >= 3000) calculatedDiscount = Math.round(cartTotal * 0.20);
        else if (upperCode === 'PROMO15') calculatedDiscount = Math.round(cartTotal * 0.15);

        if (calculatedDiscount > 0) {
          setDiscount(calculatedDiscount);
          localStorage.setItem('bluberd_coupon_discount', String(calculatedDiscount));
        } else {
          setDiscount(0);
          setCouponApplied(false);
          setCouponCode('');
          localStorage.removeItem('bluberd_coupon_code');
          localStorage.removeItem('bluberd_coupon_discount');
        }
      }
    }
  }, [cartTotal, couponCode, couponApplied, coupons]);

  const renderHeaderAvatar = (sizeClass = "w-7 h-7 text-xs") => {
    if (user) {
      if (user.avatar) {
        if (user.avatar.startsWith('data:image') || user.avatar.startsWith('http')) {
          return (
            <div className={`${sizeClass} rounded-full overflow-hidden border border-brand-accent/40 bg-white flex items-center justify-center`}>
              <img src={user.avatar} alt="Profile logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          );
        }

        const preset = PRESET_LOGOS.find(p => p.id === user.avatar);
        if (preset) {
          return (
            <div className={`${sizeClass} rounded-full flex items-center justify-center ${preset.color} border border-brand-accent/20`}>
              {preset.icon("w-4 h-4")}
            </div>
          );
        }
      }

      const initials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
        : (user.email ? user.email[0].toUpperCase() : 'U');

      return (
        <div className={`${sizeClass} rounded-full flex items-center justify-center bg-stone-900 text-brand-accent border border-brand-accent/40 font-sans font-bold`}>
          {initials}
        </div>
      );
    }

    return <User size={20} />;
  };

  return (
    <>
      {/* 1. Announcement Bar with Horizontal Marquee */}
      <div id="announcement-bar" className="bg-brand-black text-brand-cream text-xs uppercase tracking-[0.2em] py-2 overflow-hidden border-b border-stone-800 relative z-50">
        <div className="flex w-full overflow-hidden whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-16 pr-16 text-brand-accent-light">
            <span>FREE SHIPPING ON ORDERS ABOVE ₹999</span>
            <span>•</span>
            <span>NEW ARRIVALS EVERY FRIDAY</span>
            <span>•</span>
            <span>CRAFTED WITH PRIDE IN INDIA</span>
            <span>•</span>
            <span>100% ETHICAL NATURAL FIBERS</span>
            <span>•</span>
            
            <span>FREE SHIPPING ON ORDERS ABOVE ₹999</span>
            <span>•</span>
            <span>NEW ARRIVALS EVERY FRIDAY</span>
            <span>•</span>
            <span>CRAFTED WITH PRIDE IN INDIA</span>
            <span>•</span>
            <span>100% ETHICAL NATURAL FIBERS</span>
            <span>•</span>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Header */}
      <header id="main-header" className={`sticky top-0 z-40 transition-all duration-300 bg-[#ffffff] ${
        isScrolled 
          ? 'shadow-xs border-b border-stone-200' 
          : 'border-b border-stone-200/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Hamburger menu for all screens to maintain clean luxury look */}
          <div className="flex items-center">
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-brand-black hover:text-brand-accent transition-colors"
              aria-label="Open Menu"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
            <span id="brand-logo" className="font-sans text-lg md:text-xl font-black tracking-[0.22em] md:tracking-[0.28em] text-brand-black hover:text-brand-accent transition-colors uppercase select-none">
              THE BLUBERD
            </span>
          </div>

          {/* Desktop Navigation Link Menu removed for minimalist clean look */}

          {/* Right Action Icons (Search, Wishlist, Cart, Account) */}
          <div id="header-actions" className="flex items-center gap-1 md:gap-4">
            
            {/* Search Trigger */}
            <button
              id="search-trigger-btn"
              onClick={onSearchOpen}
              className="p-2 text-brand-black hover:text-brand-accent transition-colors"
              aria-label="Search Catalog"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Link with count badge */}
            <button
              id="wishlist-link-btn"
              onClick={() => navigate('wishlist')}
              className="p-2 text-brand-black hover:text-brand-accent transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={20} className={wishlist.length > 0 ? 'fill-brand-accent text-brand-accent' : ''} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-accent text-brand-white text-xs font-sans font-bold flex items-center justify-center rounded-full animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Trigger with count badge */}
            <button
              id="cart-trigger-btn"
              onClick={() => navigate('cart')}
              className="p-2 text-brand-black hover:text-brand-accent transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-black text-brand-white text-xs font-sans font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Profile link */}
            <div className="relative">
              <button
                id="account-link-btn"
                onClick={() => {
                  if (user) {
                    setProfileMenuOpen(!profileMenuOpen);
                  } else {
                    navigate('auth');
                  }
                }}
                className="p-1.5 md:p-2 text-brand-black hover:text-brand-accent transition-colors flex items-center justify-center cursor-pointer"
                aria-label="My Account"
              >
                {renderHeaderAvatar("w-7 h-7 text-xs")}
              </button>

              {/* Profile Dropdown Menu */}
              {user && profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 shadow-md py-1.5 z-20 animate-fade-in text-left">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-sans text-stone-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-xs font-sans font-semibold text-brand-black truncate mt-0.5">{user.name}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('account');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-brand-accent transition-colors font-sans uppercase font-bold tracking-widest cursor-pointer"
                    >
                      My Dashboard
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                        navigate('home');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-stone-100 flex items-center gap-1.5 font-sans uppercase font-bold tracking-widest cursor-pointer"
                    >
                      <LogOut size={12} /> Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Row 2: Category Navigation Menu / Back Navigation - placed OUTSIDE sticky header so it scrolls away naturally! */}
      {currentRoute.path === 'home' && (
        <div className="py-2.5 bg-[#ffffff] border-b border-stone-200/40">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-start md:justify-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none">
              {[
                { id: 'home', label: 'HOME' },
                { id: 'men', label: 'MENS' },
                { id: 'women', label: 'WOMENS' },
              ].map((tab) => {
                const isActive = activeHeaderTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleHeaderTabClick(tab.id as any)}
                    className={`font-navigation font-bold tracking-widest-extra transition-all duration-300 uppercase px-3 py-1.5 sm:px-4 sm:py-2 shrink-0 cursor-pointer border-b-2 ${
                      isActive
                        ? 'border-brand-black text-brand-black'
                        : 'border-transparent text-stone-500 hover:text-brand-black'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Hamburger Navigation Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-drawer-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 flex justify-start">
          <div className="w-[300px] sm:w-[320px] h-full bg-white shadow-2xl flex flex-col p-6 animate-slide-in-left border-r border-stone-200">
            
            {/* Header of Drawer */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                {/* Custom Monogram Avatar Circle */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black text-white border border-black font-sans font-bold relative select-none shadow-xs shrink-0">
                  <span className="text-xl tracking-tighter flex items-baseline">
                    {user ? (user.name.startsWith("Patron") && user.name.split(' ').length > 1 ? "P" : user.name[0].toUpperCase()) : "P"}
                    <span className="text-xs font-sans font-black ml-0.5 transform translate-y-[1px]">
                      {user ? (user.name.startsWith("Patron") && user.name.split(' ').length > 1 ? user.name.split(' ')[1].slice(-1) : (user.name.length > 1 ? user.name[1].toUpperCase() : "")) : "3"}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col text-left">
                  <span className="font-sans text-lg font-bold text-black leading-tight tracking-wide">
                    {user ? user.name : "Patron 3903"}
                  </span>
                </div>
              </div>

              <button
                id="close-mobile-drawer"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:text-black transition-colors text-stone-600 hover:bg-stone-100 rounded-none cursor-pointer flex items-center justify-center w-8 h-8"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Links */}
            <div className="flex flex-col gap-5 pl-1 flex-grow overflow-y-auto pr-1">
              {/* HOME */}
              <button
                onClick={() => {
                  navigate('home');
                  setMobileMenuOpen(false);
                }}
                className={`text-left navigation font-semibold tracking-[0.14em] uppercase hover:text-black hover:underline underline-offset-4 transition-all flex items-center cursor-pointer ${
                  currentRoute.path === 'home' ? 'text-black underline underline-offset-4' : 'text-stone-600'
                }`}
              >
                HOME
              </button>

              {/* SHOP ALL PRODUCTS */}
              <button
                onClick={() => {
                  navigate('shop');
                  setTimeout(() => {
                    const event = new CustomEvent('filter-shop', { 
                      detail: { 
                        category: 'all', 
                        subcategory: 'all',
                        sort: 'featured'
                      } 
                    });
                    window.dispatchEvent(event);
                  }, 80);
                  setMobileMenuOpen(false);
                }}
                className={`text-left navigation font-semibold tracking-[0.14em] uppercase hover:text-black hover:underline underline-offset-4 transition-all flex items-center cursor-pointer ${
                  currentRoute.path === 'shop' && activeHeaderTab === 'home' ? 'text-black underline underline-offset-4' : 'text-stone-600'
                }`}
              >
                SHOP ALL PRODUCTS
              </button>

              {/* MENS COLLECTION */}
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    setMensExpanded(!mensExpanded);
                  }}
                  className={`text-left navigation font-semibold tracking-[0.14em] uppercase hover:text-black hover:underline underline-offset-4 transition-all flex items-center justify-between cursor-pointer ${
                    currentRoute.path === 'shop' && activeHeaderTab === 'men' ? 'text-black underline underline-offset-4' : 'text-stone-600'
                  }`}
                >
                  <span>MENS COLLECTION</span>
                  <span className="text-xs">{mensExpanded ? '▲' : '▼'}</span>
                </button>
                
                {mensExpanded && (
                  <div className="flex flex-col gap-3 pl-4 mt-3 border-l border-stone-200 text-left">
                    <button
                      onClick={() => {
                        navigate('shop');
                        setTimeout(() => {
                          const event = new CustomEvent('filter-shop', { 
                            detail: { 
                              category: 'men', 
                              subcategory: 'all'
                            } 
                          });
                          window.dispatchEvent(event);
                        }, 80);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs font-sans font-bold tracking-widest text-stone-800 hover:text-black hover:underline underline-offset-4 uppercase cursor-pointer"
                    >
                      • ALL MENS
                    </button>
                    <button
                      onClick={() => {
                        navigate('shop');
                        setTimeout(() => {
                          const event = new CustomEvent('filter-shop', { 
                            detail: { 
                              category: 'men', 
                              subcategory: 'Hoodies'
                            } 
                          });
                          window.dispatchEvent(event);
                        }, 80);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs font-sans font-bold tracking-widest text-stone-600 hover:text-black hover:underline underline-offset-4 uppercase cursor-pointer"
                    >
                      • HOODIES
                    </button>
                    <button
                      onClick={() => {
                        navigate('shop');
                        setTimeout(() => {
                          const event = new CustomEvent('filter-shop', { 
                            detail: { 
                              category: 'men', 
                              subcategory: 'Sweatshirts'
                            } 
                          });
                          window.dispatchEvent(event);
                        }, 80);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs font-sans font-bold tracking-widest text-stone-600 hover:text-black hover:underline underline-offset-4 uppercase cursor-pointer"
                    >
                      • SWEATSHIRTS
                    </button>
                    <button
                      onClick={() => {
                        navigate('shop');
                        setTimeout(() => {
                          const event = new CustomEvent('filter-shop', { 
                            detail: { 
                              category: 'men', 
                              subcategory: 'Jackets'
                            } 
                          });
                          window.dispatchEvent(event);
                        }, 80);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs font-sans font-bold tracking-widest text-stone-600 hover:text-black hover:underline underline-offset-4 uppercase cursor-pointer"
                    >
                      • JACKETS
                    </button>
                    <button
                      onClick={() => {
                        navigate('shop');
                        setTimeout(() => {
                          const event = new CustomEvent('filter-shop', { 
                            detail: { 
                              category: 'men', 
                              subcategory: 'T-Shirts'
                            } 
                          });
                          window.dispatchEvent(event);
                        }, 80);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs font-sans font-bold tracking-widest text-stone-600 hover:text-black hover:underline underline-offset-4 uppercase cursor-pointer"
                    >
                      • T-SHIRTS
                    </button>
                  </div>
                )}
              </div>

              {/* WOMENS COLLECTION */}
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    setWomensExpanded(!womensExpanded);
                  }}
                  className={`text-left navigation font-semibold tracking-[0.14em] uppercase hover:text-black hover:underline underline-offset-4 transition-all flex items-center justify-between cursor-pointer ${
                    currentRoute.path === 'shop' && activeHeaderTab === 'women' ? 'text-black underline underline-offset-4' : 'text-stone-600'
                  }`}
                >
                  <span>WOMENS COLLECTION</span>
                  <span className="text-xs">{womensExpanded ? '▲' : '▼'}</span>
                </button>
                
                {womensExpanded && (
                  <div className="flex flex-col gap-3 pl-4 mt-3 border-l border-stone-200 text-left">
                    <button
                      onClick={() => {
                        navigate('shop');
                        setTimeout(() => {
                          const event = new CustomEvent('filter-shop', { 
                            detail: { 
                              category: 'women', 
                              subcategory: 'all'
                            } 
                          });
                          window.dispatchEvent(event);
                        }, 80);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs font-sans font-bold tracking-widest text-stone-800 hover:text-black hover:underline underline-offset-4 uppercase cursor-pointer"
                    >
                      • ALL WOMENS
                    </button>
                    <button
                      onClick={() => {
                        navigate('shop');
                        setTimeout(() => {
                          const event = new CustomEvent('filter-shop', { 
                            detail: { 
                              category: 'women', 
                              subcategory: 'Hoodies'
                            } 
                          });
                          window.dispatchEvent(event);
                        }, 80);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs font-sans font-bold tracking-widest text-stone-600 hover:text-black hover:underline underline-offset-4 uppercase cursor-pointer"
                    >
                      • HOODIES
                    </button>
                    <button
                      onClick={() => {
                        navigate('shop');
                        setTimeout(() => {
                          const event = new CustomEvent('filter-shop', { 
                            detail: { 
                              category: 'women', 
                              subcategory: 'Sweatshirts'
                            } 
                          });
                          window.dispatchEvent(event);
                        }, 80);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs font-sans font-bold tracking-widest text-stone-600 hover:text-black hover:underline underline-offset-4 uppercase cursor-pointer"
                    >
                      • SWEATSHIRTS
                    </button>
                    <button
                      onClick={() => {
                        navigate('shop');
                        setTimeout(() => {
                          const event = new CustomEvent('filter-shop', { 
                            detail: { 
                              category: 'women', 
                              subcategory: 'Jackets'
                            } 
                          });
                          window.dispatchEvent(event);
                        }, 80);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs font-sans font-bold tracking-widest text-stone-600 hover:text-black hover:underline underline-offset-4 uppercase cursor-pointer"
                    >
                      • JACKETS
                    </button>
                    <button
                      onClick={() => {
                        navigate('shop');
                        setTimeout(() => {
                          const event = new CustomEvent('filter-shop', { 
                            detail: { 
                              category: 'women', 
                              subcategory: 'T-Shirts'
                            } 
                          });
                          window.dispatchEvent(event);
                        }, 80);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs font-sans font-bold tracking-widest text-stone-600 hover:text-black hover:underline underline-offset-4 uppercase cursor-pointer"
                    >
                      • T-SHIRTS
                    </button>
                  </div>
                )}
              </div>

              {/* BEST SELLERS */}
              <button
                onClick={() => {
                  navigate('shop');
                  setTimeout(() => {
                    const event = new CustomEvent('filter-shop', { 
                      detail: { 
                        category: 'bestseller', 
                        subcategory: 'all'
                      } 
                    });
                    window.dispatchEvent(event);
                  }, 80);
                  setMobileMenuOpen(false);
                }}
                className="text-left navigation font-semibold tracking-[0.14em] uppercase hover:text-black hover:underline underline-offset-4 transition-all flex items-center cursor-pointer text-stone-600"
              >
                BEST SELLERS
              </button>

              {/* NEW ARRIVALS */}
              <button
                onClick={() => {
                  navigate('shop');
                  setTimeout(() => {
                    const event = new CustomEvent('filter-shop', { 
                      detail: { 
                        category: 'newarrival', 
                        subcategory: 'all'
                      } 
                    });
                    window.dispatchEvent(event);
                  }, 80);
                  setMobileMenuOpen(false);
                }}
                className="text-left navigation font-semibold tracking-[0.14em] uppercase hover:text-black hover:underline underline-offset-4 transition-all flex items-center cursor-pointer text-stone-600"
              >
                NEW ARRIVALS
              </button>

              {/* OUR STORY */}
              <button
                onClick={() => {
                  navigate('about');
                  setMobileMenuOpen(false);
                }}
                className={`text-left navigation font-semibold tracking-[0.14em] uppercase hover:text-black hover:underline underline-offset-4 transition-all flex items-center cursor-pointer ${
                  currentRoute.path === 'about' ? 'text-black underline underline-offset-4' : 'text-stone-600'
                }`}
              >
                OUR STORY
              </button>

              {/* MY PROFILE */}
              <button
                onClick={() => {
                  navigate(user ? 'account' : 'auth');
                  setMobileMenuOpen(false);
                }}
                className={`text-left navigation font-semibold tracking-[0.14em] uppercase hover:text-black hover:underline underline-offset-4 transition-all flex items-center cursor-pointer ${
                  (currentRoute.path === 'account' || currentRoute.path === 'auth') ? 'text-black underline underline-offset-4' : 'text-stone-600'
                }`}
              >
                {user && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-black text-white border border-stone-200 font-sans font-bold relative select-none mr-2.5 shrink-0">
                    <span className="text-xs tracking-tighter flex items-baseline leading-none">
                      {user.name.startsWith("Patron") && user.name.split(' ').length > 1 ? "P" : user.name[0].toUpperCase()}
                      <span className="text-xs font-sans font-black ml-0.5">
                        {user.name.startsWith("Patron") && user.name.split(' ').length > 1 ? user.name.split(' ')[1].slice(-1) : (user.name.length > 1 ? user.name[1].toUpperCase() : "")}
                      </span>
                    </span>
                  </div>
                )}
                <span>{user ? 'MY PROFILE' : 'LOGIN'}</span>
              </button>

              {/* LOG OUT (if user logged in) */}
              {user && (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('home');
                  }}
                  className="text-left navigation font-semibold tracking-[0.14em] uppercase text-rose-600 font-bold hover:text-rose-700 transition-all flex items-center cursor-pointer"
                >
                  <LogOut size={16} className="text-rose-600 mr-2.5 shrink-0" />
                  <span>LOG OUT</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </>
  );
}
