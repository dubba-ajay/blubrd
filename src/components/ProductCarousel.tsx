import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products = [] }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      // Run initial check and delayed check for rendering
      checkScroll();
      const timer = setTimeout(checkScroll, 300);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timer);
      };
    }
  }, [products]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/carousel w-full">
      {/* Left Navigation Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-brand-white/95 backdrop-blur-xs shadow-md border border-stone-200/80 flex items-center justify-center text-brand-black hover:bg-brand-accent hover:border-brand-accent transition-all duration-300 md:opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 cursor-pointer"
          aria-label="Scroll left"
        >
          <ArrowLeft size={16} />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-brand-white/95 backdrop-blur-xs shadow-md border border-stone-200/80 flex items-center justify-center text-brand-black hover:bg-brand-accent hover:border-brand-accent transition-all duration-300 md:opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 cursor-pointer"
          aria-label="Scroll right"
        >
          <ArrowRight size={16} />
        </button>
      )}

      {/* Scrollable Container with custom padding so cards aren't clipped */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[280px] md:w-[285px] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
