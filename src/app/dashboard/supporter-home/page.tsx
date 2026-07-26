'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { Coins, HeartHandshake, Clock, Compass, CreditCard, History, ArrowRight } from 'lucide-react';

interface Contribution {
  _id: string;
  campaignTitle: string;
  contributionAmount: number;
  creatorName: string;
  status: string;
  date: string;
}

export default function SupporterHomePage() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalContributionsCount: 0,
    pendingContributionsCount: 0,
    totalAmountContributed: 0,
  });
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/contributions/my-contributions?limit=5');
        if (res.data.success) {
          setContributions(res.data.contributions || []);
          if (res.data.stats) {
            setStats(res.data.stats);
          }
        }
      } catch (err) {
        console.warn('[Supporter Home Fetch Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="space-y-8">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Supporter Overview</h1>
          <p className="text-xs text-[#64748B]">Track your contributions, available balance, and backing impact.</p>
        </div>

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Available Credits</p>
              <p className="text-3xl font-black text-[#FF6B4A] mt-1">{user?.credits}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Contributed</p>
              <p className="text-3xl font-black text-[#172033] mt-1">{stats.totalAmountContributed}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Pending Backings</p>
              <p className="text-3xl font-black text-[#FFC857] mt-1">{stats.pendingContributionsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFC857]/20 text-[#172033] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Backed</p>
              <p className="text-3xl font-black text-[#172033] mt-1">{stats.totalContributionsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/campaigns"
            className="p-4 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs"
          >
            <Compass className="w-6 h-6 text-[#FF6B4A]" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">Explore Campaigns</span>
          </Link>

          <Link
            href="/dashboard/my-contributions"
            className="p-4 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs"
          >
            <HeartHandshake className="w-6 h-6 text-[#10B981]" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">My Contributions</span>
          </Link>

          <Link
            href="/dashboard/purchase-credit"
            className="p-4 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs"
          >
            <CreditCard className="w-6 h-6 text-[#FFC857]" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">Purchase Credit</span>
          </Link>

          <Link
            href="/dashboard/payment-history"
            className="p-4 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs"
          >
            <History className="w-6 h-6 text-purple-600" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">Payment History</span>
          </Link>
        </div>

        {/* Recent Contributions Table */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
            <h3 className="text-base font-bold text-[#172033]">Recent Contributions</h3>
            <Link
              href="/dashboard/my-contributions"
              className="text-xs font-bold text-[#FF6B4A] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">Campaign Title</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-[#64748B]">Loading contributions...</td>
                  </tr>
                ) : contributions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#64748B]">
                      No contributions made yet. <Link href="/campaigns" className="text-[#FF6B4A] font-bold underline">Explore campaigns</Link> to start backing!
                    </td>
                  </tr>
                ) : (
                  contributions.map((c) => (
                    <tr key={c._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-bold text-[#172033] max-w-xs truncate">{c.campaignTitle}</td>
                      <td className="p-4 font-bold text-[#FF6B4A]">{c.contributionAmount} Credits</td>
                      <td className="p-4 text-[#64748B]">{c.creatorName}</td>
                      <td className="p-4 text-[#64748B]">{new Date(c.date).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            c.status === 'approved'
                              ? 'bg-[#10B981]/15 text-[#10B981]'
                              : c.status === 'rejected'
                              ? 'bg-red-50 text-[#EF4444]'
                              : 'bg-[#FFC857]/30 text-[#172033]'
                          }`}
                        >
                          {c.status}
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
