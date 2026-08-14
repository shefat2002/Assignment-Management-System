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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = Cookies.get('token');
    const role = Cookies.get('role');

    if (!token || role !== 'Admin') {
      router.push('/?error=unauthorized');
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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-xl">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">EduAdmin</h1>
              <p className="text-xs text-slate-400 font-medium">Management System</p>
            </div>
          </div>
          <button className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
                AD
              </div>
              <div>
                <p className="text-sm font-semibold">Administrator</p>
                <p className="text-xs text-slate-400">admin@system.com</p>
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
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
              {navItems.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
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
