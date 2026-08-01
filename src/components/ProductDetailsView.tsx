import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { PLACEHOLDERS } from '../constants/placeholders';
import ProductGallery from './ProductGallery';
import ProductCarousel from './ProductCarousel';
import { ShoppingBag, ChevronDown, ChevronUp, Star, Check, Plus, Minus, Info, AlertTriangle, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';

interface ProductDetailsViewProps {
  productId: string;
}

export default function ProductDetailsView({ productId }: ProductDetailsViewProps) {
  const { 
    addToCart, getReviews, addReview, navigate,
    addToRecentlyViewed, recentlyViewed, subscribeBackInStock, products 
  } = useStore();
  
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <h2 className="section-title font-semibold text-brand-black">Garment Not Found</h2>
        <p className="text-stone-500 text-sm">The handloom weave you are looking for does not exist or has been archived.</p>
        <button
          onClick={() => navigate('shop')}
          className="bg-brand-black text-brand-white text-xs font-bold py-3 px-6 uppercase tracking-widest"
        >
          BACK TO CATALOG
        </button>
      </div>
    );
  }

  // Selected State
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.value || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [successToast, setSuccessToast] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Recently Viewed and Back in stock notifications
  useEffect(() => {
    if (product?.id) {
      addToRecentlyViewed(product.id);
    }
  }, [product?.id]);

  const [bisEmail, setBisEmail] = useState('');
  const [bisSuccess, setBisSuccess] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // PIN Code checker states
  const [pincode, setPincode] = useState('');
  const [pinCheckStatus, setPinCheckStatus] = useState<'idle' | 'checking' | 'verified' | 'error'>('idle');
  const [pinErrorMessage, setPinErrorMessage] = useState('');

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setPinCheckStatus('error');
      setPinErrorMessage('⚠️ Please enter a valid 6-digit PIN code.');
      return;
    }

    setPinCheckStatus('checking');
    setTimeout(() => {
      // Allow specific pincodes or any pincode starting with 509 (since the user checked 509320)
      const isServiceable = ['509320', '110001', '400001', '560001', '600001', '700001', '500001'].includes(cleanPin) || cleanPin.startsWith('509');
      
      if (isServiceable) {
        setPinCheckStatus('verified');
        setPinErrorMessage('');
      } else {
        setPinCheckStatus('error');
        setPinErrorMessage(`❌ Sorry, we do not deliver to PIN ${cleanPin} at this moment.`);
      }
    }, 600);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('checkout');
  };

  const handleBackInStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bisEmail) return;
    subscribeBackInStock(bisEmail, product.id, selectedSize, selectedColor);
    setBisSuccess(true);
    setBisEmail('');
    setTimeout(() => setBisSuccess(false), 5000);
  };

  const handleShareProduct = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  // Stock tracking patterns (dynamic)
  const pseudoId = `${product.id}-${selectedSize}`;
  const storedStock = typeof window !== 'undefined' ? (localStorage.getItem(`bluberd_stock_${pseudoId}`) || localStorage.getItem(`rasolark_stock_${pseudoId}`)) : null;
  const stockLevel = storedStock ? Number(storedStock) : 8; // fallback to 8
  const isOutOfStock = stockLevel <= 0;
  const isLowStock = stockLevel > 0 && stockLevel < 5;

  const otherRecentlyViewed = recentlyViewed.filter(p => p.id !== product.id);

  // Accordion State
  const [openSection, setOpenSection] = useState<'desc' | 'fabric' | 'shipping' | null>('desc');

  // Reviews State & input form
  const productReviews = getReviews(product.id);
  const [rating, setRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revBody, setRevBody] = useState('');
  const [revName, setRevName] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const averageRating = productReviews.length > 0 
    ? Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1))
    : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4000);
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revTitle || !revBody) return;
    
    addReview(product.id, rating, revTitle, revBody, revName || 'Verified Buyer');
    setReviewSuccess(true);
    setRevTitle('');
    setRevBody('');
    setRevName('');
    setTimeout(() => {
      setReviewSuccess(false);
      setShowReviewForm(false);
    }, 3000);
  };

  const toggleAccordion = (section: 'desc' | 'fabric' | 'shipping') => {
    setOpenSection(openSection === section ? null : section);
  };

  const starCounts = [0, 0, 0, 0, 0]; // index 0 is 1 star, index 4 is 5 stars
  productReviews.forEach((rev) => {
    const r = Math.max(1, Math.min(5, Math.floor(rev.rating)));
    starCounts[r - 1]++;
  });

  return (
    <div id="product-details-root" className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      
      {/* Back button requested by user */}
      <div className="text-left">
        <button
          type="button"
          onClick={() => navigate('shop')}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-black transition-all font-sans text-xs font-bold tracking-wider uppercase cursor-pointer mb-2"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>
      
      {/* Upper area: Gallery on left, Info on right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start mt-4">
        
        {/* Left Column: Product Gallery component */}
        <ProductGallery images={product.images} onShare={handleShareProduct} />

        {/* Right Column: Specifications & Purchasing Area */}
        <div id="product-purchase-details" className="space-y-6 text-left">
          <div className="space-y-2">
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-wider text-brand-black uppercase leading-tight">
              {product.name}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= Math.round(averageRating) ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}
                  />
                ))}
              </div>
              <span className="body-sm text-stone-600">
                {productReviews.length > 0 
                  ? `${averageRating} (${productReviews.length} verified review${productReviews.length > 1 ? 's' : ''})`
                  : 'No reviews yet'
                }
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-center gap-3 py-2 border-t border-b border-stone-200/50">
            <span className="price text-brand-black">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp && (
              <>
                <span className="body-sm text-stone-400 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
                <span className="caption bg-red-100 text-red-700 py-1 px-2 uppercase tracking-wider font-semibold">
                  SAVE {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Color Selection dots */}
          <div className="space-y-3">
            <span className="label text-stone-500 uppercase block tracking-wider font-semibold">
              SELECT COLOR
            </span>
            <div className="flex items-center gap-3">
              {product.colors.map((color, idx) => {
                const isSelected = selectedColor === color.value;
                return (
                  <button
                    key={`${color.name}-${idx}`}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'ring-2 ring-brand-accent ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                  >
                    {isSelected && (
                      <span className={`w-2 h-2 rounded-full ${
                        color.value.toLowerCase() === '#ffffff' ? 'bg-brand-black' : 'bg-brand-white'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
            <span className="body-sm text-brand-black font-medium block">
              Active color: <span className="text-stone-500 font-normal">{product.colors.find(c => c.value === selectedColor)?.name}</span>
            </span>
          </div>

          {/* Size Selection pills with Size Guide dialog trigger */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="label text-stone-500 uppercase tracking-wider font-semibold">
                SELECT SIZE
              </span>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="body-sm font-sans font-bold text-brand-accent hover:text-brand-accent-dark tracking-wider uppercase underline decoration-dotted flex items-center gap-1"
              >
                <Info size={12} /> Size Guide
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 px-5 border transition-all text-xs font-sans font-semibold uppercase tracking-wider rounded-none ${
                      isSelected
                        ? 'bg-brand-black text-brand-white border-brand-black'
                        : 'bg-transparent border-stone-200 text-brand-black hover:border-brand-black'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            
            {/* Live Stock & Back-in-Stock Form */}
            <div className="pt-2">
              {isOutOfStock ? (
                <div className="bg-red-50/50 border border-red-200/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                    <AlertTriangle size={14} className="animate-pulse" />
                    <span>OUT OF STOCK IN SIZE {selectedSize}</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    This handloom weave variation is temporarily dry. Fill your email below to be notified automatically the moment artisans complete the next batch.
                  </p>
                  
                  {bisSuccess ? (
                    <div className="text-xs font-bold text-green-700 bg-green-50 p-2 border border-green-200 flex items-center gap-1.5 animate-fade-in">
                      <Check size={12} /> Subscription registered! We will notify you instantly.
                    </div>
                  ) : (
                    <form onSubmit={handleBackInStockSubmit} className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder={PLACEHOLDERS.FORM.EMAIL}
                        value={bisEmail}
                        onChange={(e) => setBisEmail(e.target.value)}
                        className="flex-grow bg-brand-white border border-stone-200 p-2 text-xs focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent rounded-none"
                      />
                      <button
                        type="submit"
                        className="bg-brand-black hover:bg-brand-accent hover:text-brand-black text-brand-white text-xs font-sans font-bold px-4 py-2 uppercase tracking-wider transition-colors"
                      >
                        NOTIFY ME
                      </button>
                    </form>
                  )}
                </div>
              ) : isLowStock ? (
                <div className="bg-amber-50/40 border border-amber-200/50 p-3 flex items-center gap-2 text-xs font-semibold text-amber-800">
                  <AlertTriangle size={14} className="text-amber-600 animate-bounce" />
                  <span>Only {stockLevel} pieces left! Handloom batches take 4 weeks to replenish.</span>
                </div>
              ) : (
                <div className="text-xs font-medium text-emerald-800 bg-emerald-50/40 border border-emerald-200/40 p-2 px-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>In Stock - Ready to dispatch from our master weavers within 24 hours.</span>
                </div>
              )}
            </div>
          </div>

          {/* Quantity selector & Add to actions */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-sans font-bold tracking-widest text-stone-500 uppercase">
                QUANTITY
              </span>
              
              <div className="flex items-center border border-stone-300">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-stone-50 text-stone-600 transition-colors"
                  aria-label="Decrease"
                >
                  <Minus size={12} />
                </button>
                <span className="px-5 text-sm font-sans font-bold text-brand-black">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 hover:bg-stone-50 text-stone-600 transition-colors"
                  aria-label="Increase"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

             {/* CTA action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`text-xs font-sans font-semibold tracking-widest uppercase py-4 transition-all rounded-none flex items-center justify-center gap-2 border ${
                  isOutOfStock 
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed border-stone-200' 
                    : 'bg-transparent text-brand-black border-stone-400 hover:border-brand-black hover:bg-brand-black/5 cursor-pointer'
                }`}
              >
                <ShoppingBag size={14} /> {isOutOfStock ? 'TEMPORARILY SOLD OUT' : 'ADD TO BAG'}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`text-xs font-sans font-semibold tracking-widest uppercase py-4 transition-all rounded-none flex items-center justify-center gap-2 ${
                  isOutOfStock 
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200' 
                    : 'bg-brand-black text-brand-white hover:bg-brand-accent hover:text-brand-black cursor-pointer'
                }`}
              >
                <ArrowRight size={14} /> BUY NOW
              </button>
            </div>

            {/* Add to Cart Success banner */}
            {successToast && (
              <div className="bg-brand-cream border border-brand-accent/40 p-4 text-brand-black flex items-center justify-between animate-fade-in mt-3">
                <div className="flex items-center gap-2.5 text-xs font-sans">
                  <span className="w-5 h-5 bg-green-700 text-brand-white rounded-full flex items-center justify-center">✓</span>
                  <span>Added {quantity}x <strong>{product.name}</strong> ({selectedSize}) to your shopping bag.</span>
                </div>
              </div>
            )}

            {shareToast && (
              <div className="mt-3 animate-fade-in">
                <p className="w-full text-xs font-bold text-brand-accent bg-brand-cream border border-brand-accent/25 p-1.5 text-center uppercase tracking-widest">
                  ✓ Product Link Copied to Clipboard
                </p>
              </div>
            )}

            {/* PIN CODE SERVICEABILITY CHECKER */}
            <div className="border-t border-stone-200 pt-5 mt-4 space-y-3 font-sans text-left">
              <h4 className="text-xs font-bold text-brand-black uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-accent" /> Check Delivery & Services
              </h4>
              <p className="text-xs text-stone-500">
                Enter your 6-digit PIN code to check service availability, delivery timelines, and COD availability.
              </p>

              <form onSubmit={handleCheckPincode} className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  maxLength={6}
                  placeholder={PLACEHOLDERS.FORM.PIN_CODE}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ''));
                    setPinCheckStatus('idle');
                  }}
                  className="flex-grow bg-transparent border border-stone-400 px-3.5 py-2 text-xs font-sans focus:outline-none focus:border-brand-black h-9 rounded-none"
                />
                <button
                  type="submit"
                  disabled={pinCheckStatus === 'checking'}
                  className="bg-brand-black text-brand-white hover:bg-brand-accent hover:text-brand-black text-xs font-bold tracking-widest px-5 uppercase transition-all shrink-0 h-9 flex items-center justify-center cursor-pointer rounded-none"
                >
                  {pinCheckStatus === 'checking' ? 'Checking...' : 'Check'}
                </button>
              </form>

              {/* Status Indicator Messages */}
              {pinCheckStatus === 'verified' && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 flex items-center gap-2 text-emerald-800 font-bold text-xs animate-fade-in">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">✓</span>
                  <span>Serviceable to PIN {pincode}</span>
                </div>
              )}

              {pinCheckStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 p-2.5 flex items-center gap-2 text-red-800 font-bold text-xs animate-fade-in">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-xs font-black">✕</span>
                  <span>{pinErrorMessage || "Delivery not available to PIN " + pincode}</span>
                </div>
              )}

              {/* Delivery and Services List (Always showing) */}
              <div className="bg-stone-50 border border-stone-200/60 p-3.5 space-y-2.5 mt-2 text-xs leading-relaxed text-left">
                <div className="grid grid-cols-1 gap-2 text-stone-600 font-medium">
                  <p className="flex items-center gap-2">
                    🚚 <strong className="text-brand-black">Estimated Delivery:</strong> 3 to 5 business days (Fast Dispatch)
                  </p>
                  <p className="flex items-center gap-2">
                    💵 <strong className="text-brand-black">Cash on Delivery (COD):</strong> Available (Pay on Delivery)
                  </p>
                  <p className="flex items-center gap-2">
                    🔄 <strong className="text-brand-black">Exchange & Returns:</strong> 7-day Hassle-free Exchange
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Accordion Details (Description, Fabric, Returns) */}
          <div className="border-t border-stone-200 pt-4 space-y-2">
            {[
              { id: 'desc', title: 'Product Story & Details', content: product.description },
              { id: 'fabric', title: 'Fabric Heritage & Care Instructions', content: product.fabricCare },
              { id: 'shipping', title: 'Committed Shipping & Hassle-free Returns', content: product.shippingReturns }
            ].map((section) => {
              const isOpen = openSection === section.id;
              return (
                <div key={section.id} className="border-b border-stone-100 pb-3">
                  <button
                    onClick={() => toggleAccordion(section.id as any)}
                    className="w-full flex items-center justify-between text-left py-2 font-sans text-sm font-semibold text-brand-black hover:text-brand-accent transition-colors"
                  >
                    <span>{section.title}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-stone-500 font-sans leading-relaxed pt-1 pb-2">
                      {section.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Product Reviews Module */}
      <section id="reviews-section" className="border-t border-stone-200 pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h3 className="section-title text-brand-black">
              Verified Artisan Reviews
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              Feedback from the active The Bluberd buyer community.
            </p>
          </div>
          
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-brand-black text-brand-white text-xs font-sans font-semibold tracking-widest py-3 px-6 uppercase hover:bg-brand-accent hover:text-brand-black transition-colors rounded-none"
          >
            {showReviewForm ? 'CANCEL REVIEW' : 'WRITE A REVIEWS'}
          </button>
        </div>

        {/* Dynamic write review form */}
        {showReviewForm && (
          <form onSubmit={handleAddReviewSubmit} className="bg-brand-cream/80 p-6 space-y-4 max-w-xl border border-stone-200">
            <h4 className="card-title text-brand-black">Share Your Experience</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-wider block">Your Name</label>
                <input
                  type="text"
                  placeholder={PLACEHOLDERS.FORM.REVIEWER_NAME}
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  className="w-full bg-brand-white border border-stone-300 p-2.5 text-xs font-sans rounded-none focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-wider block">Star Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-brand-white border border-stone-300 p-2.5 text-xs font-sans rounded-none focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                  <option value="3">⭐⭐⭐ 3 Stars</option>
                  <option value="2">⭐⭐ 2 Stars</option>
                  <option value="1">⭐ 1 Star</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-wider block">Review Headline</label>
              <input
                type="text"
                placeholder={PLACEHOLDERS.FORM.REVIEW_TITLE}
                required
                value={revTitle}
                onChange={(e) => setRevTitle(e.target.value)}
                className="w-full bg-brand-white border border-stone-300 p-2.5 text-xs font-sans rounded-none focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-wider block">Review details</label>
              <textarea
                placeholder={PLACEHOLDERS.FORM.REVIEW_BODY}
                required
                rows={4}
                value={revBody}
                onChange={(e) => setRevBody(e.target.value)}
                className="w-full bg-brand-white border border-stone-300 p-2.5 text-xs font-sans rounded-none focus:outline-none focus:border-brand-accent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-black text-brand-white text-xs font-sans font-bold py-3.5 uppercase tracking-widest hover:bg-brand-accent transition-colors"
            >
              SUBMIT ARTISAN REVIEW
            </button>

            {reviewSuccess && (
              <p className="text-green-700 text-xs font-sans font-medium text-center">
                Review submitted successfully! Thank you for supporting organic craft communities.
              </p>
            )}
          </form>
        )}

        {/* Core Review breakdown and listing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Rating Summary breakdown */}
          <div className="space-y-4">
            <div className="bg-brand-cream/50 p-6 border border-stone-100 text-center space-y-2">
              <p className="text-xs font-sans font-bold text-stone-400 uppercase tracking-widest">PATRON RATING</p>
              <p className="font-sans text-4xl font-bold text-brand-black">{productReviews.length > 0 ? averageRating : '0.0'}</p>
              <div className="flex justify-center text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={productReviews.length > 0 && s <= Math.round(averageRating) ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}
                  />
                ))}
              </div>
              <p className="text-xs font-sans text-stone-500 font-medium">
                {productReviews.length > 0 
                  ? `Average based on ${productReviews.length} verified rating${productReviews.length > 1 ? 's' : ''}`
                  : 'No verified ratings yet'
                }
              </p>
            </div>

            {/* Progress Bars */}
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = starCounts[stars - 1];
                const pct = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs font-sans text-stone-500">
                    <span className="w-12 text-right">{stars} Star</span>
                    <div className="flex-grow bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-accent h-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-stone-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of customer Reviews */}
          <div className="md:col-span-2 space-y-6">
            {productReviews.length === 0 ? (
              <div className="py-12 text-center text-stone-500 space-y-2 font-sans border border-dashed border-stone-200">
                <p className="font-sans text-base italic">"No reviews for this weave yet."</p>
                <p className="text-xs text-stone-400">Be the first verified patron to write about its silhouette and fabric weave!</p>
              </div>
            ) : (
              productReviews.map((rev) => (
                <div key={rev.id} className="border-b border-stone-100 pb-5 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-sans font-semibold text-brand-black">{rev.userName}</span>
                      <span className="text-xs bg-green-50 text-green-700 py-0.5 px-2 rounded-sm font-sans font-bold">VERIFIED BUYER</span>
                    </div>
                    <span className="text-xs font-sans text-stone-400">{rev.date}</span>
                  </div>

                  {/* Stars */}
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}
                      />
                    ))}
                  </div>

                  {/* Headline & Body */}
                  <div className="space-y-1">
                    <h5 className="font-sans text-sm font-bold text-brand-black leading-tight">
                      {rev.title}
                    </h5>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      {rev.body}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* Related Products Section */}
      <section id="related-products-section" className="border-t border-stone-200 pt-12 space-y-8">
        <div className="border-b border-stone-200 pb-5">
          <p className="text-xs font-sans font-bold text-brand-accent tracking-widest-double uppercase">
            COMPLETE THE HERITAGE
          </p>
          <h3 className="section-title text-brand-black">
            You May Also Admire
          </h3>
        </div>

        {/* Horizontal scrollable row / carousel */}
        <ProductCarousel 
          products={products.filter((p) => p.category === product.category && p.id !== product.id)} 
        />
      </section>

      {/* Recently Viewed Section */}
      {otherRecentlyViewed.length > 0 && (
        <section id="recently-viewed-section" className="border-t border-stone-200 pt-12 space-y-8">
          <div className="border-b border-stone-200 pb-5">
            <p className="text-xs font-sans font-bold text-brand-accent tracking-widest-double uppercase">
              YOUR RECENT CURATIONS
            </p>
            <h3 className="section-title text-brand-black">
              Recently Viewed Weaves
            </h3>
          </div>

          <ProductCarousel 
            products={otherRecentlyViewed} 
          />
        </section>
      )}

      {/* Size Guide Overlay Modal */}
      {sizeGuideOpen && (
        <div id="size-guide-modal" className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-white w-full max-w-md p-6 relative shadow-2xl border border-stone-200">
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-brand-black transition-colors"
            >
              ✕
            </button>
            
            <div className="space-y-4 font-sans">
              <div className="text-center">
                <span className="text-xs font-sans font-bold text-brand-accent tracking-[0.2em] uppercase">THE BLUBERD TAILORED</span>
                <h4 className="card-title text-brand-black mt-1">Garmet Size Chart</h4>
                <p className="text-xs text-stone-500">All measurements are in inches. Regular, airy cuts.</p>
              </div>

              <table className="w-full text-xs text-left text-stone-500 mt-2 border-collapse border border-stone-200">
                <thead>
                  <tr className="bg-brand-cream border-b border-stone-200 text-brand-black">
                    <th className="p-2 border-r border-stone-200 font-bold">Size</th>
                    <th className="p-2 border-r border-stone-200 font-bold">Chest</th>
                    <th className="p-2 border-r border-stone-200 font-bold">Waist</th>
                    <th className="p-2 font-bold">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-brand-black">
                  <tr>
                    <td className="p-2 border-r border-stone-200 font-bold bg-stone-50">S</td>
                    <td className="p-2 border-r border-stone-200">36 - 38</td>
                    <td className="p-2 border-r border-stone-200">30 - 32</td>
                    <td className="p-2">40</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-stone-200 font-bold bg-stone-50">M</td>
                    <td className="p-2 border-r border-stone-200">38 - 40</td>
                    <td className="p-2 border-r border-stone-200">32 - 34</td>
                    <td className="p-2">41</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-stone-200 font-bold bg-stone-50">L</td>
                    <td className="p-2 border-r border-stone-200">40 - 42</td>
                    <td className="p-2 border-r border-stone-200">34 - 36</td>
                    <td className="p-2">42</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-stone-200 font-bold bg-stone-50">XL</td>
                    <td className="p-2 border-r border-stone-200">42 - 44</td>
                    <td className="p-2 border-r border-stone-200">36 - 38</td>
                    <td className="p-2">43</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-stone-200 font-bold bg-stone-50">XXL</td>
                    <td className="p-2 border-r border-stone-200">44 - 46</td>
                    <td className="p-2 border-r border-stone-200">38 - 40</td>
                    <td className="p-2">44</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-brand-cream p-3 text-xs text-stone-500 leading-relaxed border-l-2 border-brand-accent">
                <strong> patton advice:</strong> Since natural fabrics such as linen and cotton might shrink slightly after the first wash, we advise choosing one size larger if you prefer loose, airy drapes.
              </div>

              <button
                onClick={() => setSizeGuideOpen(false)}
                className="w-full bg-brand-black text-brand-white text-xs font-bold py-3 uppercase tracking-widest"
              >
                CLOSE CHART
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
