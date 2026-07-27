'use client';

import React from 'react';
import Link from 'next/link';
import { HandHeart, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function Footer() {

  const getDashboardRoute = () => {
    const { user } = useAuth();
    if (!user) return '/login';
    if (user.role === 'Admin') return '/dashboard/admin-home';
    if (user.role === 'Creator') return '/dashboard/creator-home';
    return '/dashboard/supporter-home';
  };
  return (
    <footer className="bg-[#172033] text-white pt-16 pb-12 border-t border-[#172033]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FF6B4A] flex items-center justify-center text-white font-bold">
                <HandHeart className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Fundora<span className="text-[#FF6B4A]">X</span>
              </span>
            </Link>
            <p className="text-sm text-[#64748B] leading-relaxed">
              FundoraX empowers visionary creators and passionate supporters to fund, launch, and scale impactful innovations worldwide using secure credit-based backing.
            </p>

            {/* Social Links (Clean Brand SVGs) */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/Safa-Anan08/FundoraX"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FF6B4A] flex items-center justify-center text-white transition-all"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/safa-anan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FF6B4A] flex items-center justify-center text-white transition-all"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FF6B4A] flex items-center justify-center text-white transition-all"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white tracking-wide border-b border-[#64748B]/30 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-[#64748B]">
              <li>
                <Link href="/campaigns" className="hover:text-[#FF6B4A] transition-colors">
                  Explore Campaigns
                </Link>
              </li>
              <li>
                <Link href={getDashboardRoute()} className="hover:text-[#FF6B4A] transition-colors">
                  User Dashboard
                </Link>

              </li>
              <li>
                <Link href="/register?role=Creator" className="hover:text-[#FF6B4A] transition-colors">
                  Start a Campaign
                </Link>
              </li>
              <li>
                <a href="https://github.com/fundorax" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6B4A] transition-colors">
                  Join as Developer
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white tracking-wide border-b border-[#64748B]/30 pb-2">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-[#64748B]">
              <li>
                <Link href="/campaigns?category=Technology" className="hover:text-[#FF6B4A] transition-colors">
                  Technology & Hardware
                </Link>
              </li>
              <li>
                <Link href="/campaigns?category=Community" className="hover:text-[#FF6B4A] transition-colors">
                  Community & Social Impact
                </Link>
              </li>
              <li>
                <Link href="/campaigns?category=Agriculture" className="hover:text-[#FF6B4A] transition-colors">
                  Agriculture & Ecology
                </Link>
              </li>
              <li>
                <Link href="/campaigns?category=Innovations" className="hover:text-[#FF6B4A] transition-colors">
                  Creative Innovations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white tracking-wide border-b border-[#64748B]/30 pb-2">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm text-[#64748B]">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF6B4A]" />
                <span>support@fundorax.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF6B4A]" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF6B4A]" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Divider & Copyright */}
        <div className="mt-12 pt-6 border-t border-[#64748B]/20 text-center text-xs text-[#64748B] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} FundoraX Crowdfunding Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
