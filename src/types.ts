export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp?: number;
  badge?: string;
  category: 'men' | 'women' | 'accessories' | 'sale';
  subcategory: string;
  images: string[];
  colors: { name: string; value: string }[];
  sizes: string[];
  description: string;
  fabricCare: string;
  shippingReturns: string;
  styles?: string[];
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number; // 1-5
  title: string;
  body: string;
  date: string;
}

export interface CartItem {
  id: string; // unique key combining product.id + selectedColor + selectedSize
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  status?: 'Ordered' | 'Cancelled' | 'Returned' | 'Exchanged';
  returnType?: 'Refund' | 'Exchange';
  returnReason?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  image: string;
  readTime: string;
}
