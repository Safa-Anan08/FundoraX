'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { FolderKanban, Edit3, Trash2, PlusCircle, X, Check, Clock, AlertTriangle } from 'lucide-react';

interface Campaign {
  _id: string;
  title: string;
  story: string;
  category: string;
  fundingGoal: number;
  minContribution: number;
  deadline: string;
  rewardInfo: string;
  image: string;
  raisedAmount: number;
  status: string;
}

export default function MyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editRewardInfo, setEditRewardInfo] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns/my-campaigns');
      if (res.data.success) {
        setCampaigns(res.data.campaigns || []);
      }
    } catch (err) {
      console.warn('[Fetch My Campaigns Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  const handleOpenEdit = (c: Campaign) => {
    setEditCampaign(c);
    setEditTitle(c.title);
    setEditStory(c.story);
    setEditRewardInfo(c.rewardInfo || '');
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCampaign) return;

    setUpdating(true);
    try {
      const res = await api.put(`/campaigns/update/${editCampaign._id}`, {
        title: editTitle,
        story: editStory,
        rewardInfo: editRewardInfo,
      });

      if (res.data.success) {
        toast.success('Campaign updated successfully');
        setEditCampaign(null);
        fetchMyCampaigns();
      } else {
        toast.error(res.data.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error updating campaign');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await api.delete(`/campaigns/delete/${deleteTarget._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Campaign deleted and supporters refunded');
        setDeleteTarget(null);
        fetchMyCampaigns();
      } else {
        toast.error(res.data.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error deleting campaign');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#172033]">My Campaigns</h1>
            <p className="text-xs text-[#64748B]">Manage your active campaigns, update story descriptions, or delete with supporter refunds.</p>
          </div>
          <Link
            href="/dashboard/add-campaign"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Add New Campaign
          </Link>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">Campaign Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Goal</th>
                  <th className="p-4">Raised</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#64748B]">Loading your campaigns...</td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#64748B]">
                      You have not created any campaigns yet. <br />
                      <Link href="/dashboard/add-campaign" className="text-[#FF6B4A] font-bold underline mt-2 inline-block">
                        Create your first campaign
                      </Link>
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-bold text-[#172033] max-w-xs">{c.title}</td>
                      <td className="p-4 text-[#64748B]">{c.category}</td>
                      <td className="p-4 font-bold text-[#172033]">{c.fundingGoal} Credits</td>
                      <td className="p-4 font-bold text-[#FF6B4A]">{c.raisedAmount} Credits</td>
                      <td className="p-4 text-[#64748B]">{new Date(c.deadline).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            c.status === 'approved'
                              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                              : c.status === 'rejected'
                              ? 'bg-red-50 text-[#EF4444] border border-[#EF4444]/30'
                              : 'bg-[#FFC857]/20 text-[#172033] border border-[#FFC857]/50'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Campaign"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
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

      {/* Edit Campaign Modal */}
      {editCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E5E7EB] shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <h3 className="font-bold text-base text-[#172033]">Edit Campaign Details</h3>
              <button onClick={() => setEditCampaign(null)} className="text-[#64748B] hover:text-[#172033]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#172033]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">Campaign Story</label>
                <textarea
                  rows={5}
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  className="w-full p-3.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-xs text-[#172033]"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">Reward Information</label>
                <input
                  type="text"
                  value={editRewardInfo}
                  onChange={(e) => setEditRewardInfo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-xs text-[#172033]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditCampaign(null)}
                  className="px-4 py-2 border border-[#E5E7EB] text-[#172033] text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-[#FF6B4A] hover:bg-[#E85538] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E5E7EB] shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-[#172033]">Confirm Campaign Deletion</h3>
                <p className="text-xs text-[#64748B]">This action is irreversible.</p>
              </div>
            </div>

            <p className="text-xs text-[#172033] bg-red-50 p-3 rounded-xl border border-red-200 leading-relaxed">
              Deleting <strong>"{deleteTarget.title}"</strong> will refund all approved supporter contribution credits back to their accounts.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-[#E5E7EB] text-[#172033] text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2 bg-[#EF4444] hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {deleting ? 'Deleting & Refund...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
