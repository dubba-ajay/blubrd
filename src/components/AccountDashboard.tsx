import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { PLACEHOLDERS } from '../constants/placeholders';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Heart, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Check, 
  ArrowLeft, 
  Truck
} from 'lucide-react';

interface SavedAddress {
  id: string;
  tag: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export default function AccountDashboard() {
  const { 
    user, 
    logout, 
    navigate, 
    updateProfile,
    addToCart,
    orders,
    updateOrderStatus,
    wishlist: storeWishlist,
    products,
    removeFromWishlist
  } = useStore();

  // Active tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'payment' | 'wishlist' | 'settings'>('overview');

  // Personal Info Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || user?.phone || ''
  });

  // Track if profile is updated
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || user.phone || ''
      });
    }
  }, [user]);

  // Order Tracking Details State (simulated)
  const [trackingOrder, setTrackingOrder] = useState<string | null>(null);

  // Exchange or Return dialog state
  const [returnOrder, setReturnOrder] = useState<{ id: string; option: 'Refund' | 'Exchange' | null } | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    const stored = localStorage.getItem('bluberd_user_addresses');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    if (user?.address) {
      return [{
        id: 'addr-default',
        tag: 'Home',
        name: user.name || '',
        address: user.address,
        city: user.city || '',
        zip: user.zip || '',
        phone: user.mobile || user.phone || '',
        isDefault: true
      }];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bluberd_user_addresses', JSON.stringify(addresses));
  }, [addresses]);

  // Add/Edit Address Form State
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    tag: 'Home',
    name: user?.name || '',
    address: '',
    city: '',
    zip: '',
    phone: ''
  });

  // Payment Methods State
  const [cards, setCards] = useState<PaymentMethod[]>(() => {
    const stored = localStorage.getItem('bluberd_user_cards');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bluberd_user_cards', JSON.stringify(cards));
  }, [cards]);

  // Add Card State
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [cardForm, setCardForm] = useState({
    brand: 'Visa',
    number: '',
    expiry: '',
    cardholder: user?.name || ''
  });

  // Wishlist Products dynamically matched from Store
  const wishlistProducts = products.filter(p => storeWishlist.includes(p.id));

  // Global Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2800);
  };

  // Profile Save Action
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      mobile: profileForm.mobile
    });
    triggerToast('Profile changes saved successfully');
    setActiveTab('overview');
  };

  // Cancel order handler
  const handleCancelOrder = async (id: string) => {
    try {
      await updateOrderStatus(id, 'Cancelled');
      triggerToast(`Order #${id} has been cancelled successfully`);
    } catch (error) {
      console.error('[AccountDashboard] Cancel order failed:', error);
      triggerToast('Failed to cancel order.');
    }
  };

  // Address handlers
  const handleAddAddressClick = () => {
    setEditingAddressId(null);
    setAddressForm({
      tag: 'Home',
      name: profileForm.name,
      address: '',
      city: '',
      zip: '',
      phone: profileForm.mobile
    });
    setAddressFormOpen(true);
  };

  const handleEditAddressClick = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      tag: addr.tag,
      name: addr.name,
      address: addr.address,
      city: addr.city,
      zip: addr.zip,
      phone: addr.phone
    });
    setAddressFormOpen(true);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    triggerToast('Address deleted successfully');
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.address || !addressForm.city || !addressForm.zip) {
      triggerToast('Please fill out all address fields');
      return;
    }
    if (editingAddressId) {
      setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...a, ...addressForm } : a));
      triggerToast('Address updated successfully');
    } else {
      const newAddr: SavedAddress = {
        id: `addr-${Date.now()}`,
        tag: addressForm.tag,
        name: addressForm.name,
        address: addressForm.address,
        city: addressForm.city,
        zip: addressForm.zip,
        phone: addressForm.phone,
        isDefault: false
      };
      setAddresses(prev => [...prev, newAddr]);
      triggerToast('New address added successfully');
    }
    setAddressFormOpen(false);
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    triggerToast('Default address updated');
  };

  // Card handlers
  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardForm.number.length < 4) {
      triggerToast('Please enter a valid card number');
      return;
    }
    const last4 = cardForm.number.slice(-4);
    const newCard: PaymentMethod = {
      id: `card-${Date.now()}`,
      brand: cardForm.brand,
      last4: last4,
      expiry: cardForm.expiry || '12/29',
      isDefault: false
    };
    setCards(prev => [...prev, newCard]);
    setCardFormOpen(false);
    triggerToast('Payment method added successfully');
  };

  const handleDeleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    triggerToast('Payment method removed');
  };

  const handleSetDefaultCard = (id: string) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    triggerToast('Default payment method updated');
  };

  // Utility to get initials from profile name
  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0] ? parts[0].slice(0, 2).toUpperCase() : 'AV';
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 font-sans text-stone-800">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 text-xs px-4 py-3 shadow-lg flex items-center gap-2 animate-fade-in border border-stone-800 rounded-none tracking-wider uppercase font-semibold">
          <Check size={14} className="text-stone-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Back button */}
      <div className="mb-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('home')} 
          className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-widest font-medium"
        >
          <ArrowLeft size={12} /> Back to shop
        </button>
        <span className="text-[10px] font-mono text-stone-400">Secure Patron Account</span>
      </div>

      {/* Main Wrapper Container */}
      <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] border border-stone-300 bg-white">
        
        {/* Left Sidebar */}
        <div className="hidden md:block bg-stone-50 p-6 border-r border-stone-300">
          
          {/* User Header Block */}
          <div className="flex items-center gap-3 pb-5 border-b border-stone-300 mb-5">
            <div className="w-10 h-10 bg-stone-900 text-stone-100 flex items-center justify-center font-semibold text-xs rounded-none flex-shrink-0">
              {getInitials(profileForm.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-stone-900 truncate tracking-tight">{profileForm.name}</p>
              <p className="text-[10px] text-stone-400 leading-none mt-1">Member since 2022</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'addresses', label: 'Addresses', icon: MapPin },
              { id: 'payment', label: 'Payment methods', icon: CreditCard },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setTrackingOrder(null);
                    setReturnOrder(null);
                    setAddressFormOpen(false);
                    setCardFormOpen(false);
                  }}
                  className={`flex items-center gap-2.5 py-2.5 px-3 text-xs text-left transition-all ${
                    isActive 
                      ? 'text-stone-950 font-semibold border-l-2 border-stone-950 bg-stone-100/60' 
                      : 'text-stone-500 font-normal hover:text-stone-800 border-l-2 border-transparent'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-stone-950' : 'text-stone-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="border-t border-stone-300 my-3"></div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-2.5 py-2.5 px-3 text-xs text-stone-400 hover:text-rose-600 text-left transition-all border-l-2 border-transparent"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </nav>
        </div>

        {/* Right Panel Workspace */}
        <div className="p-4 sm:p-7 md:p-9 min-w-0">

          {/* Mobile Dashboard Navigation Tabs */}
          <div className="md:hidden border-b border-stone-200 pb-2 mb-6 bg-white">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:-mx-7 sm:px-7">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                { id: 'addresses', label: 'Addresses', icon: MapPin },
                { id: 'payment', label: 'Payment', icon: CreditCard },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setTrackingOrder(null);
                      setReturnOrder(null);
                      setAddressFormOpen(false);
                      setCardFormOpen(false);
                    }}
                    className={`flex items-center gap-1.5 py-2 px-3 text-[10px] sm:text-xs uppercase tracking-wider shrink-0 transition-all border ${
                      isActive 
                        ? 'text-stone-950 font-bold border-stone-950 bg-stone-50' 
                        : 'text-stone-500 font-medium border-stone-200 hover:text-stone-800 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <Icon size={12} className={isActive ? 'text-stone-950' : 'text-stone-400'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 py-2 px-3 text-[10px] sm:text-xs uppercase tracking-wider shrink-0 transition-all border border-transparent text-stone-400 hover:text-rose-600"
              >
                <LogOut size={12} />
                <span>Log out</span>
              </button>
            </div>
          </div>

          {/* PANEL: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-6">Overview</p>
              
              <div className="border border-stone-300 p-6 flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-14 h-14 bg-stone-900 text-stone-100 flex items-center justify-center font-medium text-lg flex-shrink-0">
                  {getInitials(profileForm.name)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-stone-900 tracking-tight leading-tight mb-1">{profileForm.name}</p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium mb-5">Member since 2022</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-xs font-serif text-stone-700 leading-normal">{profileForm.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-xs font-serif text-stone-700 leading-normal">{profileForm.mobile}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Default address</p>
                      <p className="text-xs font-serif text-stone-700 leading-normal">
                        {addresses.find(a => a.isDefault)?.address || 'No default address configured'}, {addresses.find(a => a.isDefault)?.city || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Default payment</p>
                      <p className="text-xs font-serif text-stone-700 leading-normal">
                        {cards.find(c => c.isDefault) ? `${cards.find(c => c.isDefault)?.brand} ending in ${cards.find(c => c.isDefault)?.last4}` : 'No payment card configured'}
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('settings')}
                  className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 hover:text-stone-950 uppercase tracking-widest border border-stone-300 px-3 py-1.5 transition-colors"
                >
                  <Edit size={11} /> Edit
                </button>
              </div>

            </div>
          )}

          {/* PANEL: ORDERS */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-6">Order history</p>
              
              <div className="flex flex-col divide-y divide-stone-200">
                {orders.map((order) => (
                  <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                      
                      {/* Left Block */}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-900 tracking-tight">Order #{order.id}</p>
                        <p className="text-[11px] text-stone-400 mt-1 uppercase tracking-widest font-medium">
                          {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'} · placed {order.date} · ₹{order.amount.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Right Block */}
                      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                        
                        {/* Custom status badge */}
                        <span className="text-[11px] text-stone-700 flex items-center gap-1.5 font-medium tracking-wide">
                          <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                            order.status === 'Delivered' 
                              ? 'bg-emerald-500' 
                              : order.status === 'Shipped' 
                              ? 'bg-amber-400' 
                              : order.status === 'Processing'
                              ? 'bg-stone-400'
                              : 'bg-rose-500'
                          }`} />
                          {order.status}
                        </span>

                        {/* Interactive actions */}
                        {order.status === 'Delivered' && (
                          <button 
                            onClick={() => setReturnOrder({ id: order.id, option: null })}
                            className="border border-stone-300 text-stone-700 hover:text-stone-950 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors bg-white"
                          >
                            Return / exchange
                          </button>
                        )}

                        {order.status === 'Shipped' && (
                          <button 
                            onClick={() => setTrackingOrder(trackingOrder === order.id ? null : order.id)}
                            className="border border-stone-300 text-stone-700 hover:text-stone-950 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors bg-white inline-flex items-center gap-1"
                          >
                            <Truck size={11} /> {trackingOrder === order.id ? 'Hide track' : 'Track'}
                          </button>
                        )}

                        {order.status === 'Processing' && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="border border-stone-300 text-stone-500 hover:text-rose-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors bg-white"
                          >
                            Cancel
                          </button>
                        )}

                        {order.status === 'Cancelled' && (
                          <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold italic">Cancelled</span>
                        )}

                      </div>
                    </div>

                    {/* Order Products List with Images */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3.5 border border-stone-200/80 bg-stone-50/40 p-3.5 flex flex-col gap-3">
                        <p className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Items Ordered ({order.items.length})</p>
                        <div className="flex flex-col divide-y divide-stone-200/50">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center justify-between py-2.5 first:pt-0 last:pb-0">
                              <div className="flex gap-3.5 items-center min-w-0">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-12 h-16 object-cover border border-stone-200 bg-white shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-stone-900 truncate tracking-tight">{item.name}</p>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[10px] text-stone-500 font-mono uppercase tracking-wide">
                                    <span>Size: <strong className="text-stone-700">{item.size}</strong></span>
                                    <span>·</span>
                                    <span>Color: <strong className="text-stone-700">{item.color}</strong></span>
                                    <span>·</span>
                                    <span>Qty: <strong className="text-stone-700">{item.quantity}</strong></span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-semibold text-stone-950">₹{item.price.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expandable Courier Tracking Timeline */}
                    {trackingOrder === order.id && (
                      <div className="mt-4 p-4 border border-stone-300 bg-stone-50/70 animate-fade-in">
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold mb-3">Live Shipment Track</p>
                        <div className="relative flex flex-col gap-4 pl-4 border-l border-stone-300">
                          <div className="relative">
                            <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 bg-stone-900 rounded-none border-2 border-stone-100"></span>
                            <p className="text-xs font-semibold text-stone-900">Arrived at Local Hub - Mumbai</p>
                            <p className="text-[10px] text-stone-400 font-serif">July 21, 2026 - 06:12 AM</p>
                          </div>
                          <div className="relative">
                            <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 bg-stone-400 rounded-none border-2 border-stone-100"></span>
                            <p className="text-xs font-semibold text-stone-600">Dispatched from Warehouse - Pune</p>
                            <p className="text-[10px] text-stone-400 font-serif">July 20, 2026 - 10:45 PM</p>
                          </div>
                          <div className="relative">
                            <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 bg-stone-400 rounded-none border-2 border-stone-100"></span>
                            <p className="text-xs font-semibold text-stone-600">Order Manifested & Packed</p>
                            <p className="text-[10px] text-stone-400 font-serif">July 19, 2026 - 02:30 PM</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expandable Return/Exchange Panel */}
                    {returnOrder?.id === order.id && (
                      <div className="mt-4 p-4 border border-stone-300 bg-stone-50/70 animate-fade-in">
                        {returnOrder.option === null ? (
                          <div>
                            <p className="text-xs font-semibold text-stone-900 mb-2">Select an option for Order #{order.id}:</p>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setReturnOrder({ id: order.id, option: 'Refund' })}
                                className="bg-stone-900 text-stone-100 text-[10px] uppercase tracking-widest px-3 py-1.5 font-semibold hover:bg-stone-800 transition-colors"
                              >
                                Request Refund
                              </button>
                              <button 
                                onClick={() => setReturnOrder({ id: order.id, option: 'Exchange' })}
                                className="bg-white border border-stone-300 text-stone-900 text-[10px] uppercase tracking-widest px-3 py-1.5 font-semibold hover:bg-stone-50 transition-colors"
                              >
                                Request Exchange
                              </button>
                              <button 
                                onClick={() => setReturnOrder(null)}
                                className="text-stone-400 hover:text-stone-600 text-xs py-1.5 px-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-stone-900 mb-1">
                              {returnOrder.option === 'Refund' ? 'Refund Process Initiated' : 'Exchange Process Initiated'}
                            </p>
                            <p className="text-[11px] text-stone-500 font-serif leading-relaxed mb-3">
                              Our courier agent will perform a quality check and collect the item from your default delivery address within 24 hours. Keep tags intact.
                            </p>
                            <button 
                              onClick={() => {
                                triggerToast(`${returnOrder.option} requested successfully for order #${order.id}`);
                                setReturnOrder(null);
                              }}
                              className="bg-stone-900 text-stone-100 text-[10px] uppercase tracking-widest px-3 py-1 font-semibold hover:bg-stone-800"
                            >
                              Confirm
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PANEL: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-stone-900">Saved addresses</p>
                {!addressFormOpen && (
                  <button 
                    onClick={handleAddAddressClick}
                    className="bg-stone-900 text-stone-100 border-none px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest hover:bg-stone-800 transition-colors inline-flex items-center gap-1"
                  >
                    <Plus size={11} /> Add address
                  </button>
                )}
              </div>

              {/* Address Form */}
              {addressFormOpen && (
                <form onSubmit={handleAddressSubmit} className="mb-6 p-5 border border-stone-300 bg-stone-50/50 space-y-4 animate-fade-in">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Address Tag</label>
                      <select 
                        value={addressForm.tag} 
                        onChange={(e) => setAddressForm({...addressForm, tag: e.target.value})}
                        className="w-full border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Recipient Name</label>
                      <input 
                        type="text" 
                        value={addressForm.name} 
                        onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                        className="w-full border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Address Particulars</label>
                    <input 
                      type="text" 
                      placeholder={PLACEHOLDERS.FORM.STREET_ADDRESS}
                      value={addressForm.address} 
                      onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                      className="w-full border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">City & State</label>
                      <input 
                        type="text" 
                        placeholder={PLACEHOLDERS.FORM.CITY_STATE}
                        value={addressForm.city} 
                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                        className="w-full border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">PIN Code</label>
                      <input 
                        type="text" 
                        placeholder={PLACEHOLDERS.FORM.PIN_CODE}
                        value={addressForm.zip} 
                        onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})}
                        className="w-full border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      value={addressForm.phone} 
                      onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                      className="w-full border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-stone-200">
                    <button 
                      type="button" 
                      onClick={() => setAddressFormOpen(false)}
                      className="border border-stone-300 text-stone-500 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest hover:bg-stone-100 rounded-none"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-stone-900 text-stone-100 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest hover:bg-stone-850 rounded-none"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List Grid */}
              {addresses.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-stone-300">
                  <p className="text-xs italic text-stone-400 font-serif">No saved addresses yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-stone-300 divide-y sm:divide-y-0 sm:divide-x divide-stone-300">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-5 relative flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-stone-900 flex items-center gap-2">
                            {addr.tag}
                            {addr.isDefault && (
                              <span className="text-[9px] font-serif text-stone-400 italic font-normal">· default</span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => handleEditAddressClick(addr)}
                              className="text-stone-400 hover:text-stone-900 transition-colors p-1"
                              title="Edit Address"
                            >
                              <Edit size={13} />
                            </button>
                            <button 
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                              title="Delete Address"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs font-serif text-stone-600 leading-relaxed">
                          <strong className="text-stone-900 font-sans font-medium">{addr.name}</strong><br />
                          {addr.address}<br />
                          {addr.city}<br />
                          {addr.phone}
                        </p>
                      </div>

                      {!addr.isDefault && (
                        <button 
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="mt-4 text-[10px] text-left text-stone-400 hover:text-stone-900 uppercase tracking-widest font-semibold transition-colors"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL: PAYMENT METHODS */}
          {activeTab === 'payment' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-stone-900">Payment methods</p>
                {!cardFormOpen && (
                  <button 
                    onClick={() => setCardFormOpen(true)}
                    className="bg-stone-900 text-stone-100 border-none px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest hover:bg-stone-800 transition-colors inline-flex items-center gap-1"
                  >
                    <Plus size={11} /> Add card
                  </button>
                )}
              </div>

              {/* Add Card Form */}
              {cardFormOpen && (
                <form onSubmit={handleAddCardSubmit} className="mb-6 p-5 border border-stone-300 bg-stone-50/50 space-y-4 animate-fade-in">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-900">Add Payment Card</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Card Brand</label>
                      <select 
                        value={cardForm.brand} 
                        onChange={(e) => setCardForm({...cardForm, brand: e.target.value})}
                        className="w-full border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="American Express">American Express</option>
                        <option value="Diners Club">Diners Club</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Cardholder Name</label>
                      <input 
                        type="text" 
                        value={cardForm.cardholder} 
                        onChange={(e) => setCardForm({...cardForm, cardholder: e.target.value})}
                        className="w-full border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Card Number</label>
                      <input 
                        type="text" 
                        placeholder={PLACEHOLDERS.PAYMENT.CARD_NUMBER}
                        value={cardForm.number} 
                        onChange={(e) => setCardForm({...cardForm, number: e.target.value.replace(/\D/g, '')})}
                        maxLength={16}
                        className="w-full border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder={PLACEHOLDERS.PAYMENT.CARD_EXPIRY}
                        value={cardForm.expiry} 
                        onChange={(e) => setCardForm({...cardForm, expiry: e.target.value})}
                        maxLength={5}
                        className="w-full border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-stone-200">
                    <button 
                      type="button" 
                      onClick={() => setCardFormOpen(false)}
                      className="border border-stone-300 text-stone-500 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest hover:bg-stone-100 rounded-none"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-stone-900 text-stone-100 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest hover:bg-stone-850 rounded-none"
                    >
                      Save Card
                    </button>
                  </div>
                </form>
              )}

              {/* Cards List Stack */}
              {cards.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-stone-300">
                  <p className="text-xs italic text-stone-400 font-serif">No saved payment methods yet.</p>
                </div>
              ) : (
                <div className="border border-stone-300 divide-y divide-stone-300">
                  {cards.map((card) => (
                    <div key={card.id} className="flex items-center gap-4 p-4 hover:bg-stone-50/50 transition-colors">
                      <CreditCard className="text-stone-400 flex-shrink-0" size={20} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-900">{card.brand} ending in {card.last4}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Expires {card.expiry}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {card.isDefault ? (
                          <span className="text-[9px] text-stone-400 border border-stone-300 px-2 py-0.5 uppercase tracking-wider font-semibold">
                            Default
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleSetDefaultCard(card.id)}
                            className="text-[10px] text-stone-400 hover:text-stone-900 uppercase tracking-widest font-semibold transition-colors"
                          >
                            Make Default
                          </button>
                        )}

                        <button 
                          onClick={() => handleDeleteCard(card.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove Card"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-6">Wishlist</p>
              
              {wishlistProducts.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-stone-300">
                  <p className="text-xs italic text-stone-400 font-serif">Your wishlist is currently empty.</p>
                  <button 
                    onClick={() => navigate('home')}
                    className="mt-3 bg-stone-900 text-stone-100 text-[10px] uppercase tracking-widest font-semibold px-4 py-2 hover:bg-stone-850 cursor-pointer"
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {wishlistProducts.map((item) => (
                    <div key={item.id} className="group border border-stone-300 p-3 flex flex-col justify-between">
                      <div>
                        <div className="aspect-square border border-stone-200 bg-stone-50 overflow-hidden mb-3 relative">
                          <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeFromWishlist(item.id)}
                            className="absolute top-1.5 right-1.5 text-stone-500 hover:text-stone-900 bg-white/90 p-1 transition-colors cursor-pointer"
                            title="Remove from Wishlist"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-[11px] font-semibold text-stone-900 truncate leading-tight">{item.name}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>

                      <button 
                        onClick={() => {
                          addToCart(item, item.sizes?.[0] || 'M', item.colors?.[0]?.value || '#000', 1);
                          triggerToast('Added to bag');
                        }}
                        className="mt-3 w-full bg-stone-900 hover:bg-stone-800 text-stone-100 text-[9px] uppercase tracking-widest font-semibold py-1.5 transition-colors cursor-pointer"
                      >
                        Move to Bag
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-6">Personal info</p>
              
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Full name</label>
                    <input 
                      type="text" 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Email address</label>
                    <input 
                      type="email" 
                      value={profileForm.email} 
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="w-full border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">Contact Phone</label>
                  <input 
                    type="tel" 
                    value={profileForm.mobile} 
                    onChange={(e) => setProfileForm({...profileForm, mobile: e.target.value})}
                    className="w-full border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:border-stone-900 rounded-none bg-white"
                    required
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button 
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-850 text-stone-100 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest transition-colors rounded-none"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
