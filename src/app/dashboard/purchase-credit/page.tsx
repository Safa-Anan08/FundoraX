'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Coins,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  X,
  TrendingUp,
  ArrowUpRight,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
} from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CreditPackage {
  id: string;
  title: string;
  credits: number;
  priceUSD: number;
  popular?: boolean;
  bonus?: string;
  description: string;
}

interface WalletSummary {
  availableCredits: number;
  totalPurchased: number;
  totalContributed: number;
  totalRefunded: number;
}

// Sub-component for the Stripe form since it needs to be inside <Elements>
const CheckoutForm = ({
  selectedPkg,
  clientSecret,
  onClose,
  onSuccess,
}: {
  selectedPkg: CreditPackage;
  clientSecret: string;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded on Stripe. The webhook on the backend will add credits.
      // We can poll our backend confirm endpoint to wait for webhook sync
      try {
        let attempts = 0;
        let synced = false;
        
        while (attempts < 5 && !synced) {
           const confirmRes = await api.post('/payments/confirm', {
             paymentIntentId: paymentIntent.id
           });
           
           if (confirmRes.data.success && !confirmRes.data.pendingWebhook) {
             synced = true;
             onSuccess();
           } else {
             // wait 1 second and retry
             await new Promise(r => setTimeout(r, 1000));
             attempts++;
           }
        }
        
        if (!synced) {
          // Fallback if webhook is slow: we still succeeded on Stripe
          toast.success('Payment succeeded! Credits will appear shortly.');
          onClose(); 
        }
      } catch (err: any) {
         toast.error('Payment succeeded on Stripe but sync delayed.');
         onClose();
      }
    } else {
       toast.error('Payment status: ' + paymentIntent?.status);
       setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#172033] mb-1">
          Credit or Debit Card
        </label>
        <div className="p-3.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: '#172033',
                  '::placeholder': {
                    color: '#64748B',
                  },
                },
                invalid: {
                  color: '#EF4444',
                },
              },
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-sm rounded-xl shadow-md shadow-[#FF6B4A]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {processing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Coins className="w-4 h-4" />
            <span>Pay ${selectedPkg.priceUSD} & Claim {selectedPkg.credits} Credits</span>
          </>
        )}
      </button>
    </form>
  );
};

export default function PurchaseCreditPage() {
  const { user, refreshUser } = useAuth();

  const [summary, setSummary] = useState<WalletSummary>({
    availableCredits: user?.credits || 0,
    totalPurchased: 0,
    totalContributed: 0,
    totalRefunded: 0,
  });

  const [selectedPkg, setSelectedPkg] = useState<CreditPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loadingIntent, setLoadingIntent] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/payments/summary');
      if (res.data.success) {
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.warn('[Fetch Wallet Summary Error]', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [user?.credits]);

  const packages: CreditPackage[] = [
    {
      id: 'pkg-100',
      title: 'Starter',
      credits: 100,
      priceUSD: 10,
      description: 'Ideal for backing your first community campaigns.',
    },
    {
      id: 'pkg-300',
      title: 'Popular',
      credits: 300,
      priceUSD: 25,
      popular: true,
      bonus: 'Save $5 USD',
      description: 'Our most requested pack for active project supporters.',
    },
    {
      id: 'pkg-800',
      title: 'Growth',
      credits: 800,
      priceUSD: 60,
      bonus: 'Save $20 USD',
      description: 'Designed for serious backers funding high-impact innovations.',
    },
    {
      id: 'pkg-1500',
      title: 'Premium',
      credits: 1500,
      priceUSD: 110,
      bonus: 'Best Value ($40 Savings)',
      description: 'Maximum credit bundle for platform champion supporters.',
    },
  ];

  const handleSelectPackage = async (pkg: CreditPackage) => {
    setLoadingIntent(true);
    try {
      // 1. Create Payment Intent dynamically on selection
      const intentRes = await api.post('/payments/create-intent', {
        packageTitle: pkg.title,
      });

      if (intentRes.data.success && intentRes.data.clientSecret) {
        setClientSecret(intentRes.data.clientSecret);
        setSelectedPkg(pkg);
        setModalOpen(true);
      } else {
        toast.error('Could not initialize payment: ' + (intentRes.data.message || 'Error'));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Payment intialization error');
    } finally {
      setLoadingIntent(false);
    }
  };

  const handleSuccess = async () => {
    toast.success(`Payment Successful! Added ${selectedPkg?.credits} credits to your wallet.`);
    await refreshUser(); // Updates available credits immediately across Navbar & components
    fetchSummary();
    setModalOpen(false);
    setSelectedPkg(null);
  };

  const scrollToPackages = () => {
    const el = document.getElementById('packages-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="space-y-8">
        
        {/* Low / Empty Wallet Warning Banner */}
        {user?.credits === 0 ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-4 text-red-800 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
              <div>
                <p className="text-xs font-bold">Your wallet is empty!</p>
                <p className="text-[11px] text-red-600">Purchase credits below to continue supporting campaigns.</p>
              </div>
            </div>
            <button
              onClick={scrollToPackages}
              className="px-3.5 py-1.5 bg-[#EF4444] text-white text-xs font-bold rounded-xl shadow-xs shrink-0"
            >
              Purchase Credits
            </button>
          </div>
        ) : (user?.credits || 0) < 20 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 text-amber-800 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">Your credit balance is running low.</p>
                <p className="text-[11px] text-amber-700">Top up your wallet so you never miss an active project opportunity.</p>
              </div>
            </div>
            <button
              onClick={scrollToPackages}
              className="px-3.5 py-1.5 bg-[#FF6B4A] text-white text-xs font-bold rounded-xl shadow-xs shrink-0"
            >
              Top Up Wallet
            </button>
          </div>
        ) : null}

        {/* 1. Credit Wallet Summary Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-[#172033]">Credit Wallet & Top-Up</h1>
              <p className="text-xs text-[#64748B]">Manage your FundoraX credit balance, view summary telemetry, and buy credits via Stripe.</p>
            </div>

            <button
              onClick={scrollToPackages}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-xs rounded-xl shadow-md shadow-[#FF6B4A]/20 transition-all shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase More Credits</span>
            </button>
          </div>

          {/* 4 Telemetry Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Available Credits */}
            <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-5 rounded-2xl border border-[#FF6B4A]/30 shadow-xs relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Available Credits</span>
                <div className="w-8 h-8 rounded-xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#FF6B4A]">{user?.credits || 0}</p>
              <p className="text-[10px] text-[#64748B]">Ready to pledge to campaigns</p>
            </div>

            {/* Card 2: Total Purchased */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Total Purchased</span>
                <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#172033]">{summary.totalPurchased}</p>
              <p className="text-[10px] text-[#64748B]">Credits bought via Stripe</p>
            </div>

            {/* Card 3: Total Contributed */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Total Contributed</span>
                <div className="w-8 h-8 rounded-xl bg-[#FFC857]/20 text-[#172033] flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-[#FF6B4A]" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#172033]">{summary.totalContributed}</p>
              <p className="text-[10px] text-[#64748B]">Pledged to approved campaigns</p>
            </div>

            {/* Card 4: Total Refunded */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Total Refunded</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#172033]">{summary.totalRefunded}</p>
              <p className="text-[10px] text-[#64748B]">Returned from rejected/deleted projects</p>
            </div>

          </div>
        </div>

        {/* 2. Purchase Credit Packages Section */}
        <div id="packages-section" className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-block px-3.5 py-1 bg-[#FFC857]/30 border border-[#FFC857]/50 text-[#172033] text-xs font-bold rounded-full">
              Flexible Credit Bundles
            </span>
            <h2 className="text-2xl font-black text-[#172033]">Choose a Credit Package</h2>
            <p className="text-xs text-[#64748B]">
              Select your preferred credit bundle. Payment processed securely with Stripe 256-bit encryption.
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 border flex flex-col justify-between space-y-6 relative transition-all duration-300 hover:-translate-y-1 ${
                  pkg.popular
                    ? 'border-[#FF6B4A] shadow-xl ring-2 ring-[#FF6B4A]/20'
                    : 'border-[#E5E7EB] shadow-xs'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FF6B4A] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-3 text-center">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{pkg.title}</span>
                  <div className="flex items-center justify-center gap-1.5 text-[#FF6B4A]">
                    <Coins className="w-6 h-6" />
                    <span className="text-3xl font-black">{pkg.credits}</span>
                    <span className="text-xs font-bold text-[#172033]">Credits</span>
                  </div>
                  <div className="text-2xl font-black text-[#172033]">${pkg.priceUSD} <span className="text-xs text-[#64748B] font-normal">USD</span></div>
                  
                  {pkg.bonus && (
                    <span className="inline-block px-2.5 py-0.5 bg-[#10B981]/15 text-[#10B981] text-[11px] font-bold rounded-full">
                      {pkg.bonus}
                    </span>
                  )}

                  <p className="text-xs text-[#64748B] leading-relaxed pt-1">
                    {pkg.description}
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-[#64748B] border-t border-[#E5E7EB] pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>Instant Account Credit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>Stripe Encrypted Payment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>Never Expires</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleSelectPackage(pkg)}
                  disabled={loadingIntent}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-xs transition-all ${
                    pkg.popular
                      ? 'bg-[#FF6B4A] hover:bg-[#E85538] text-white shadow-md shadow-[#FF6B4A]/20'
                      : 'bg-[#FFF9F5] hover:bg-[#FF6B4A] text-[#172033] hover:text-white border border-[#E5E7EB] hover:border-[#FF6B4A]'
                  } disabled:opacity-50`}
                >
                  Buy {pkg.credits} Credits for ${pkg.priceUSD}
                </button>
              </div>
            ))}
          </div>

          {/* Security Assurance Badge */}
          <div className="max-w-xl mx-auto p-4 bg-white rounded-2xl border border-[#E5E7EB] flex items-center gap-3 text-xs text-[#64748B] shadow-xs">
            <ShieldCheck className="w-8 h-8 text-[#10B981] shrink-0" />
            <p>
              Payments are securely processed via <strong>Stripe Gateway</strong>. Financial details are encrypted and stored according to PCI-DSS standards.
            </p>
          </div>
        </div>

        {/* 3. How Credits Work Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-[#172033] font-black text-lg border-b border-[#E5E7EB] pb-3">
            <HelpCircle className="w-5 h-5 text-[#FF6B4A]" />
            <span>How Credits Work on FundoraX</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#64748B]">
            <div className="space-y-2 p-4 bg-[#FFF9F5] rounded-2xl border border-[#E5E7EB]">
              <span className="w-6 h-6 rounded-full bg-[#FF6B4A] text-white font-bold inline-flex items-center justify-center text-xs">1</span>
              <h4 className="font-bold text-[#172033] text-sm">Initial Signup Credits</h4>
              <p className="leading-relaxed">
                New Supporters receive 50 free credits upon registration. Creators receive 20 initial credits to kickstart their campaign journey.
              </p>
            </div>

            <div className="space-y-2 p-4 bg-[#FFF9F5] rounded-2xl border border-[#E5E7EB]">
              <span className="w-6 h-6 rounded-full bg-[#FF6B4A] text-white font-bold inline-flex items-center justify-center text-xs">2</span>
              <h4 className="font-bold text-[#172033] text-sm">Backing Campaigns</h4>
              <p className="leading-relaxed">
                Use your wallet credits to back approved campaigns. Approved contributions directly help creators hit funding goals and unlock rewards.
              </p>
            </div>

            <div className="space-y-2 p-4 bg-[#FFF9F5] rounded-2xl border border-[#E5E7EB]">
              <span className="w-6 h-6 rounded-full bg-[#FF6B4A] text-white font-bold inline-flex items-center justify-center text-xs">3</span>
              <h4 className="font-bold text-[#172033] text-sm">Guaranteed Refunds</h4>
              <p className="leading-relaxed">
                If a contribution is rejected or a campaign is deleted by a creator, your pledged credits are automatically refunded to your wallet balance.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Stripe Payment Checkout Modal */}
      {modalOpen && selectedPkg && clientSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E5E7EB] shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-[#172033]">
                <CreditCard className="w-5 h-5 text-[#FF6B4A]" />
                <span>Stripe Secure Checkout</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#64748B] hover:text-[#172033]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Package Summary */}
            <div className="p-4 bg-[#FFF9F5] rounded-2xl border border-[#E5E7EB] flex justify-between items-center">
              <div>
                <p className="text-xs text-[#64748B]">Package Selected</p>
                <p className="text-base font-extrabold text-[#172033]">{selectedPkg.title}</p>
                <p className="text-xs text-[#FF6B4A] font-bold">{selectedPkg.credits} Credits</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#64748B]">Total Amount</p>
                <p className="text-2xl font-black text-[#172033]">${selectedPkg.priceUSD} USD</p>
              </div>
            </div>

            {/* Real Stripe Elements Form */}
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                selectedPkg={selectedPkg}
                clientSecret={clientSecret}
                onClose={() => setModalOpen(false)}
                onSuccess={handleSuccess}
              />
            </Elements>

          </div>
        </div>
      )}
    </>
  );
}
