'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { HeartHandshake, Eye, CheckCircle2, XCircle, X, Coins, Calendar, User } from 'lucide-react';

interface PendingContribution {
  _id: string;
  campaignTitle: string;
  contributionAmount: number;
  supporterName: string;
  supporterEmail: string;
  status: string;
  date: string;
}

export default function ContributionsReviewPage() {
  const [contributions, setContributions] = useState<PendingContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContrib, setSelectedContrib] = useState<PendingContribution | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchPendingContributions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contributions/creator/pending');
      if (res.data.success) {
        setContributions(res.data.contributions || []);
      }
    } catch (err) {
      console.warn('[Fetch Pending Contributions Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingContributions();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessing(true);
    try {
      const res = await api.patch(`/contributions/approve/${id}`);
      if (res.data.success) {
        toast.success('Contribution APPROVED! Added credits to campaign raised amount.');
        setSelectedContrib(null);
        fetchPendingContributions();
      } else {
        toast.error(res.data.message || 'Approval failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error approving contribution');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(true);
    try {
      const res = await api.patch(`/contributions/reject/${id}`);
      if (res.data.success) {
        toast.success('Contribution REJECTED. Credits refunded to Supporter.');
        setSelectedContrib(null);
        fetchPendingContributions();
      } else {
        toast.error(res.data.message || 'Rejection failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error rejecting contribution');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Review Backing Contributions</h1>
          <p className="text-xs text-[#64748B]">Review and approve or reject pending supporter contributions for your campaigns.</p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">Supporter Name</th>
                  <th className="p-4">Campaign Title</th>
                  <th className="p-4">Contribution</th>
                  <th className="p-4">Submission Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#64748B]">Loading pending contributions...</td>
                  </tr>
                ) : contributions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-[#64748B]">
                      No pending contributions to review right now!
                    </td>
                  </tr>
                ) : (
                  contributions.map((c) => (
                    <tr key={c._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-bold text-[#172033]">{c.supporterName}</td>
                      <td className="p-4 font-semibold text-[#172033] max-w-xs truncate">{c.campaignTitle}</td>
                      <td className="p-4 font-bold text-[#FF6B4A]">{c.contributionAmount} Credits</td>
                      <td className="p-4 text-[#64748B]">{new Date(c.date).toLocaleString()}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-[#FFC857]/30 text-[#172033] rounded-full text-[10px] font-bold uppercase">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedContrib(c)}
                          className="px-3.5 py-1.5 bg-[#FFF9F5] hover:bg-[#FF6B4A] text-[#172033] hover:text-white font-bold text-xs rounded-xl border border-[#E5E7EB] hover:border-[#FF6B4A] transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
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

      {/* View Contribution Modal */}
      {selectedContrib && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E5E7EB] shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-[#172033]">
                <HeartHandshake className="w-5 h-5 text-[#FF6B4A]" />
                <span>Review Contribution</span>
              </div>
              <button onClick={() => setSelectedContrib(null)} className="text-[#64748B] hover:text-[#172033]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[#FFF9F5] p-4 rounded-2xl border border-[#E5E7EB] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Campaign:</span>
                <span className="font-bold text-[#172033] text-right">{selectedContrib.campaignTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Supporter Name:</span>
                <span className="font-bold text-[#172033]">{selectedContrib.supporterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Supporter Email:</span>
                <span className="font-semibold text-[#64748B]">{selectedContrib.supporterEmail}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E7EB] pt-2">
                <span className="text-[#64748B]">Contribution Amount:</span>
                <span className="font-black text-[#FF6B4A] text-sm">{selectedContrib.contributionAmount} Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Date Submitted:</span>
                <span className="text-[#64748B]">{new Date(selectedContrib.date).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleReject(selectedContrib._id)}
                disabled={processing}
                className="py-2.5 bg-red-50 hover:bg-red-100 text-[#EF4444] font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject & Refund</span>
              </button>

              <button
                onClick={() => handleApprove(selectedContrib._id)}
                disabled={processing}
                className="py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-[#10B981]/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Contribution</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
