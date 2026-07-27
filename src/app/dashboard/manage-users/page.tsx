'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Users, UserX, Shield, Edit2 } from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: 'Supporter' | 'Creator' | 'Admin';
  credits: number;
  createdAt: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/admin/all');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.warn('[Fetch Admin Users Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setProcessingId(userId);
    try {
      const res = await api.patch(`/users/admin/role/${userId}`, { role: newRole });
      if (res.data.success) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers();
      } else {
        toast.error(res.data.message || 'Role update failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error updating role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}"?`)) return;

    setProcessingId(userId);
    try {
      const res = await api.delete(`/users/admin/delete/${userId}`);
      if (res.data.success) {
        toast.success(`User "${name}" removed`);
        fetchUsers();
      } else {
        toast.error(res.data.message || 'User deletion failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error deleting user');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-[#172033]">Manage Platform Users</h1>
          <p className="text-xs text-[#64748B]">View all registered supporters, creators, and admins. Update roles or remove accounts.</p>
        </div>

        {/* User Table Container */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F5] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#64748B]">Loading user accounts...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-[#64748B]">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={u.photo || 'https://i.ibb.co/MgsTCzP/default-avatar.png'}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#FF6B4A]"
                        />
                        <span className="font-bold text-[#172033]">{u.name}</span>
                      </td>
                      <td className="p-4 text-[#64748B]">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={processingId === u._id}
                          className="px-2.5 py-1 bg-[#FFF9F5] border border-[#E5E7EB] rounded-lg font-bold text-xs text-[#172033] focus:outline-none focus:border-[#FF6B4A]"
                        >
                          <option value="Supporter">Supporter</option>
                          <option value="Creator">Creator</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4 font-bold text-[#FF6B4A]">{u.credits} Credits</td>
                      <td className="p-4 text-[#64748B]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          disabled={processingId === u._id}
                          className="p-1.5 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>
          <div className="lg:hidden p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8 text-[#64748B]">
                Loading user accounts...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-10 text-[#64748B]">
                No users found.
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-4 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.photo || "https://i.ibb.co/MgsTCzP/default-avatar.png"}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#FF6B4A]"
                    />

                    <div className="min-w-0">
                      <h3 className="font-bold text-[#172033]">
                        {u.name}
                      </h3>

                      <p className="text-xs text-[#64748B] break-all">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 text-xs">
                    <span className="text-[#64748B]">Role</span>

                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(u._id, e.target.value)
                      }
                      disabled={processingId === u._id}
                      className="px-2 py-1 bg-[#FFF9F5] border border-[#E5E7EB] rounded-lg font-bold text-[#172033]"
                    >
                      <option value="Supporter">Supporter</option>
                      <option value="Creator">Creator</option>
                      <option value="Admin">Admin</option>
                    </select>

                    <span className="text-[#64748B]">Credits</span>

                    <span className="font-bold text-[#FF6B4A]">
                      {u.credits} Credits
                    </span>

                    <span className="text-[#64748B]">Registered</span>

                    <span>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteUser(u._id, u.name)}
                    disabled={processingId === u._id}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-[#EF4444] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" />
                    Remove User
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
}
