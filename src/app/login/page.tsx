'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HandHeart, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

function LoginContent() {
  const { login, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Google OAuth Callback Token
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error(decodeURIComponent(error));
        router.replace('/login');
        return;
      }

      if (token) {
        setLoading(true);
        try {
          localStorage.setItem('fundorax_token', token);
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data.success && res.data.user) {
            const loggedInUser = res.data.user;
            await refreshUser();
            toast.success(`Welcome, ${loggedInUser.name}!`);

            // Clean query parameters from URL
            window.history.replaceState({}, document.title, window.location.pathname);

            if (loggedInUser.role === 'Admin') {
              router.push('/dashboard/admin-home');
            } else if (loggedInUser.role === 'Creator') {
              router.push('/dashboard/creator-home');
            } else {
              router.push('/dashboard/supporter-home');
            }
          } else {
            toast.error('Authentication failed');
            router.replace('/login');
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Google Login error');
          router.replace('/login');
        } finally {
          setLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [searchParams, refreshUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.user) {
      toast.success(`Welcome back, ${res.user.name}!`);
      if (res.user.role === 'Admin') {
        router.push('/dashboard/admin-home');
      } else if (res.user.role === 'Creator') {
        router.push('/dashboard/creator-home');
      } else {
        router.push('/dashboard/supporter-home');
      }
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Redirect browser to backend Google OAuth initiation route
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F5]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E5E7EB] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FF6B4A] flex items-center justify-center text-white font-bold shadow-md shadow-[#FF6B4A]/20">
              <HandHeart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#172033]">Log In to FundoraX</h2>
            <p className="text-xs text-[#64748B]">Access your credits, campaigns, and account overview.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-sm rounded-xl shadow-md shadow-[#FF6B4A]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#E5E7EB]"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-[#64748B] uppercase">Or</span>
            <div className="flex-grow border-t border-[#E5E7EB]"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-[#172033] font-bold text-sm rounded-xl border border-[#E5E7EB] flex items-center justify-center gap-2 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.62H1.29A11.96 11.96 0 000 12c0 1.92.45 3.74 1.29 5.38l3.99-3.14z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-xs text-[#64748B]">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-[#FF6B4A] hover:underline">
              Register here
            </Link>
          </p>

          <div className="p-3 bg-[#FFF9F5] rounded-xl border border-[#E5E7EB] text-[11px] text-[#64748B] space-y-1">
            <p className="font-bold text-[#172033]">Demo Accounts (Seed Data):</p>
            <p>• Admin: admin@fundorax.com / admin123</p>
            <p>• Creator: creator@fundorax.com / creator123</p>
            <p>• Supporter: supporter@fundorax.com / supporter123</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F5]">
        <div className="w-10 h-10 border-4 border-[#FF6B4A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
