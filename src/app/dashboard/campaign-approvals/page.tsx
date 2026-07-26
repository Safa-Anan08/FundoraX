'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { CheckSquare, CheckCircle2, XCircle, Eye } from 'lucide-react';

interface PendingCampaign {
  _id: string;
  title: string;
  creatorName: string;
  creatorEmail: string;
  category: string;
  fundingGoal: number;
  deadline: string;
  createdAt: string;
}

export default function CampaignApprovalsPage() {
  const [campaigns, setCampaigns] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns/admin/all');
      if (res.data.success) {
        const pending = (res.data.campaigns || []).filter((c: any) => c.status === 'pending');
        setCampaigns(pending);
      }
    } catch (err) {
      console.warn('[Fetch Admin Campaigns Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCampaigns();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await api.patch(`/campaigns/admin/approve/${id}`);
      if (res.data.success) {
        toast.success('Campaign APPROVED! Now visible to public supporters.');
        fetchPendingCampaigns();
      } else {
        toast.error(res.data.message || 'Approval failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error approving campaign');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await api.patch(`/campaigns/admin/reject/${id}`);
      if (res.data.success) {
        toast.success('Campaign REJECTED.');
        fetchPendingCampaigns();
      } else {
        toast.error(res.data.message || 'Rejection failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error rejecting campaign');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Campaign Approvals Queue</h1>
          <p className="text-xs text-[#64748B]">Review newly created campaigns submitted by creators before public listing.</p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">Campaign Title</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Funding Goal</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#64748B]">Loading pending approvals...</td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#64748B]">
                      No pending campaign approval requests!
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-bold text-[#172033] max-w-xs">{c.title}</td>
                      <td className="p-4 text-[#172033]">
                        <p className="font-bold">{c.creatorName}</p>
                        <p className="text-[11px] text-[#64748B]">{c.creatorEmail}</p>
                      </td>
                      <td className="p-4 text-[#64748B]">{c.category}</td>
                      <td className="p-4 font-bold text-[#FF6B4A]">{c.fundingGoal} Credits</td>
                      <td className="p-4 text-[#64748B]">{new Date(c.deadline).toLocaleDateString()}</td>
                      <td className="p-4 text-[#64748B]">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleReject(c._id)}
                          disabled={processingId === c._id}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#EF4444] font-bold text-xs rounded-xl border border-red-200 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(c._id)}
                          disabled={processingId === c._id}
                          className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                        >
                          Approve
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
