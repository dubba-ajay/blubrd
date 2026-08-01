import React, { useState } from 'react';
import { useStore } from '../store';
import { BLOG_POSTS } from '../data/products';
import ProductCard from './ProductCard';
import { ShoppingBag, Heart, Trash, ArrowRight, ArrowLeft, Lock, FileText, X, Tag, Smartphone, CreditCard, Landmark, Truck, QrCode } from 'lucide-react';
import { apiClient } from '../api/client';
import { PLACEHOLDERS } from '../constants/placeholders';

// ==========================================
// 1. WISHLIST VIEW
// ==========================================
export function WishlistView() {
  const { wishlist, navigate, products } = useStore();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div id="wishlist-view" className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-6 font-sans">
      <button 
        onClick={() => navigate('shop')} 
        className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-black transition-colors font-sans text-xs font-bold tracking-wider uppercase cursor-pointer"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="border-b border-stone-200 pb-4">
        <h1 className="page-title text-brand-black">Your Wishlist</h1>
        <p className="text-xs text-stone-500 mt-1">Saved items you are watching on the weavers' looms.</p>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center text-brand-accent mx-auto">
            <Heart size={28} />
          </div>
          <h3 className="product-title font-medium text-brand-black">Your wishlist is empty</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">Explore the catalog and save garments with the heart button.</p>
          <button
            onClick={() => navigate('shop')}
            className="bg-brand-black text-brand-white text-xs font-semibold tracking-widest uppercase py-3 px-8 hover:bg-brand-accent hover:text-brand-black transition-colors rounded-none"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. SHOPPING BAG / CART VIEW
// ==========================================
export function CartView() {
  const { cart, cartTotal, updateCartQuantity, removeFromCart, navigate } = useStore();
  const [couponCode, setCouponCode] = useState(() => localStorage.getItem('thebluberd_coupon_code') || '');
  const [discount, setDiscount] = useState(() => Number(localStorage.getItem('thebluberd_coupon_discount')) || 0);
  const [couponApplied, setCouponApplied] = useState(() => !!localStorage.getItem('thebluberd_coupon_code'));
  const [couponError, setCouponError] = useState('');
  const [customPromoInput, setCustomPromoInput] = useState('');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  const handleApplyCoupon = async (code: string) => {
    setCouponError('');
    const upperCode = code.toUpperCase().trim();
    if (!upperCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      const res = await apiClient.post('/coupons/validate', {
        code: upperCode,
        subtotal: cartTotal
      });
      
      if (res.valid) {
        setDiscount(res.discountAmount);
        setCouponApplied(true);
        setCouponCode(upperCode);
        localStorage.setItem('thebluberd_coupon_code', upperCode);
        localStorage.setItem('thebluberd_coupon_discount', String(res.discountAmount));
      } else {
        setCouponError(res.error || 'Invalid coupon code.');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon.');
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCouponApplied(false);
    setCouponCode('');
    setCouponError('');
    localStorage.removeItem('thebluberd_coupon_code');
    localStorage.removeItem('thebluberd_coupon_discount');
  };

  // Re-calculate discount when cart total changes
  React.useEffect(() => {
    if (couponApplied && couponCode) {
      const upperCode = couponCode.toUpperCase().trim();
      let calculatedDiscount = 0;
      if (upperCode === 'WELCOME10') {
        calculatedDiscount = Math.round(cartTotal * 0.10);
      } else if (upperCode === 'FASHION40') {
        calculatedDiscount = Math.round(cartTotal * 0.40);
      } else if (upperCode === 'FESTIVE20') {
        if (cartTotal >= 3000) {
          calculatedDiscount = Math.round(cartTotal * 0.20);
        } else {
          // No longer valid
          handleRemoveCoupon();
          return;
        }
      } else if (upperCode === 'PROMO15') {
        calculatedDiscount = Math.round(cartTotal * 0.15);
      } else if (upperCode === 'ARTISAN50') {
        calculatedDiscount = Math.round(cartTotal * 0.50);
      } else if (upperCode === 'GIFT500') {
        calculatedDiscount = Math.min(500, cartTotal);
      } else if (upperCode === 'GIFTCARD1000') {
        calculatedDiscount = Math.min(1000, cartTotal);
      }
      setDiscount(calculatedDiscount);
      localStorage.setItem('thebluberd_coupon_discount', String(calculatedDiscount));
    }
  }, [cartTotal]);

  const shippingCost = cartTotal > 999 ? 0 : 99;
  const discountedSubtotal = Math.max(0, cartTotal - discount);
  const gst = Math.round(discountedSubtotal * 0.18); // 18% GST
  const serviceTax = Math.round(discountedSubtotal * 0.05); // 5% Service Tax
  const grandTotal = discountedSubtotal + gst + serviceTax + shippingCost;

  const { coupons } = useStore();

  // List of active coupons from database
  const availableCouponsList = coupons.filter(c => c.isActive).map(c => ({
    code: c.code,
    label: c.description || `${c.discountPercentage}% OFF`,
    desc: c.description || `${c.discountPercentage}% off campaign`,
    type: 'percentage' as const,
    value: c.discountPercentage,
    minSpend: c.minSpend
  }));

  return (
    <div id="cart-view" className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-6 font-sans pb-32 text-left">

      <div className="text-left">
        <button 
          onClick={() => navigate('shop')} 
          className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-black transition-colors font-sans text-xs font-bold tracking-wider uppercase cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="border-b border-stone-200 pb-4">
        <h1 className="page-title text-brand-black">Your Shopping Bag</h1>
        <p className="text-xs text-stone-500 mt-1">Review your selections before heading to our secure checkouts.</p>
      </div>

      {cart.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center text-brand-accent mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h3 className="product-title font-medium text-brand-black">Your bag is empty</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto"> Patrons of craft can begin by viewing our latest arrivals.</p>
          <button
            onClick={() => navigate('shop')}
            className="bg-brand-black text-brand-white text-xs font-semibold tracking-widest uppercase py-3.5 px-8 hover:bg-brand-accent hover:text-brand-black transition-colors rounded-none"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* List of Cart items on left (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 md:gap-6 border-b border-stone-200 pb-6 items-center">
                  
                  {/* Image */}
                  <div className="w-24 h-24 bg-brand-cream overflow-hidden cursor-pointer shrink-0" onClick={() => navigate('product', { id: item.product.id })}>
                    <img
                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="product-title text-brand-black truncate cursor-pointer hover:text-brand-accent" onClick={() => navigate('product', { id: item.product.id })}>
                        {item.product.name}
                      </h3>
                      <span className="text-sm font-sans font-bold text-brand-black">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-xs text-brand-accent font-sans font-medium uppercase tracking-wider">{item.product.brand}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 pt-1">
                      <span>Selected Size: <strong className="text-brand-black">{item.selectedSize}</strong></span>
                      <span className="flex items-center gap-2">
                        Color: 
                        <span className="w-3 h-3 rounded-full border border-stone-300 shadow-2xs shrink-0" style={{ backgroundColor: item.selectedColor }} />
                        <strong className="text-brand-black">
                          {item.product.colors?.find(c => c.value === item.selectedColor)?.name || item.selectedColor}
                        </strong>
                      </span>
                    </div>

                    {/* Quantity Stepper / Delete button row */}
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center border border-stone-200 bg-brand-white">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-stone-500 hover:bg-stone-50"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-4 text-xs font-sans font-bold text-brand-black">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-stone-500 hover:bg-stone-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 text-xs font-semibold tracking-wider flex items-center gap-1 py-1"
                      >
                        <Trash size={14} /> REMOVE
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* PROMOCODE & COUPONS BLOCK */}
            <div className="bg-white border border-stone-200 p-6 space-y-5 text-left shadow-xs">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#a16207] transform -rotate-45" />
                <h3 className="font-sans font-bold text-sm text-stone-800 tracking-wider uppercase">
                  PROMOCODE & COUPONS
                </h3>
              </div>

              {couponApplied ? (
                <div className="bg-rose-50/20 border border-rose-100/50 p-4 flex items-center justify-between text-left">
                  <div className="space-y-1">
                    <span className="text-xs font-sans font-extrabold text-brand-accent uppercase tracking-widest block">ACTIVE COUPON</span>
                    <p className="text-sm font-mono font-bold text-brand-black">{couponCode}</p>
                    <p className="text-xs text-emerald-600 font-bold">
                      Saved ₹{discount.toLocaleString('en-IN')} on your order
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-rose-500 hover:text-rose-700 font-sans font-bold text-xs uppercase tracking-wider underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={PLACEHOLDERS.COUPON.PROMO_CODE}
                      value={customPromoInput}
                      onChange={(e) => setCustomPromoInput(e.target.value)}
                      className="flex-grow bg-white border border-stone-200 px-4 py-3 text-xs uppercase tracking-wider focus:outline-none focus:border-brand-accent h-11"
                    />
                    <button
                      onClick={() => {
                        handleApplyCoupon(customPromoInput);
                        setCustomPromoInput('');
                      }}
                      className="bg-[#2a1e17] text-white hover:bg-brand-accent hover:text-brand-black text-xs font-bold px-6 transition-all h-11 uppercase tracking-wider cursor-pointer font-sans"
                    >
                      APPLY
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-600 text-xs font-medium font-sans">{couponError}</p>
                  )}
                  
                  {/* Quick Click Coupon Chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { code: 'FASHION40', desc: '40% OFF' },
                      { code: 'ARTISAN50', desc: '50% OFF' },
                      { code: 'WELCOME10', desc: '10% OFF' },
                      { code: 'GIFTCARD1000', desc: '₹1K OFF' }
                    ].map((cp) => (
                      <button
                        key={cp.code}
                        onClick={() => handleApplyCoupon(cp.code)}
                        className="bg-brand-cream/40 border border-stone-200 hover:border-brand-accent px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-950 rounded-xs transition-colors cursor-pointer font-sans"
                      >
                        {cp.code} ({cp.desc})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Checkout Bag Summary Panel on right */}
          <div className="bg-brand-cream p-6 border border-stone-200/60 space-y-6">
            <h3 className="product-title font-bold text-brand-black border-b border-stone-200 pb-3">Bag Summary</h3>
            
            <div className="space-y-3.5 text-xs font-sans text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-brand-black">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-stone-200/50 pt-2 text-xs text-stone-500 font-medium">
                <span>Net Taxable Amount</span>
                <span>₹{discountedSubtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span className="font-semibold text-brand-black">₹{gst.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>Retail & Service Tax (5%)</span>
                <span className="font-semibold text-brand-black">₹{serviceTax.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{shippingCost === 0 ? <strong className="text-green-700 uppercase font-bold">FREE (above ₹999)</strong> : `₹${shippingCost}`}</span>
              </div>

              {shippingCost > 0 && (
                <p className="text-xs text-stone-400">Add ₹{999 - cartTotal} more to qualify for Free Shipping.</p>
              )}

              <div className="flex justify-between text-base font-sans font-bold text-brand-black border-t border-stone-200 pt-4">
                <span>Estimated Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout buttons */}
            <button
              onClick={() => navigate('checkout')}
              className="w-full bg-brand-black text-brand-white hover:bg-brand-accent hover:text-brand-black text-xs font-sans font-bold tracking-widest py-4 transition-colors rounded-none flex items-center justify-center gap-2.5 shadow-md uppercase"
            >
              PROCEED TO CHECKOUT <ArrowRight size={14} />
            </button>

            <div className="bg-brand-white p-3.5 border border-stone-100 space-y-2">
              <span className="text-xs font-sans font-bold text-brand-accent tracking-widest uppercase block">SECURE TRANSACTIONS</span>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your data is fully protected with premium encryption standards. All shipments are insured and tracked.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* MYNTRA-STYLE COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setIsCouponModalOpen(false)}>
          <div 
            className="bg-white w-full sm:max-w-md md:max-w-lg overflow-hidden border-t sm:border border-stone-200 shadow-2xl flex flex-col h-[80vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-none animate-slide-up-mobile sm:animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-stone-100 bg-stone-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-rose-500 transform -rotate-45" />
                <h3 className="product-title text-stone-800">Apply Coupon</h3>
              </div>
              <button 
                onClick={() => {
                  setIsCouponModalOpen(false);
                  setCouponError('');
                }}
                className="p-1.5 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-grow">
              {/* Promo input field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs sm:text-xs font-sans font-extrabold text-stone-400 tracking-widest uppercase">Enter Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={PLACEHOLDERS.COUPON.PROMO_CODE_HINT}
                    value={customPromoInput}
                    onChange={(e) => setCustomPromoInput(e.target.value)}
                    className="flex-grow bg-white border border-stone-300 px-3 sm:px-4 py-2 sm:py-3 text-xs font-sans uppercase tracking-wider focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 rounded-none h-10 sm:h-11"
                  />
                  <button
                    onClick={() => {
                      handleApplyCoupon(customPromoInput);
                      setCustomPromoInput('');
                    }}
                    className="bg-brand-black text-brand-white hover:bg-rose-600 text-xs font-sans font-bold tracking-widest px-4 sm:px-6 py-2 sm:py-3 transition-colors rounded-none uppercase shrink-0 h-10 sm:h-11 cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-600 text-xs sm:text-xs font-sans font-semibold bg-red-50 border border-red-100 p-2 sm:p-2.5">{couponError}</p>
                )}
              </div>

              {/* Coupon Status or Applied Info */}
              {couponApplied && (
                <div className="bg-emerald-50/40 border border-emerald-500/30 p-3 sm:p-4 flex items-center justify-between text-left rounded-none">
                  <div className="space-y-0.5">
                    <span className="text-xs sm:text-xs font-sans font-extrabold text-emerald-800 uppercase tracking-widest block">CURRENTLY APPLIED</span>
                    <p className="text-xs sm:text-sm font-sans font-bold text-emerald-800 font-mono">
                      {couponCode}
                    </p>
                    <p className="text-xs sm:text-xs font-sans text-stone-500">
                      Saving <strong className="font-bold text-emerald-700">₹{discount.toLocaleString('en-IN')}</strong> on this order
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleRemoveCoupon();
                    }}
                    className="text-rose-500 hover:text-rose-700 font-sans font-extrabold text-xs hover:underline transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Available Coupons title */}
              <div className="border-t border-stone-100 pt-4 text-left">
                <h4 className="text-xs sm:text-xs font-sans font-extrabold text-stone-400 tracking-wider uppercase mb-3">
                  Available Coupons
                </h4>

                <div className="space-y-3">
                  {availableCouponsList.map((cp) => {
                    const isCurrent = couponCode === cp.code;
                    
                    // Calculate potential discount
                    let potentialDiscount = 0;
                    if (cp.type === 'percentage') {
                      potentialDiscount = Math.round(cartTotal * (cp.value / 100));
                    } else {
                      potentialDiscount = Math.min(cp.value, cartTotal);
                    }

                    const isDisabled = cp.minSpend ? cartTotal < cp.minSpend : false;

                    return (
                      <div 
                        key={cp.code} 
                        className={`border p-3.5 sm:p-4.5 transition-all duration-300 text-left flex flex-col justify-between rounded-none ${
                          isCurrent 
                            ? 'border-emerald-600 bg-emerald-50/10' 
                            : isDisabled
                              ? 'border-stone-200 bg-stone-50/50 opacity-60'
                              : 'border-stone-200 bg-stone-50/30 hover:border-stone-400'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <span className="font-sans font-extrabold text-xs sm:text-xs bg-stone-100 border border-stone-200 text-brand-black px-2 py-0.5 sm:py-1 rounded-none inline-block mb-1 sm:mb-2 uppercase tracking-wider">
                              {cp.code}
                            </span>
                            <span className="font-sans font-bold text-xs text-stone-800 block uppercase tracking-wide truncate">
                              {cp.label}
                            </span>
                          </div>
                          <span className="text-xs font-sans text-emerald-700 font-extrabold shrink-0">
                            {isDisabled ? `Unlock at ₹${cp.minSpend?.toLocaleString('en-IN')}` : `Save ₹${potentialDiscount.toLocaleString('en-IN')}`}
                          </span>
                        </div>

                        <p className="text-xs sm:text-xs text-stone-500 leading-relaxed mt-1.5">{cp.desc}</p>
                        {cp.minSpend && (
                          <p className="text-xs sm:text-xs text-brand-accent font-medium font-sans mt-1">Min Spend: ₹{cp.minSpend.toLocaleString('en-IN')}</p>
                        )}

                        <div className="border-t border-stone-100 mt-2.5 pt-2 flex items-center justify-end">
                          {isCurrent ? (
                            <span className="text-xs sm:text-xs font-sans font-bold text-emerald-600 uppercase tracking-widest">
                              ✓ APPLIED
                            </span>
                          ) : (
                            <button
                              disabled={isDisabled}
                              onClick={() => {
                                handleApplyCoupon(cp.code);
                                setCouponError('');
                              }}
                              className={`text-xs sm:text-xs font-sans font-bold uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 transition-all cursor-pointer ${
                                isDisabled
                                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                  : 'bg-brand-black text-brand-white hover:bg-rose-500 hover:text-white'
                              }`}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-t border-stone-100 bg-stone-50/50 flex justify-end shrink-0">
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="w-full sm:w-auto bg-brand-black text-brand-white hover:bg-stone-800 font-sans font-bold text-xs tracking-widest uppercase px-6 py-3 sm:py-2.5 cursor-pointer text-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. SECURE CHECKOUT VIEW
// ==========================================
export function CheckoutView() {
  const { cart, cartTotal, clearCart, navigate, user, syncOrders, coupons } = useStore();

  const [checkoutStep, setCheckoutStep] = useState<'shipping' | 'payment_method' | 'processing' | 'otp_verification'>('shipping');
  const [checkoutError, setCheckoutError] = useState('');

  // Interface for saved addresses
  interface AddressItem {
    id: string;
    tag?: string; // "HOME", "WORK", "OFFICE", "OTHER"
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    phone: string;
    country: string;
  }

  // Address Manager States
  const [savedAddresses, setSavedAddresses] = useState<AddressItem[]>(() => {
    const stored = localStorage.getItem('thebluberd_saved_addresses');
    if (stored) return JSON.parse(stored);
    
    // Default address if user profile has details
    if (user?.name && user?.address) {
      return [{
        id: 'default',
        tag: 'HOME',
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || '',
        zip: user.zip || '',
        phone: user.mobile || user.phone || '',
        country: 'India'
      }];
    }
    return [];
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const stored = localStorage.getItem('thebluberd_selected_address_id');
    if (stored) return stored;
    return savedAddresses.length > 0 ? savedAddresses[0].id : '';
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form states for temporary input (when creating or editing)
  const [addressForm, setAddressForm] = useState({
    tag: 'HOME',
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    country: 'India'
  });

  // Simulated UPI application overlay states
  const [simulatedUpiApp, setSimulatedUpiApp] = useState<string | null>(null);
  const [simulatedUpiStep, setSimulatedUpiStep] = useState<'pin' | 'processing' | 'success'>('pin');
  const [simulatedPin, setSimulatedPin] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    zip: user?.zip || '',
    phone: user?.mobile || user?.phone || '',
    country: 'India',
    payment: 'upi'
  });

  // Save changes to localStorage whenever savedAddresses changes
  React.useEffect(() => {
    localStorage.setItem('thebluberd_saved_addresses', JSON.stringify(savedAddresses));
    if (savedAddresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(savedAddresses[0].id);
    }
  }, [savedAddresses]);

  React.useEffect(() => {
    if (selectedAddressId) {
      localStorage.setItem('thebluberd_selected_address_id', selectedAddressId);
      const activeAddr = savedAddresses.find(a => a.id === selectedAddressId);
      if (activeAddr) {
        setForm(prev => ({
          ...prev,
          name: activeAddr.name,
          email: activeAddr.email,
          address: activeAddr.address,
          city: activeAddr.city,
          zip: activeAddr.zip,
          phone: activeAddr.phone,
          country: activeAddr.country
        }));
      }
    }
  }, [selectedAddressId, savedAddresses]);

  React.useEffect(() => {
    if (user && savedAddresses.length === 0) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || '',
        zip: prev.zip || user.zip || '',
        phone: prev.phone || user.mobile || user.phone || '',
        country: prev.country || 'India'
      }));
    }
  }, [user, savedAddresses]);

  // Coupon / Promo / Gift Card / Offer Code State (initialized from Shopping Bag)
  const [promoCode, setPromoCode] = useState(() => localStorage.getItem('thebluberd_coupon_code') || '');
  const [discount, setDiscount] = useState(() => Number(localStorage.getItem('thebluberd_coupon_discount')) || 0);
  const [promoApplied, setPromoApplied] = useState(() => !!localStorage.getItem('thebluberd_coupon_code'));
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const checkoutShippingCost = cartTotal > 999 ? 0 : 99;
  const checkoutDiscountedSubtotal = Math.max(0, cartTotal - discount);
  const checkoutGst = Math.round(checkoutDiscountedSubtotal * 0.18);
  const checkoutServiceTax = Math.round(checkoutDiscountedSubtotal * 0.05);
  const finalDiscountedTotal = checkoutDiscountedSubtotal + checkoutGst + checkoutServiceTax + checkoutShippingCost;

  // Selected Bank state for Net Banking option
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [netbankingUserId, setNetbankingUserId] = useState('');
  const [netbankingPassword, setNetbankingPassword] = useState('');

  // Card details state
  const [cardDetails, setCardDetails] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  });

  // UPI sub-options state
  const [upiSubOption, setUpiSubOption] = useState<'paytm' | 'phonepe' | 'gpay' | 'amazonpay' | 'other'>('paytm');
  const [upiMobileNumber, setUpiMobileNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isUpiVerifying, setIsUpiVerifying] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Processing visual states
  const [processingPercent, setProcessingPercent] = useState(0);
  const [processingMsg, setProcessingMsg] = useState('');

  // Local state for applying custom promo code inside the Checkout sidebar
  const [customCheckoutPromoInput, setCustomCheckoutPromoInput] = useState('');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // List of active coupons from database
  const availableCouponsList = (coupons || []).filter(c => c.isActive).map(c => ({
    code: c.code,
    label: c.description || `${c.discountPercentage}% OFF`,
    desc: c.description || `${c.discountPercentage}% off campaign`,
    type: 'percentage' as const,
    value: c.discountPercentage,
    minSpend: c.minSpend
  }));

  const handleCheckoutApplyCoupon = async (code: string) => {
    setPromoError('');
    setPromoSuccess('');
    const upperCode = code.toUpperCase().trim();
    if (!upperCode) {
      setPromoError('Please enter a coupon code.');
      return;
    }

    try {
      const res = await apiClient.post('/coupons/validate', {
        code: upperCode,
        subtotal: cartTotal
      });
      
      if (res.valid) {
        setDiscount(res.discountAmount);
        setPromoApplied(true);
        setPromoCode(upperCode);
        setPromoSuccess(`Coupon ${upperCode} applied successfully!`);
        localStorage.setItem('thebluberd_coupon_code', upperCode);
        localStorage.setItem('thebluberd_coupon_discount', String(res.discountAmount));
      } else {
        setPromoError(res.error || 'Invalid coupon code.');
      }
    } catch (err: any) {
      setPromoError(err.message || 'Failed to validate coupon.');
    }
  };

  const handleCheckoutRemoveCoupon = () => {
    setDiscount(0);
    setPromoApplied(false);
    setPromoCode('');
    setPromoError('');
    setPromoSuccess('');
    localStorage.removeItem('thebluberd_coupon_code');
    localStorage.removeItem('thebluberd_coupon_discount');
  };

  React.useEffect(() => {
    if (promoApplied && promoCode) {
      const upperCode = promoCode.toUpperCase().trim();
      let calculatedDiscount = 0;
      if (upperCode === 'WELCOME10') {
        calculatedDiscount = Math.round(cartTotal * 0.10);
      } else if (upperCode === 'FASHION40') {
        calculatedDiscount = Math.round(cartTotal * 0.40);
      } else if (upperCode === 'FESTIVE20') {
        if (cartTotal >= 3000) {
          calculatedDiscount = Math.round(cartTotal * 0.20);
        } else {
          handleCheckoutRemoveCoupon();
          return;
        }
      } else if (upperCode === 'PROMO15') {
        calculatedDiscount = Math.round(cartTotal * 0.15);
      } else if (upperCode === 'ARTISAN50') {
        calculatedDiscount = Math.round(cartTotal * 0.50);
      } else if (upperCode === 'GIFT500') {
        calculatedDiscount = Math.min(500, cartTotal);
      } else if (upperCode === 'GIFTCARD1000') {
        calculatedDiscount = Math.min(1000, cartTotal);
      }
      setDiscount(calculatedDiscount);
      localStorage.setItem('thebluberd_coupon_discount', String(calculatedDiscount));
    }
  }, [cartTotal]);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <h3 className="section-title">Your bag is empty</h3>
        <p className="text-xs text-stone-500">Please add products to your cart before proceeding to checkout.</p>
        <button onClick={() => navigate('shop')} className="bg-brand-black text-brand-white px-6 py-3 text-xs tracking-widest uppercase">SHOP NOW</button>
      </div>
    );
  }

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'number') {
      const sanitized = value.replace(/\D/g, '').slice(0, 16);
      const formatted = sanitized.match(/.{1,4}/g)?.join(' ') || sanitized;
      setCardDetails({ ...cardDetails, number: formatted });
    } else if (name === 'expiry') {
      let sanitized = value.replace(/\D/g, '').slice(0, 4);
      if (sanitized.length >= 2) {
        sanitized = sanitized.slice(0, 2) + '/' + sanitized.slice(2);
      }
      setCardDetails({ ...cardDetails, expiry: sanitized });
    } else if (name === 'cvv') {
      setCardDetails({ ...cardDetails, cvv: value.replace(/\D/g, '').slice(0, 3) });
    } else {
      setCardDetails({ ...cardDetails, [name]: value });
    }
  };

  // Simulating VPA check
  const handleVerifyUpi = () => {
    setCheckoutError('');
    if (!upiId || !upiId.includes('@')) {
      setCheckoutError('Please enter a valid UPI ID (e.g., username@bank)');
      return;
    }
    setIsUpiVerifying(true);
    setTimeout(() => {
      setIsUpiVerifying(false);
      setUpiVerified(true);
    }, 1500);
  };

  // Save or edit address in Address Manager
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    const isEditing = editingAddressId !== null;
    const isAdding = isAddingNew;
    const activeForm = (isAdding || isEditing || savedAddresses.length === 0) ? addressForm : { ...form, tag: 'HOME' };

    if (!activeForm.name || !activeForm.email || !activeForm.address || !activeForm.phone || !activeForm.city || !activeForm.zip) {
      setCheckoutError('Please fill out all mandatory fields.');
      return;
    }

    const cleanZip = activeForm.zip.replace(/\D/g, '');
    if (cleanZip.length !== 6) {
      setCheckoutError('Please enter a valid 6-digit PIN Code.');
      return;
    }

    if (isEditing) {
      // Editing existing address
      setSavedAddresses(prev => prev.map(addr => {
        if (addr.id === editingAddressId) {
          return {
            ...addr,
            tag: activeForm.tag || 'HOME',
            name: activeForm.name,
            email: activeForm.email,
            address: activeForm.address,
            city: activeForm.city,
            zip: activeForm.zip,
            phone: activeForm.phone,
            country: activeForm.country
          };
        }
        return addr;
      }));
      setEditingAddressId(null);
    } else {
      // Adding new address (or first address)
      const newId = `addr-${Date.now()}`;
      const newAddressItem = {
        id: newId,
        tag: activeForm.tag || 'HOME',
        name: activeForm.name,
        email: activeForm.email,
        address: activeForm.address,
        city: activeForm.city,
        zip: activeForm.zip,
        phone: activeForm.phone,
        country: activeForm.country
      };
      setSavedAddresses(prev => [...prev, newAddressItem]);
      setSelectedAddressId(newId);
      setIsAddingNew(false);
    }

    // Reset temporary form
    setAddressForm({
      tag: 'HOME',
      name: '',
      email: '',
      address: '',
      city: '',
      zip: '',
      phone: '',
      country: 'India'
    });
  };

  const handleDeleteAddress = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    if (selectedAddressId === id) {
      setSelectedAddressId(updated.length > 0 ? updated[0].id : '');
    }
    if (updated.length === 0) {
      setIsAddingNew(true);
      setEditingAddressId(null);
      setAddressForm({
        tag: 'HOME',
        name: '',
        email: '',
        address: '',
        city: '',
        zip: '',
        phone: '',
        country: 'India'
      });
    }
  };

  const handleStartEdit = (addr: AddressItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingAddressId(addr.id);
    setAddressForm({
      tag: addr.tag || 'HOME',
      name: addr.name,
      email: addr.email,
      address: addr.address,
      city: addr.city,
      zip: addr.zip,
      phone: addr.phone,
      country: addr.country
    });
  };

  const handleStartAddNew = () => {
    setIsAddingNew(true);
    setEditingAddressId(null);
    setAddressForm({
      tag: 'HOME',
      name: '',
      email: '',
      address: '',
      city: '',
      zip: '',
      phone: '',
      country: 'India'
    });
  };

  const handleProceedToPaymentFromSaved = () => {
    setCheckoutError('');
    if (!selectedAddressId) {
      setCheckoutError('Please select a delivery address or add a new one.');
      return;
    }
    const activeAddr = savedAddresses.find(a => a.id === selectedAddressId);
    if (!activeAddr) {
      setCheckoutError('Selected address not found.');
      return;
    }
    if (activeAddr.zip.replace(/\D/g, '').length !== 6) {
      setCheckoutError('Selected address does not have a valid 6-digit PIN Code.');
      return;
    }
    setCheckoutStep('payment_method');
  };

  const executeActualUpiOrder = async () => {
    setCheckoutStep('processing');
    setProcessingPercent(20);
    setProcessingMsg('Connecting to secure banking rails...');

    try {
      const mappedItems = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor
      }));

      // Create pending order on Postgres backend
      const createRes = await apiClient.post('/orders/create', {
        customerName: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: `${form.address}, ${form.city} - ${form.zip}, ${form.country}`,
        items: mappedItems,
        couponCode: promoCode || undefined,
        claimedTotal: finalDiscountedTotal
      });

      setProcessingPercent(60);
      setProcessingMsg('Authenticating payment signature...');

      // Finalize and verify payment on Postgres backend
      const verifyRes = await apiClient.post('/orders/verify-payment', {
        orderId: createRes.gatewayOrderId,
        customerName: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: `${form.address}, ${form.city} - ${form.zip}, ${form.country}`,
        total: finalDiscountedTotal,
        paymentMethod: 'UPI',
        items: mappedItems,
        couponCode: promoCode || undefined,
        gatewayPaymentId: `pay_${Math.floor(100000 + Math.random() * 900000)}`,
        gatewaySignature: 'mock_sig_ok'
      });

      setProcessingPercent(100);
      setProcessingMsg('Payment validated! Finalizing artisan order transmission...');
      
      setTimeout(async () => {
        await syncOrders();
        completeOrderTransmission({
          id: verifyRes.order?.id,
          trackingId: verifyRes.order?.trackingId,
          estimatedDelivery: verifyRes.order?.estimatedDelivery
        });
      }, 800);

    } catch (err: any) {
      setCheckoutStep('payment_method');
      setCheckoutError(err.message || 'Relaying payment failed.');
    }
  };

  // Placing order and executing processing sequence
  const startPaymentProcessing = async () => {
    setCheckoutError('');
    if (form.payment === 'card') {
      if (cardDetails.number.replace(/\s/g, '').length < 16 || !cardDetails.holder || cardDetails.expiry.length < 5 || cardDetails.cvv.length < 3) {
        setCheckoutError('Please fill out complete and valid card credentials.');
        return;
      }
    }
    if (form.payment === 'netbanking') {
      if (!selectedBank) {
        setCheckoutError('Please select your preferred bank.');
        return;
      }
    }

    setCheckoutStep('processing');
    setProcessingPercent(15);
    setProcessingMsg('Connecting to secure payment gateway...');

    try {
      const mappedItems = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor
      }));

      if (form.payment === 'cod') {
        // Create pending order on Postgres backend
        const createRes = await apiClient.post('/orders/create', {
          customerName: form.name,
          email: form.email,
          phone: form.phone || undefined,
          address: `${form.address}, ${form.city} - ${form.zip}, ${form.country}`,
          items: mappedItems,
          couponCode: promoCode || undefined,
          claimedTotal: finalDiscountedTotal
        });

        setProcessingPercent(60);
        setProcessingMsg('Artisan order registered on looms...');

        // Finalize order as COD
        const verifyRes = await apiClient.post('/orders/verify-payment', {
          orderId: createRes.gatewayOrderId,
          customerName: form.name,
          email: form.email,
          phone: form.phone || undefined,
          address: `${form.address}, ${form.city} - ${form.zip}, ${form.country}`,
          total: finalDiscountedTotal,
          paymentMethod: 'COD',
          items: mappedItems,
          couponCode: promoCode || undefined,
          gatewayPaymentId: `pay_cod_${Math.floor(100000 + Math.random() * 900000)}`,
          gatewaySignature: 'mock_sig_ok'
        });

        setProcessingPercent(100);
        setProcessingMsg('COD Registration complete!');

        setTimeout(async () => {
          await syncOrders();
          completeOrderTransmission({
            id: verifyRes.order?.id,
            trackingId: verifyRes.order?.trackingId || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}-COD`,
            estimatedDelivery: verifyRes.order?.estimatedDelivery || new Date(Date.now() + 3600000 * 24 * 5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          });
        }, 800);
        return;
      }

      // Create pending order on Postgres backend
      const createRes = await apiClient.post('/orders/create', {
        customerName: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: `${form.address}, ${form.city} - ${form.zip}, ${form.country}`,
        items: mappedItems,
        couponCode: promoCode || undefined,
        claimedTotal: finalDiscountedTotal
      });

      setProcessingPercent(50);
      setProcessingMsg('Securing network handshakes...');

      // Finalize and verify payment on Postgres backend
      const verifyRes = await apiClient.post('/orders/verify-payment', {
        orderId: createRes.gatewayOrderId,
        customerName: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: `${form.address}, ${form.city} - ${form.zip}, ${form.country}`,
        total: finalDiscountedTotal,
        paymentMethod: form.payment.toUpperCase(),
        items: mappedItems,
        couponCode: promoCode || undefined,
        gatewayPaymentId: `pay_${Math.floor(100000 + Math.random() * 900000)}`,
        gatewaySignature: 'mock_sig_ok'
      });

      setProcessingPercent(100);
      setProcessingMsg('Payment validated! Finalizing artisan order transmission...');

      setTimeout(async () => {
        await syncOrders();
        completeOrderTransmission({
          id: verifyRes.order?.id,
          trackingId: verifyRes.order?.trackingId,
          estimatedDelivery: verifyRes.order?.estimatedDelivery
        });
      }, 800);

    } catch (err: any) {
      setCheckoutStep('payment_method');
      setCheckoutError(err.message || 'Connecting to payment backend failed. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    completeOrderTransmission();
  };

  const completeOrderTransmission = (shippingInfo?: any) => {
    const finalOrderId = shippingInfo?.id || `ODR-${Math.floor(1000000 + Math.random() * 9000000)}-IN`;
    
    // Save as latest order for confirmation screen
    const newOrderForConfirmation = {
      orderId: finalOrderId,
      customerName: form.name,
      email: form.email,
      address: `${form.address}, ${form.city} - ${form.zip}, ${form.country}`,
      phone: form.phone,
      total: finalDiscountedTotal,
      items: cart,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      trackingId: shippingInfo?.trackingId || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}-DEL`,
      estimatedDelivery: shippingInfo?.estimatedDelivery || new Date(Date.now() + 3600000 * 24 * 4).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      paymentMethod: form.payment.toUpperCase(),
    };

    localStorage.setItem('thebluberd_latest_order', JSON.stringify(newOrderForConfirmation));

    clearCart();
    // Redirect directly to My Orders on the account page to see premium invoice, cancellations, tracking
    navigate('account');
  };

  const renderCheckoutOrderSummary = (isPaymentStep: boolean) => (
    <div className="bg-white border border-[#e8e8e8] rounded-[14px] p-4 sm:p-6 text-left lg:sticky lg:top-6 space-y-4 sm:space-y-5 shadow-xs overflow-hidden">
      <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
        <h3 className="font-sans font-bold text-sm text-brand-black uppercase tracking-wider">Order Summary</h3>
        <span className="text-xs text-stone-500 font-semibold">{cart.length} {cart.length === 1 ? 'Item' : 'Items'}</span>
      </div>

      {/* Cart Items List Preview */}
      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {cart.map((item, idx) => (
          <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="flex items-center gap-3 text-xs">
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              className="w-12 h-14 object-cover rounded-xs border border-stone-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-brand-black truncate">{item.product.name}</p>
              <p className="text-stone-500 text-[11px]">
                Size: <strong className="text-stone-800">{item.selectedSize}</strong> | Qty: <strong className="text-stone-800">{item.quantity}</strong>
              </p>
              <p className="font-semibold text-brand-black mt-0.5">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-stone-100" />

      {/* COUPON & PROMO CODE BOX */}
      <div className="bg-stone-50/80 border border-dashed border-stone-300 p-3 sm:p-3.5 space-y-2.5 text-left rounded-[10px] min-w-0 overflow-hidden">
        <div className="flex items-center justify-between gap-1 border-b border-stone-200/60 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider min-w-0">
            <Tag size={13} className="text-rose-500 transform -rotate-45 shrink-0" />
            <span className="truncate">Coupons & Offers</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCouponModalOpen(true)}
            className="text-[10px] sm:text-[11px] font-sans font-extrabold text-rose-600 hover:text-rose-800 uppercase tracking-wider cursor-pointer underline decoration-dotted shrink-0 whitespace-nowrap"
          >
            VIEW OFFERS
          </button>
        </div>

        {promoApplied && promoCode ? (
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-[6px] flex items-center justify-between text-xs">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1 font-bold text-emerald-800">
                <span>✓</span>
                <span className="font-mono truncate">{promoCode}</span>
              </div>
              <p className="text-[11px] text-emerald-700">Saved ₹{discount.toLocaleString('en-IN')} on order</p>
            </div>
            <button
              type="button"
              onClick={handleCheckoutRemoveCoupon}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 uppercase cursor-pointer underline shrink-0 ml-2"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-1.5 w-full min-w-0">
              <input
                type="text"
                placeholder={PLACEHOLDERS.COUPON.PROMO_CODE}
                value={customCheckoutPromoInput}
                onChange={(e) => setCustomCheckoutPromoInput(e.target.value)}
                className="min-w-0 flex-1 w-full bg-white border border-stone-300 px-2.5 py-1.5 sm:py-2 text-xs font-sans uppercase tracking-wider focus:outline-none focus:border-brand-black rounded-[6px] truncate"
              />
              <button
                type="button"
                onClick={() => {
                  handleCheckoutApplyCoupon(customCheckoutPromoInput);
                  setCustomCheckoutPromoInput('');
                }}
                className="bg-brand-black text-white hover:bg-stone-800 text-xs font-bold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-[6px] uppercase tracking-wider transition-colors cursor-pointer shrink-0"
              >
                APPLY
              </button>
            </div>

            {promoError && (
              <p className="text-[11px] text-red-600 font-medium bg-red-50 border border-red-100 p-1.5 rounded">{promoError}</p>
            )}
            {promoSuccess && (
              <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-100 p-1.5 rounded">{promoSuccess}</p>
            )}

            <button
              type="button"
              onClick={() => setIsCouponModalOpen(true)}
              className="w-full text-center py-2 px-2 bg-white border border-dashed border-stone-300 hover:border-stone-800 text-stone-900 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 rounded-[6px] cursor-pointer shadow-xs hover:bg-stone-50 leading-tight"
            >
              <Tag size={12} className="text-rose-500 shrink-0" /> <span className="truncate">Choose from {availableCouponsList.length > 0 ? availableCouponsList.length : 5} Available Coupons</span>
            </button>
          </div>
        )}
      </div>

      {/* Price Calculations */}
      <div className="space-y-2 text-xs text-stone-600 pt-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-brand-black">₹{cartTotal.toLocaleString('en-IN')}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>Coupon Discount ({promoCode})</span>
            <span>-₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>GST & Taxes (23%)</span>
          <span className="font-semibold text-brand-black">₹{(checkoutGst + checkoutServiceTax).toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="font-semibold text-brand-black">{checkoutShippingCost === 0 ? 'FREE' : `₹${checkoutShippingCost}`}</span>
        </div>

        <hr className="border-stone-100 my-2" />

        <div className="flex justify-between text-sm text-brand-black">
          <strong className="font-bold">Total Payable</strong>
          <strong className="font-extrabold text-base text-brand-black">₹{finalDiscountedTotal.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {isPaymentStep && (
        <button 
          type="button"
          onClick={startPaymentProcessing}
          className="w-full mt-2 py-3.5 bg-brand-black hover:bg-stone-800 text-white font-bold rounded-[10px] text-xs tracking-wider uppercase transition-colors cursor-pointer"
        >
          PLACE ORDER (₹{finalDiscountedTotal.toLocaleString('en-IN')})
        </button>
      )}
    </div>
  );

  return (
    <div id="checkout-view" className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-6 font-sans">

      {checkoutStep === 'shipping' ? (
        <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('cart')}
              className="inline-flex items-center gap-1.5 text-stone-500 hover:text-brand-black hover:underline transition-all font-sans text-xs font-bold tracking-wider uppercase cursor-pointer"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="h-4 w-px bg-stone-300" />
            <h1 className="text-sm md:text-base font-sans font-extrabold tracking-wider text-brand-black uppercase">Delivery Address</h1>
          </div>
        </div>
      ) : checkoutStep === 'payment_method' ? (
        <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCheckoutStep('shipping')}
              className="inline-flex items-center gap-1.5 text-stone-500 hover:text-brand-black hover:underline transition-all font-sans text-xs font-bold tracking-wider uppercase cursor-pointer"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="h-4 w-px bg-stone-300" />
            <h1 className="text-sm md:text-base font-sans font-extrabold tracking-wider text-brand-black uppercase">Payment</h1>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-stone-200 pb-4">
            <h1 className="page-title text-brand-black">Secure Checkout</h1>
            <p className="text-xs text-stone-500 mt-1">Provide shipping details and finalize your handloom garment procurement.</p>
          </div>

          {/* Progress indicators for checkout stages */}
          <div className="flex items-center gap-2 max-w-lg text-xs md:text-xs font-bold tracking-widest uppercase text-stone-400">
            <span className={checkoutStep === 'shipping' ? 'text-brand-black font-bold' : 'text-stone-400'}>1. SHIPPING</span>
            <span>→</span>
            <span className={checkoutStep === 'payment_method' ? 'text-brand-black font-bold' : 'text-stone-400'}>2. SECURE PAYMENT</span>
            {(checkoutStep === 'processing' || checkoutStep === 'otp_verification') && (
              <>
                <span>→</span>
                <span className="text-brand-accent">3. VERIFYING PAY</span>
              </>
            )}
          </div>
        </>
      )}

      {checkoutStep === 'processing' && (
        <div className="bg-brand-cream border border-stone-200 p-12 text-center space-y-6 max-w-xl mx-auto animate-fade-in">
          <div className="w-16 h-16 border-4 border-stone-200 border-t-brand-accent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <h3 className="product-title font-bold text-brand-black">Processing Transaction</h3>
            <p className="text-xs text-stone-500">{processingMsg}</p>
          </div>
          <div className="w-full bg-stone-200 h-1.5 max-w-xs mx-auto overflow-hidden">
            <div 
              className="bg-brand-accent h-full transition-all duration-300" 
              style={{ width: `${processingPercent}%` }}
            />
          </div>
          <span className="text-xs text-stone-400 uppercase tracking-widest block font-bold">🔒 ENCRYPTED END-TO-END</span>
        </div>
      )}

      {checkoutStep === 'otp_verification' && (
        <div className="bg-brand-cream border border-stone-200 p-8 max-w-md mx-auto space-y-6 animate-fade-in shadow-md">
          <div className="text-center space-y-2 border-b border-stone-200 pb-4">
            <div className="flex justify-center items-center gap-1.5 text-brand-accent font-bold tracking-widest uppercase text-xs">
              <Lock size={12} /> 3D-SECURE VERIFICATION
            </div>
            <h3 className="product-title font-semibold text-brand-black">Bank Identity Check</h3>
            <p className="text-xs text-stone-500">A one-time passcode has been generated for authentication.</p>
          </div>

          <div className="bg-white border border-stone-200 p-4 space-y-3.5 text-xs text-stone-600 rounded-sm">
            <div className="flex justify-between">
              <span>Merchant:</span>
              <strong className="text-brand-black">The Bluberd Handlooms Ltd.</strong>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <strong className="text-brand-accent font-bold">₹{cartTotal.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between">
              <span>Method:</span>
              <span>{form.payment === 'card' ? `Credit Card (*${cardDetails.number.slice(-4)})` : `UPI Transfer (${upiId})`}</span>
            </div>
          </div>

          {otpError && (
            <p className="text-xs text-red-600 bg-red-50/50 border border-red-200 p-2 text-center">
              {otpError}
            </p>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-stone-500 font-bold uppercase block text-center">ENTER 6-DIGIT VERIFICATION CODE</label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder={PLACEHOLDERS.FORM.OTP}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] font-mono font-bold text-lg bg-white border border-stone-300 p-3 rounded-none focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-black hover:bg-brand-accent hover:text-brand-black text-brand-white text-xs font-bold tracking-widest py-3.5 uppercase transition-all"
            >
              SUBMIT SECURE OTP
            </button>
          </form>

          <div className="text-center">
            <button 
              type="button" 
              onClick={() => {
                setOtpCode('123456');
                setOtpError('');
              }}
              className="text-xs text-stone-400 hover:text-brand-accent underline decoration-dotted font-semibold"
            >
              Resend OTP SMS
            </button>
          </div>
        </div>
      )}

      {checkoutStep === 'shipping' && (
        <div className="max-w-[1320px] mx-auto px-4 md:px-5">
          {checkoutError && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 animate-fade-in shadow-xs text-left">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold font-sans">!</span>
                <p className="text-xs font-sans font-medium text-red-800">{checkoutError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7 items-start">
            {/* Main Form Fields */}
            <div className="w-full space-y-8">
              <div className="space-y-6 animate-fade-in">
                {/* Address Editing / Adding Form */}
                {(isAddingNew || editingAddressId !== null || savedAddresses.length === 0) ? (
                  <form onSubmit={handleSaveAddress} className="space-y-6 text-left animate-fade-in bg-white border border-stone-200 p-4 sm:p-8 rounded-[14px]">
                    <div className="border-b border-stone-200 pb-4">
                      <h3 className="section-title text-brand-black tracking-tight">
                        {editingAddressId ? 'Edit Address' : 'New Address'}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Address Tag Selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest block">Address Tag *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {['HOME', 'WORK', 'OFFICE', 'OTHER'].map((tagOption) => (
                            <button
                              key={tagOption}
                              type="button"
                              onClick={() => setAddressForm({ ...addressForm, tag: tagOption })}
                              className={`w-full py-2.5 px-2 text-center text-xs font-sans font-bold border uppercase transition-colors rounded-[8px] cursor-pointer ${
                                addressForm.tag === tagOption
                                  ? 'border-brand-black bg-brand-black text-white'
                                  : 'border-stone-200 hover:border-stone-400 bg-white text-stone-600'
                              }`}
                            >
                              {tagOption}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest block">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder={PLACEHOLDERS.FORM.FULL_NAME}
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          className="w-full bg-white border border-stone-200 p-3.5 text-sm font-sans rounded-[8px] focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest block">Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder={PLACEHOLDERS.FORM.EMAIL}
                            value={addressForm.email}
                            onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                            className="w-full bg-white border border-stone-200 p-3.5 text-sm font-sans rounded-[8px] focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest block">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder={PLACEHOLDERS.FORM.PHONE}
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full bg-white border border-stone-200 p-3.5 text-sm font-sans rounded-[8px] focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest block">Address Details *</label>
                        <input
                          type="text"
                          required
                          placeholder={PLACEHOLDERS.FORM.STREET_ADDRESS}
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          className="w-full bg-white border border-stone-200 p-3.5 text-sm font-sans rounded-[8px] focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest block">City *</label>
                          <input
                            type="text"
                            required
                            placeholder={PLACEHOLDERS.FORM.CITY}
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full bg-white border border-stone-200 p-3.5 text-sm font-sans rounded-[8px] focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest block">PIN Code *</label>
                          <input
                            type="text"
                            required
                            placeholder={PLACEHOLDERS.FORM.PIN_CODE}
                            value={addressForm.zip}
                            onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value.replace(/\D/g, '') })}
                            className="w-full bg-white border border-stone-200 p-3.5 text-sm font-sans rounded-[8px] focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest block">Country *</label>
                          <select
                            required
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            className="w-full bg-white border border-stone-200 p-3.5 text-sm font-sans rounded-[8px] focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-colors h-[48px]"
                          >
                            <option value="India">India</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="United Arab Emirates">United Arab Emirates</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Australia">Australia</option>
                            <option value="Canada">Canada</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Form Controls - Save & Back */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-100">
                      <button
                        type="submit"
                        className="flex-1 bg-brand-black text-white hover:bg-stone-800 text-xs sm:text-sm font-bold tracking-wider py-3.5 transition-colors rounded-[8px] uppercase cursor-pointer text-center"
                      >
                        Save Address
                      </button>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNew(false);
                            setEditingAddressId(null);
                          }}
                          className="px-6 py-3.5 bg-transparent text-stone-600 hover:text-brand-black border border-stone-300 hover:border-brand-black text-xs sm:text-sm font-bold tracking-wider uppercase transition-colors rounded-[8px] cursor-pointer text-center"
                        >
                          Back
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8 text-left animate-fade-in bg-white border border-[#e8e8e8] rounded-[14px] p-6 shadow-xs">
                    <h2 className="text-lg font-bold text-[#111] font-sans border-b border-stone-100 pb-3">Select Delivery Address</h2>

                    {/* Saved Addresses List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        
                        return (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-6 border transition-all duration-300 text-left relative cursor-pointer flex flex-col justify-between rounded-[10px] shadow-xs group ${
                              isSelected
                                ? 'border-black bg-stone-50/50 ring-1 ring-black/40'
                                : 'border-stone-200 bg-white hover:border-stone-400'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Address Tag Display */}
                              <div className="flex justify-between items-center">
                                <span className="px-2.5 py-1 text-[11px] font-sans font-bold bg-stone-100 text-stone-800 border border-stone-200/60 tracking-widest uppercase rounded-sm">
                                  {addr.tag || 'HOME'}
                                </span>
                                {isSelected && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-black" />
                                )}
                              </div>

                              {/* Address Details Block */}
                              <div className="text-xs text-stone-600 space-y-1.5 font-sans leading-relaxed pt-2">
                                <p className="font-bold text-sm text-brand-black">{addr.name}</p>
                                <p className="font-medium text-stone-800">{addr.address}</p>
                                <p className="text-stone-500">
                                  {addr.city} — <strong className="font-mono text-brand-black">{addr.zip}</strong>, <span className="uppercase">{addr.country}</span>
                                </p>
                                <p className="text-stone-500 font-mono">
                                  {addr.phone}
                                </p>
                                <p className="text-stone-400 text-[11px]">
                                  {addr.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Buttons Row Below Addresses */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-t border-stone-200 pt-5">
                      <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleStartAddNew}
                          className="px-4 py-3 bg-white text-stone-900 border border-stone-300 hover:border-black text-xs font-bold uppercase tracking-wider rounded-[8px] transition-colors flex-1 sm:flex-initial text-center cursor-pointer"
                        >
                          + Add New Address
                        </button>
                        {selectedAddressId && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);
                                if (selectedAddr) handleStartEdit(selectedAddr, e);
                              }}
                              className="px-3.5 py-3 bg-white text-stone-600 hover:text-black border border-stone-200 hover:border-stone-400 text-xs font-semibold uppercase tracking-wider rounded-[8px] transition-colors text-center cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(selectedAddressId, e)}
                              className="px-3.5 py-3 bg-white text-rose-600 hover:text-rose-800 border border-stone-200 hover:border-rose-300 text-xs font-semibold uppercase tracking-wider rounded-[8px] transition-colors text-center cursor-pointer"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleProceedToPaymentFromSaved}
                        className="w-full sm:w-auto bg-brand-black text-white hover:bg-stone-800 text-xs font-bold tracking-wider py-3.5 px-7 transition-colors rounded-[8px] flex items-center justify-center gap-2 uppercase cursor-pointer text-center shrink-0"
                      >
                        Proceed to Payment <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Order Summary with Coupon Code Box */}
            {renderCheckoutOrderSummary(false)}
          </div>
        </div>
      )}

      {checkoutStep === 'payment_method' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {checkoutError && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 animate-fade-in shadow-xs text-left">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold font-sans">!</span>
                <p className="text-xs font-sans font-medium text-red-800">{checkoutError}</p>
              </div>
            </div>
          )}

          {/* Payment Card */}
          <div className="bg-white border border-[#e8e8e8] rounded-[14px] overflow-hidden shadow-xs">
            
            {/* Header with Total Payable Badge */}
            <div className="p-5 sm:p-7 border-b border-[#eee] text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#111] leading-tight font-sans">Select Payment Method</h2>
                <p className="text-[#777] text-xs sm:text-sm mt-1 font-sans">Choose your preferred payment option.</p>
              </div>
              <div className="bg-white border border-stone-200 px-4 py-2.5 rounded-[10px] text-left sm:text-right shrink-0 shadow-2xs">
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Total Payable</span>
                <span className="text-base sm:text-lg font-extrabold text-brand-black">₹{finalDiscountedTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2.5 p-4 sm:p-6 border-b border-[#eee] bg-white">
              {[
                { id: 'upi', label: 'UPI', icon: <Smartphone size={16} /> },
                { id: 'card', label: 'Cards', icon: <CreditCard size={16} /> },
                { id: 'netbanking', label: 'Net Banking', icon: <Landmark size={16} /> },
                { id: 'cod', label: 'Cash on Delivery', icon: <Truck size={16} /> }
              ].map((t) => {
                const isActive = form.payment === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, payment: t.id })}
                    className={`px-4 py-2.5 border rounded-[10px] cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-150 font-sans flex items-center gap-2 ${
                      isActive 
                        ? 'bg-[#111] text-white border-[#111]' 
                        : 'border-[#ddd] bg-[#fafafa] text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Panel Container */}
            <div className="p-5 sm:p-8 text-left bg-white">
              
              {/* UPI Panel */}
              {form.payment === 'upi' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { 
                        id: 'gpay', 
                        logo: (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Smartphone size={16} className="text-stone-700" />
                              <span className="font-bold text-sm tracking-tight font-sans">
                                <span className="text-blue-500">G</span>
                                <span className="text-red-500">P</span>
                                <span className="text-yellow-500">a</span>
                                <span className="text-green-600">y</span>
                              </span>
                            </div>
                            <p className="text-[11px] text-[#777]">Instant payment</p>
                          </div>
                        )
                      },
                      { 
                        id: 'phonepe', 
                        logo: (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Smartphone size={16} className="text-purple-700" />
                              <span className="font-extrabold text-sm tracking-tight text-purple-700 font-sans">PhonePe</span>
                            </div>
                            <p className="text-[11px] text-[#777]">Instant payment</p>
                          </div>
                        )
                      },
                      { 
                        id: 'paytm', 
                        logo: (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Smartphone size={16} className="text-sky-600" />
                              <span className="font-sans font-black text-sm tracking-tight">
                                <span className="text-sky-500">Pay</span>
                                <span className="text-blue-700">tm</span>
                              </span>
                            </div>
                            <p className="text-[11px] text-[#777]">Instant payment</p>
                          </div>
                        )
                      },
                      { 
                        id: 'other', 
                        logo: (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <QrCode size={16} className="text-stone-600" />
                              <span className="font-sans font-bold text-sm text-stone-700 uppercase tracking-wider">Other UPI</span>
                            </div>
                            <p className="text-[11px] text-[#777]">UPI ID</p>
                          </div>
                        )
                      }
                    ].map((opt) => (
                      <div 
                        key={opt.id}
                        onClick={() => {
                          setUpiSubOption(opt.id as any);
                          setUpiVerified(false);
                        }}
                        className={`border rounded-[12px] p-3.5 sm:p-4 cursor-pointer transition-colors duration-200 ${
                          upiSubOption === opt.id 
                            ? 'border-[#111] bg-stone-50/50 ring-1 ring-black/10' 
                            : 'border-[#e5e5e5] hover:border-[#111] bg-white'
                        }`}
                      >
                        {opt.logo}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <input 
                      placeholder={upiSubOption === 'other' ? PLACEHOLDERS.PAYMENT.UPI_VPA : PLACEHOLDERS.PAYMENT.UPI_MOBILE}
                      value={upiSubOption === 'other' ? upiId : upiMobileNumber}
                      onChange={(e) => {
                        if (upiSubOption === 'other') {
                          setUpiId(e.target.value);
                        } else {
                          setUpiMobileNumber(e.target.value.replace(/\D/g, ''));
                        }
                        setUpiVerified(false);
                      }}
                      className="flex-grow p-[13px] border border-[#ddd] rounded-[10px] text-sm focus:outline-none focus:border-[#111] bg-white text-[#111]"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (upiSubOption === 'other') {
                          handleVerifyUpi();
                        } else {
                          if (upiMobileNumber.length !== 10) {
                            setCheckoutError('Please enter a valid 10-digit mobile number.');
                            return;
                          }
                          setCheckoutError('');
                          setIsUpiVerifying(true);
                          setTimeout(() => {
                            setIsUpiVerifying(false);
                            setUpiVerified(true);
                            const handle = upiSubOption === 'gpay' ? 'okaxis' : upiSubOption === 'paytm' ? 'paytm' : 'upi';
                            setUpiId(`${upiMobileNumber}@${handle}`);
                          }, 1000);
                        }
                      }}
                      disabled={isUpiVerifying || upiVerified}
                      className="px-5 py-3 bg-[#111] hover:bg-[#222] active:bg-black text-white font-semibold rounded-[10px] text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isUpiVerifying ? 'Verifying...' : upiVerified ? 'Linked ✓' : 'Verify'}
                    </button>
                  </div>

                  {upiVerified && (
                    <p className="text-xs text-emerald-600 font-bold mt-1">
                      ✓ UPI account successfully verified/linked.
                    </p>
                  )}

                  <button 
                    type="button"
                    onClick={startPaymentProcessing}
                    className="w-full mt-4 py-3.5 bg-[#111] hover:bg-[#222] text-white font-bold rounded-[10px] text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Pay ₹{finalDiscountedTotal.toLocaleString('en-IN')} with UPI
                  </button>
                </div>
              )}

              {/* Cards Panel */}
              {form.payment === 'card' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Card brand logo bar */}
                  <div className="flex items-center justify-between bg-stone-50 border border-[#eee] rounded-[10px] p-3.5 mb-4">
                    <span className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest">Accepted Cards</span>
                    <div className="flex gap-2 items-center">
                      <span className="px-2 py-1 bg-white border border-[#ddd] rounded text-[11px] font-black italic text-blue-800 tracking-tight font-sans">VISA</span>
                      <span className="px-2 py-1 bg-white border border-[#ddd] rounded text-[11px] font-sans font-bold flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-90 inline-block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-90 inline-block -ml-2"></span>
                        <span className="text-[10px] text-stone-700 font-bold font-sans">Mastercard</span>
                      </span>
                      <span className="px-2 py-1 bg-white border border-[#ddd] rounded text-[11px] font-extrabold italic text-emerald-700 font-sans">RuPay</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <input 
                      placeholder={PLACEHOLDERS.PAYMENT.CARD_HOLDER}
                      name="holder"
                      value={cardDetails.holder}
                      onChange={handleCardInputChange}
                      className="w-full p-[14px] border border-[#ddd] rounded-[10px] text-sm focus:outline-none focus:border-[#111] bg-white text-[#111]"
                    />
                    <input 
                      placeholder={PLACEHOLDERS.PAYMENT.CARD_NUMBER}
                      name="number"
                      value={cardDetails.number}
                      onChange={handleCardInputChange}
                      className="w-full p-[14px] border border-[#ddd] rounded-[10px] text-sm focus:outline-none focus:border-[#111] bg-white text-[#111]"
                    />
                  </div>
                  <div className="flex gap-4 mt-4">
                    <input 
                      placeholder={PLACEHOLDERS.PAYMENT.CARD_EXPIRY}
                      name="expiry"
                      value={cardDetails.expiry}
                      onChange={handleCardInputChange}
                      className="flex-1 p-[14px] border border-[#ddd] rounded-[10px] text-sm focus:outline-none focus:border-[#111] bg-white text-[#111]"
                    />
                    <input 
                      placeholder={PLACEHOLDERS.PAYMENT.CARD_CVV}
                      name="cvv"
                      type="password"
                      maxLength={3}
                      value={cardDetails.cvv}
                      onChange={handleCardInputChange}
                      className="flex-1 p-[14px] border border-[#ddd] rounded-[10px] text-sm focus:outline-none focus:border-[#111] bg-white text-[#111]"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={startPaymentProcessing}
                    className="w-full mt-6 py-3.5 bg-[#111] hover:bg-[#222] text-white font-bold rounded-[10px] text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Pay ₹{finalDiscountedTotal.toLocaleString('en-IN')} with Card
                  </button>
                </div>
              )}

              {/* Net Banking Panel */}
              {form.payment === 'netbanking' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Quick Bank Selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                    {[
                      { id: 'hdfc', name: 'HDFC', logo: <span className="bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.5 tracking-tight font-sans">HDFC Bank</span> },
                      { id: 'icici', name: 'ICICI', logo: <span className="text-orange-600 font-bold text-xs font-sans">i ICICI</span> },
                      { id: 'sbi', name: 'SBI', logo: <span className="text-sky-600 font-bold text-xs flex items-center gap-1 font-sans"><span className="w-2.5 h-2.5 rounded-full border-2 border-sky-600 inline-block"></span>SBI</span> },
                      { id: 'axis', name: 'Axis', logo: <span className="text-red-800 font-bold text-xs italic font-sans">AXIS BANK</span> },
                      { id: 'kotak', name: 'Kotak', logo: <span className="text-red-600 font-bold text-xs font-sans">kotak</span> }
                    ].map((bank) => (
                      <div
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={`border rounded-[10px] p-3 text-center cursor-pointer transition-all duration-150 flex items-center justify-center min-h-[48px] ${
                          selectedBank === bank.id 
                            ? 'border-[#111] bg-stone-50/50 ring-1 ring-black/10' 
                            : 'border-[#ddd] hover:border-stone-400 bg-white'
                        }`}
                      >
                        {bank.logo}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4">
                    <select 
                      value={selectedBank}
                      onChange={(e) => {
                        setSelectedBank(e.target.value);
                      }}
                      className="w-full p-[14px] border border-[#ddd] rounded-[10px] text-sm focus:outline-none focus:border-[#111] bg-white text-[#111]"
                    >
                      <option value="">Or Select Another Bank</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="sbi">SBI</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak</option>
                    </select>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <input 
                        placeholder={PLACEHOLDERS.PAYMENT.CUSTOMER_ID}
                        value={netbankingUserId}
                        onChange={(e) => {
                          setNetbankingUserId(e.target.value.replace(/\D/g, ''));
                        }}
                        className="flex-1 p-[14px] border border-[#ddd] rounded-[10px] text-sm focus:outline-none focus:border-[#111] bg-white text-[#111]"
                      />
                      <input 
                        placeholder={PLACEHOLDERS.PAYMENT.NETBANKING_PIN}
                        type="password"
                        value={netbankingPassword}
                        onChange={(e) => {
                          setNetbankingPassword(e.target.value);
                        }}
                        className="flex-1 p-[14px] border border-[#ddd] rounded-[10px] text-sm focus:outline-none focus:border-[#111] bg-white text-[#111]"
                      />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!selectedBank) {
                        setCheckoutError('Please select a bank first.');
                        return;
                      }
                      if (!netbankingUserId || !netbankingPassword) {
                        setCheckoutError('Please enter Customer ID and PIN.');
                        return;
                      }
                      setCheckoutError('');
                      startPaymentProcessing();
                    }}
                    className="w-full mt-6 py-3.5 bg-[#111] hover:bg-[#222] text-white font-bold rounded-[10px] text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Pay ₹{finalDiscountedTotal.toLocaleString('en-IN')} via Net Banking
                  </button>
                </div>
              )}

              {/* Cash on Delivery Panel */}
              {form.payment === 'cod' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="flex items-start gap-4 bg-stone-50 p-5 rounded-[12px] border border-stone-200">
                    <div className="p-3 bg-white rounded-full border border-stone-300 shadow-xs">
                      <Truck size={24} className="text-stone-700 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111] mb-1">Cash on Delivery</h4>
                      <p className="text-[13px] text-[#777] leading-relaxed">
                        Available for eligible pincodes. Pay when your order is delivered. Pay in cash or scan QR upon delivery.
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={startPaymentProcessing}
                    className="w-full mt-6 py-3.5 bg-[#111] hover:bg-[#222] text-white font-bold rounded-[10px] text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Confirm COD Order (₹{finalDiscountedTotal.toLocaleString('en-IN')})
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MYNTRA-STYLE COUPON MODAL FOR CHECKOUT */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setIsCouponModalOpen(false)}>
          <div 
            className="bg-white w-full sm:max-w-md md:max-w-lg overflow-hidden border-t sm:border border-stone-200 shadow-2xl flex flex-col h-[80vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-none animate-slide-up-mobile sm:animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-stone-100 bg-stone-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-rose-500 transform -rotate-45" />
                <h3 className="product-title text-stone-800">Apply Coupon</h3>
              </div>
              <button 
                onClick={() => {
                  setIsCouponModalOpen(false);
                  setPromoError('');
                }}
                className="p-1.5 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-grow">
              {/* Promo input field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs sm:text-xs font-sans font-extrabold text-stone-400 tracking-widest uppercase">Enter Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={PLACEHOLDERS.COUPON.PROMO_CODE_HINT}
                    value={customCheckoutPromoInput}
                    onChange={(e) => setCustomCheckoutPromoInput(e.target.value)}
                    className="flex-grow bg-white border border-stone-300 px-3 sm:px-4 py-2 sm:py-3 text-xs font-sans uppercase tracking-wider focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 rounded-none h-10 sm:h-11"
                  />
                  <button
                    onClick={() => {
                      handleCheckoutApplyCoupon(customCheckoutPromoInput);
                      setCustomCheckoutPromoInput('');
                    }}
                    className="bg-brand-black text-brand-white hover:bg-rose-600 text-xs font-sans font-bold tracking-widest px-4 sm:px-6 py-2 sm:py-3 transition-colors rounded-none uppercase shrink-0 h-10 sm:h-11 cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>
                {promoError && (
                  <p className="text-red-600 text-xs sm:text-xs font-sans font-semibold bg-red-50 border border-red-100 p-2 sm:p-2.5">{promoError}</p>
                )}
                {promoSuccess && (
                  <p className="text-emerald-700 text-xs sm:text-xs font-sans font-semibold bg-emerald-50 border border-emerald-100 p-2 sm:p-2.5">{promoSuccess}</p>
                )}
              </div>

              {/* Coupon Status or Applied Info */}
              {promoApplied && (
                <div className="bg-emerald-50/40 border border-emerald-500/30 p-3 sm:p-4 flex items-center justify-between text-left rounded-none">
                  <div className="space-y-0.5">
                    <span className="text-xs sm:text-xs font-sans font-extrabold text-emerald-800 uppercase tracking-widest block">CURRENTLY APPLIED</span>
                    <p className="text-xs sm:text-sm font-sans font-bold text-emerald-800 font-mono">
                      {promoCode}
                    </p>
                    <p className="text-xs sm:text-xs font-sans text-stone-500">
                      Saving <strong className="font-bold text-emerald-700">₹{discount.toLocaleString('en-IN')}</strong> on this order
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleCheckoutRemoveCoupon();
                    }}
                    className="text-rose-500 hover:text-rose-700 font-sans font-extrabold text-xs hover:underline transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Available Coupons title */}
              <div className="border-t border-stone-100 pt-4 text-left">
                <h4 className="text-xs sm:text-xs font-sans font-extrabold text-stone-400 tracking-wider uppercase mb-3">
                  Available Coupons
                </h4>

                <div className="space-y-3">
                  {availableCouponsList.map((cp) => {
                    const isCurrent = promoCode === cp.code;
                    
                    // Calculate potential discount
                    let potentialDiscount = 0;
                    if (cp.type === 'percentage') {
                      potentialDiscount = Math.round(cartTotal * (cp.value / 100));
                    } else {
                      potentialDiscount = Math.min(cp.value, cartTotal);
                    }

                    const isDisabled = cp.minSpend ? cartTotal < cp.minSpend : false;

                    return (
                      <div 
                        key={cp.code} 
                        className={`border p-3.5 sm:p-4.5 transition-all duration-300 text-left flex flex-col justify-between rounded-none ${
                          isCurrent 
                            ? 'border-emerald-600 bg-emerald-50/10' 
                            : isDisabled
                              ? 'border-stone-200 bg-stone-50/50 opacity-60'
                              : 'border-stone-200 bg-stone-50/30 hover:border-stone-400'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <span className="font-sans font-extrabold text-xs sm:text-xs bg-stone-100 border border-stone-200 text-brand-black px-2 py-0.5 sm:py-1 rounded-none inline-block mb-1 sm:mb-2 uppercase tracking-wider">
                              {cp.code}
                            </span>
                            <span className="font-sans font-bold text-xs text-stone-800 block uppercase tracking-wide truncate">
                              {cp.label}
                            </span>
                          </div>
                          <span className="text-xs font-sans text-emerald-700 font-extrabold shrink-0">
                            {isDisabled ? `Unlock at ₹${cp.minSpend?.toLocaleString('en-IN')}` : `Save ₹${potentialDiscount.toLocaleString('en-IN')}`}
                          </span>
                        </div>

                        <p className="text-xs sm:text-xs text-stone-500 leading-relaxed mt-1.5">{cp.desc}</p>
                        {cp.minSpend && (
                          <p className="text-xs sm:text-xs text-brand-accent font-medium font-sans mt-1">Min Spend: ₹{cp.minSpend.toLocaleString('en-IN')}</p>
                        )}

                        <div className="border-t border-stone-100 mt-2.5 pt-2 flex items-center justify-end">
                          {isCurrent ? (
                            <span className="text-xs sm:text-xs font-sans font-bold text-emerald-600 uppercase tracking-widest">
                              ✓ APPLIED
                            </span>
                          ) : (
                            <button
                              disabled={isDisabled}
                              onClick={() => {
                                handleCheckoutApplyCoupon(cp.code);
                                setPromoError('');
                              }}
                              className={`text-xs sm:text-xs font-sans font-bold uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 transition-all cursor-pointer ${
                                isDisabled
                                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                  : 'bg-brand-black text-brand-white hover:bg-rose-500 hover:text-white'
                              }`}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-t border-stone-100 bg-stone-50/50 flex justify-end shrink-0">
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="w-full sm:w-auto bg-brand-black text-brand-white hover:bg-stone-800 font-sans font-bold text-xs tracking-widest uppercase px-6 py-3 sm:py-2.5 cursor-pointer text-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED UPI APP OVERLAY */}
      {simulatedUpiApp && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-sm overflow-hidden shadow-2xl flex flex-col min-h-[520px] rounded-2xl text-white">
            
            {/* Native App Top Branding Bar */}
            <div className={`px-5 py-4 flex items-center justify-between border-b border-stone-800 shrink-0 ${
              simulatedUpiApp === 'Paytm' ? 'bg-sky-600 text-white' :
              simulatedUpiApp === 'PhonePe' ? 'bg-purple-800 text-white' :
              simulatedUpiApp === 'Amazon Pay' ? 'bg-[#232f3e] text-amber-400' :
              'bg-white text-stone-900 border-b border-stone-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase">
                  {simulatedUpiApp === 'Google Pay' ? 'Google Pay' : simulatedUpiApp}
                </span>
                <span className="text-xs bg-stone-800/45 px-1.5 py-0.5 rounded text-xs uppercase font-bold tracking-wider text-stone-200">
                  Secure UPI
                </span>
              </div>
              <span className="text-xs font-bold tracking-wider opacity-90">🔒 128-Bit Encryption</span>
            </div>

            {/* Inner Content Area */}
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              {simulatedUpiStep === 'pin' && (
                <>
                  {/* Transaction Specs */}
                  <div className="text-center space-y-2">
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">PAYEE MERCHANT</p>
                    <h3 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
                      The Bluberd Artisans <span className="text-emerald-400 text-sm">✓</span>
                    </h3>
                    <p className="text-xs font-mono text-stone-500">UPI ID: thebluberd@ybl</p>
                    
                    <div className="py-4 border-y border-stone-800/80 my-2">
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">AMOUNT</p>
                      <h2 className="text-3xl font-mono font-bold text-white mt-1">
                        ₹{finalDiscountedTotal.toLocaleString('en-IN')}
                      </h2>
                    </div>
                  </div>

                  {/* PIN Display Input */}
                  <div className="text-center space-y-2">
                    <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider">ENTER UPI PIN</p>
                    <div className="flex justify-center gap-3.5 py-2">
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const hasVal = simulatedPin.length > idx;
                        return (
                          <div 
                            key={idx} 
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                              hasVal 
                                ? 'bg-brand-accent border-brand-accent scale-110' 
                                : 'border-stone-600 bg-stone-800'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-stone-500 italic">Please enter your 6-digit transaction PIN to validate bank remittance.</p>
                  </div>

                  {/* On-screen Keypad */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto text-center">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            if (simulatedPin.length < 6) {
                              setSimulatedPin(prev => prev + num);
                            }
                          }}
                          className="bg-stone-800/60 hover:bg-stone-800 text-lg font-bold py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all text-white border border-stone-800"
                        >
                          {num}
                        </button>
                      ))}
                      
                      {/* Clear Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatedPin(prev => prev.slice(0, -1));
                        }}
                        className="bg-stone-800/30 hover:bg-stone-800 text-stone-400 hover:text-white font-bold py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center border border-stone-800"
                      >
                        ⌫
                      </button>

                      {/* Zero Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (simulatedPin.length < 6) {
                            setSimulatedPin(prev => prev + '0');
                          }
                        }}
                        className="bg-stone-800/60 hover:bg-stone-800 text-lg font-bold py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all text-white border border-stone-800"
                      >
                        0
                      </button>

                      {/* Confirm Tick Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (simulatedPin.length === 6) {
                            setSimulatedUpiStep('processing');
                            setTimeout(() => {
                              setSimulatedUpiStep('success');
                              setTimeout(() => {
                                setSimulatedUpiApp(null);
                                executeActualUpiOrder();
                              }, 1800);
                            }, 2000);
                          }
                        }}
                        disabled={simulatedPin.length !== 6}
                        className={`font-bold py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center border ${
                          simulatedPin.length === 6
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                            : 'bg-stone-800/30 text-stone-600 border-stone-800 cursor-not-allowed'
                        }`}
                      >
                        ✓
                      </button>
                    </div>

                    {/* Back / Cancel option */}
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatedUpiApp(null);
                          setSimulatedPin('');
                          setSimulatedUpiStep('pin');
                        }}
                        className="text-xs text-stone-500 hover:text-stone-300 uppercase tracking-widest font-bold underline transition-all cursor-pointer"
                      >
                        ← Cancel Payment & Return
                      </button>
                    </div>
                  </div>
                </>
              )}

              {simulatedUpiStep === 'processing' && (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 py-8 animate-fade-in">
                  <div className="w-12 h-12 border-4 border-stone-700 border-t-brand-accent rounded-full animate-spin" />
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-sm text-white">Contacting UPI Banking Network</h4>
                    <p className="text-xs text-stone-400">Verifying secure multi-factor tokens and authenticating PIN. Do not close or navigate away.</p>
                  </div>
                </div>
              )}

              {simulatedUpiStep === 'success' && (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-5 py-8 animate-fade-in">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-16 h-16 bg-emerald-500/20 rounded-full animate-ping" />
                    <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      ✓
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-emerald-400">Transaction Approved</h4>
                    <p className="text-xs text-stone-400">Payment of ₹{finalDiscountedTotal.toLocaleString('en-IN')} is secure.</p>
                    <p className="text-xs text-brand-accent font-semibold pt-1">Handshaking with The Bluberd secure terminal... Redirecting.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 4. ORDER CONFIRMATION VIEW
// ==========================================
export function OrderConfirmationView() {
  const { navigate } = useStore();
  const latestOrder = JSON.parse(localStorage.getItem('thebluberd_latest_order') || '{}');

  return (
    <div id="order-confirmation-view" className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8 font-sans">
      <div className="w-16 h-16 bg-brand-cream text-brand-accent rounded-full flex items-center justify-center mx-auto text-2xl border border-brand-accent animate-bounce">
        ✓
      </div>

      <div className="space-y-2">
        <p className="text-xs font-sans font-bold text-brand-accent tracking-widest-double uppercase">TRANSMISSION SUCCESSFUL</p>
        <h1 className="page-title text-brand-black">Thank you, Patron</h1>
        <p className="text-xs text-stone-500">Your order has been registered on the looms of The Bluberd.</p>
      </div>

      {latestOrder.orderId && (
        <div className="bg-brand-cream/80 p-6 border border-stone-200 text-left space-y-4 max-w-md mx-auto">
          <h3 className="product-title text-brand-black border-b border-stone-200 pb-2">Order Particulars</h3>
          
          <div className="space-y-2 text-xs font-sans text-stone-600">
            <div className="flex justify-between">
              <span>Order Number</span>
              <strong className="text-brand-black">{latestOrder.orderId}</strong>
            </div>
            <div className="flex justify-between">
              <span>Date Recieved</span>
              <span>{latestOrder.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Recipient Patron</span>
              <span>{latestOrder.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Destination</span>
              <span className="truncate max-w-[200px]">{latestOrder.address}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-sans font-bold text-brand-black">
              <span>Amount Remitted</span>
              <span>₹{latestOrder.total?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
        A confirmation email with real-time tracking links will be sent to your inbox shortly. Standard artisan delivery takes 3 to 5 business days.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={() => {
            const win = window.open(`/api/invoice/${latestOrder.orderId || 'ODR-1234567-IN'}`, '_blank');
            win?.focus();
          }}
          className="border border-brand-black text-brand-black text-xs font-bold py-3.5 px-8 uppercase tracking-widest hover:bg-stone-100 transition-colors rounded-none flex items-center gap-2"
        >
          <FileText size={14} /> PRINT GST TAX INVOICE
        </button>
        <button
          onClick={() => navigate('shop')}
          className="bg-brand-black text-brand-white text-xs font-bold py-3.5 px-8 uppercase tracking-widest hover:bg-brand-accent hover:text-brand-black transition-colors rounded-none"
        >
          EXPLORE MORE WEAVES
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 5. OUR STORY / ABOUT VIEW
// ==========================================
export function AboutView() {
  const { navigate } = useStore();

  return (
    <div id="about-view" className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8 font-sans">
      
      <button 
        onClick={() => navigate('home')} 
        className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-black transition-colors font-sans text-xs font-bold tracking-wider uppercase cursor-pointer"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Title block */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <p className="text-xs font-sans font-bold text-brand-accent tracking-widest-double uppercase">THE BLUBERD HERITAGE</p>
        <h1 className="page-title text-brand-black">Our Story</h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          Crafting a modern era of slow fashion, celebrating local weavers, organic dye baths, and the geometry of ancestral Indian motifs.
        </p>
      </div>

      {/* Two section details with image block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 md:col-span-2 md:max-w-3xl md:mx-auto">
          <span className="text-xs font-sans font-bold text-brand-accent tracking-widest uppercase">THE PHILOSOPHY</span>
          <h2 className="section-title text-brand-black">Modern Silhouettes, Ancient Looms</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            The Bluberd was born out of a desire to create a clean, minimalist fashion brand that respects generations of Indian loom masters. We strip away the unnecessary noise of fast fashion, replacing it with small-batch production, raw natural fibers, and high-density stitching.
          </p>
          <p className="text-xs text-stone-500 leading-relaxed">
            By eliminating intermediaries, we connect directly with master weavers in Lucknow, Bengal, and Varanasi. Every garment you wear contributes to sustaining families who have preserved the art of hand-block printing, Banarasi threadwork, and georgette embroidery for centuries.
          </p>
        </div>

        <div className="aspect-square bg-brand-cream overflow-hidden border border-stone-200 md:hidden w-full max-w-md mx-auto">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
            alt="Hand loom weaving illustration"
            className="w-full h-full object-cover grayscale opacity-90"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 md:col-span-2 md:max-w-3xl md:mx-auto">
          <span className="text-xs font-sans font-bold text-brand-accent tracking-widest uppercase">THE CRAFT</span>
          <h2 className="section-title text-brand-black">The Geometry of Slow Print</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Traditional Indian textile printing is a highly mathematical process. Artisans carve beautiful geometric designs into teakwood blocks, dip them in organic dye baths of fermented iron, indigo, and madder root, and print with surgical alignment.
          </p>
          <p className="text-xs text-stone-500 leading-relaxed">
            This slow, meditative craft yields small, delightful variations in block saturation. No two The Bluberd garments are completely identical — each block imprint writes a distinctive chapter of its ancestral lineage on your skin.
          </p>
          
          <button
            onClick={() => navigate('shop')}
            className="bg-brand-black text-brand-white text-xs font-bold py-3.5 px-6 uppercase tracking-widest hover:bg-brand-accent hover:text-brand-black transition-all duration-300 rounded-none"
          >
            VIEW THE CATALOG
          </button>
        </div>
      </div>

    </div>
  );
}

// ==========================================
// 6. HERITAGE JOURNAL / BLOG VIEW
// ==========================================
export function BlogView() {
  const { navigate, blogs } = useStore();
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const isDevMode = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';
  const displayBlogs = Array.isArray(blogs) && blogs.length > 0 ? blogs : (isDevMode ? BLOG_POSTS : []);

  if (selectedPost) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 font-sans">
        <button
          onClick={() => setSelectedPost(null)}
          className="text-xs font-sans font-bold text-brand-accent uppercase tracking-widest flex items-center gap-1 hover:underline cursor-pointer"
        >
          ← BACK TO JOURNAL
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span>{selectedPost.category}</span>
            <span>•</span>
            <span>{selectedPost.date}</span>
            <span>•</span>
            <span>{selectedPost.readTime}</span>
          </div>

          <h1 className="page-title text-brand-black tracking-wide leading-tight">
            {selectedPost.title}
          </h1>
        </div>

        <div className="aspect-video w-full bg-brand-cream overflow-hidden">
          <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
        </div>

        <div className="text-stone-600 text-sm md:text-base leading-relaxed space-y-4 font-light">
          <p className="font-sans italic text-lg text-brand-accent">{selectedPost.excerpt}</p>
          <p>{selectedPost.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div id="blog-view" className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-6 font-sans">
      <button 
        onClick={() => navigate('home')} 
        className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-black transition-colors font-sans text-xs font-bold tracking-wider uppercase cursor-pointer"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="border-b border-stone-200 pb-4">
        <h1 className="page-title text-brand-black">The Heritage Journal</h1>
        <p className="text-xs text-stone-500 mt-1">Stories, styling guides, and reports from the weavers of Lucknow and Varanasi.</p>
      </div>

      {displayBlogs.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-stone-50/50 border border-stone-200/60 rounded-lg">
          <p className="text-stone-600 font-sans font-semibold text-sm">No journal articles published yet.</p>
          <p className="text-stone-400 text-xs">Check back soon for new artisan stories and collection guides.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayBlogs.map((post) => (
            <div key={post.id} className="border border-stone-200/60 overflow-hidden flex flex-col h-full bg-brand-white rounded-lg">
              <div className="aspect-video w-full bg-brand-cream overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-102 transition-transform duration-500" />
              </div>

              <div className="p-6 flex flex-col flex-grow space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-400 font-bold tracking-wider uppercase">
                  <span>{post.category}</span>
                  <span>{post.date}</span>
                </div>

                <h3 className="product-title font-bold text-brand-black leading-tight line-clamp-2 hover:text-brand-accent cursor-pointer" onClick={() => setSelectedPost(post)}>
                  {post.title}
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed flex-grow line-clamp-3">
                  {post.excerpt}
                </p>

                <button
                  onClick={() => setSelectedPost(post)}
                  className="text-xs font-sans font-bold text-brand-accent hover:text-brand-accent-dark tracking-widest uppercase flex items-center gap-1 pt-2 cursor-pointer"
                >
                  READ STORY →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. PATRON PROFILE / ACCOUNT VIEW
// ==========================================
// ==========================================
// 7. PATRON PROFILE / ACCOUNT VIEW
// ==========================================

import AccountDashboard from './AccountDashboard';

export function AccountView() {
  const { user, navigate } = useStore();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <h3 className="section-title">Please Log In</h3>
        <p className="text-xs text-stone-500">Accessing past order sheets requires an active account.</p>
        <button onClick={() => navigate('auth')} className="bg-brand-black text-brand-white px-6 py-3 text-xs uppercase tracking-widest font-bold">LOG IN</button>
      </div>
    );
  }

  return <AccountDashboard />;
}

// ==========================================
// 8. LOG IN / REGISTER SIMULATOR
// ==========================================
export function AuthView() {
  const { login, navigate } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegister && !name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!identifier.trim()) {
      setError('Please provide your email address or mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password or OTP code.');
      return;
    }

    const cleanId = identifier.trim();
    const isEmail = cleanId.includes('@');

    if (isEmail) {
      const displayName = isRegister ? name : cleanId.split('@')[0];
      login(cleanId, undefined, displayName || 'Patron');
      setSuccessMsg(isRegister ? 'Patron record successfully created!' : 'Secure login authenticated!');
      setTimeout(() => {
        navigate('home');
      }, 800);
    } else {
      // Treat as mobile number
      const digits = cleanId.replace(/\D/g, '');
      if (digits.length < 10) {
        setError('Please provide a valid 10-digit mobile number or email address.');
        return;
      }
      if (password !== '1234' && password !== '123456') {
        setError('For mobile simulation, please enter password/OTP "1234".');
        return;
      }
      const displayName = isRegister ? name : `Patron ${digits.slice(-4)}`;
      login(undefined, `+91 ${digits}`, displayName);
      setSuccessMsg(isRegister ? 'Patron record successfully created!' : 'Secure login authenticated!');
      setTimeout(() => {
        navigate('home');
      }, 800);
    }
  };

  return (
    <div id="auth-view" className="max-w-md mx-auto px-4 py-16 font-sans space-y-4">
      <button 
        onClick={() => navigate('home')} 
        className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-black transition-colors font-sans text-xs font-bold tracking-wider uppercase cursor-pointer"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-brand-cream border border-stone-200 p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-sans font-bold text-brand-accent tracking-widest uppercase">SECURE PORTAL</span>
          <h2 className="section-title text-brand-black">
            {isRegister ? 'Create Account' : 'Patron Login'}
          </h2>
          <p className="text-xs text-stone-500">
            {isRegister ? 'Register your specifications with us.' : 'Access your private luxury order portfolio.'}
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50/50 border border-red-200 p-2.5 font-sans leading-relaxed text-center animate-fade-in">
            {error}
          </p>
        )}

        {successMsg && (
          <p className="text-xs text-emerald-700 bg-emerald-50/50 border border-emerald-200 p-2.5 font-sans leading-relaxed text-center animate-fade-in">
            {successMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-sans font-bold text-stone-500 uppercase block">Full Name</label>
              <input
                type="text"
                placeholder={PLACEHOLDERS.FORM.FULL_NAME}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-white border border-stone-300 p-3 text-xs font-sans rounded-none focus:outline-none focus:border-brand-accent"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-sans font-bold text-stone-500 uppercase block">Email Address or Mobile Number</label>
            <input
              type="text"
              placeholder={PLACEHOLDERS.FORM.EMAIL_OR_PHONE}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-brand-white border border-stone-300 p-3 text-xs font-sans rounded-none focus:outline-none focus:border-brand-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-sans font-bold text-stone-500 uppercase block">Secure Password or OTP Code</label>
            <input
              type="password"
              placeholder={PLACEHOLDERS.FORM.PASSWORD}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-white border border-stone-300 p-3 text-xs font-sans rounded-none focus:outline-none focus:border-brand-accent"
            />
            {!isRegister && !identifier.includes('@') && identifier.trim().length > 0 && (
              <p className="text-xs text-stone-400 italic">For mobile login simulation, use "1234" as your OTP/Passcode.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-brand-black text-brand-white text-xs font-bold py-3.5 uppercase tracking-widest hover:bg-brand-accent hover:text-brand-black transition-colors rounded-none"
          >
            {isRegister ? 'CREATE PATRON RECORD' : 'LOG IN TO SECURE PROFILE'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-200">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccessMsg('');
            }}
            className="text-xs text-stone-500 hover:text-brand-accent font-semibold underline decoration-dotted"
          >
            {isRegister ? 'Already a registered Patron? Log In' : "New to The Bluberd? Create Account"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 9. HELPER / LEGAL FAQ PAGE
// ==========================================
export function FAQView() {
  const { navigate } = useStore();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let active = true;
    apiClient.get('/faqs')
      .then((data: any) => {
        if (active) {
          if (Array.isArray(data) && data.length > 0) {
            setFaqs(data);
          } else {
            const isDevMode = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';
            if (isDevMode) {
              setFaqs([
                { q: "What defines slow artisan fashion?", a: "Slow fashion focuses on small-batch manufacturing, paying weavers fair salaries, selecting raw bio-degradable flax cotton, and utilizing hand-carved block prints rather than high-carbon industrial digital printing." },
                { q: "How should I care for block printed indigo?", a: "Natural organic indigo bleed naturally during early washes. We highly recommend washing separately in gentle cold water, drying in shade inside-out, and using warm irons." },
                { q: "Where are The Bluberd garments stitched?", a: "Our fabrics are woven in Varanasi and Lucknow, and subsequently tailored with reinforced double stitching in our boutique atelier located in Bhopal, Madhya Pradesh." },
                { q: "How long does standard delivery take?", a: "We dispatch orders within 24 hours. Transit take 3 to 5 business days inside major metropolitan cities of India. Shipping on orders over ₹999 is completely free." },
                { q: "Do you offer returns and size exchanges?", a: "Yes, we accept easy returns and size exchanges within 15 days of delivery, provided the tags and original packaging are kept fully intact." }
              ]);
            } else {
              setFaqs([]);
            }
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setFaqs([]);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  return (
    <div id="faq-view" className="max-w-3xl mx-auto px-4 py-12 space-y-6 font-sans">
      <button 
        onClick={() => navigate('home')} 
        className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-black transition-colors font-sans text-xs font-bold tracking-wider uppercase cursor-pointer"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="text-center space-y-2 pt-2">
        <p className="text-xs font-sans font-bold text-brand-accent tracking-widest-double uppercase">SECURE SUPPORT</p>
        <h1 className="page-title text-brand-black">Frequently Asked Questions</h1>
        <p className="text-xs text-stone-500">patron guidelines regarding tailoring sizes and natural indigo care.</p>
      </div>

      <div className="space-y-4 pt-6 border-t border-stone-200">
        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">Loading FAQs...</div>
        ) : faqs.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400">No FAQ entries available.</div>
        ) : (
          faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="border-b border-stone-200 pb-3">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-2 text-sm font-sans font-semibold text-brand-black hover:text-brand-accent cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <p className="text-xs text-stone-500 leading-relaxed font-sans pt-1">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
