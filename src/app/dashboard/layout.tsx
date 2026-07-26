'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../services/api';
import {
  Sparkles,
  Coins,
  Bell,
  Home,
  Compass,
  HeartHandshake,
  CreditCard,
  History,
  PlusCircle,
  FolderKanban,
  Wallet,
  Users,
  ShieldCheck,
  CheckSquare,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface NotificationItem {
  _id: string;
  message: string;
  actionRoute: string;
  isRead: boolean;
  time: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Fetch notifications for logged-in user
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[Notifications Fetch Error]', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationClick = async (n: NotificationItem) => {
    try {
      await api.patch(`/notifications/read/${n._id}`);
      fetchNotifications();
    } catch (err) {
      console.warn(err);
    }
    setNotifDropdownOpen(false);
    if (n.actionRoute) {
      router.push(n.actionRoute);
    }
  };

  // Build navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];

    if (user.role === 'Admin') {
      return [
        { label: 'Admin Overview', href: '/dashboard/admin-home', icon: Home },
        { label: 'Campaign Approvals', href: '/dashboard/campaign-approvals', icon: CheckSquare },
        { label: 'Withdrawal Requests', href: '/dashboard/withdrawal-requests', icon: Wallet },
        { label: 'Manage Users', href: '/dashboard/manage-users', icon: Users },
        { label: 'Manage Campaigns', href: '/dashboard/manage-campaigns', icon: FolderKanban },
        { label: 'Reports Audit', href: '/dashboard/reports', icon: AlertTriangle },
      ];
    }

    if (user.role === 'Creator') {
      return [
        { label: 'Creator Home', href: '/dashboard/creator-home', icon: Home },
        { label: 'Add New Campaign', href: '/dashboard/add-campaign', icon: PlusCircle },
        { label: 'My Campaigns', href: '/dashboard/my-campaigns', icon: FolderKanban },
        { label: 'Review Contributions', href: '/dashboard/contributions-review', icon: HeartHandshake },
        { label: 'Withdrawals Payout', href: '/dashboard/creator-withdrawals', icon: Wallet },
        { label: 'Payment History', href: '/dashboard/creator-payments', icon: History },
      ];
    }

    // Default Supporter nav
    return [
      { label: 'Supporter Home', href: '/dashboard/supporter-home', icon: Home },
      { label: 'Explore Campaigns', href: '/campaigns', icon: Compass },
      { label: 'My Contributions', href: '/dashboard/my-contributions', icon: HeartHandshake },
      { label: 'Purchase Credit', href: '/dashboard/purchase-credit', icon: CreditCard },
      { label: 'Payment History', href: '/dashboard/payment-history', icon: History },
    ];
  };

  const navItems = getNavItems();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FFF9F5] flex flex-col md:flex-row overflow-x-hidden">
        
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between shadow-xs">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B4A] flex items-center justify-center text-white font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-[#172033]">
              Fundora<span className="text-[#FF6B4A]">X</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Credits pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#FFC857]/20 border border-[#FFC857]/50 rounded-full text-xs font-bold text-[#172033]">
              <Coins className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>{user?.credits}</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 text-[#172033] hover:text-[#FF6B4A] rounded-lg border border-[#E5E7EB]"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-[#172033] hover:text-[#FF6B4A] rounded-lg border border-[#E5E7EB]"
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Sidebar Container (Fixed desktop / Collapsible drawer mobile) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col justify-between ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Sidebar Brand Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-[#E5E7EB]">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B4A] flex items-center justify-center text-white font-bold shadow-md shadow-[#FF6B4A]/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold text-[#172033] tracking-tight">
                  Fundora<span className="text-[#FF6B4A]">X</span>
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-[#64748B] hover:text-[#172033]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Info Summary */}
            <div className="p-4 mx-4 mt-4 bg-[#FFF9F5] border border-[#E5E7EB] rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={user?.photo || 'https://i.ibb.co/MgsTCzP/default-avatar.png'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#FF6B4A]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#172033] truncate">{user?.name}</p>
                  <span className="inline-block px-2 py-0.5 bg-[#FFC857]/30 text-[#172033] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
              </div>
              <Link href="/dashboard/profile" onClick={() => setSidebarOpen(false)} className="w-full py-1.5 text-center bg-white border border-[#E5E7EB] text-[#172033] text-[10px] font-bold rounded-lg hover:border-[#FF6B4A] hover:text-[#FF6B4A] transition-colors">
                Edit Profile
              </Link>
            </div>

            {/* Available Credits Card */}
            <div className="px-4 mt-3">
              <div className="p-3.5 bg-gradient-to-r from-[#FF6B4A] to-[#E85538] text-white rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Available Credits</p>
                  <p className="text-2xl font-black">{user?.credits}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="px-3 mt-6 space-y-1">
              <p className="px-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Navigation</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#FF6B4A] text-white shadow-sm shadow-[#FF6B4A]/30'
                        : 'text-[#172033] hover:bg-[#FFF9F5] hover:text-[#FF6B4A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                  </Link>
                );
              })}

              <Link
                href="/"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#64748B] hover:bg-[#FFF9F5] hover:text-[#172033] transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Public Website</span>
              </Link>
            </nav>
          </div>

          {/* Sidebar Footer Logout */}
          <div className="p-4 border-t border-[#E5E7EB]">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-[#EF4444] font-semibold text-sm rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
          ></div>
        )}

        {/* Main Dashboard Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Desktop Top Navbar Bar */}
          <header className="hidden md:flex sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-8 py-3 justify-between items-center shadow-xs">
            <div>
              <h2 className="text-xl font-extrabold text-[#172033]">
                Welcome back, <span className="text-[#FF6B4A]">{user?.name}</span>
              </h2>
              <p className="text-xs font-medium text-[#64748B]">FundoraX Dashboard • Role: {user?.role}</p>
            </div>

            <div className="flex items-center gap-5">
              {/* Notification Bell Popup */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2.5 text-[#172033] hover:text-[#FF6B4A] hover:bg-[#FFF9F5] rounded-xl border border-[#E5E7EB] transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Floating Notification Dropdown Popup */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-[#172033] text-white flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#FFC857]" />
                        <h4 className="font-bold text-sm">Notifications</h4>
                      </div>
                      <span className="text-xs bg-[#FF6B4A] px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} unread
                      </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E7EB]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-[#64748B]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 text-xs cursor-pointer hover:bg-[#FFF9F5] transition-colors ${
                              !n.isRead ? 'bg-[#FFF9F5]/70 font-semibold border-l-4 border-[#FF6B4A]' : 'text-[#64748B]'
                            }`}
                          >
                            <p className="text-[#172033] leading-relaxed mb-1">{n.message}</p>
                            <span className="text-[10px] text-[#64748B]">
                              {new Date(n.time).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-3 border-l border-[#E5E7EB] pl-5">
                <Link href="/dashboard/profile" className="flex items-center gap-3 group">
                  <img
                    src={user?.photo || 'https://i.ibb.co/MgsTCzP/default-avatar.png'}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#FF6B4A] group-hover:shadow-md transition-all"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B4A] transition-colors">{user?.name}</p>
                    <p className="text-[10px] font-semibold text-[#FF6B4A] uppercase tracking-wider">{user?.role}</p>
                  </div>
                </Link>
                <Link href="/dashboard/profile" className="ml-2 px-3 py-1.5 bg-[#FFF9F5] text-[#FF6B4A] border border-[#FF6B4A]/30 text-[10px] font-bold rounded-lg hover:bg-[#FF6B4A] hover:text-white transition-colors">
                  Edit Profile
                </Link>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Dashboard Footer */}
          <footer className="bg-white border-t border-[#E5E7EB] py-4 px-8 text-center text-xs text-[#64748B]">
            © {new Date().getFullYear()} FundoraX Crowdfunding Platform. Responsive SaaS Dashboard.
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
}
