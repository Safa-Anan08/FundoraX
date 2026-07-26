'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Coins,
  ShieldCheck,
  Camera,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoto(user.photo || '');
      setPreview(user.photo || '');
    }
  }, [user]);

  // imgBB Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploadingImg(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || 'mock_imgbb_key';
      
      // If we have a real key, upload to imgBB
      if (apiKey && apiKey !== 'mock_imgbb_key') {
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          setPhoto(data.data.url);
          setPreview(data.data.url);
          toast.success('Profile image uploaded to imgBB!');
        } else {
          throw new Error('imgBB upload failed');
        }
      } else {
        // Mock fallback
        setTimeout(() => {
          const mockUrl = 'https://i.ibb.co/MgsTCzP/default-avatar.png';
          setPhoto(mockUrl);
          setPreview(mockUrl);
          toast.success('Mock image uploaded successfully!');
          setUploadingImg(false);
        }, 1500);
        return;
      }
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
      setPreview(photo); // Revert to previous image
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    setSaving(true);
    try {
      const res = await api.patch('/users/profile', {
        name: name.trim(),
        photo: photo,
      });

      if (res.data.success) {
        toast.success('Profile updated successfully!');
        await refreshUser(); // Update AuthContext state immediately
      } else {
        toast.error(res.data.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || '');
      setPhoto(user.photo || '');
      setPreview(user.photo || '');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033]">Edit Profile</h1>
        <p className="text-xs text-[#64748B]">Update your personal information and profile picture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Read-Only Info Cards */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-2 relative overflow-hidden">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Account Role</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-[#172033]">{user?.role}</p>
              <p className="text-[10px] text-[#64748B]">Contact support to change roles</p>
          </div>

          <div className="bg-gradient-to-br from-[#FFF9F5] to-white p-5 rounded-2xl border border-[#FF6B4A]/30 shadow-xs space-y-2 relative overflow-hidden">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Available Credits</span>
                <div className="w-8 h-8 rounded-xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-[#FF6B4A]">{user?.credits}</p>
              <p className="text-[10px] text-[#64748B]">Purchase more in wallet</p>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-[#FFF9F5]">
              <div className="flex items-center gap-2 text-[#172033] font-bold">
                <User className="w-5 h-5 text-[#FF6B4A]" />
                <h3>Personal Information</h3>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Image Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FFF9F5] shadow-md bg-gray-100 flex items-center justify-center">
                    {preview ? (
                      <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#FF6B4A] hover:bg-[#E85538] text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      disabled={uploadingImg || saving}
                    />
                  </label>
                </div>
                
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-sm font-bold text-[#172033]">Profile Picture</h4>
                  <p className="text-xs text-[#64748B] max-w-xs">JPG, GIF or PNG. Max size of 5MB.</p>
                  {uploadingImg && <p className="text-[10px] font-bold text-[#FF6B4A] animate-pulse">Uploading to imgBB...</p>}
                </div>
              </div>

              <hr className="border-[#E5E7EB]" />

              <div className="grid grid-cols-1 gap-5">
                {/* Name Input */}
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1.5">
                    Display Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    className="w-full p-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#172033] focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Input (Read Only) */}
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1.5 flex items-center gap-1">
                    Email Address <AlertCircle className="w-3.5 h-3.5 text-[#64748B]" />
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-[#64748B]" />
                    </div>
                    <input
                      type="email"
                      readOnly
                      value={user?.email || ''}
                      className="w-full pl-9 p-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm text-[#64748B] cursor-not-allowed outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-1.5">Email address cannot be changed from the dashboard.</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-[#E5E7EB] flex flex-col-reverse sm:flex-row justify-end items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || uploadingImg}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-gray-100 border border-[#E5E7EB] text-[#172033] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={saving || uploadingImg}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#FF6B4A] hover:bg-[#E85538] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FF6B4A]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
