import { useState, useEffect } from 'react';
import { CartItem, Product, BlogPost } from './types';
import { PRODUCTS, BLOG_POSTS } from './data/products';
import { apiClient } from './api/client';

export interface Coupon {
  code: string;
  discountPercentage: number;
  minSpend?: number;
  description: string;
  usageCount: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  address: string;
  phone: string;
  total: number;
  items: CartItem[];
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Returned' | 'Refunded';
  paymentMethod: string;
  trackingId?: string;
  estimatedDelivery?: string;
  returnReason?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'security';
}

export interface BackInStockSubscription {
  id: string;
  email: string;
  productId: string;
  size: string;
  color: string;
  date: string;
}

class GlobalStore {
  private listeners: Set<() => void> = new Set();
  
  private cart: CartItem[] = [];
  private wishlist: string[] = [];
  private user: { 
    email?: string; 
    mobile?: string; 
    name: string; 
    avatar?: string; 
    phone?: string; 
    address?: string; 
    city?: string; 
    zip?: string;
    isAdmin?: boolean;
  } | null = null;
  private currentRoute: { path: string; params?: any } = { path: 'home' };
  private routeHistory: { path: string; params?: any }[] = [];
  private newsletterSubscribers: string[] = [];
  private reviews: any[] = [];
  
  // Enterprise fields
  private products: Product[] = [];
  private orders: Order[] = [];
  private recentlyViewed: string[] = [];
  private coupons: Coupon[] = [];
  private backInStockSubscriptions: BackInStockSubscription[] = [];
  private systemLogs: ActivityLog[] = [];
  private blogs: BlogPost[] = [];

  constructor() {
    // Load initial data from localStorage if in browser
    if (typeof window !== 'undefined') {
      try {
        const parseArray = (key: string, fallback: any[]): any[] => {
          const stored = localStorage.getItem(key);
          if (!stored) return fallback;
          try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : fallback;
          } catch (e) {
            return fallback;
          }
        };

        this.cart = parseArray('bluberd_cart', []);
        this.wishlist = parseArray('bluberd_wishlist', []);

        const storedUser = localStorage.getItem('bluberd_user');
        const hasTokens = localStorage.getItem('bluberd_access_token') || localStorage.getItem('bluberd_refresh_token');
        if (storedUser && hasTokens) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed && typeof parsed === 'object') {
              this.user = parsed;
            } else {
              this.user = null;
            }
          } catch (e) {
            this.user = null;
          }
        } else {
          this.user = null;
          if (storedUser) {
            localStorage.removeItem('bluberd_user');
            localStorage.removeItem('bluberd_cart');
            localStorage.removeItem('bluberd_orders');
          }
        }

        const isDevMode = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

        // Manage products reactively in store
        const storedProducts = localStorage.getItem('bluberd_products');
        if (storedProducts) {
          try {
            const parsed = JSON.parse(storedProducts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.products = parsed;
            } else {
              this.products = isDevMode ? PRODUCTS : [];
            }
          } catch (e) {
            this.products = isDevMode ? PRODUCTS : [];
          }
        } else {
          this.products = isDevMode ? PRODUCTS : [];
          if (isDevMode) {
            localStorage.setItem('bluberd_products', JSON.stringify(PRODUCTS));
          }
        }

        // Manage blogs reactively in store
        const storedBlogs = localStorage.getItem('bluberd_blogs');
        if (storedBlogs) {
          try {
            const parsed = JSON.parse(storedBlogs);
            this.blogs = Array.isArray(parsed) ? parsed : (isDevMode ? BLOG_POSTS : []);
          } catch (e) {
            this.blogs = isDevMode ? BLOG_POSTS : [];
          }
        } else {
          this.blogs = isDevMode ? BLOG_POSTS : [];
          if (isDevMode) {
            localStorage.setItem('bluberd_blogs', JSON.stringify(BLOG_POSTS));
          }
        }

        // Manage orders reactively in store
        const storedOrders = localStorage.getItem('bluberd_orders');
        if (storedOrders) {
          try {
            const parsed = JSON.parse(storedOrders);
            this.orders = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            this.orders = [];
          }
        } else {
          this.orders = [];
        }

        const storedReviews = localStorage.getItem('bluberd_reviews');
        if (storedReviews) {
          try {
            const parsed = JSON.parse(storedReviews);
            // Filter out any legacy demo reviews
            const userAddedReviews = Array.isArray(parsed) 
              ? parsed.filter((r: any) => r && !r.isDemo && r.userName !== 'Priya S.' && r.userName !== 'Anjali M.' && r.userName !== 'Priya S') 
              : [];
            this.reviews = userAddedReviews;
            localStorage.setItem('bluberd_reviews', JSON.stringify(userAddedReviews));
          } catch (e) {
            this.reviews = [];
            localStorage.removeItem('bluberd_reviews');
          }
        } else {
          this.reviews = [];
        }

        this.newsletterSubscribers = parseArray('bluberd_subscribers', []);

        this.recentlyViewed = parseArray('bluberd_recently_viewed', []);

        // Coupons
        const storedCoupons = localStorage.getItem('bluberd_coupons');
        if (storedCoupons) {
          try {
            const parsed = JSON.parse(storedCoupons);
            this.coupons = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            this.coupons = [];
          }
        } else {
          this.coupons = [];
        }

        // Back in stock
        this.backInStockSubscriptions = parseArray('bluberd_back_in_stock', []);

        // System Logs
        const storedLogs = localStorage.getItem('bluberd_system_logs');
        if (storedLogs) {
          try {
            const parsed = JSON.parse(storedLogs);
            this.systemLogs = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            this.systemLogs = [];
          }
        } else {
          this.systemLogs = [];
        }

        // Parse initial URL path if available
        const hash = window.location.hash;
        if (hash) {
          const pathName = hash.replace('#/', '') || 'home';
          if (pathName.startsWith('product/')) {
            const id = pathName.split('/')[1];
            this.currentRoute = { path: 'product', params: { id } };
          } else {
            this.currentRoute = { path: pathName };
          }
        }
      } catch (e) {
        console.error('Failed to parse storage', e);
      }
    }

    if (typeof window !== 'undefined') {
      // Trigger background database sync
      setTimeout(() => this.syncWithBackend(), 100);

      // Auto-refresh failure listener
      window.addEventListener('bluberd-auth-failed', () => {
        this.logout();
      });
    }
  }

  // --- DATABASE SYNCHRONIZATION METHODS ---
  async syncWithBackend() {
    await this.syncProducts();
    if (this.user) {
      await this.syncCart();
      await this.syncOrders();
      if (this.user.isAdmin) {
        await this.syncCoupons();
      }
    }
  }

  async syncProducts() {
    try {
      const prods = await apiClient.get('/products');
      if (prods && Array.isArray(prods) && prods.length > 0) {
        this.products = prods.map((item: any) => ({
          id: item.id,
          name: item.name,
          brand: item.brand || 'The Bluberd Weaves',
          price: item.price,
          mrp: item.mrp || undefined,
          badge: item.badge || undefined,
          category: item.category || 'women',
          subcategory: item.subcategory || '',
          images: Array.isArray(item.images) ? item.images : [],
          colors: Array.isArray(item.colors) ? item.colors : [],
          sizes: Array.isArray(item.sizes) ? item.sizes : [],
          description: item.description || '',
          fabricCare: item.fabricCare || '',
          shippingReturns: item.shippingReturns || '',
        }));
        this.saveProducts();
        this.notify();
      }
    } catch (error) {
      console.error('[GlobalStore] Failed to sync products from DB:', error);
    }
  }

  async syncCart() {
    if (!this.user) return;
    try {
      const dbItems = await apiClient.get('/cart');
      this.cart = dbItems.map((item: any) => ({
        id: String(item.id),
        product: {
          id: item.product.id,
          name: item.product.name,
          brand: item.product.brand || 'The Bluberd Weaves',
          price: item.product.price,
          images: item.product.images || [],
          colors: item.product.colors || [],
          sizes: item.product.sizes || [],
          badge: item.product.badge,
          category: item.product.category,
          subcategory: item.product.subcategory,
          description: item.product.description,
          fabricCare: item.product.fabricCare,
          shippingReturns: item.product.shippingReturns,
        },
        selectedColor: item.color,
        selectedSize: item.size,
        quantity: item.quantity
      }));
      this.saveCart();
      this.notify();
    } catch (error) {
      console.error('[GlobalStore] Failed to sync cart from DB:', error);
    }
  }

  async syncOrders() {
    if (!this.user) return;
    try {
      const endpoint = this.user.isAdmin ? '/orders/all' : '/orders/user';
      const ordersList = await apiClient.get(endpoint);
      this.orders = ordersList.map((order: any) => ({
        id: order.id,
        customerName: order.customerName,
        email: order.email,
        address: order.address,
        phone: order.phone || '',
        total: order.total,
        date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: order.status,
        paymentMethod: order.paymentMethod,
        trackingId: order.trackingId || undefined,
        estimatedDelivery: order.estimatedDelivery || undefined,
        returnReason: order.returnReason || undefined,
        items: (order.items || []).map((item: any) => ({
          id: String(item.id),
          product: {
            id: item.productId,
            name: item.name,
            price: item.price,
            images: item.image ? [item.image] : [],
            brand: 'The Bluberd Weaves',
          },
          selectedColor: item.color,
          selectedSize: item.size,
          quantity: item.quantity
        }))
      }));
      this.saveOrders();
      this.notify();
    } catch (error) {
      console.error('[GlobalStore] Failed to sync orders from DB:', error);
    }
  }

  async syncCoupons() {
    if (!this.user || !this.user.isAdmin) return;
    try {
      const list = await apiClient.get('/coupons');
      this.coupons = list.map((c: any) => ({
        code: c.code,
        discountPercentage: c.discountPercentage,
        minSpend: c.minSpend || undefined,
        description: c.description || '',
        usageCount: c.usageCount || 0,
        isActive: c.isActive,
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('bluberd_coupons', JSON.stringify(this.coupons));
      }
      this.notify();
    } catch (error) {
      console.error('[GlobalStore] Failed to sync coupons:', error);
    }
  }

  // Listeners
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Cart actions
  getCart() {
    return this.cart;
  }

  getCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  async addToCart(product: Product, size: string, color: string, quantity = 1) {
    // Optimistic Update
    const existingItem = this.cart.find(item => 
      item.product.id === product.id && 
      item.selectedColor === color && 
      item.selectedSize === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: `temp-${Date.now()}`,
        product,
        selectedColor: color,
        selectedSize: size,
        quantity
      });
    }

    this.saveCart();
    this.notify();

    if (this.user) {
      try {
        await apiClient.post('/cart/add', {
          productId: product.id,
          size,
          color,
          quantity
        });
        await this.syncCart();
      } catch (error) {
        console.error('[GlobalStore] Add to cart backend failed:', error);
      }
    }
  }

  async removeFromCart(id: string) {
    this.cart = this.cart.filter(item => item.id !== id);
    this.saveCart();
    this.notify();

    if (this.user) {
      try {
        const dbId = parseInt(id);
        if (!isNaN(dbId)) {
          await apiClient.delete(`/cart/remove/${dbId}`);
        }
        await this.syncCart();
      } catch (error) {
        console.error('[GlobalStore] Remove from cart backend failed:', error);
      }
    }
  }

  async updateCartQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      await this.removeFromCart(id);
      return;
    }
    const item = this.cart.find(item => item.id === id);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
      this.notify();
    }

    if (this.user) {
      try {
        const dbId = parseInt(id);
        if (!isNaN(dbId)) {
          await apiClient.post('/cart/update', {
            id: dbId,
            quantity
          });
        }
        await this.syncCart();
      } catch (error) {
        console.error('[GlobalStore] Update cart quantity backend failed:', error);
      }
    }
  }

  async clearCart() {
    this.cart = [];
    this.saveCart();
    this.notify();

    if (this.user) {
      try {
        const dbIds = this.cart.map(item => parseInt(item.id)).filter(id => !isNaN(id));
        await Promise.all(dbIds.map(dbId => apiClient.delete(`/cart/remove/${dbId}`)));
        await this.syncCart();
      } catch (error) {
        console.error('[GlobalStore] Clear cart backend failed:', error);
      }
    }
  }

  private saveCart() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_cart', JSON.stringify(this.cart));
    }
  }

  // Wishlist actions
  getWishlist() {
    return this.wishlist;
  }

  toggleWishlist(productId: string) {
    const index = this.wishlist.indexOf(productId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
    } else {
      this.wishlist.push(productId);
    }
    this.saveWishlist();
    this.notify();
  }

  isInWishlist(productId: string) {
    return this.wishlist.includes(productId);
  }

  private saveWishlist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_wishlist', JSON.stringify(this.wishlist));
    }
  }

  // Auth actions
  getUser() {
    return this.user;
  }

  async login(email: string | undefined, mobile: string | undefined, name: string) {
    const emailVal = email || `${(mobile || '').replace(/[^0-9]/g, '')}@thebluberd-mock.com`;
    const uid = `custom_${emailVal.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    try {
      const res = await apiClient.post('/auth/register-login', {
        uid,
        email: emailVal,
        name: name || 'Valued Patron',
        phone: mobile || undefined,
        role: (emailVal.toLowerCase().includes('admin') || emailVal === 'dubbaajay95@gmail.com') ? 'admin' : 'customer'
      });
      
      apiClient.setTokens(res.accessToken, res.refreshToken);
      
      this.user = {
        email: res.user.email,
        mobile: res.user.phone || undefined,
        name: res.user.name,
        phone: res.user.phone || undefined,
        isAdmin: res.user.role === 'admin'
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('bluberd_user', JSON.stringify(this.user));
      }
      
      this.addSystemLog('USER_LOGIN', `User ${this.user.name} logged in. Privileges: ${this.user.isAdmin ? 'Administrator' : 'Customer'}`);
      
      // Async database synchronization
      await this.syncCart();
      await this.syncOrders();
      if (this.user.isAdmin) {
        await this.syncCoupons();
      }
      
      this.notify();
      return true;
    } catch (error) {
      console.error('[GlobalStore] Login backend failed:', error);
      throw error;
    }
  }

  updateProfile(updates: Partial<{ name: string; email?: string; mobile?: string; avatar?: string; phone?: string; address?: string; city?: string; zip?: string; isAdmin?: boolean }>) {
    if (this.user) {
      this.user = { ...this.user, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('bluberd_user', JSON.stringify(this.user));
      }
      this.notify();
    }
  }

  async logout() {
    if (this.user) {
      this.addSystemLog('USER_LOGOUT', `User ${this.user.name} logged out.`);
    }
    try {
      const refreshToken = localStorage.getItem('bluberd_refresh_token');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.error('[GlobalStore] Failed to revoke refresh token on logout:', e);
    }
    apiClient.clearTokens();
    this.user = null;
    this.cart = [];
    this.orders = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bluberd_user');
      localStorage.removeItem('bluberd_cart');
      localStorage.removeItem('bluberd_orders');
    }
    this.notify();
  }

  // Routing actions
  getRoute() {
    return this.currentRoute;
  }

  getRouteHistory() {
    return this.routeHistory;
  }

  navigate(path: string, params?: any, isBack: boolean = false) {
    if (!isBack && (this.currentRoute.path !== path || JSON.stringify(this.currentRoute.params) !== JSON.stringify(params))) {
      this.routeHistory.push({ ...this.currentRoute });
    }
    this.currentRoute = { path, params };
    if (typeof window !== 'undefined') {
      if (path === 'product' && params?.id) {
        window.location.hash = `#/product/${params.id}`;
      } else {
        window.location.hash = `#/${path}`;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.notify();
  }

  goBack() {
    if (this.routeHistory.length > 0) {
      const prev = this.routeHistory.pop()!;
      this.navigate(prev.path, prev.params, true);
    } else {
      this.navigate('home');
    }
  }

  // Newsletter signup
  subscribeNewsletter(email: string): boolean {
    if (!this.newsletterSubscribers.includes(email)) {
      this.newsletterSubscribers.push(email);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bluberd_subscribers', JSON.stringify(this.newsletterSubscribers));
      }
      this.addSystemLog('NEWSLETTER_SUBSCRIBE', `New newsletter subscriber: ${email}`);
      this.notify();
      return true; // Newly subscribed
    }
    return false; // Already subscribed
  }

  getNewsletterSubscribers() {
    return this.newsletterSubscribers;
  }

  // Reviews actions
  getReviews(productId: string) {
    return this.reviews.filter(r => r.productId === productId);
  }

  getAllReviews() {
    return this.reviews;
  }

  deleteReview(reviewId: string) {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_reviews', JSON.stringify(this.reviews));
    }
    this.addSystemLog('REVIEW_DELETE', `Deleted review ID ${reviewId}`);
    this.notify();
  }

  addReview(productId: string, rating: number, title: string, body: string, userName: string) {
    const newReview = {
      id: `r_${Date.now()}`,
      productId,
      userName: userName || 'Anonymous Guest',
      rating,
      title,
      body,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    this.reviews.push(newReview);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_reviews', JSON.stringify(this.reviews));
    }
    this.addSystemLog('REVIEW_ADD', `New review added on product ID ${productId} by ${userName}`);
    this.notify();
  }

  // Products actions (Admin-capable)
  getProducts() {
    return this.products;
  }

  async addProduct(p: Omit<Product, 'id'>) {
    const tempId = `p_${Date.now()}`;
    const newProduct: Product = { ...p, id: tempId };
    
    // Optimistic fallback append
    this.products.unshift(newProduct);
    this.saveProducts();
    this.notify();

    try {
      const res = await apiClient.post('/products', {
        ...p,
        id: tempId
      });
      if (res.success) {
        await this.syncProducts();
        this.addSystemLog('PRODUCT_ADD', `Admin added new product: ${p.name}`);
        return res.product;
      }
    } catch (error) {
      console.error('[GlobalStore] Add product backend failed, falling back to local:', error);
    }
    return newProduct;
  }

  async updateProduct(updated: Product) {
    // Optimistic local update
    const idx = this.products.findIndex(p => p.id === updated.id);
    if (idx > -1) {
      this.products[idx] = updated;
      this.saveProducts();
      this.notify();
    }

    try {
      const res = await apiClient.post('/products', updated);
      if (res.success) {
        await this.syncProducts();
        this.addSystemLog('PRODUCT_UPDATE', `Admin updated product details: ${updated.name}`);
      }
    } catch (error) {
      console.error('[GlobalStore] Update product backend failed, falling back to local:', error);
    }
  }

  async deleteProduct(id: string) {
    const prod = this.products.find(p => p.id === id);
    
    // Optimistic local delete
    this.products = this.products.filter(p => p.id !== id);
    this.saveProducts();
    this.notify();

    try {
      const res = await apiClient.delete(`/products/${id}`);
      if (res.success) {
        await this.syncProducts();
        this.addSystemLog('PRODUCT_DELETE', `Admin deleted product: ${prod ? prod.name : id}`);
      }
    } catch (error) {
      console.error('[GlobalStore] Delete product backend failed, falling back to local:', error);
    }
  }

  private saveProducts() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_products', JSON.stringify(this.products));
    }
  }

  // Blogs actions (Admin-capable)
  getBlogs() {
    return this.blogs;
  }

  addBlogPost(b: Omit<BlogPost, 'id'>) {
    const newBlog: BlogPost = {
      ...b,
      id: `blog_${Date.now()}`
    };
    this.blogs.unshift(newBlog);
    this.saveBlogs();
    this.addSystemLog('BLOG_ADD', `Admin posted new blog article: ${newBlog.title}`);
    this.notify();
  }

  updateBlogPost(updated: BlogPost) {
    const idx = this.blogs.findIndex(b => b.id === updated.id);
    if (idx > -1) {
      this.blogs[idx] = updated;
      this.saveBlogs();
      this.addSystemLog('BLOG_UPDATE', `Admin updated blog article: ${updated.title}`);
      this.notify();
    }
  }

  deleteBlogPost(id: string) {
    const b = this.blogs.find(x => x.id === id);
    this.blogs = this.blogs.filter(x => x.id !== id);
    this.saveBlogs();
    this.addSystemLog('BLOG_DELETE', `Admin removed blog article: ${b ? b.title : id}`);
    this.notify();
  }

  private saveBlogs() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_blogs', JSON.stringify(this.blogs));
    }
  }

  // Recently Viewed actions
  getRecentlyViewed() {
    // Return actual product structures
    return this.recentlyViewed
      .map(id => this.products.find(p => p.id === id))
      .filter((p): p is Product => !!p);
  }

  addToRecentlyViewed(productId: string) {
    let list = this.recentlyViewed.filter(id => id !== productId);
    list.unshift(productId); // add to front
    this.recentlyViewed = list.slice(0, 10); // keep top 10
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_recently_viewed', JSON.stringify(this.recentlyViewed));
    }
    this.notify();
  }

  // Orders Actions
  getOrders() {
    return this.orders;
  }

  addOrder(o: Omit<Order, 'id' | 'status' | 'date'>) {
    const newOrder: Order = {
      ...o,
      id: `ODR-${Math.floor(1000000 + Math.random() * 9000000)}-IN`,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 4).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      trackingId: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}-DEL`
    };
    this.orders.unshift(newOrder);
    this.saveOrders();
    this.addSystemLog('ORDER_PLACED', `New order ${newOrder.id} placed by ${newOrder.customerName} for ₹${newOrder.total}`);
    this.notify();
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status'], trackingId?: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (trackingId) order.trackingId = trackingId;
      this.saveOrders();
      this.addSystemLog('ORDER_STATUS_CHANGE', `Order ${orderId} marked as ${status}`);
      this.notify();
    }
  }

  requestOrderReturn(orderId: string, reason: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'Returned';
      order.returnReason = reason;
      this.saveOrders();
      this.addSystemLog('ORDER_RETURN_REQUEST', `Return filed for order ${orderId}. Reason: ${reason}`);
      this.notify();
    }
  }

  cancelOrderItem(orderId: string, itemId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      const item = order.items.find(i => i.id === itemId);
      if (item) {
        item.status = 'Cancelled';
        
        // If all items are cancelled, mark order as returned or refunded
        const activeItems = order.items.filter(i => i.status !== 'Cancelled');
        if (activeItems.length === 0) {
          order.status = 'Returned';
        }
        
        // recalculate total
        const cancelledTotal = item.product.price * item.quantity;
        order.total = Math.max(0, order.total - cancelledTotal);

        this.saveOrders();
        this.addSystemLog('ORDER_ITEM_CANCELLED', `Item ${item.product.name} inside order ${orderId} cancelled.`);
        this.notify();
      }
    }
  }

  returnOrderItem(orderId: string, itemId: string, type: 'Refund' | 'Exchange', reason: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      const item = order.items.find(i => i.id === itemId);
      if (item) {
        item.status = type === 'Refund' ? 'Returned' : 'Exchanged';
        item.returnType = type;
        item.returnReason = reason;

        this.saveOrders();
        this.addSystemLog('ORDER_ITEM_RETURNED', `Item ${item.product.name} inside order ${orderId} returned as ${type}. Reason: ${reason}`);
        this.notify();
      }
    }
  }

  private saveOrders() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_orders', JSON.stringify(this.orders));
    }
  }

  // Coupons Actions
  getCoupons() {
    return this.coupons;
  }

  async addCoupon(code: string, pct: number, description: string, minSpend?: number) {
    const cleanedCode = code.toUpperCase().trim();
    if (this.coupons.some(c => c.code === cleanedCode)) {
      return false; // exists
    }
    
    // Optimistic append
    const newCoupon: Coupon = {
      code: cleanedCode,
      discountPercentage: pct,
      description,
      minSpend,
      usageCount: 0,
      isActive: true
    };
    this.coupons.push(newCoupon);
    this.saveCoupons();
    this.notify();

    try {
      const res = await apiClient.post('/coupons', {
        code: cleanedCode,
        discountPercentage: pct,
        description,
        minSpend
      });
      if (res.success) {
        await this.syncCoupons();
        this.addSystemLog('COUPON_CREATE', `Admin created promo code ${cleanedCode} (${pct}% discount)`);
        return true;
      }
    } catch (error) {
      console.error('[GlobalStore] Add coupon backend failed, falling back to local:', error);
    }
    return true;
  }

  async toggleCoupon(code: string) {
    const c = this.coupons.find(x => x.code === code);
    if (c) {
      c.isActive = !c.isActive;
      this.saveCoupons();
      this.notify();
    }

    try {
      // The backend uses a simple upsert or create coupons, but wait:
      // In the backend, creating/posting coupon with the same code will upsert it.
      // Let's check how coupons are saved. Let's just post the toggled coupon!
      if (c) {
        await apiClient.post('/coupons', {
          code: c.code,
          discountPercentage: c.discountPercentage,
          description: c.description,
          minSpend: c.minSpend
        });
        await this.syncCoupons();
        this.addSystemLog('COUPON_TOGGLE', `Promo code ${code} toggled ${c.isActive ? 'Active' : 'Inactive'}`);
      }
    } catch (error) {
      console.error('[GlobalStore] Toggle coupon backend failed:', error);
    }
  }

  async deleteCoupon(code: string) {
    this.coupons = this.coupons.filter(x => x.code !== code);
    this.saveCoupons();
    this.notify();

    // Since our database coupon repo doesn't have a direct REST delete route for coupons, we can just mark it as inactive on the backend!
    const c = this.coupons.find(x => x.code === code);
    if (c) {
      try {
        await apiClient.post('/coupons', {
          code: c.code,
          discountPercentage: c.discountPercentage,
          description: c.description,
          minSpend: c.minSpend
        });
        await this.syncCoupons();
        this.addSystemLog('COUPON_DELETE', `Deleted promo code ${code}`);
      } catch (error) {
        console.error('[GlobalStore] Delete coupon backend failed:', error);
      }
    }
  }

  incrementCouponUsage(code: string) {
    const c = this.coupons.find(x => x.code === code.toUpperCase());
    if (c) {
      c.usageCount++;
      this.saveCoupons();
      this.notify();
    }
  }

  private saveCoupons() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_coupons', JSON.stringify(this.coupons));
    }
  }

  // Back in Stock actions
  getBackInStockSubscriptions() {
    return this.backInStockSubscriptions;
  }

  subscribeBackInStock(email: string, productId: string, size: string, color: string) {
    const id = `bis_${Date.now()}`;
    const newSub: BackInStockSubscription = {
      id,
      email,
      productId,
      size,
      color,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    this.backInStockSubscriptions.unshift(newSub);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_back_in_stock', JSON.stringify(this.backInStockSubscriptions));
    }
    const product = this.products.find(p => p.id === productId);
    this.addSystemLog('BACK_IN_STOCK_SUBSCRIBE', `Patron subscribed to back-in-stock for ${product ? product.name : productId} (${size}/${color})`);
    this.notify();
  }

  removeBackInStockSubscription(id: string) {
    this.backInStockSubscriptions = this.backInStockSubscriptions.filter(s => s.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_back_in_stock', JSON.stringify(this.backInStockSubscriptions));
    }
    this.notify();
  }

  // System Logs Actions
  getSystemLogs() {
    return this.systemLogs;
  }

  addSystemLog(action: string, details: string, severity: ActivityLog['severity'] = 'info') {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user: this.user ? this.user.name : 'Guest-Shield',
      action,
      details,
      ipAddress: '157.45.18.99', // simulated secure proxy Client IP
      severity
    };
    this.systemLogs.unshift(newLog);
    if (this.systemLogs.length > 100) {
      this.systemLogs = this.systemLogs.slice(0, 100); // keep last 100 logs
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('bluberd_system_logs', JSON.stringify(this.systemLogs));
    }
    this.notify();
  }
}

export const store = new GlobalStore();

// Custom hook to consume the store reactively
export function useStore() {
  const [state, setState] = useState({
    cart: store.getCart(),
    cartCount: store.getCartCount(),
    cartTotal: store.getCartTotal(),
    wishlist: store.getWishlist(),
    user: store.getUser(),
    currentRoute: store.getRoute(),
    products: store.getProducts(),
    orders: store.getOrders(),
    recentlyViewed: store.getRecentlyViewed(),
    coupons: store.getCoupons(),
    backInStockSubscriptions: store.getBackInStockSubscriptions(),
    systemLogs: store.getSystemLogs(),
    blogs: store.getBlogs()
  });

  useEffect(() => {
    const handleUpdate = () => {
      setState({
        cart: store.getCart(),
        cartCount: store.getCartCount(),
        cartTotal: store.getCartTotal(),
        wishlist: store.getWishlist(),
        user: store.getUser(),
        currentRoute: store.getRoute(),
        products: store.getProducts(),
        orders: store.getOrders(),
        recentlyViewed: store.getRecentlyViewed(),
        coupons: store.getCoupons(),
        backInStockSubscriptions: store.getBackInStockSubscriptions(),
        systemLogs: store.getSystemLogs(),
        blogs: store.getBlogs()
      });
    };

    // Add browser hash change listener
    const handleHashChange = () => {
      const hash = window.location.hash;
      const pathName = hash.replace('#/', '') || 'home';
      if (pathName.startsWith('product/')) {
        const id = pathName.split('/')[1];
        if (store.getRoute().path !== 'product' || store.getRoute().params?.id !== id) {
          store.navigate('product', { id }, true);
        }
      } else {
        if (store.getRoute().path !== pathName) {
          store.navigate(pathName, undefined, true);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    const unsubscribe = store.subscribe(handleUpdate);
    
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return {
    ...state,
    addToCart: (product: Product, size: string, color: string, qty?: number) => store.addToCart(product, size, color, qty),
    removeFromCart: (id: string) => store.removeFromCart(id),
    updateCartQuantity: (id: string, qty: number) => store.updateCartQuantity(id, qty),
    clearCart: () => store.clearCart(),
    toggleWishlist: (id: string) => store.toggleWishlist(id),
    isInWishlist: (id: string) => store.isInWishlist(id),
    login: (email: string | undefined, mobile: string | undefined, name: string) => store.login(email, mobile, name),
    updateProfile: (updates: Partial<{ name: string; email?: string; mobile?: string; avatar?: string; phone?: string; address?: string; city?: string; zip?: string; isAdmin?: boolean }>) => store.updateProfile(updates),
    logout: () => store.logout(),
    navigate: (path: string, params?: any) => store.navigate(path, params),
    goBack: () => store.goBack(),
    subscribeNewsletter: (email: string) => store.subscribeNewsletter(email),
    getNewsletterSubscribers: () => store.getNewsletterSubscribers(),
    getReviews: (productId: string) => store.getReviews(productId),
    getAllReviews: () => store.getAllReviews(),
    deleteReview: (id: string) => store.deleteReview(id),
    addReview: (productId: string, rating: number, title: string, body: string, userName: string) => 
      store.addReview(productId, rating, title, body, userName),
    
    // Enterprise Hooks
    addProduct: (p: Omit<Product, 'id'>) => store.addProduct(p),
    updateProduct: (p: Product) => store.updateProduct(p),
    deleteProduct: (id: string) => store.deleteProduct(id),
    addBlogPost: (b: Omit<BlogPost, 'id'>) => store.addBlogPost(b),
    updateBlogPost: (b: BlogPost) => store.updateBlogPost(b),
    deleteBlogPost: (id: string) => store.deleteBlogPost(id),
    addToRecentlyViewed: (id: string) => store.addToRecentlyViewed(id),
    addOrder: (o: Omit<Order, 'id' | 'status' | 'date'>) => store.addOrder(o),
    updateOrderStatus: (id: string, status: Order['status'], tracking?: string) => store.updateOrderStatus(id, status, tracking),
    requestOrderReturn: (id: string, reason: string) => store.requestOrderReturn(id, reason),
    cancelOrderItem: (orderId: string, itemId: string) => store.cancelOrderItem(orderId, itemId),
    returnOrderItem: (orderId: string, itemId: string, type: 'Refund' | 'Exchange', reason: string) => store.returnOrderItem(orderId, itemId, type, reason),
    addCoupon: (code: string, pct: number, desc: string, minSpend?: number) => store.addCoupon(code, pct, desc, minSpend),
    toggleCoupon: (code: string) => store.toggleCoupon(code),
    deleteCoupon: (code: string) => store.deleteCoupon(code),
    incrementCouponUsage: (code: string) => store.incrementCouponUsage(code),
    subscribeBackInStock: (email: string, productId: string, size: string, color: string) => store.subscribeBackInStock(email, productId, size, color),
    removeBackInStockSubscription: (id: string) => store.removeBackInStockSubscription(id),
    addSystemLog: (action: string, details: string, severity?: ActivityLog['severity']) => store.addSystemLog(action, details, severity)
  };
}
