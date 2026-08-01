import React, { useState } from 'react';
import { useStore } from '../store';
import { Smartphone, ArrowRight, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { PLACEHOLDERS } from '../constants/placeholders';

export default function PhoneOTPLogin() {
  const { login } = useStore();
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formatter for 10-digit phone numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  // Handle requesting the OTP code
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (loginMethod === 'phone') {
      if (phone.length < 10) {
        setError('Please provide a valid 10-digit mobile number.');
        return;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please provide a valid email address.');
        return;
      }
    }

    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      const finalName = `User`;
      if (loginMethod === 'phone') {
        login(undefined, `+91 ${phone}`, finalName);
      } else {
        login(email, undefined, finalName);
      }
      setSuccess(`Welcome. Access granted.`);
    }, 1000);
  };

  return (
    <div 
      id="phone-otp-login-page" 
      className="min-h-screen w-full bg-[#ffffff] flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background Decorative Textiles elements */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-sm bg-white border border-stone-200 p-8 space-y-6 shadow-xs relative z-10 animate-fade-in">
        
        {/* Simple Login Header */}
        <div className="text-center space-y-2">
          <h1 className="font-sans text-xl font-bold tracking-wider text-stone-900 uppercase">Login</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('phone');
              setError('');
            }}
            className={`flex-1 pb-3 text-xs font-sans font-extrabold uppercase tracking-widest transition-colors cursor-pointer text-center ${
              loginMethod === 'phone'
                ? 'border-b-2 border-brand-black text-brand-black'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            Phone
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('email');
              setError('');
            }}
            className={`flex-1 pb-3 text-xs font-sans font-extrabold uppercase tracking-widest transition-colors cursor-pointer text-center ${
              loginMethod === 'email'
                ? 'border-b-2 border-brand-black text-brand-black'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            Email
          </button>
        </div>

        {/* Global errors and success alerts */}
        {error && (
          <div className="bg-red-50/50 border border-red-200 p-4 text-left flex gap-2.5 items-start animate-fade-in">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={14} />
            <p className="text-xs text-red-700 font-sans leading-relaxed">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50/60 border border-emerald-200 p-4 text-left flex gap-2.5 items-start animate-fade-in">
            <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={14} />
            <p className="text-xs text-emerald-800 font-sans leading-relaxed">{success}</p>
          </div>
        )}

        <motion.div
          key="phone-step"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {loginMethod === 'phone' ? (
              /* Phone Number Input */
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-sans font-extrabold text-stone-800 uppercase tracking-widest block">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center justify-center bg-stone-100 border border-stone-200 border-r-0 px-3.5 text-xs font-sans text-stone-500 font-medium font-mono">
                    +91
                  </span>
                  <div className="relative flex-grow">
                    <input
                      type="tel"
                      placeholder={PLACEHOLDERS.FORM.PHONE}
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full bg-white border border-stone-200 px-4 py-3.5 pl-10 text-xs font-sans font-mono tracking-wide rounded-none focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-colors"
                    />
                    <Smartphone className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
                  </div>
                </div>
              </div>
            ) : (
              /* Email Input */
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-sans font-extrabold text-stone-800 uppercase tracking-widest block">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder={PLACEHOLDERS.FORM.EMAIL}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-stone-200 px-4 py-3.5 pl-10 text-xs font-sans tracking-wide rounded-none focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-colors"
                  />
                  <Mail className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || (loginMethod === 'phone' ? phone.length < 10 : !email)}
              className={`w-full bg-black hover:bg-white text-white hover:text-black border border-black transition-all font-sans text-xs font-bold tracking-widest py-4 uppercase rounded-none cursor-pointer flex items-center justify-center gap-2 ${
                (loginMethod === 'phone' ? phone.length < 10 : !email) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
                  LOGGING IN...
                </>
              ) : (
                <>
                  LOG IN
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}
