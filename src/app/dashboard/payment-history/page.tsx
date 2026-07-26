'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { History, Receipt, CreditCard, Coins, Calendar, CheckCircle2 } from 'lucide-react';

interface Payment {
  _id: string;
  transactionId: string;
  packageTitle: string;
  credits: number;
  amountUSD: number;
  paymentMethod: string;
  status: string;
  type: string;
  date: string;
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/history');
        if (res.data.success) {
          setPayments(res.data.payments || []);
        }
      } catch (err) {
        console.warn('[Payment History Fetch Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Payment History</h1>
          <p className="text-xs text-[#64748B]">Complete audit log of all credit top-ups and billing transactions.</p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Package</th>
                  <th className="p-4">Credits Added</th>
                  <th className="p-4">Amount Paid ($)</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#64748B]">Loading payment history...</td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#64748B]">
                      No payment records found yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#172033]">{p.transactionId || p._id}</td>
                      <td className="p-4 font-bold text-[#172033]">{p.packageTitle}</td>
                      <td className="p-4 font-bold text-[#FF6B4A]">+{p.credits} Credits</td>
                      <td className="p-4 font-bold text-[#172033]">${p.amountUSD} USD</td>
                      <td className="p-4 text-[#64748B]">{p.paymentMethod || 'Stripe'}</td>
                      <td className="p-4 text-[#64748B]">{new Date(p.date).toLocaleString()}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded-full text-[10px] font-bold uppercase">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View (320px - 767px) */}
        <div className="block md:hidden space-y-4">
          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB] text-xs text-[#64748B]">
              Loading payment records...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB] text-xs text-[#64748B]">
              No payment history records found yet.
            </div>
          ) : (
            payments.map((p) => (
              <div key={p._id} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-xs font-bold text-[#172033]">{p.packageTitle}</span>
                  <span className="px-2.5 py-0.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded-full text-[10px] font-bold uppercase">
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#64748B] text-[10px] block">Credits Added</span>
                    <span className="font-black text-[#FF6B4A]">+{p.credits} Credits</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] text-[10px] block">Amount Paid</span>
                    <span className="font-bold text-[#172033]">${p.amountUSD} USD</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] text-[11px] text-[#64748B] space-y-1">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono text-[#172033] font-semibold truncate max-w-[180px]">{p.transactionId || p._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="text-[#172033]">{p.paymentMethod || 'Stripe'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(p.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
}
