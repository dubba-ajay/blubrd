import { Product, BlogPost } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Aero Tech Men Fleece Hoodie',
    brand: 'The Bluberd Active',
    price: 2499,
    mrp: 3499,
    badge: 'NEW',
    category: 'men',
    subcategory: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Charcoal', value: '#2C3539' },
      { name: 'Heather Grey', value: '#D3D3D3' },
      { name: 'Off-White', value: '#FAF9F6' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Designed for premium athletic comfort or minimal streetwear vibes. Made from extra-heavy organic cotton fleece with brushed interior warmth, structured kangaroo pocket, and double-lined hood with custom metal tipping.',
    fabricCare: '100% Organic Cotton Fleece. Machine wash cold with like colors. Tumble dry low.',
    shippingReturns: 'Free express shipping on orders above ₹999. Deliveries within India take 3-5 business days. Easy 15-day hassle-free returns.'
  },
  {
    id: 'p2',
    name: 'Classic Overhead Men Knit Hoodie',
    brand: 'The Bluberd Essential',
    price: 2899,
    mrp: 3999,
    badge: 'BEST SELLER',
    category: 'men',
    subcategory: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Camel Tan', value: '#C19A6B' },
      { name: 'Olive Green', value: '#556B2F' },
      { name: 'Midnight Navy', value: '#131A26' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    description: 'An exquisite overhead style featuring relaxed drop-shoulder tailoring and extra-soft cotton loopback knit. Features premium self-fabric cuffs, an adjustable drawcord waist, and heavy-duty flatlock stitched detailing.',
    fabricCare: '80% Cotton, 20% Polyester. Machine wash warm. Warm iron if needed.',
    shippingReturns: 'Free shipping within India. Delivered in 3-5 days. Hassle-free 15-day return window.'
  },
  {
    id: 'p3',
    name: 'Minimalist Crewneck Men Sweatshirt',
    brand: 'The Bluberd Studio',
    price: 1999,
    mrp: 2799,
    badge: 'SALE',
    category: 'men',
    subcategory: 'Sweatshirts',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609873814058-a8928924184a?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Sand Khaki', value: '#C2B280' },
      { name: 'Pure Black', value: '#1A1A1A' },
      { name: 'Burgundy', value: '#800020' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'A clean modern silhouette made from supreme-grade French Terry cotton. This crewneck sweatshirt features premium ribbed side panels for comfort, an elegant ribbed neck collar, and signature embroidered chest logo.',
    fabricCare: '100% French Terry Cotton. Machine wash inside out on gentle cycle. Do not bleach.',
    shippingReturns: 'Complimentary premium shipping. Standard delivery 4-6 business days. Easy exchange.'
  },
  {
    id: 'p4',
    name: 'Heritage Cable Men Knit Sweatshirt',
    brand: 'The Bluberd Heritage',
    price: 3299,
    mrp: 4500,
    badge: 'BEST SELLER',
    category: 'men',
    subcategory: 'Sweatshirts',
    images: [
      'https://images.unsplash.com/photo-1609873814058-a8928924184a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Oatmeal', value: '#EAE6DF' },
      { name: 'Sage Green', value: '#707A65' },
      { name: 'Rust Orange', value: '#B7410E' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'The pinnacle of cold weather sophistication. This heavy-gauge cotton knit sweatshirt combines classic cable texture with premium modern ribbed cuffs and a relaxed, timeless fit.',
    fabricCare: '100% Soft-Spun Cotton Knit. Hand wash cold. Dry flat in shade. Do not wring.',
    shippingReturns: 'Free express shipping on orders above ₹999. Deliveries within India take 3-5 business days. Easy 15-day return policy.'
  },
  {
    id: 'p5',
    name: 'Classic Biker Men Leather Jacket',
    brand: 'The Bluberd Tailored',
    price: 7999,
    mrp: 11999,
    badge: 'NEW',
    category: 'men',
    subcategory: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Midnight Black', value: '#1A1A1A' },
      { name: 'Vintage Brown', value: '#4A3B32' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Handcrafted from top-grain buttery-soft lambskin leather. Features asymmetric metal zippers, classic snap collar detailing, zipper cuffs, and a luxury insulated satin interior lining.',
    fabricCare: '100% Top-Grain Lambskin Leather. Professional leather clean only. Store on padded hanger.',
    shippingReturns: 'Free shipping on orders over ₹999. Fast 3-day home delivery. Easy exchange/returns within 15 days.'
  },
  {
    id: 'p6',
    name: 'Atelier Premium Men Denim Jacket',
    brand: 'The Bluberd Atelier',
    price: 3499,
    mrp: 4999,
    category: 'men',
    subcategory: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Indigo Blue', value: '#1C3144' },
      { name: 'Washed Black', value: '#3F3F3F' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'A vintage-inspired silhouette constructed from heavy 14oz Japanese selvedge denim. Complete with hand-distressed detailing, customized metal shank buttons, and deep internal pockets.',
    fabricCare: '100% Selvedge Cotton Denim. Wash inside out in cold water. Indigo may transfer initially.',
    shippingReturns: 'Shipped within 24 hours. Delivery takes 2-4 days. Free returns and size exchanges.'
  },
  {
    id: 'p7',
    name: 'Oversized Cozy Women Fleece Hoodie',
    brand: 'The Bluberd Modern',
    price: 2699,
    mrp: 3599,
    badge: 'NEW',
    category: 'women',
    subcategory: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Sage Green', value: '#A5C4A8' },
      { name: 'Blush Pink', value: '#FFD1DC' },
      { name: 'Onyx Black', value: '#242426' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'An ultra-plush oversized fleece hoodie featuring elegant side slits, drop shoulders, and a beautiful minimalist structure. Perfect for layering over activewear or styling with chic denim.',
    fabricCare: '80% Cotton, 20% Polyester fleece. Machine wash cold with like colors inside-out.',
    shippingReturns: 'Express shipping in India. Delivers in 2-4 days. 15-day simple exchange/returns.'
  },
  {
    id: 'p8',
    name: 'Solstice Drawstring Women Hoodie',
    brand: 'The Bluberd Modern',
    price: 2899,
    mrp: 3899,
    badge: 'BEST SELLER',
    category: 'women',
    subcategory: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Eggshell White', value: '#F0EAD6' },
      { name: 'Dusty Rose', value: '#C9A0DC' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Immaculate casual styling. Features a premium wide-cut hood, luxurious heavy cotton cord drawstrings, and tailored side seam pockets for a super sleek, clean silhouette.',
    fabricCare: '100% Cotton loopback knit. Gentle machine wash cold. Lay flat to dry.',
    shippingReturns: 'Free premium delivery. Shipped in 3-5 days. Easy exchange for alternate sizes.'
  },
  {
    id: 'p9',
    name: 'Luxe Loungewear Women Sweatshirt',
    brand: 'The Bluberd Atelier',
    price: 2199,
    mrp: 2999,
    badge: 'SALE',
    category: 'women',
    subcategory: 'Sweatshirts',
    images: [
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548624149-f7b31668831a?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Dusty Lavender', value: '#A899B5' },
      { name: 'Emerald', value: '#0B6623' },
      { name: 'Peach Cream', value: '#FFE5D9' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'A super soft, medium-weight crewneck tailored with premium organic cotton blend fabric. Features a modern ribbed mock neck, ribbed cuffs, and an elegantly relaxed fit.',
    fabricCare: '65% Organic Cotton, 35% Modal. Wash cold inside out on delicate cycle. Warm iron.',
    shippingReturns: 'Complimentary premium shipping. Standard delivery 4-6 business days. Fast exchange.'
  },
  {
    id: 'p10',
    name: 'Downtown Crop Women Sweatshirt',
    brand: 'The Bluberd Modern',
    price: 1899,
    mrp: 2499,
    category: 'women',
    subcategory: 'Sweatshirts',
    images: [
      'https://images.unsplash.com/photo-1548624149-f7b31668831a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Slate Grey', value: '#708090' },
      { name: 'Sunset Peach', value: '#FCD7B4' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Sporty meets luxury. This crop-length raw hem sweatshirt features extra-wide sleeves, soft fleece lining, and stylish drop shoulder paneling for a supreme streetwear statement.',
    fabricCare: '80% Cotton, 20% Polyester. Machine wash warm with similar colors.',
    shippingReturns: 'Free Indian shipping. Delivered in 3 business days. 15-day return window.'
  },
  {
    id: 'p11',
    name: 'Aria Suede Women Bomber Jacket',
    brand: 'The Bluberd Modern',
    price: 4599,
    mrp: 5999,
    badge: 'BEST SELLER',
    category: 'women',
    subcategory: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Cognac Suede', value: '#834333' },
      { name: 'Olive Suede', value: '#5B5E43' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'An absolute head-turner. Features buttery faux-suede fabric with an elastic ribbed waistband, custom metallic snaps, and a beautiful premium interior satin lining for ultimate touch of elegance.',
    fabricCare: 'Premium Faux Suede. Professional dry clean only. Brush with suede brush to maintain texture.',
    shippingReturns: 'Free fast delivery. Shipped in 24 hours. Easy returns via self-service portal within 15 days.'
  },
  {
    id: 'p12',
    name: 'Classic Distressed Women Denim Jacket',
    brand: 'The Bluberd Modern',
    price: 3199,
    mrp: 4200,
    badge: 'NEW',
    category: 'women',
    subcategory: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Classic Blue Wash', value: '#7392B7' },
      { name: 'Acid Washed Black', value: '#3A3B3C' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Your perfect companion for casual outfits. Tailored from top-grade recycled sturdy denim, detailed with light fading, dual button-flap breast pockets, and a timeless relaxed cut.',
    fabricCare: '100% Recycled Cotton Denim. Machine wash cold inside out. Tumble dry low.',
    shippingReturns: 'Complimentary shipping. Standard delivery within 3-5 business days. Fast exchange for size issues.'
  },
  {
    id: 'p13',
    name: 'Signature Pastel Crewneck Women Sweatshirt',
    brand: 'The Bluberd Active',
    price: 2199,
    mrp: 2999,
    badge: 'NEW',
    category: 'women',
    subcategory: 'Sweatshirts',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548624149-f7b31668831a?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Lilac Haze', value: '#DCD0FF' },
      { name: 'Sage Mint', value: '#BDFCC9' },
      { name: 'Ivory Cream', value: '#FDF6E2' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Minimalism at its finest. This signature crewneck sweatshirt features an incredibly soft brushed organic cotton interior, tailored athletic raglan sleeves, and a subtle tone-on-tone embroidered chest emblem. Engineered for durability, maximum comfort, and seamless styling.',
    fabricCare: '90% Organic Cotton, 10% Recycled Polyester. Wash inside-out in cold water with gentle cycle.',
    shippingReturns: 'Free premium shipping within India. Easy returns and size exchanges within 15 days.'
  },
  {
    id: 'p14',
    name: 'Thermal Heavyweight Zip-Up Men Hoodie',
    brand: 'The Bluberd Essential',
    price: 2999,
    mrp: 3999,
    badge: 'BEST SELLER',
    category: 'men',
    subcategory: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Graphite Grey', value: '#383838' },
      { name: 'Navy Blue', value: '#1F2937' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'A masterpiece of utility and warmth. Constructed with extra-thick double-knit cotton-poly thermal fleece. Features premium gunmetal YKK zipper, ribbed elastic hem & cuffs, deep fleece-lined handwarmer pockets, and a dynamic adjustable storm hood.',
    fabricCare: '100% Thermal Cotton-Poly blend. Machine wash cold with similar colors. Line dry.',
    shippingReturns: 'Complimentary shipping across India. Standard delivery takes 3-5 days. Simple self-service returns.'
  },
  {
    id: 'p15',
    name: 'Sherpa Lined Corduroy Women Jacket',
    brand: 'The Bluberd Studio',
    price: 4299,
    mrp: 5499,
    badge: 'LIMITED EDITION',
    category: 'women',
    subcategory: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Vintage Camel', value: '#C19A6B' },
      { name: 'Olive Drab', value: '#556B2F' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'The ultimate winter outer layer. Crafted from heavy-gauge 100% cotton corduroy, completely lined with plush, super-soft high-pile faux Sherpa fleece for optimal thermal insulation. Features signature metal shank buttons, dual chest flap pockets, and cozy side pockets.',
    fabricCare: '100% Cotton Corduroy with Sherpa Lining. Dry clean only. Use soft brush for corduroy fibers.',
    shippingReturns: 'Insured premium shipping. Deliveries take 2-4 business days. Size exchanges available.'
  },
  {
    id: 'p16',
    name: 'Vintage Raglan Athletics Men Sweatshirt',
    brand: 'The Bluberd Active',
    price: 1899,
    mrp: 2499,
    badge: 'SALE',
    category: 'men',
    subcategory: 'Sweatshirts',
    images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Athletic Grey', value: '#A0A0A0' },
      { name: 'Burgundy Red', value: '#800020' },
      { name: 'Forest Green', value: '#1E3F20' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    description: 'Inspired by collegiate athletics. This heavyweight raglan sleeve sweatshirt is woven from a luxury cotton French Terry yarn that is breathable yet cozy. Highlights include double-stitched flatlock seams, classic retro rib triangular insert at the neck collar, and dynamic vintage washing.',
    fabricCare: '100% Premium Cotton French Terry. Machine wash inside-out with gentle detergent. Warm iron if needed.',
    shippingReturns: 'Complimentary shipping across India. Standard delivery 3-5 days. Hassle-free exchanges.'
  },
  {
    id: 'p17',
    name: 'Signature Heavyweight Cotton Men Tee',
    brand: 'The Bluberd Essential',
    price: 1199,
    mrp: 1799,
    badge: 'BEST SELLER',
    category: 'men',
    subcategory: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Classic White', value: '#FFFFFF' },
      { name: 'Midnight Black', value: '#1C1C1C' },
      { name: 'Oatmeal', value: '#EAE6DF' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Crafted from an ultra-durable 240 GSM heavy cotton jersey. Features a comfortable, relaxed, boxy cut with drop-shoulders and a tight, shape-retaining ribbed crewneck collar.',
    fabricCare: '100% Premium Organic Cotton. Cold machine wash inside out. Tumble dry on low heat.',
    shippingReturns: 'Free premium shipping in India. Standard delivery within 3-5 days. Easy size exchanges.'
  },
  {
    id: 'p18',
    name: 'Atelier Relaxed Crop Women Tee',
    brand: 'The Bluberd Atelier',
    price: 999,
    mrp: 1499,
    badge: 'NEW',
    category: 'women',
    subcategory: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Lilac Pastel', value: '#E3D7FF' },
      { name: 'Soft Peach', value: '#FFE6D5' },
      { name: 'Off-White', value: '#FAF9F6' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'The ultimate stylish companion. Made from ultra-soft fine combed cotton with a raw edge cropped hem, breathable knit construction, and relaxed drop shoulders for a luxury streetwear look.',
    fabricCare: '100% Fine Combed Cotton. Machine wash inside-out with gentle cycle. Warm iron.',
    shippingReturns: 'Shipped within 24 hours. Delivery takes 2-4 business days. Hassle-free returns.'
  },
  {
    id: 'p19',
    name: 'Minimalist Organic Cotton Men Tee',
    brand: 'The Bluberd Studio',
    price: 1299,
    mrp: 1899,
    badge: 'NEW',
    category: 'men',
    subcategory: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Sage Green', value: '#8FA382' },
      { name: 'Desert Sand', value: '#D2B48C' },
      { name: 'Pure Charcoal', value: '#363636' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'A classic, tailored everyday staple. Sourced from 100% certified organic cotton, this tee is super breathable, soft on skin, and designed to look sharp wash after wash.',
    fabricCare: '100% Certified Organic Cotton. Machine wash cold with similar colors. Line dry in shade.',
    shippingReturns: 'Complimentary shipping across India. Standard delivery takes 3-5 days. Easy exchanges.'
  },
  {
    id: 'p20',
    name: 'Premium Oversized Cotton Women Tee',
    brand: 'The Bluberd Modern',
    price: 1199,
    mrp: 1699,
    badge: 'BEST SELLER',
    category: 'women',
    subcategory: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Soft Sage', value: '#A5C4A8' },
      { name: 'Dusty Rose', value: '#C9A0DC' },
      { name: 'Oatmeal', value: '#EAE6DF' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'An elegant statement piece. Features a super roomy oversized silhouette with side slits and a premium heavy rib mock-neck collar. Woven from luxury knit modal cotton blend.',
    fabricCare: '70% Combed Cotton, 30% Modal. Dry flat in shade. Do not bleach or wring.',
    shippingReturns: 'Free premium delivery. Delivered in 3-5 days. Simple self-service size exchanges.'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'The Revival of Chikankari: From Awadh to Modern Runways',
    excerpt: 'Explore the journey of Chikankari embroidery and how modern designers are preserving this meticulous handwork.',
    content: 'Chikankari is a traditional embroidery style from Lucknow, India. Literally translated, the word means embroidery (thread or wire work). Believed to have been introduced by Noor Jahan, the consort of Mughal emperor Jahangir, it began as a delicate white-on-white embroidery on fine muslin... Today, Chikankari has found its place on international runways while continuing to empower thousands of female weavers in rural Awadh.',
    category: 'Heritage Craft',
    date: 'June 18, 2026',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    readTime: '4 mins read'
  },
  {
    id: 'b2',
    title: 'Linen & Cotton: The Ultimate Summer Breathing Guide',
    excerpt: 'An in-depth guide to understanding weave densities and selecting natural fabrics that keep you cool in high temperatures.',
    content: 'In tropical climates, fabric choice defines comfort. Natural linen, harvested from the flax plant, is prized for its exceptional breathability and moisture-wicking properties. Combined with long-staple organic cotton, it creates the ultimate summer fabric... Discover our ethical blends designed to breathe with you.',
    category: 'Style Manual',
    date: 'June 25, 2026',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80',
    readTime: '3 mins read'
  }
];

