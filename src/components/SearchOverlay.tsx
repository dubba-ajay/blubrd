import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../store';
import ProductCard from './ProductCard';
import { PLACEHOLDERS } from '../constants/placeholders';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const { products } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input on mount
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';

      // Read search parameter if exists for SEO crawler compatibility
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        setQuery(q);
      }
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Filter products by query
  const filteredProducts = products.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  // SEO Dynamic Head and URL Sync
  useEffect(() => {
    if (!isOpen) return;

    // 1. Sync search query to URL parameter for crawlability & indexability
    const newUrl = query
      ? `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(query)}`
      : `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);

    // 2. Dynamic SEO Document Title
    const originalTitle = document.title;
    document.title = query
      ? `Search results for "${query}" | The Bluberd`
      : 'Atelier Search & Discover | The Bluberd';

    // 3. Dynamic Meta Description Tag
    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      query
        ? `Find premium hoodies, sweatshirts, and jackets matching "${query}". Explore ${filteredProducts.length} high-quality e-commerce streetwear designs.`
        : 'Explore The Bluberd active luxury fashion. Search for premium organic cotton fleece hoodies, crewneck sweatshirts, and heavyweight zip jackets.'
    );

    // 4. Injected JSON-LD Schema (SearchResultsPage structure for rich snippets)
    let schemaScript = document.getElementById('search-seo-schema') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'search-seo-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "name": query ? `Search results for "${query}"` : "Atelier Search Portal",
      "url": window.location.href,
      "description": `Search results showing matching apparel items for query: ${query || 'none'}.`,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": filteredProducts.length,
        "itemListElement": filteredProducts.slice(0, 10).map((p, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "url": `${window.location.origin}/product/${p.id}`,
          "name": p.name,
          "image": p.images[0]
        }))
      }
    };
    schemaScript.textContent = JSON.stringify(schemaData);

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute('content', originalDesc);
      }
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [isOpen, query, filteredProducts.length]);

  if (!isOpen) return null;

  return (
    <div
      id="search-overlay"
      className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[9999] overflow-y-auto animate-fade-in flex flex-col text-stone-900 dark:text-stone-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Upper bar with search input */}
      <div className="border-b border-stone-150 dark:border-stone-850 bg-white dark:bg-stone-900 sticky top-0 z-10 px-4 md:px-8 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 flex-grow max-w-3xl">
            <Search size={16} className="text-stone-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder={PLACEHOLDERS.SEARCH.INPUT}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-stone-900 dark:text-stone-100 text-xs md:text-sm font-sans font-normal placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-0 py-0.5"
            />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors border border-stone-200 dark:border-stone-800 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Close search overlay"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {query === '' ? (
        <div 
          className="flex-grow w-full cursor-pointer bg-transparent" 
          onClick={onClose}
        />
      ) : (
        <div className="flex-grow w-full bg-white/90 dark:bg-stone-950/90 backdrop-blur-md overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8 animate-fade-in">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/50 pb-3">
                <p className="text-sm font-sans text-stone-500 dark:text-stone-400">
                  Found <strong className="font-semibold text-stone-900 dark:text-white">{filteredProducts.length}</strong> apparel results for "{query}"
                </p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <p className="font-sans text-sm text-stone-500 dark:text-stone-400 italic">No products match your query.</p>
                  <button
                    onClick={() => setQuery('')}
                    className="bg-stone-900 hover:bg-stone-850 dark:bg-brand-accent dark:hover:bg-brand-accent/90 text-white dark:text-stone-950 text-xs font-bold tracking-widest uppercase py-2.5 px-5 rounded-xl transition-all"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} onClick={onClose}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
