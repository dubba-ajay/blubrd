import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import ProductCard from './ProductCard';
import { ListFilter, ArrowDownWideNarrow, X, ArrowLeft } from 'lucide-react';

export default function ShopView() {
  const { products, navigate } = useStore();
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Collect unique subcategories available in the dataset
  const allSubcategories = Array.from(new Set(products.map((p) => p.subcategory))) as string[];

  // Listen to top CategoryNav click events (dispatched via custom event)
  useEffect(() => {
    const handleFilterEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { category, subcategory, sort, style } = customEvent.detail;
        if (style) {
          setSelectedStyle(style);
          setGenderFilter('all');
          setSelectedCategory('all');
          setSelectedSubcategory('all');
        } else {
          setSelectedStyle('all');
          if (category) {
            if (category === 'men' || category === 'women' || category === 'all') {
              setGenderFilter(category);
              setSelectedCategory('all');
            } else if (category === 'sale') {
              setGenderFilter('all');
              setSelectedCategory('sale');
            } else {
              setSelectedCategory(category);
            }
          }
          if (sort === 'newest') {
            setSelectedCategory('newarrival');
          } else if (sort === 'bestseller') {
            setSelectedCategory('bestseller');
          }
          if (subcategory) {
            setSelectedSubcategory(subcategory);
          } else {
            setSelectedSubcategory('all');
          }
        }
        if (sort) {
          setSelectedSort(sort);
        }
      }
    };

    window.addEventListener('filter-shop', handleFilterEvent);
    return () => {
      window.removeEventListener('filter-shop', handleFilterEvent);
    };
  }, []);

  // Filter & Sort logic
  const filteredProducts = products.filter((p) => {
    // Strictly hoodies, sweatshirts, jackets, and t-shirts only.
    const sub = p.subcategory ? p.subcategory.toLowerCase() : '';
    const isValidSub = sub === 'hoodies' || sub === 'sweatshirts' || sub === 'jackets' || sub === 't-shirts';
    if (!isValidSub) return false;

    // 1. Gender Filter (Men's vs Women's)
    if (genderFilter !== 'all') {
      if (p.category !== genderFilter) return false;
    }

    // 1.5 Style Concept Filter
    if (selectedStyle !== 'all') {
      const nameLower = p.name.toLowerCase();
      const descLower = p.description.toLowerCase();
      const subLower = p.subcategory.toLowerCase();
      const colorsList = p.colors.map(c => c.name.toLowerCase());

      if (selectedStyle === 'classics') {
        const isClassic = nameLower.includes('classic') || nameLower.includes('signature') || nameLower.includes('minimalist') || nameLower.includes('fleece') || subLower === 't-shirts';
        if (!isClassic) return false;
      } else if (selectedStyle === 'old-money') {
        const isOldMoney = nameLower.includes('knit') || nameLower.includes('suede') || nameLower.includes('cable') || nameLower.includes('terry') || descLower.includes('french terry') || colorsList.some(c => c.includes('oatmeal') || c.includes('sand') || c.includes('camel') || c.includes('khaki') || c.includes('white'));
        if (!isOldMoney) return false;
      } else if (selectedStyle === 'streetwear') {
        const isStreet = nameLower.includes('street') || nameLower.includes('oversized') || nameLower.includes('hoodie') || nameLower.includes('washed') || nameLower.includes('crop') || descLower.includes('boxy') || descLower.includes('heavyweight');
        if (!isStreet) return false;
      } else if (selectedStyle === 'smart-casuals') {
        const isSmart = nameLower.includes('jacket') || nameLower.includes('denim') || nameLower.includes('overshirt') || nameLower.includes('sherpa') || nameLower.includes('windbreaker') || nameLower.includes('mock-neck');
        if (!isSmart) return false;
      } else if (selectedStyle === 'print-play') {
        const isPrintPlay = nameLower.includes('sashiko') || nameLower.includes('embroidered') || nameLower.includes('indigo') || descLower.includes('lilac') || descLower.includes('peach') || descLower.includes('sage') || descLower.includes('pastel') || colorsList.some(c => c.includes('sage') || c.includes('lilac') || c.includes('peach') || c.includes('rose'));
        if (!isPrintPlay) return false;
      } else if (selectedStyle === 'workwear') {
        const isWork = nameLower.includes('work') || nameLower.includes('tailored') || nameLower.includes('overshirt') || nameLower.includes('minimalist') || nameLower.includes('organic') || descLower.includes('tailored') || descLower.includes('clean');
        if (!isWork) return false;
      }
    }

    // 2. Custom Collection/Category Filter matching criteria
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'buy1get2') {
        // Buy 1 Get 2 matches products under 2500
        if (p.price >= 2500) return false;
      } else if (selectedCategory === 'bestseller') {
        if (p.badge !== 'BEST SELLER' && !(p.badge && p.badge.toLowerCase().includes('best'))) return false;
      } else if (selectedCategory === 'newarrival') {
        if (p.badge !== 'NEW' && !(p.badge && p.badge.toLowerCase().includes('new'))) return false;
      } else if (selectedCategory === 'featured') {
        if (p.price < 2000 && !(p.badge && p.badge.toLowerCase().includes('featured'))) return false;
      } else if (selectedCategory === 'sale') {
        // checks if mrp > price or contains sale/offer in badge
        const hasOffer = (p.mrp && p.mrp > p.price) || (p.badge && (p.badge.toLowerCase().includes('sale') || p.badge.toLowerCase().includes('off') || p.badge.toLowerCase().includes('%') || p.badge.toLowerCase().includes('offer')));
        if (!hasOffer) return false;
      } else if (p.category !== selectedCategory) {
        return false;
      }
    }

    // 3. Subcategory Filter
    if (selectedSubcategory !== 'all') {
      if (p.subcategory.toLowerCase() !== selectedSubcategory.toLowerCase()) return false;
    }

    // 4. Price Filter
    if (p.price > maxPrice) return false;

    return true;
  }).sort((a, b) => {
    // Sort logic
    if (selectedSort === 'price-low') {
      return a.price - b.price;
    }
    if (selectedSort === 'price-high') {
      return b.price - a.price;
    }
    if (selectedSort === 'newest') {
      const aIsNew = a.badge === 'NEW' || (a.badge && a.badge.toLowerCase().includes('new'));
      const bIsNew = b.badge === 'NEW' || (b.badge && b.badge.toLowerCase().includes('new'));
      return aIsNew ? -1 : bIsNew ? 1 : 0;
    }
    if (selectedSort === 'bestseller') {
      const aIsBest = a.badge === 'BEST SELLER' || (a.badge && a.badge.toLowerCase().includes('best'));
      const bIsBest = b.badge === 'BEST SELLER' || (b.badge && b.badge.toLowerCase().includes('best'));
      return aIsBest ? -1 : bIsBest ? 1 : 0;
    }
    return 0; // Featured default
  });

  const clearAllFilters = () => {
    setGenderFilter('all');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedStyle('all');
    setSelectedSort('featured');
    setMaxPrice(10000);
  };

  return (
    <div id="shop-view-root" className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      
      {/* Navigation & Controls Row */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 pt-1">
        {/* Left: Back button */}
        <button
          type="button"
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-black transition-colors font-sans text-xs font-bold tracking-[0.14em] uppercase cursor-pointer py-1"
        >
          <ArrowLeft size={14} /> BACK
        </button>

        {/* Right: Filter & Sort Controls */}
        <div className="flex items-center gap-8">
          {/* Filter button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 text-xs font-sans font-bold tracking-[0.14em] uppercase text-stone-800 hover:text-black transition-colors cursor-pointer py-1"
          >
            <ListFilter size={14} className="text-stone-800" /> FILTER
          </button>

          {/* Sort select */}
          <div className="relative cursor-pointer group py-1">
            <div className="flex items-center gap-2 text-xs font-sans font-bold tracking-[0.14em] uppercase text-stone-800 group-hover:text-black transition-colors">
              <ArrowDownWideNarrow size={14} className="text-stone-800" /> SORT BY
            </div>
            
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
            >
              <option value="featured">Featured Collection</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">New Arrivals First</option>
              <option value="bestseller">Best Sellers First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main product area - Full Width Grid */}
      <div className="w-full">
        <main className="space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center space-y-4 border border-stone-200 rounded-lg">
              <p className="section-title text-stone-500 italic">"No garments found matching criteria."</p>
              <p className="text-xs text-stone-400 max-w-xs mx-auto font-sans">
                Try widening your search, sliding the price maximum higher, or clearing all active filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-brand-black text-brand-white text-xs font-semibold tracking-widest uppercase py-3.5 px-8 hover:bg-brand-accent transition-colors"
              >
                RESET ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const displayProduct = selectedCategory === 'buy1get2'
                  ? { ...product, badge: 'BUY 1 GET 2' }
                  : product;
                return (
                  <ProductCard key={product.id} product={displayProduct} />
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Unified Filters Left Drawer Overlay */}
      {showMobileFilters && (
        <div 
          id="filter-drawer-overlay" 
          className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setShowMobileFilters(false)}
        >
          <div 
            className="absolute top-0 left-0 w-[85%] sm:w-4/5 max-w-[380px] h-full bg-brand-cream shadow-2xl flex flex-col p-6 sm:p-8 animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
              <span className="font-sans text-lg font-bold text-brand-black tracking-widest">FILTERS</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 hover:text-brand-accent transition-colors text-stone-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter content - scrollable */}
            <div className="flex-grow overflow-y-auto space-y-8 pr-2">
              
              {/* Category */}
              <div className="space-y-3">
                <h4 className="text-xs font-sans font-bold tracking-widest-double text-brand-black uppercase">
                  CATEGORIES
                </h4>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'all', label: 'Show All Collection' },
                    ...(genderFilter === 'all' ? [
                      { id: 'men', label: "Mens Collection" },
                      { id: 'women', label: "Womens Collection" },
                    ] : []),
                    { id: 'bestseller', label: 'Best Sellers' },
                    { id: 'newarrival', label: 'New Arrivals' },
                    { id: 'featured', label: 'Featured Collection' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory('all'); // reset subcategory on main change
                      }}
                      className={`text-left text-xs font-sans font-semibold py-1 transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'text-brand-accent font-bold underline underline-offset-4'
                          : 'text-stone-500 hover:text-brand-black'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories */}
              <div className="space-y-3">
                <h4 className="text-xs font-sans font-bold tracking-widest-double text-brand-black uppercase">
                  CRAFT SUB-WEAVES
                </h4>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`text-left text-xs font-sans font-semibold py-1 transition-colors cursor-pointer ${
                      selectedSubcategory === 'all'
                        ? 'text-brand-accent font-bold underline underline-offset-4'
                        : 'text-stone-500 hover:text-brand-black'
                    }`}
                  >
                    All Sub-Weaves
                  </button>
                  {allSubcategories.map((sub) => {
                    // Only show subcategories valid for the selected category if appropriate
                    const productsOfSub = products.filter(
                      p => p.subcategory === sub && (genderFilter === 'all' || p.category === genderFilter)
                    );
                    if (productsOfSub.length === 0) return null;

                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`text-left text-xs font-sans font-semibold py-1 transition-colors cursor-pointer ${
                          selectedSubcategory.toLowerCase() === sub.toLowerCase()
                            ? 'text-brand-accent font-bold underline underline-offset-4'
                            : 'text-stone-500 hover:text-brand-black'
                        }`}
                      >
                        {sub} ({productsOfSub.length})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-sans font-bold tracking-widest-double text-brand-black uppercase">
                    MAX PRICE
                  </h4>
                  <span className="text-xs font-sans font-bold text-brand-accent">
                    ₹{maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="12000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-accent bg-stone-200 h-1 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-stone-400 font-sans">
                  <span>₹1,000</span>
                  <span>₹12,000</span>
                </div>
              </div>

            </div>

            {/* Bottom Actions of Filters */}
            <div className="border-t border-stone-200 pt-4 mt-auto space-y-2">
              <button
                onClick={() => {
                  setShowMobileFilters(false);
                }}
                className="w-full bg-brand-black text-brand-white text-xs font-sans font-bold py-3 uppercase tracking-widest hover:bg-brand-accent transition-colors cursor-pointer"
              >
                APPLY FILTERS
              </button>
              <button
                onClick={() => {
                  clearAllFilters();
                  setShowMobileFilters(false);
                }}
                className="w-full bg-stone-100 text-stone-700 text-xs font-sans font-bold py-3 uppercase tracking-widest hover:bg-stone-200 transition-colors cursor-pointer"
              >
                CLEAR ALL
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
