import { useEffect } from 'react';
import { useStore } from '../store';

export default function SEOHandler() {
  const { currentRoute, getReviews, products } = useStore();

  useEffect(() => {
    let title = 'The Bluberd | Premium Indian D2C Fashion E-Commerce';
    let description = 'A premium Indian D2C fashion e-commerce brand celebrating local craft and modern elegance with the tagline "Wear Your Story".';
    let canonicalUrl = window.location.origin + window.location.hash;
    let schemaData: any = null;

    if (currentRoute.path === 'home') {
      title = 'The Bluberd | Premium Indian D2C Fashion E-Commerce';
      description = 'The Bluberd is a premium Indian D2C fashion brand celebrating local craft, natural fibers, and modern elegance. Wear Your Story.';
      
      // Multi-schema for Home (Organization & WebSite)
      schemaData = [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'The Bluberd',
          'url': window.location.origin,
          'logo': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=200',
          'sameAs': [
            'https://instagram.com/thebluberd',
            'https://pinterest.com/thebluberd'
          ],
          'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': '+91-999-999-9999',
            'contactType': 'customer service',
            'email': 'care@thebluberd.com'
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'The Bluberd',
          'url': window.location.origin,
          'potentialAction': {
            '@type': 'SearchAction',
            'target': `${window.location.origin}/#/shop?search={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }
      ];
    } else if (currentRoute.path === 'shop') {
      title = 'Shop All Premium Weaves | The Bluberd';
      description = 'Discover ethically woven artisanal Indian clothing, handlooms, linens, sarees, and traditional modern kurtas.';
      
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'Shop All Premium Weaves',
        'description': 'Explore handloom cotton, linen, silk sarees, kurtas, and apparel from India\'s legacy craft regions.',
        'url': canonicalUrl
      };
    } else if (currentRoute.path === 'product' && currentRoute.params?.id) {
      const prodId = currentRoute.params.id;
      const product = products.find((p) => p.id === prodId);
      
      if (product) {
        title = `${product.brand} ${product.name} | The Bluberd`;
        description = product.description.substring(0, 155) + '...';
        
        // Fetch reviews
        const reviews = getReviews(prodId) || [];
        const averageRating = reviews.length > 0 
          ? Number((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1))
          : 5.0;

        // Structured Product Schema with Offers & Ratings
        schemaData = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': product.name,
          'image': product.images,
          'description': product.description,
          'brand': {
            '@type': 'Brand',
            'name': product.brand
          },
          'category': product.category,
          'offers': {
            '@type': 'Offer',
            'url': canonicalUrl,
            'priceCurrency': 'INR',
            'price': product.price,
            'itemCondition': 'https://schema.org/NewCondition',
            'availability': 'https://schema.org/InStock',
            'seller': {
              '@type': 'Organization',
              'name': 'The Bluberd'
            }
          }
        };

        if (reviews.length > 0) {
          schemaData.aggregateRating = {
            '@type': 'AggregateRating',
            'ratingValue': averageRating,
            'reviewCount': reviews.length,
            'bestRating': '5',
            'worstRating': '1'
          };
          schemaData.review = reviews.map((r: any) => ({
            '@type': 'Review',
            'author': {
              '@type': 'Person',
              'name': r.userName
            },
            'datePublished': new Date(r.date).toISOString().split('T')[0],
            'reviewBody': r.body,
            'name': r.title,
            'reviewRating': {
              '@type': 'Rating',
              'ratingValue': r.rating,
              'bestRating': '5'
            }
          }));
        }
      }
    } else {
      // General title casing
      const pageName = currentRoute.path.charAt(0).toUpperCase() + currentRoute.path.slice(1);
      title = `${pageName} | The Bluberd`;
      description = `Access the secure ${pageName} area of The Bluberd, your destination for premium sustainable Indian fashion.`;
    }

    // Apply Meta Tags and Title
    document.title = title;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Inject Schema JSON-LD Script tag
    let schemaScript = document.getElementById('seo-structured-data') as HTMLScriptElement;
    if (schemaScript) {
      schemaScript.textContent = JSON.stringify(schemaData);
    } else {
      schemaScript = document.createElement('script');
      schemaScript.id = 'seo-structured-data';
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(schemaData);
      document.head.appendChild(schemaScript);
    }

    return () => {
      // Optional cleanups
    };
  }, [currentRoute, getReviews]);

  return null; // Side-effect component
}
