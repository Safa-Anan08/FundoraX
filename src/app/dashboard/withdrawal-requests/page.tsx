'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Wallet, CheckCircle2 } from 'lucide-react';

interface PendingWithdrawal {
  _id: string;
  creatorName: string;
  creatorEmail: string;
  withdrawalCredit: number;
  withdrawalAmount: number;
  paymentSystem: string;
  accountNumber: string;
  withdrawDate: string;
  status: string;
}

export default function WithdrawalRequestsPage() {
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/withdrawals/admin/all');
      if (res.data.success) {
        const pending = (res.data.withdrawals || []).filter((w: any) => w.status === 'pending');
        setWithdrawals(pending);
      }
    } catch (err) {
      console.warn('[Fetch Admin Withdrawals Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handlePaymentSuccess = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await api.patch(`/withdrawals/admin/approve/${id}`);
      if (res.data.success) {
        toast.success('Payout marked SUCCESSFUL! Credits deducted & Creator notified.');
        fetchWithdrawals();
      } else {
        toast.error(res.data.message || 'Payout approval failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error processing payout approval');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Creator Withdrawal Requests</h1>
          <p className="text-xs text-[#64748B]">Process creator payout requests. Clicking "Payment Success" deducts creator credits and marks payout as completed.</p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">Creator</th>
                  <th className="p-4">Requested Credits</th>
                  <th className="p-4">USD Amount ($)</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4">Account Number</th>
                  <th className="p-4">Request Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#64748B]">Loading withdrawal requests...</td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#64748B]">
                      No pending creator withdrawal requests!
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-bold text-[#172033]">
                        <p>{w.creatorName}</p>
                        <p className="text-[11px] text-[#64748B]">{w.creatorEmail}</p>
                      </td>
                      <td className="p-4 font-bold text-[#FF6B4A]">{w.withdrawalCredit} Credits</td>
                      <td className="p-4 font-bold text-[#10B981]">${w.withdrawalAmount} USD</td>
                      <td className="p-4 font-semibold text-[#172033]">{w.paymentSystem}</td>
                      <td className="p-4 font-mono text-[#64748B]">{w.accountNumber}</td>
                      <td className="p-4 text-[#64748B]">{new Date(w.withdrawDate).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handlePaymentSuccess(w._id)}
                          disabled={processingId === w._id}
                          className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Payment Success</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
