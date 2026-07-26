'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { FolderKanban, Trash2, Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface CampaignItem {
  _id: string;
  title: string;
  creatorName: string;
  creatorEmail: string;
  category: string;
  fundingGoal: number;
  raisedAmount: number;
  deadline: string;
  status: string;
}

export default function ManageCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns/admin/all');
      if (res.data.success) {
        setCampaigns(res.data.campaigns || []);
      }
    } catch (err) {
      console.warn('[Fetch Admin All Campaigns Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${title}"? This will refund all approved supporters.`)) return;

    setProcessingId(id);
    try {
      const res = await api.delete(`/campaigns/delete/${id}`);
      if (res.data.success) {
        toast.success(`Campaign "${title}" deleted and supporters refunded.`);
        fetchCampaigns();
      } else {
        toast.error(res.data.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error deleting campaign');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Manage All Platform Campaigns</h1>
          <p className="text-xs text-[#64748B]">Audit platform-wide campaigns, check raised metrics, or remove violating projects.</p>
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
                  <th className="p-4">Raised Amount</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#64748B]">Loading platform campaigns...</td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-[#64748B]">
                      No campaigns found on platform.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-bold text-[#172033] max-w-xs">{c.title}</td>
                      <td className="p-4 text-[#172033]">
                        <p className="font-semibold">{c.creatorName}</p>
                        <p className="text-[11px] text-[#64748B]">{c.creatorEmail}</p>
                      </td>
                      <td className="p-4 text-[#64748B]">{c.category}</td>
                      <td className="p-4 font-bold text-[#172033]">{c.fundingGoal} Credits</td>
                      <td className="p-4 font-bold text-[#FF6B4A]">{c.raisedAmount} Credits</td>
                      <td className="p-4 text-[#64748B]">{new Date(c.deadline).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            c.status === 'approved'
                              ? 'bg-[#10B981]/15 text-[#10B981]'
                              : c.status === 'rejected' || c.status === 'suspended'
                              ? 'bg-red-50 text-[#EF4444]'
                              : 'bg-[#FFC857]/30 text-[#172033]'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/campaigns/${c._id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-block transition-colors"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteCampaign(c._id, c.title)}
                          disabled={processingId === c._id}
                          className="p-1.5 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
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
