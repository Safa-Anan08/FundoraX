'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import {
  Coins,
  Clock,
  User as UserIcon,
  ShieldCheck,
  Award,
  AlertTriangle,
  Send,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Lock,
  Flag,
  X,
  ShoppingBag,
} from 'lucide-react';

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
  creatorName: string;
  creatorEmail: string;
  raisedAmount: number;
  status: string;
}

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Contribution state
  const [amount, setAmount] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchCampaign = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/campaigns/details/${id}`);
      if (res.data.success) {
        setCampaign(res.data.campaign);
        if (res.data.campaign?.minContribution) {
          setAmount(res.data.campaign.minContribution);
        }
      } else {
        setError(res.data.message || 'Campaign not found');
      }
    } catch (err: any) {
      console.warn('[Fetch Campaign Error]', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCampaign();
  }, [id]);

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in as a Supporter to back this campaign');
      router.push('/login');
      return;
    }

    if (user.role !== 'Supporter' && user.role !== 'Admin') {
      toast.error('Only Supporter accounts can make contributions.');
      return;
    }

    const contribAmount = Number(amount);
    if (!contribAmount || contribAmount <= 0) {
      toast.error('Please enter a valid contribution amount');
      return;
    }

    if (!campaign) return;

    if (contribAmount < campaign.minContribution) {
      toast.error(`Minimum contribution is ${campaign.minContribution} credits`);
      return;
    }

    if (user.credits < contribAmount) {
      toast.error(`Insufficient credits. Please purchase more credits to continue supporting this campaign.`);
      return;
    }

    if (new Date(campaign.deadline) < new Date()) {
      toast.error('Campaign deadline has passed');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/contributions/submit', {
        campaignId: campaign._id,
        contributionAmount: contribAmount,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Contribution submitted successfully for Creator review!');
        refreshUser(); // Update available credits badge immediately
        fetchCampaign(); // Refresh campaign details
      } else {
        toast.error(res.data.message || 'Contribution failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error submitting contribution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      toast.error('Please enter a reason for reporting');
      return;
    }

    setSubmittingReport(true);
    try {
      const res = await api.post('/reports/submit', {
        campaignId: campaign?._id,
        reason: reportReason,
      });

      if (res.data.success) {
        toast.success('Report submitted to Admin for review.');
        setReportModalOpen(false);
        setReportReason('');
      } else {
        toast.error(res.data.message || 'Failed to submit report');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error submitting report');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F5]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-[#FF6B4A] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-semibold text-slate-600">Loading campaign details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F5]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 border border-[#E5E7EB] text-center max-w-md space-y-4">
            <AlertTriangle className="w-12 h-12 text-[#EF4444] mx-auto" />
            <h2 className="text-xl font-bold text-[#172033]">{error || 'Campaign not found'}</h2>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B4A] text-white font-bold text-xs rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Explore Campaigns
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = Math.min(100, Math.round((campaign.raisedAmount / (campaign.fundingGoal || 1)) * 100));
  const remainingCredits = Math.max(0, campaign.fundingGoal - campaign.raisedAmount);
  const isExpired = new Date(campaign.deadline) < new Date();
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const isInsufficient = user && amount && user.credits < Number(amount);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F5]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#FF6B4A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore Campaigns
          </Link>

          <button
            onClick={() => {
              if (!user) {
                toast.error('Please log in to report campaigns');
                router.push('/login');
              } else {
                setReportModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#EF4444] text-xs font-bold rounded-lg border border-red-200 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" /> Report Campaign
          </button>
        </div>

        {/* Campaign Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Image, Story, Reward Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl overflow-hidden border border-[#E5E7EB] shadow-sm">
              <div className="relative h-72 sm:h-96 bg-slate-100">
                <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3.5 py-1 bg-[#172033]/90 text-white text-xs font-bold rounded-full backdrop-blur-md">
                    {campaign.category}
                  </span>
                  <span className="px-3.5 py-1 bg-[#10B981] text-white text-xs font-bold rounded-full capitalize">
                    {campaign.status}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-tight">
                    {campaign.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-[#FF6B4A]" />
                      <span>Creator: <strong className="text-[#172033]">{campaign.creatorName}</strong> ({campaign.creatorEmail})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#FF6B4A] font-bold">
                      <Clock className="w-4 h-4" />
                      <span>{isExpired ? 'Deadline Passed' : `${daysLeft} Days Remaining`}</span>
                    </div>
                  </div>
                </div>

                <hr className="border-[#E5E7EB]" />

                {/* Campaign Story */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#172033]">Campaign Story</h3>
                  <div className="text-sm text-[#64748B] leading-relaxed whitespace-pre-line bg-[#FFF9F5] p-5 rounded-2xl border border-[#E5E7EB]">
                    {campaign.story}
                  </div>
                </div>

                {/* Reward Information */}
                {campaign.rewardInfo && (
                  <div className="p-5 bg-[#FFC857]/10 border border-[#FFC857]/40 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-[#172033] font-bold text-sm">
                      <Award className="w-5 h-5 text-[#FF6B4A]" />
                      <span>Supporter Reward Information</span>
                    </div>
                    <p className="text-xs text-[#172033]/80 leading-relaxed pl-7">
                      {campaign.rewardInfo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Funding Progress & Contribution Form */}
          <div className="space-y-6">
            
            {/* Funding Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-md space-y-6 sticky top-24">
              
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Total Raised</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#FF6B4A]">{campaign.raisedAmount}</span>
                  <span className="text-sm font-bold text-[#172033]">Credits</span>
                </div>
                <p className="text-xs text-[#64748B]">Goal: {campaign.fundingGoal} Credits • Remaining: {remainingCredits} Credits</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-3 bg-[#FFF9F5] rounded-full overflow-hidden border border-[#E5E7EB]">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B4A] to-[#FFC857] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#10B981]">{progress}% Funded</span>
                  <span className="text-[#64748B]">Min: {campaign.minContribution} Credits</span>
                </div>
              </div>

              <hr className="border-[#E5E7EB]" />

              {/* Contribution Form */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-[#172033] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#FF6B4A]" /> Back This Campaign
                </h4>

                {user ? (
                  <div className="p-3 bg-[#FFF9F5] rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#64748B]">Your Available Balance:</span>
                    <span className="text-[#FF6B4A] font-bold">{user.credits} Credits</span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Please <Link href="/login" className="font-bold underline">Log In</Link> to contribute.</span>
                  </div>
                )}

                {user && user.role !== 'Supporter' && user.role !== 'Admin' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    ⚠️ You are logged in as a <strong>{user.role}</strong>. Only Supporter accounts can contribute.
                  </div>
                )}

                {/* Insufficient Credits Banner */}
                {isInsufficient && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs space-y-2 text-red-800 animate-in fade-in duration-200">
                    <p className="font-bold flex items-center gap-1.5 text-[#EF4444]">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Insufficient Credits</span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-red-700">
                      Insufficient credits. Please purchase more credits to continue supporting this campaign.
                    </p>
                    <Link
                      href="/dashboard/purchase-credit"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Purchase Credits
                    </Link>
                  </div>
                )}

                <form onSubmit={handleContributionSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#172033] mb-1">
                      Contribution Amount (Credits)
                    </label>
                    <input
                      type="number"
                      min={campaign.minContribution}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder={`Min ${campaign.minContribution} credits`}
                      disabled={isExpired || !user || (user.role !== 'Supporter' && user.role !== 'Admin')}
                      className="w-full px-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#172033] focus:outline-none focus:border-[#FF6B4A] disabled:opacity-50"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      isExpired ||
                      !user ||
                      (user.role !== 'Supporter' && user.role !== 'Admin') ||
                      !amount ||
                      Number(amount) < campaign.minContribution ||
                      Boolean(isInsufficient)
                    }
                    className="w-full py-3 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-sm rounded-xl shadow-md shadow-[#FF6B4A]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Contribution</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="text-[11px] text-center text-[#64748B]">
                  Contributions are held in <strong>Pending</strong> status until Creator approval.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Report Modal Popup */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E5E7EB] shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2 text-[#EF4444] font-bold text-base">
                <Flag className="w-5 h-5" />
                <span>Report Campaign to Admin</span>
              </div>
              <button onClick={() => setReportModalOpen(false)} className="text-[#64748B] hover:text-[#172033]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">Reason for Report</label>
                <textarea
                  rows={4}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Explain why this campaign violates terms or requires audit..."
                  className="w-full p-3 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#EF4444]"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E7EB] text-[#172033] text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2 bg-[#EF4444] hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
