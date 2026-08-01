import React from 'react';
import { Heart } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../store';

interface ProductCardProps {
  product: Product;
  key?: string;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist, navigate } = useStore();
  const wishlisted = isInWishlist(product.id);

  const handleCardClick = () => {
    navigate('product', { id: product.id });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-none border border-stone-200/80 overflow-hidden hover:border-stone-300/90 hover:shadow-xs transition-all duration-300 flex flex-col h-full cursor-pointer select-none"
      onClick={handleCardClick}
    >
      {/* Product Image Area */}
      <div className="aspect-[3/4] w-full bg-white relative overflow-hidden border-b border-stone-100">
        {/* Badge (NEW, BEST SELLER, SALE) */}
        {product.badge && (
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10">
            <span className={`text-[8px] sm:text-[9px] font-sans font-extrabold uppercase tracking-[0.15em] px-1.5 py-0.5 sm:px-2 sm:py-0.5 ${
              product.badge === 'SALE' 
                ? 'bg-red-600 text-brand-white' 
                : product.badge === 'NEW' 
                ? 'bg-brand-accent text-brand-black' 
                : 'bg-brand-black text-brand-white'
            }`}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Quick Add to Wishlist Heart (Top Right) */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brand-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-stone-600 hover:text-brand-accent hover:bg-brand-white transition-all duration-300 focus:outline-none"
          aria-label={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`${wishlisted ? 'fill-brand-accent text-brand-accent scale-110' : 'text-stone-700'} transition-transform w-3.5 h-3.5 sm:w-4 sm:h-4`} />
        </button>

        {/* Core Product Image (Subtle zoom on hover) */}
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Quick Preview Slide-up Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-brand-black/40 backdrop-blur-[2px] py-1.5 sm:py-2 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <span className="text-xs font-sans font-semibold tracking-widest text-brand-white uppercase">
            QUICK VIEW
          </span>
        </div>
      </div>

      {/* Product Information Area */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow text-left">
        {/* Product Name (Design scale) */}
        <h3 className="product-title text-brand-black group-hover:text-brand-accent transition-colors flex-grow leading-tight line-clamp-1">
          {product.name}
        </h3>

        {/* Pricing line with optional strikethrough MRP */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
          <span className="price text-brand-black">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.mrp && (
            <span className="body-sm text-stone-400 line-through">
              ₹{product.mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Color Swatch Dots row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-stone-100">
          {(product.colors || []).map((color, idx) => (
            <span
              key={`${color.name}-${idx}`}
              title={color.name}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-stone-200 block"
              style={{ backgroundColor: color.value }}
            />
          ))}
          <span className="text-xs font-sans text-stone-400 ml-0.5 sm:ml-1 font-medium whitespace-nowrap">
            {(product.colors || []).length} {(product.colors || []).length === 1 ? 'col' : 'cols'}
          </span>
        </div>
      </div>
    </div>
  );
}
