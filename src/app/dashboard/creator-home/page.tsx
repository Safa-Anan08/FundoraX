'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { FolderKanban, TrendingUp, Wallet, PlusCircle, HeartHandshake, ArrowRight, Clock } from 'lucide-react';

interface Campaign {
  _id: string;
  title: string;
  category: string;
  fundingGoal: number;
  raisedAmount: number;
  deadline: string;
  status: string;
}

export default function CreatorHomePage() {
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const campaignRes = await api.get('/campaigns/my-campaigns');
        if (campaignRes.data.success) {
          setCampaigns(campaignRes.data.campaigns || []);
        }

        const pendingRes = await api.get('/contributions/creator/pending');
        if (pendingRes.data.success) {
          setPendingCount(pendingRes.data.count || 0);
        }
      } catch (err) {
        console.warn('[Creator Home Fetch Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, []);

  const totalCampaignsCount = campaigns.length;
  const activeCampaignsCount = campaigns.filter(
    (c) => c.status === 'approved' && new Date(c.deadline) >= new Date()
  ).length;
  const totalAmountRaised = campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);

  return (
    <>
      <div className="space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#172033]">Creator Overview</h1>
            <p className="text-xs text-[#64748B]">Manage your active campaigns, review supporter backings, and request payouts.</p>
          </div>
          <Link
            href="/dashboard/add-campaign"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Create New Campaign
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Campaigns</p>
              <p className="text-3xl font-black text-[#172033] mt-1">{totalCampaignsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Active Campaigns</p>
              <p className="text-3xl font-black text-[#10B981] mt-1">{activeCampaignsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Raised</p>
              <p className="text-3xl font-black text-[#FF6B4A] mt-1">{totalAmountRaised} <span className="text-xs font-bold text-[#172033]">Credits</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Pending Reviews</p>
              <p className="text-3xl font-black text-[#FFC857] mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFC857]/20 text-[#172033] flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Links Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/dashboard/add-campaign"
            className="p-4 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs"
          >
            <PlusCircle className="w-6 h-6 text-[#FF6B4A]" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">Add New Campaign</span>
          </Link>

          <Link
            href="/dashboard/my-campaigns"
            className="p-4 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs"
          >
            <FolderKanban className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">My Campaigns</span>
          </Link>

          <Link
            href="/dashboard/contributions-review"
            className="p-4 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs relative"
          >
            <HeartHandshake className="w-6 h-6 text-[#10B981]" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">Review Backings</span>
            {pendingCount > 0 && (
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#FF6B4A] text-white text-[10px] font-bold rounded-full">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/creator-withdrawals"
            className="p-4 bg-white hover:bg-[#FFF9F5] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-colors shadow-xs"
          >
            <Wallet className="w-6 h-6 text-[#FFC857]" />
            <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A]">Request Payout</span>
          </Link>
        </div>

        {/* My Active Campaigns Table */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
            <h3 className="text-base font-bold text-[#172033]">Recent Campaigns</h3>
            <Link href="/dashboard/my-campaigns" className="text-xs font-bold text-[#FF6B4A] hover:underline flex items-center gap-1">
              <span>Manage All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Goal</th>
                  <th className="p-4">Raised</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-[#64748B]">Loading campaigns...</td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#64748B]">
                      You have not created any campaigns yet. <Link href="/dashboard/add-campaign" className="text-[#FF6B4A] font-bold underline">Create one now!</Link>
                    </td>
                  </tr>
                ) : (
                  campaigns.slice(0, 5).map((c) => (
                    <tr key={c._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-bold text-[#172033] max-w-xs truncate">{c.title}</td>
                      <td className="p-4 text-[#64748B]">{c.category}</td>
                      <td className="p-4 font-bold text-[#172033]">{c.fundingGoal} Credits</td>
                      <td className="p-4 font-bold text-[#FF6B4A]">{c.raisedAmount} Credits</td>
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
