'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import { Search, Filter, Calendar, Sparkles, ArrowRight, Clock, Award } from 'lucide-react';

interface Campaign {
  _id: string;
  title: string;
  category: string;
  fundingGoal: number;
  raisedAmount: number;
  minContribution: number;
  deadline: string;
  image: string;
  creatorName: string;
}

function ExploreCampaignsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<string[]>(['All', 'Technology', 'Community', 'Innovations', 'Agriculture']);

  // Sync state if URL query param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Dynamically fetch unique categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/campaigns/categories');
        if (res.data.success && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
          setCategories(['All', ...res.data.categories]);
        }
      } catch (err) {
        console.warn('[Fetch Categories Error]', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/campaigns/approved';
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (search.trim()) {
        params.append('search', search.trim());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setCampaigns(res.data.campaigns || []);
      } else {
        setError(res.data.message || 'Failed to load campaigns');
      }
    } catch (err: any) {
      console.warn('[Fetch Campaigns Error]', err);
      setError('Error connecting to API server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F5]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="inline-block px-3.5 py-1 bg-[#FF6B4A]/10 border border-[#FF6B4A]/30 text-[#FF6B4A] text-xs font-bold rounded-full">
            Explore Verified Campaigns
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            Discover & Back Visionary Projects
          </h1>
          <p className="text-sm text-[#64748B]">
            All listed campaigns are approved by administrators and actively accepting credit contributions.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-[#E5E7EB] shadow-sm mb-10 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-[#64748B] flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#FF6B4A] text-white shadow-sm shadow-[#FF6B4A]/30'
                    : 'bg-[#FFF9F5] text-[#172033] hover:bg-slate-100 border border-[#E5E7EB]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns by title..."
              className="w-full pl-10 pr-24 py-2 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-xs rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] animate-pulse space-y-4">
                <div className="w-full h-48 bg-slate-200 rounded-xl"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-[#EF4444]/30 rounded-2xl p-8 text-center text-[#EF4444]">
            <p className="font-bold">{error}</p>
            <button
              onClick={fetchCampaigns}
              className="mt-4 px-4 py-2 bg-[#EF4444] text-white font-bold text-xs rounded-xl"
            >
              Retry Loading
            </button>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E7EB] max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF9F5] border border-[#E5E7EB] flex items-center justify-center text-[#64748B]">
              <Search className="w-8 h-8 text-[#FF6B4A]" />
            </div>
            <h3 className="text-xl font-bold text-[#172033]">No Campaigns Found</h3>
            <p className="text-xs text-[#64748B]">
              No active approved campaigns matched your filter criteria "{selectedCategory}" or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearch('');
              }}
              className="px-5 py-2.5 bg-[#FF6B4A] text-white font-bold text-xs rounded-xl hover:bg-[#E85538] transition-colors"
            >
              Clear Filters & Reset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((c) => {
              const progress = Math.min(100, Math.round((c.raisedAmount / (c.fundingGoal || 1)) * 100));
              const daysLeft = Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={c.image}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 bg-[#172033]/80 backdrop-blur-md text-white text-xs font-bold rounded-full">
                        {c.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-[#FFC857] text-[11px] font-bold rounded-full flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{daysLeft}d left</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">
                        By <span className="font-semibold text-[#172033]">{c.creatorName}</span>
                      </p>
                      <h3 className="text-lg font-bold text-[#172033] line-clamp-2 group-hover:text-[#FF6B4A] transition-colors">
                        {c.title}
                      </h3>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#FF6B4A]">{c.raisedAmount} Credits Raised</span>
                        <span className="text-[#64748B]">Goal: {c.fundingGoal}</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#FFF9F5] rounded-full overflow-hidden border border-[#E5E7EB]">
                        <div
                          className="h-full bg-gradient-to-r from-[#FF6B4A] to-[#FFC857] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#64748B]">
                        <span>Min Backing: {c.minContribution} Credits</span>
                        <span className="text-[#10B981] font-bold">{progress}%</span>
                      </div>
                    </div>

                    <Link
                      href={`/campaigns/${c._id}`}
                      className="w-full py-2.5 bg-[#FFF9F5] hover:bg-[#FF6B4A] text-[#172033] hover:text-white font-bold text-xs rounded-xl border border-[#E5E7EB] hover:border-[#FF6B4A] text-center transition-all flex items-center justify-center gap-2 group-hover:bg-[#FF6B4A] group-hover:text-white"
                    >
                      <span>View Campaign Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ExploreCampaignsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FFF9F5] text-[#64748B] font-semibold">Loading campaigns...</div>}>
      <ExploreCampaignsContent />
    </Suspense>
  );
}
