'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { AlertTriangle, ShieldAlert, Trash2, Ban } from 'lucide-react';

interface ReportItem {
  _id: string;
  reporterName: string;
  campaignTitle: string;
  campaign: string;
  reason: string;
  createdAt: string;
}

export default function ReportsAuditPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/admin/all');
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      console.warn('[Fetch Admin Reports Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSuspendCampaign = async (campaignId: string, title: string) => {
    setProcessingId(campaignId);
    try {
      const res = await api.patch(`/reports/admin/suspend/${campaignId}`);
      if (res.data.success) {
        toast.success(`Campaign "${title}" has been SUSPENDED.`);
        fetchReports();
      } else {
        toast.error(res.data.message || 'Suspension failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error suspending campaign');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${title}"? This will refund all approved supporters.`)) return;

    setProcessingId(campaignId);
    try {
      const res = await api.delete(`/campaigns/delete/${campaignId}`);
      if (res.data.success) {
        toast.success(`Campaign "${title}" deleted & supporters refunded.`);
        fetchReports();
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
          <h1 className="text-2xl font-black text-[#172033]">Campaign Reports Audit</h1>
          <p className="text-xs text-[#64748B]">Review user reports regarding campaign violations and suspend or remove fraudulent projects.</p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">Reporter Name</th>
                  <th className="p-4">Target Campaign</th>
                  <th className="p-4">Report Reason</th>
                  <th className="p-4">Date Reported</th>
                  <th className="p-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#64748B]">Loading campaign reports...</td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-[#64748B]">
                      No campaign reports submitted yet!
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-bold text-[#172033]">{r.reporterName}</td>
                      <td className="p-4 font-extrabold text-[#172033] max-w-xs">{r.campaignTitle}</td>
                      <td className="p-4 text-[#EF4444] bg-red-50/50 max-w-sm rounded-xl font-medium">{r.reason}</td>
                      <td className="p-4 text-[#64748B]">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleSuspendCampaign(r.campaign, r.campaignTitle)}
                          disabled={processingId === r.campaign}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 inline-flex items-center gap-1 transition-colors"
                          title="Suspend Campaign"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(r.campaign, r.campaignTitle)}
                          disabled={processingId === r.campaign}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#EF4444] font-bold text-xs rounded-xl border border-red-200 inline-flex items-center gap-1 transition-colors"
                          title="Delete & Refund"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
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
