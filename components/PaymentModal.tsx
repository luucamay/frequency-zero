'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BatteryCharging, MessageSquare, Phone, Radio, Loader2, Check, AlertCircle, User, Shield, Mail, Wallet } from 'lucide-react';

export type PaymentAction = 'fuel' | 'inject' | 'call' | 'claim';

interface PaymentModalProps {
  action: PaymentAction;
  stationName: string;
  injectMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ACTION_CONFIG = {
  fuel: {
    title: 'FUEL STATION',
    description: '+5 Minutes Stability',
    price: 1,
    icon: BatteryCharging,
    color: 'red',
  },
  inject: {
    title: 'INJECT MESSAGE',
    description: 'Broadcast system message',
    price: 10,
    icon: MessageSquare,
    color: 'purple',
  },
  call: {
    title: 'CALL STATION',
    description: 'Patch into live broadcast',
    price: 250,
    icon: Phone,
    color: 'green',
  },
  claim: {
    title: 'CLAIM FREQUENCY',
    description: 'Take ownership of this station',
    price: 500,
    icon: Radio,
    color: 'amber',
  },
};

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';
type PaymentMethod = 'crypto' | 'stripe' | null;

export function PaymentModal({ action, stationName, injectMessage, onConfirm, onCancel }: PaymentModalProps) {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('frequency-zero-user-name') || '';
    }
    return '';
  });
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('frequency-zero-user-email') || '';
    }
    return '';
  });

  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  const colorClasses = {
    red: {
      bg: 'bg-red-500/10',
      bgHover: 'hover:bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-500',
      glow: 'shadow-red-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10',
      bgHover: 'hover:bg-purple-500/20',
      border: 'border-purple-500/30',
      text: 'text-purple-500',
      glow: 'shadow-purple-500/20',
    },
    green: {
      bg: 'bg-green-500/10',
      bgHover: 'hover:bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-500',
      glow: 'shadow-green-500/20',
    },
    amber: {
      bg: 'bg-amber-500/10',
      bgHover: 'hover:bg-amber-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-500',
      glow: 'shadow-amber-500/20',
    },
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses];

  const handlePayment = async (method: PaymentMethod) => {
    if (status === 'processing' || !method) return;
    if (!isFormValid) return;
    
    // Save user info
    localStorage.setItem('frequency-zero-user-name', userName.trim());
    localStorage.setItem('frequency-zero-user-email', email.trim());
    
    setSelectedMethod(method);
    setStatus('processing');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate success (in real app, this would redirect to payment provider)
    const success = Math.random() > 0.1; // 90% success rate for demo
    
    if (success) {
      setStatus('success');
      setTimeout(() => {
        onConfirm();
      }, 1500);
    } else {
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setSelectedMethod(null);
      }, 3000);
    }
  };

  const isFormValid = userName.trim().length >= 2 && email.includes('@');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-sm bg-zinc-950 rounded-2xl overflow-hidden border ${colors.border} shadow-2xl ${colors.glow}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${colors.bg} rounded-xl`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <button
                onClick={onCancel}
                disabled={status === 'processing'}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            
            <h2 className="font-mono text-xl font-bold text-zinc-100 tracking-widest uppercase">
              {config.title}
            </h2>
            <p className="text-zinc-500 text-sm mt-1 font-sans">
              {config.description}
            </p>
            
            {action === 'inject' && injectMessage && (
              <div className="mt-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <p className="font-mono text-xs text-zinc-400 mb-1">Message:</p>
                <p className="text-sm text-zinc-300 font-mono">&quot;{injectMessage}&quot;</p>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Station</span>
                <span className="font-mono text-zinc-100 text-sm uppercase">{stationName}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                <span className="text-zinc-400 text-sm">Total</span>
                <span className="font-mono text-2xl font-bold text-zinc-100">${config.price}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-6 space-y-4">
            {status === 'success' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mb-4`}>
                  <Check className={`w-8 h-8 ${colors.text}`} />
                </div>
                <h3 className="font-mono text-lg font-bold text-zinc-100 uppercase tracking-widest">
                  Payment Complete
                </h3>
                <p className="text-zinc-500 text-sm mt-1">Transaction processed successfully</p>
              </motion.div>
            ) : status === 'error' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-mono text-lg font-bold text-zinc-100 uppercase tracking-widest">
                  Payment Failed
                </h3>
                <p className="text-zinc-500 text-sm mt-1">Please try again</p>
              </motion.div>
            ) : (
              <>
                {/* Name Input */}
                <div>
                  <label className="block text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      disabled={status === 'processing'}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors font-mono placeholder:text-zinc-700 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      disabled={status === 'processing'}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors font-mono placeholder:text-zinc-700 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Payment Buttons - Side by Side */}
                <div className="flex gap-3 mt-2">
                  {/* Crypto Button */}
                  <button
                    onClick={() => handlePayment('crypto')}
                    disabled={!isFormValid || status === 'processing'}
                    className="flex-1 py-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 hover:from-orange-500/20 hover:to-yellow-500/20 border border-orange-500/30 text-orange-400 font-semibold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
                  >
                    {status === 'processing' && selectedMethod === 'crypto' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        <span className="text-xs">Crypto</span>
                      </>
                    )}
                  </button>

                  {/* Stripe Link Button */}
                  <button
                    onClick={() => handlePayment('stripe')}
                    disabled={!isFormValid || status === 'processing'}
                    className="flex-1 py-4 bg-[#635BFF] hover:bg-[#7A73FF] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
                  >
                    {status === 'processing' && selectedMethod === 'stripe' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                        </svg>
                        <span className="text-xs">Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Shield className="w-3 h-3 text-zinc-600" />
                  <p className="text-center text-xs text-zinc-600">
                    Secure checkout • Your data is protected
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
