'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  LayoutDashboard,
  Users,
  Library,
  BookOpen,
  FileText,
  CheckSquare,
  LogOut,
  Menu,
  X,
  Settings,
  Bell
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [email, setEmail] = useState('admin@system.com');
  const [name, setName] = useState('Administrator');

  useEffect(() => {
    setIsClient(true);
    const token = Cookies.get('token');
    const role = Cookies.get('role');

    if (!token || role !== 'Admin') {
      router.push('/?error=unauthorized');
    } else {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        console.log("Decoded Token:", decoded);
        const userEmail = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || 'admin@system.com';
        const userName = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.name || decoded.unique_name || 'Administrator';
        setEmail(userEmail);
        setName(userName);
      } catch (e) {
        console.error('Failed to decode token for email');
      }
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Classes', href: '/admin/classes', icon: Library },
    { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
    { name: 'Assignments', href: '/admin/assignments', icon: FileText },
    { name: 'Submissions', href: '/admin/submissions', icon: CheckSquare },
  ];

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transform transition-all duration-300 ease-in-out lg:static lg:flex-shrink-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 lg:translate-x-0'
        } ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        <div className={`flex items-center h-20 border-b border-slate-800 transition-all ${isDesktopCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-xl flex-shrink-0">
              <Settings className="w-6 h-6 text-white" />
            </div>
            {!isDesktopCollapsed && (
              <div className="overflow-hidden whitespace-nowrap transition-all opacity-100">
                <h1 className="text-xl font-bold tracking-tight">Admin</h1>
                <p className="text-xs text-slate-400 font-medium">Assignment Management System</p>
              </div>
            )}
          </div>
          {!isDesktopCollapsed && (
            <button className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setSidebarOpen(false)}>
              <X size={20} className="text-slate-400" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-1 scrollbar-hide px-3">
          {!isDesktopCollapsed && (
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 whitespace-nowrap">
              Navigation
            </p>
          )}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                title={isDesktopCollapsed ? item.name : undefined}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group ${
                  isDesktopCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
                {!isDesktopCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          {!isDesktopCollapsed ? (
            <>
              <div className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex flex-shrink-0 items-center justify-center font-bold text-sm">
                    {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD'}
                  </div>
                  <div className="overflow-hidden whitespace-nowrap">
                    <p className="text-sm font-semibold truncate">{name}</p>
                    <p className="text-xs text-slate-400 truncate">{email}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-rose-400 bg-rose-400/10 hover:bg-rose-400/20 rounded-xl transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm" title={name}>
                {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="w-10 h-10 flex items-center justify-center text-rose-400 bg-rose-400/10 hover:bg-rose-400/20 rounded-xl transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0 transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setIsDesktopCollapsed(!isDesktopCollapsed);
                } else {
                  setSidebarOpen(true);
                }
              }}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
              {navItems.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
