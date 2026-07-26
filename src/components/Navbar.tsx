'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Menu, X, Coins, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'Admin') return '/dashboard/admin-home';
    if (user.role === 'Creator') return '/dashboard/creator-home';
    return '/dashboard/supporter-home';
  };

  const GITHUB_REPO_URL = 'https://github.com/fundorax/fundorax-crowdfunding-platform';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B4A] flex items-center justify-center text-white font-bold shadow-md shadow-[#FF6B4A]/30 group-hover:bg-[#E85538] transition-all">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-2xl font-extrabold text-[#172033] tracking-tight">
              Fundora<span className="text-[#FF6B4A]">X</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/campaigns"
              className="text-sm font-semibold text-[#172033] hover:text-[#FF6B4A] transition-colors"
            >
              Explore Campaigns
            </Link>

            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-[#64748B] hover:text-[#172033] transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Join as Developer
            </a>

            {user ? (
              <div className="flex items-center gap-4">
                {/* Available Credits Badge -> Click navigates to Purchase Credit page */}
                <Link
                  href="/dashboard/purchase-credit"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFC857]/20 border border-[#FFC857]/50 text-[#172033] rounded-full text-xs font-bold shadow-xs hover:bg-[#FFC857]/40 hover:scale-105 transition-all"
                  title="Click to Purchase Credits"
                >
                  <Coins className="w-4 h-4 text-[#FF6B4A] fill-[#FF6B4A]/20" />
                  <span>{user.credits} Credits</span>
                </Link>

                {/* Dashboard CTA */}
                <Link
                  href={getDashboardRoute()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B4A] hover:bg-[#E85538] text-white text-sm font-semibold rounded-lg shadow-sm shadow-[#FF6B4A]/20 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* User Avatar & Logout */}
                <div className="flex items-center gap-3 border-l border-[#E5E7EB] pl-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.photo || 'https://i.ibb.co/MgsTCzP/default-avatar.png'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#FF6B4A]"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-[#172033] leading-tight">{user.name}</p>
                      <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">{user.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-1.5 text-[#64748B] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#172033] hover:text-[#FF6B4A] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-[#FF6B4A] hover:bg-[#E85538] text-white text-sm font-semibold rounded-lg shadow-sm shadow-[#FF6B4A]/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Hamburger & Credit Badge */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                href="/dashboard/purchase-credit"
                className="flex items-center gap-1 px-2.5 py-1 bg-[#FFC857]/20 border border-[#FFC857]/50 text-[#172033] rounded-full text-xs font-bold hover:bg-[#FFC857]/40"
              >
                <Coins className="w-3.5 h-3.5 text-[#FF6B4A]" />
                <span>{user.credits}</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#172033] hover:text-[#FF6B4A] rounded-lg border border-[#E5E7EB]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5E7EB] bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <Link
            href="/campaigns"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-[#172033] hover:bg-[#FFF9F5]"
          >
            Explore Campaigns
          </Link>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-semibold text-[#64748B] hover:bg-[#FFF9F5]"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Join as Developer
          </a>

          {user ? (
            <div className="pt-2 border-t border-[#E5E7EB] space-y-3">
              <div className="flex items-center gap-3 px-3">
                <img
                  src={user.photo || 'https://i.ibb.co/MgsTCzP/default-avatar.png'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#FF6B4A]"
                />
                <div>
                  <p className="text-sm font-bold text-[#172033]">{user.name}</p>
                  <p className="text-xs text-[#64748B]">{user.email} ({user.role})</p>
                </div>
              </div>

              <Link
                href="/dashboard/purchase-credit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 bg-[#FFF9F5] border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#172033]"
              >
                <span>Wallet Balance</span>
                <span className="text-[#FF6B4A]">{user.credits} Credits</span>
              </Link>

              <Link
                href={getDashboardRoute()}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 bg-[#FF6B4A] text-white font-semibold rounded-lg"
              >
                Go to Dashboard
              </Link>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-[#EF4444] font-semibold rounded-lg hover:bg-red-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#E5E7EB] grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 border border-[#E5E7EB] text-[#172033] font-semibold rounded-lg"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 bg-[#FF6B4A] text-white font-semibold rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
