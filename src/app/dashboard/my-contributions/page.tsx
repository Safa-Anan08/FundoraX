'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../services/api';
import { HeartHandshake, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface Contribution {
  _id: string;
  campaignTitle: string;
  contributionAmount: number;
  creatorName: string;
  status: string;
  date: string;
}

export default function MyContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchContributions = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/contributions/my-contributions?page=${currentPage}&limit=8`);
      if (res.data.success) {
        setContributions(res.data.contributions || []);
        if (res.data.pagination) {
          setPage(res.data.pagination.page);
          setTotalPages(res.data.pagination.totalPages);
          setTotalCount(res.data.pagination.total);
        }
      }
    } catch (err) {
      console.warn('[My Contributions Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions(page);
  }, [page]);

  return (
    <>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#172033]">My Contributions</h1>
            <p className="text-xs text-[#64748B]">View all campaigns you have backed and their approval statuses.</p>
          </div>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Compass className="w-4 h-4" /> Back More Campaigns
          </Link>
        </div>

        {/* Contributions Table Container */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">Campaign Title</th>
                  <th className="p-4">Contribution Amount</th>
                  <th className="p-4">Creator Name</th>
                  <th className="p-4">Submission Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#64748B]">Loading your contributions...</td>
                  </tr>
                ) : contributions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-[#64748B]">
                      You have not made any contributions yet. <br />
                      <Link href="/campaigns" className="text-[#FF6B4A] font-bold underline mt-2 inline-block">
                        Explore Approved Campaigns
                      </Link>
                    </td>
                  </tr>
                ) : (
                  contributions.map((c) => (
                    <tr key={c._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 font-bold text-[#172033] max-w-sm">{c.campaignTitle}</td>
                      <td className="p-4 font-bold text-[#FF6B4A]">{c.contributionAmount} Credits</td>
                      <td className="p-4 text-[#64748B]">{c.creatorName}</td>
                      <td className="p-4 text-[#64748B]">{new Date(c.date).toLocaleDateString()}</td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E5E7EB] bg-[#FFF9F5] flex items-center justify-between text-xs text-[#64748B]">
              <span>
                Showing page <strong className="text-[#172033]">{page}</strong> of <strong className="text-[#172033]">{totalPages}</strong> (Total {totalCount})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg font-bold text-[#172033] disabled:opacity-40 flex items-center gap-1 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg font-bold text-[#172033] disabled:opacity-40 flex items-center gap-1 hover:bg-slate-50"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
