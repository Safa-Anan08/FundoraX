'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { PlusCircle, Upload, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

export default function AddCampaignPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('Technology');
  const [fundingGoal, setFundingGoal] = useState<number | ''>(5000);
  const [minContribution, setMinContribution] = useState<number | ''>(10);
  const [deadline, setDeadline] = useState('');
  const [rewardInfo, setRewardInfo] = useState('');
  const [image, setImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // imgBB Image Upload Handler
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
          setImage(data.data.url);
          toast.success('Campaign cover image uploaded to imgBB!');
        } else {
          throw new Error('imgBB upload failed');
        }
      } else {
        const fakeUrl = URL.createObjectURL(file);
        setImage(fakeUrl);
        toast.success('Campaign image uploaded');
      }
    } catch (err) {
      toast.error('Image upload failed, please paste an image URL directly');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !story || !category || !fundingGoal || !deadline || !image) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(deadline) <= new Date()) {
      toast.error('Deadline must be a future date');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/campaigns/create', {
        title,
        story,
        category,
        fundingGoal: Number(fundingGoal),
        minContribution: Number(minContribution || 1),
        deadline,
        rewardInfo,
        image,
      });

      if (res.data.success) {
        toast.success('Campaign submitted successfully! Pending Admin approval.');
        router.push('/dashboard/my-campaigns');
      } else {
        toast.error(res.data.message || 'Campaign creation failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error creating campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Create New Campaign</h1>
          <p className="text-xs text-[#64748B]">Fill in details to launch your crowdfunding campaign. Pending Admin approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">Campaign Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. EcoPack: 100% Biodegradable Water Bottles"
              className="w-full px-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
              required
            />
          </div>

          {/* Category & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
              >
                <option value="Technology">Technology</option>
                <option value="Community">Community</option>
                <option value="Innovations">Innovations</option>
                <option value="Agriculture">Agriculture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Deadline Date *</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                required
              />
            </div>
          </div>

          {/* Funding Goal & Min Contribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Funding Goal (Credits) *</label>
              <input
                type="number"
                min={1}
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value ? Number(e.target.value) : '')}
                placeholder="5000"
                className="w-full px-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#FF6B4A] focus:outline-none focus:border-[#FF6B4A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Minimum Backing Contribution (Credits) *</label>
              <input
                type="number"
                min={1}
                value={minContribution}
                onChange={(e) => setMinContribution(e.target.value ? Number(e.target.value) : '')}
                placeholder="10"
                className="w-full px-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                required
              />
            </div>
          </div>

          {/* Cover Image URL / imgBB Upload */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">Campaign Cover Image *</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <ImageIcon className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                  required
                />
              </div>
              <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#172033] text-xs font-bold rounded-xl border border-[#E5E7EB] flex items-center gap-1.5 transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImg ? 'Uploading...' : 'imgBB Upload'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {image && (
              <div className="mt-3 relative h-40 rounded-2xl overflow-hidden border border-[#E5E7EB]">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Story Description */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">Campaign Story *</label>
            <textarea
              rows={6}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Describe your vision, product specs, problem being solved, and how credits will be utilized..."
              className="w-full p-4 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-sm text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
              required
            ></textarea>
          </div>

          {/* Reward Info */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">Reward Information for Backers</label>
            <input
              type="text"
              value={rewardInfo}
              onChange={(e) => setRewardInfo(e.target.value)}
              placeholder="e.g. Backers of 50+ credits receive early access product samples"
              className="w-full px-4 py-2.5 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
            />
          </div>

          {/* Notice Box */}
          <div className="p-4 bg-[#FFC857]/15 border border-[#FFC857]/40 rounded-2xl flex items-center gap-3 text-xs text-[#172033]">
            <AlertCircle className="w-5 h-5 text-[#FF6B4A] shrink-0" />
            <p>
              Newly submitted campaigns are set to <strong>Pending Status</strong>. Admin review is required before your campaign appears publicly.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingImg}
            className="w-full py-3.5 bg-[#FF6B4A] hover:bg-[#E85538] text-white font-bold text-sm rounded-xl shadow-md shadow-[#FF6B4A]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Submit Campaign for Admin Approval</span>
              </>
            )}
          </button>
        </form>

      </div>
    </>
  );
}
