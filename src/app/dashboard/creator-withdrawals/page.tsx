'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Wallet, Coins, DollarSign, Send, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CreatorWithdrawalsPage() {
  const { user } = useAuth();

  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [withdrawalCredit, setWithdrawalCredit] = useState<number | ''>(200);
  const [paymentSystem, setPaymentSystem] = useState<string>('Stripe');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Creator available credits come from user account credits or raised campaigns
    if (user) {
      setAvailableCredits(user.credits || 0);
    }
  }, [user]);

  const currentCredits = Number(withdrawalCredit) || 0;
  const calculatedUSD = (currentCredits / 20).toFixed(2);
  const isInsufficient = availableCredits < 200 || currentCredits > availableCredits || currentCredits < 200;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficient) {
      toast.error('Insufficient credit. Minimum withdrawal is 200 credits.');
      return;
    }

    if (!accountNumber.trim()) {
      toast.error('Please enter your account number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/withdrawals/request', {
        withdrawalCredit: currentCredits,
        paymentSystem,
        accountNumber: accountNumber.trim(),
      });

      if (res.data.success) {
        toast.success('Withdrawal request submitted! Pending Admin payout approval.');
        setWithdrawalCredit(200);
        setAccountNumber('');
      } else {
        toast.error(res.data.message || 'Withdrawal request failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error submitting withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Creator Withdrawal Payout</h1>
          <p className="text-xs text-[#64748B]">Convert raised credits to real-world currency (20 Credits = $1.00 USD).</p>
        </div>

        {/* Calculation Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Available Credits</p>
            <p className="text-3xl font-black text-[#FF6B4A] mt-1">{availableCredits}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Max Withdrawable</p>
            <p className="text-3xl font-black text-[#172033] mt-1">${(availableCredits / 20).toFixed(2)} <span className="text-xs text-[#64748B]">USD</span></p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Conversion Rate</p>
            <p className="text-xl font-extrabold text-[#10B981] mt-2">20 Credits = $1 USD</p>
          </div>
        </div>

        {/* Withdrawal Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
          
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
            <Wallet className="w-5 h-5 text-[#FF6B4A]" />
            <h3 className="font-bold text-base text-[#172033]">Request Withdrawal Payout</h3>
          </div>

          {/* Credits to Withdraw */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">Credits to Withdraw (Minimum 200 Credits)</label>
            <div className="relative">
              <Coins className="w-4 h-4 text-[#FF6B4A] absolute left-3.5 top-3.5" />
              <input
                type="number"
                min={200}
                max={availableCredits}
                value={withdrawalCredit}
                onChange={(e) => setWithdrawalCredit(e.target.value ? Number(e.target.value) : '')}
                placeholder="200"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                required
              />
            </div>
          </div>

          {/* Automatically Calculated USD Amount */}
          <div className="p-4 bg-[#FFF9F5] rounded-2xl border border-[#E5E7EB] flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B]">Calculated Payout Amount:</span>
            <div className="text-right">
              <span className="text-2xl font-black text-[#10B981]">${calculatedUSD}</span>
              <span className="text-xs text-[#64748B] ml-1">USD</span>
            </div>
          </div>

          {/* Payment System & Account Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Payment System Gateway *</label>
              <select
                value={paymentSystem}
                onChange={(e) => setPaymentSystem(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
              >
                <option value="Stripe">Stripe USD Payout</option>
                <option value="bKash">bKash Mobile Wallet</option>
                <option value="Rocket">Rocket Mobile Money</option>
                <option value="Nagad">Nagad Digital Service</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Account Number / Phone *</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. acct_12345 or +8801700000000"
                className="w-full px-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                required
              />
            </div>
          </div>

          {/* Insufficient Credit Alert */}
          {isInsufficient && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-[#EF4444] font-bold">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Insufficient credit. You need at least 200 credits available to request a withdrawal.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || isInsufficient}
            className="w-full py-3.5 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-sm rounded-xl shadow-md shadow-[#FF6B4A]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Withdrawal Request (${calculatedUSD} USD)</span>
              </>
            )}
          </button>
        </form>

      </div>
    </>
  );
}
