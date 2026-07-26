'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { Sparkles, Mail, Lock, User as UserIcon, Image as ImageIcon, UserCheck, Coins, Upload } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState('');
  const [role, setRole] = useState<'Supporter' | 'Creator'>('Supporter');
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // imgBB upload handler helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    const formData = new FormData();
    formData.append('image', file);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || 'mock_imgbb_key';

    try {
      if (apiKey && apiKey !== 'mock_imgbb_key') {
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.data?.url) {
          setPhoto(data.data.url);
          toast.success('Image uploaded to imgBB!');
        } else {
          throw new Error('imgBB response error');
        }
      } else {
        // Fallback for mock mode
        const fakeUrl = URL.createObjectURL(file);
        setPhoto(fakeUrl);
        toast.success('Profile avatar updated');
      }
    } catch (err: any) {
      toast.error('Image upload failed, using fallback URL');
      setPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Name, email, and password are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await register(
      name,
      email,
      password,
      photo || 'https://i.ibb.co/MgsTCzP/default-avatar.png',
      role
    );
    setLoading(false);

    if (res.success && res.user) {
      const initialBonus = role === 'Creator' ? 20 : 50;
      toast.success(`Account created! You received ${initialBonus} initial credits.`);
      if (res.user.role === 'Creator') {
        router.push('/dashboard/creator-home');
      } else {
        router.push('/dashboard/supporter-home');
      }
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F5]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E5E7EB] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FF6B4A] flex items-center justify-center text-white font-bold shadow-md shadow-[#FF6B4A]/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#172033]">Create Your Account</h2>
            <p className="text-xs text-[#64748B]">Join FundoraX to back projects or launch campaigns.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selection */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5">Select Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('Supporter')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    role === 'Supporter'
                      ? 'border-[#FF6B4A] bg-[#FFF9F5] ring-2 ring-[#FF6B4A]/30'
                      : 'border-[#E5E7EB] bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#172033]">Supporter</span>
                    <Coins className="w-4 h-4 text-[#FF6B4A]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#10B981] mt-1">+50 Initial Credits</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('Creator')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    role === 'Creator'
                      ? 'border-[#FF6B4A] bg-[#FFF9F5] ring-2 ring-[#FF6B4A]/30'
                      : 'border-[#E5E7EB] bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#172033]">Creator</span>
                    <Sparkles className="w-4 h-4 text-[#FFC857]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#10B981] mt-1">+20 Initial Credits</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                  required
                />
              </div>
            </div>

            {/* Profile Photo / imgBB Upload */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Profile Photo (URL or Upload)</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
                  <input
                    type="url"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="https://image-url.com/avatar.jpg"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                  />
                </div>
                <label className="cursor-pointer px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#172033] text-xs font-bold rounded-xl border border-[#E5E7EB] flex items-center gap-1 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImg ? 'Uploading...' : 'Upload'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImg}
              className="w-full py-3 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-sm rounded-xl shadow-md shadow-[#FF6B4A]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#64748B]">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#FF6B4A] hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
