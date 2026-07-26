'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Wallet, History } from 'lucide-react';

interface Withdrawal {
  _id: string;
  withdrawalCredit: number;
  withdrawalAmount: number;
  paymentSystem: string;
  accountNumber: string;
  withdrawDate: string;
  status: string;
}

export default function CreatorPaymentsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const res = await api.get('/withdrawals/my-withdrawals');
        if (res.data.success) {
          setWithdrawals(res.data.withdrawals || []);
        }
      } catch (err) {
        console.warn('[Creator Payments Fetch Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, []);

  return (
    <>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Creator Withdrawal History</h1>
          <p className="text-xs text-[#64748B]">Complete audit history of payout requests and status tracking.</p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">Withdrawal Credits</th>
                  <th className="p-4">USD Amount ($)</th>
                  <th className="p-4">Payment System</th>
                  <th className="p-4">Account Number</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#64748B]">Loading withdrawal history...</td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-[#64748B]">
                      No withdrawal requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-bold text-[#FF6B4A]">{w.withdrawalCredit} Credits</td>
                      <td className="p-4 font-bold text-[#172033]">${w.withdrawalAmount} USD</td>
                      <td className="p-4 font-semibold text-[#172033]">{w.paymentSystem}</td>
                      <td className="p-4 font-mono text-[#64748B]">{w.accountNumber}</td>
                      <td className="p-4 text-[#64748B]">{new Date(w.withdrawDate).toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            w.status === 'approved'
                              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                              : w.status === 'rejected'
                              ? 'bg-red-50 text-[#EF4444] border border-[#EF4444]/30'
                              : 'bg-[#FFC857]/20 text-[#172033] border border-[#FFC857]/50'
                          }`}
                        >
                          {w.status}
                        </span>
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
