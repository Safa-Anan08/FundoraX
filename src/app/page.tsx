'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

import {
  Rocket,
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  Coins,
  ArrowRight,
  CheckCircle2,
  HandHeart,
  Lightbulb,
  Globe2,
  Heart,

} from 'lucide-react';

interface Campaign {
  _id: string;
  title: string;
  category: string;
  fundingGoal: number;
  raisedAmount: number;
  image: string;
  creatorName: string;
}

const CATEGORY_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  Technology: { icon: Lightbulb, color: 'bg-blue-50 text-blue-600' },
  Community: { icon: Globe2, color: 'bg-emerald-50 text-emerald-600' },
  Innovations: { icon: Rocket, color: 'bg-purple-50 text-purple-600' },
  Agriculture: { icon: Heart, color: 'bg-amber-50 text-amber-600' },
};

const DEFAULT_CATEGORY_STYLE = { icon: HandHeart, color: 'bg-rose-50 text-rose-600' };

const getCategoryStyle = (catName: string) => {
  return CATEGORY_MAP[catName] || DEFAULT_CATEGORY_STYLE;
};

export default function Home() {
  const [topCampaigns, setTopCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTopCampaigns = async () => {
      try {
        const res = await api.get('/campaigns/top-funded');
        if (res.data.success) {
          setTopCampaigns(res.data.campaigns || []);
        }
      } catch (err) {
        console.warn('[Fetch Top Campaigns Error]', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await api.get('/campaigns/categories');
        if (res.data.success && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
          setCategories(res.data.categories);
        } else {
          setCategories(['Technology', 'Community', 'Innovations', 'Agriculture']);
        }
      } catch (err) {
        console.warn('[Fetch Categories Error]', err);
        setCategories(['Technology', 'Community', 'Innovations', 'Agriculture']);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchTopCampaigns();
    fetchCategories();
  }, []);

  const heroSlides = [
    {
      id: 1,
      badge: (
        <span className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Next-Gen Crowdfunding
        </span>
      ),
      heading: "Fuel the Future of Visionary Innovation",
      description:
        "Back groundbreaking projects with secure credits, support independent creators, and earn exclusive rewards on FundoraX.",
      ctaText: "Explore Approved Campaigns",
      ctaLink: "/campaigns",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80",
    },
    {
      id: 2,
      badge: (
        <span className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-sky-400" />
          For Creators & Innovators
        </span>
      ),
      heading: "Turn Passion Into Real-World Impact",
      description:
        "Launch your campaign in minutes, manage supporter contributions, and request hassle-free payouts.",
      ctaText: "Start Your Campaign",
      ctaLink: "/register?role=Creator",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80",
    },
    {
      id: 3,
      badge: (
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Verified & Transparent
        </span>
      ),
      heading: "Every Credit Accounted & Backed",
      description:
        "Join thousands of backers building tomorrow through trusted campaigns, transparent funding, and secure transactions.",
      ctaText: "Claim 50 Free Credits",
      ctaLink: "/register",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Hardware Innovator',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      quote: 'FundoraX allowed our EcoPack campaign to raise over 3,000 credits in just 2 weeks! The credit approval workflow gave backers total confidence.',
    },
    {
      id: 2,
      name: 'David Chen',
      role: 'Community Backer',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      quote: 'I love how easy it is to purchase credits via Stripe and back solar energy initiatives. Receiving real-time notifications on contribution approvals is fantastic.',
    },
    {
      id: 3,
      name: 'Elena Rostova',
      role: 'VR Developer',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      quote: 'The withdrawal calculator and multi-channel payouts made receiving our funding smooth and predictable. Best crowdfunding platform experience!',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F5]">
      <Navbar />

      <main className="flex-1">

        {/* 1. HERO SLIDER SECTION */}
        <section className="relative bg-[#172033] text-white py-12 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Swiper
              modules={[Autoplay, Pagination, Navigation, EffectFade]}
              effect="fade"
              spaceBetween={30}
              centeredSlides={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              className="rounded-3xl shadow-2xl overflow-hidden"
            >
              {heroSlides.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <div className="relative min-h-[460px] lg:min-h-[520px] flex items-center bg-[#172033] p-6 lg:p-12">
                    {/* Background Overlay */}
                    <div className="absolute inset-0 z-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}></div>
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#172033] via-[#172033]/90 to-transparent"></div>

                    <div className="relative z-10 max-w-2xl space-y-6">
                      <span className="inline-block px-4 py-1.5 bg-[#FF6B4A]/20 border border-[#FF6B4A]/40 text-[#FFC857] text-xs font-bold rounded-full">
                        {slide.badge}
                      </span>
                      <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                        {slide.heading}
                      </h1>
                      <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                        {slide.description}
                      </p>
                      <div className="pt-2 flex flex-wrap gap-4">
                        <Link
                          href={slide.ctaLink}
                          className="px-6 py-3.5 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF6B4A]/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                        >
                          <span>{slide.ctaText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          href="/campaigns"
                          className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl backdrop-blur-md transition-colors"
                        >
                          Browse All Projects
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* 2. TOP FUNDED CAMPAIGNS SECTION */}
        <section className="py-16 bg-[#FFF9F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-widest">Featured Projects</span>
                <h2 className="text-3xl font-extrabold text-[#172033] mt-1">Top Funded Campaigns</h2>
              </div>
              <Link
                href="/campaigns"
                className="mt-4 md:mt-0 inline-flex items-center gap-2 font-bold text-[#FF6B4A] hover:text-[#E85538] text-sm group"
              >
                <span>View All Campaigns</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] animate-pulse space-y-4">
                    <div className="w-full h-48 bg-slate-200 rounded-xl"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : topCampaigns.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#E5E7EB]">
                <p className="text-[#64748B]">No approved campaigns found yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {topCampaigns.map((c) => {
                  const progress = Math.min(100, Math.round((c.raisedAmount / (c.fundingGoal || 1)) * 100));
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
                        <span className="absolute top-3 left-3 px-3 py-1 bg-[#172033]/80 backdrop-blur-md text-white text-xs font-bold rounded-full">
                          {c.category}
                        </span>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <p className="text-xs text-[#64748B] mb-1">By <span className="font-semibold text-[#172033]">{c.creatorName}</span></p>
                          <h3 className="text-lg font-bold text-[#172033] line-clamp-2 group-hover:text-[#FF6B4A] transition-colors">
                            {c.title}
                          </h3>
                        </div>

                        {/* Progress Bar */}
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
                          <p className="text-right text-[11px] font-bold text-[#64748B]">{progress}% Funded</p>
                        </div>

                        <Link
                          href={`/campaigns/${c._id}`}
                          className="w-full py-2.5 bg-[#FFF9F5] hover:bg-[#FF6B4A] text-[#172033] hover:text-white font-bold text-xs rounded-xl border border-[#E5E7EB] hover:border-[#FF6B4A] text-center transition-all block"
                        >
                          View Campaign Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 3. EXTRA SECTION 1: HOW IT WORKS */}
        <section className="py-16 bg-white border-y border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-widest">Simple Step-by-Step</span>
              <h2 className="text-3xl font-extrabold text-[#172033] mt-1">How FundoraX Works</h2>
              <p className="text-sm text-[#64748B] mt-2">
                Whether you want to back high-potential ideas or launch your own, our credit system makes crowdfunding secure and transparent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-[#FFF9F5] border border-[#E5E7EB] space-y-4 text-center hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-black text-xl">
                  1
                </div>
                <h3 className="text-xl font-bold text-[#172033]">Create Account & Get Credits</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Supporters automatically receive 50 initial credits upon sign up. Purchase more credits seamlessly via Stripe whenever needed.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#FFF9F5] border border-[#E5E7EB] space-y-4 text-center hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFC857]/20 text-[#172033] flex items-center justify-center font-black text-xl">
                  2
                </div>
                <h3 className="text-xl font-bold text-[#172033]">Explore & Back Projects</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Browse verified campaigns approved by administrators. Submit credit contributions directly to creator campaigns.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#FFF9F5] border border-[#E5E7EB] space-y-4 text-center hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-black text-xl">
                  3
                </div>
                <h3 className="text-xl font-bold text-[#172033]">Creators Approve & Payout</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Creators review contributions, update campaign milestones, and request USD payouts starting at 200 credits ($10 USD).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. EXTRA SECTION 2: EXPLORE BY CATEGORY */}
        <section className="py-16 bg-[#FFF9F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-widest">Diverse Ecosystem</span>
              <h2 className="text-3xl font-extrabold text-[#172033] mt-1">Explore by Category</h2>
            </div>

            {categoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-[#E5E7EB] animate-pulse text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100"></div>
                    <div className="h-4 bg-slate-100 rounded-md w-24 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-[#64748B] text-sm font-semibold">
                No categories available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((catName) => {
                  const style = getCategoryStyle(catName);
                  const Icon = style.icon;
                  return (
                    <Link
                      key={catName}
                      href={`/campaigns?category=${encodeURIComponent(catName)}`}
                      className="p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md transition-all text-center space-y-3 group"
                    >
                      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${style.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-[#172033] group-hover:text-[#FF6B4A] transition-colors">{catName}</h4>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 5. TESTIMONIALS SECTION (SWIPER) */}
        <section className="py-16 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-widest">Community Voice</span>
              <h2 className="text-3xl font-extrabold text-[#172033] mt-1">What Our Users Say</h2>
            </div>

            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              autoplay={{ delay: 4000 }}
              pagination={{ clickable: true }}
              className="pb-12"
            >
              {testimonials.map((t) => (
                <SwiperSlide key={t.id}>
                  <div className="p-6 bg-[#FFF9F5] rounded-2xl border border-[#E5E7EB] h-full flex flex-col justify-between space-y-4">
                    <p className="text-sm text-[#172033] italic leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-[#E5E7EB]">
                      <img
                        src={t.photo}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#FF6B4A]"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#172033]">{t.name}</h4>
                        <p className="text-xs text-[#64748B]">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* 6. EXTRA SECTION 3: PLATFORM IMPACT & STATISTICS */}
        <section className="py-16 bg-[#172033] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <p className="text-4xl font-black text-[#FFC857]">12,500+</p>
                <p className="text-xs uppercase font-bold text-slate-300 tracking-wider">Credits Contributed</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-black text-[#FF6B4A]">98%</p>
                <p className="text-xs uppercase font-bold text-slate-300 tracking-wider">Approved Campaigns</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-black text-[#10B981]">2,400+</p>
                <p className="text-xs uppercase font-bold text-slate-300 tracking-wider">Active Supporters</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-black text-[#FFC857]">$45,000+</p>
                <p className="text-xs uppercase font-bold text-slate-300 tracking-wider">Payouts Processed</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
