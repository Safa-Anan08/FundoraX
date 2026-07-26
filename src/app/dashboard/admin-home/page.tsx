'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../services/api';
import { Users, FolderKanban, Wallet, CheckSquare, Coins, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AdminStats {
  totalSupporters: number;
  totalCreators: number;
  totalAvailableCredits: number;
  totalPaymentsProcessed: number;
  pendingCampaignsCount: number;
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<AdminStats>({
    totalSupporters: 0,
    totalCreators: 0,
    totalAvailableCredits: 0,
    totalPaymentsProcessed: 0,
    pendingCampaignsCount: 0,
  });
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const statsRes = await api.get('/users/admin/stats');
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }

        const withdrawalsRes = await api.get('/withdrawals/admin/all');
        if (withdrawalsRes.data.success) {
          const pendingW = (withdrawalsRes.data.withdrawals || []).filter((w: any) => w.status === 'pending').length;
          setPendingWithdrawalsCount(pendingW);
        }
      } catch (err) {
        console.warn('[Admin Stats Fetch Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Admin Control Center</h1>
          <p className="text-xs text-[#64748B]">Platform-wide telemetry, campaign approvals, user role management, and payouts.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Supporters</p>
              <p className="text-3xl font-black text-[#172033] mt-1">{stats.totalSupporters}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Creators</p>
              <p className="text-3xl font-black text-[#FF6B4A] mt-1">{stats.totalCreators}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Available Platform Credits</p>
              <p className="text-3xl font-black text-[#FFC857] mt-1">{stats.totalAvailableCredits}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFC857]/20 text-[#172033] flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Payments Processed</p>
              <p className="text-3xl font-black text-[#10B981] mt-1">${stats.totalPaymentsProcessed} <span className="text-xs text-[#64748B]">USD</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/dashboard/campaign-approvals"
            className="p-5 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs relative"
          >
            <CheckSquare className="w-6 h-6 text-[#FF6B4A]" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">Campaign Approvals</span>
            {stats.pendingCampaignsCount > 0 && (
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#FF6B4A] text-white text-[10px] font-bold rounded-full">
                {stats.pendingCampaignsCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/withdrawal-requests"
            className="p-5 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs relative"
          >
            <Wallet className="w-6 h-6 text-[#10B981]" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">Withdrawal Payouts</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#10B981] text-white text-[10px] font-bold rounded-full">
                {pendingWithdrawalsCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/manage-users"
            className="p-5 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs"
          >
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">Manage Users</span>
          </Link>

          <Link
            href="/dashboard/reports"
            className="p-5 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs"
          >
            <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">Audit Reports</span>
          </Link>
        </div>

      </div>
    </>
  );
}
