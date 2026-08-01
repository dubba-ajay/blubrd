import React, { useState } from 'react';
import { useStore } from '../store';
import { ArrowRight, Check, Instagram, Facebook } from 'lucide-react';
import { PLACEHOLDERS } from '../constants/placeholders';

// High-fidelity vector WhatsApp icon
const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`${className} fill-current shrink-0`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.454L0 24zm6.59-4.846c1.6.95 3.18 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.63-1.023-5.101-2.887-6.968C16.528 1.917 14.054.89 11.424.89 5.992.89 1.57 5.31 1.567 10.742c-.001 1.737.457 3.432 1.328 4.922L1.875 21.8l6.23-1.634zM16.921 13.91c-.27-.135-1.597-.788-1.845-.878-.247-.09-.427-.135-.607.135-.18.27-.697.878-.855 1.058-.158.18-.315.202-.585.067-.27-.135-1.14-.42-2.17-1.34-.801-.715-1.342-1.6-1.5-1.871-.158-.27-.017-.416.118-.551.121-.122.27-.315.405-.472.135-.158.18-.27.27-.45.09-.18.045-.337-.022-.472-.067-.135-.607-1.463-.832-2.003-.22-.528-.44-.455-.607-.463-.158-.007-.337-.008-.517-.008-.18 0-.472.067-.719.337-.247.27-.945.922-.945 2.25s.967 2.61 1.102 2.79c.135.18 1.902 2.904 4.61 4.07.644.277 1.147.443 1.54.568.647.206 1.237.177 1.702.108.519-.078 1.598-.652 1.823-1.282.225-.63.225-1.17.157-1.282-.068-.113-.248-.18-.518-.315z"/>
  </svg>
);

export default function Footer() {
  const { navigate, subscribeNewsletter } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeNewsletter(email);
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer id="footer-section" className="bg-brand-cream border-t border-stone-200 text-brand-black font-sans py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Column 1: Shop */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-widest uppercase text-brand-black border-b border-stone-200/50 pb-2">
            SHOP COLLECTIONS
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-stone-600">
            <li>
              <button onClick={() => navigate('shop')} className="hover:text-brand-accent transition-colors">
                Hoodies
              </button>
            </li>
            <li>
              <button onClick={() => navigate('shop')} className="hover:text-brand-accent transition-colors">
                T-Shirt
              </button>
            </li>
            <li>
              <button onClick={() => navigate('shop')} className="hover:text-brand-accent transition-colors">
                Sweatshirt
              </button>
            </li>
            <li>
              <button onClick={() => navigate('shop')} className="hover:text-brand-accent transition-colors">
                Jackets
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: Policies */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-widest uppercase text-brand-black border-b border-stone-200/50 pb-2">
            POLICIES
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-stone-600">
            <li>
              <button onClick={() => navigate('faq')} className="hover:text-brand-accent transition-colors">
                Terms and Conditions
              </button>
            </li>
            <li>
              <button onClick={() => navigate('faq')} className="hover:text-brand-accent transition-colors">
                Delivery & Shipping
              </button>
            </li>
            <li>
              <button onClick={() => navigate('returns')} className="hover:text-brand-accent transition-colors">
                Return Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigate('faq')} className="hover:text-brand-accent transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigate('faq')} className="hover:text-brand-accent transition-colors">
                Frequently Asked Questions
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Quick Help */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-widest uppercase text-brand-black border-b border-stone-200/50 pb-2">
            QUICK HELP
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-stone-600">
            <li>
              <button onClick={() => navigate('about')} className="hover:text-brand-accent transition-colors">
                About Us
              </button>
            </li>
            <li>
              <button onClick={() => navigate('faq')} className="hover:text-brand-accent transition-colors">
                Contact Us
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter Signup */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-widest uppercase text-brand-black border-b border-stone-200/50 pb-2">
            SUBSCRIBE
          </h4>
          
          <form onSubmit={handleSub} className="flex gap-2">
            <input
              type="email"
              placeholder={PLACEHOLDERS.FORM.NEWSLETTER_EMAIL}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow bg-brand-white border border-stone-300 text-xs px-3 py-2 focus:outline-none focus:border-brand-accent rounded-none"
              aria-label="Footer newsletter signup email"
            />
            <button
              type="submit"
              disabled={subscribed}
              className={`p-2 transition-colors rounded-none ${
                subscribed ? 'bg-green-700 text-brand-white' : 'bg-brand-black text-brand-white hover:bg-brand-accent hover:text-brand-black'
              }`}
              aria-label="Subscribe"
            >
              {subscribed ? <Check size={14} /> : <ArrowRight size={14} />}
            </button>
          </form>
          {subscribed && (
            <p className="text-green-700 text-xs font-sans font-semibold animate-fade-in">
              Subscribed successfully! Welcome to the loop.
            </p>
          )}
        </div>

      </div>

      {/* Bottom Footer Credits */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-stone-200/60 flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-stone-500">
        
        {/* Social media icons row */}
        <div id="footer-social-row" className="flex items-center gap-5 justify-center">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-stone-400 hover:text-pink-600 transition-colors p-1"
            aria-label="Instagram"
          >
            <Instagram size={15} className="shrink-0" />
          </a>
          <a 
            href="https://wa.me/910000000000" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-stone-400 hover:text-emerald-600 transition-colors p-1 flex items-center justify-center"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="w-[15px] h-[15px]" />
          </a>
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-stone-400 hover:text-blue-600 transition-colors p-1"
            aria-label="Facebook"
          >
            <Facebook size={15} className="shrink-0" />
          </a>
        </div>
      </div>
    </footer>
  );
}
