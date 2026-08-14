'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  ChevronRight,
  LogOut,
  Settings,
  UserPlus,
  UserCheck,
  Library
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  totalAssignments: number;
  totalSubmissions: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
  });
  const [name, setName] = useState('Administrator');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    const token = Cookies.get('token');
    const role = Cookies.get('role');

    if (!token || role !== 'Admin') {
      router.push('/?error=unauthorized');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      const userName = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.name || decoded.unique_name || 'Administrator';
      setName(userName);
    } catch (e) {
      console.error('Failed to decode token for name');
    }

    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      // If stats endpoint doesn't exist, set zeros
      console.warn('Stats endpoint not available:', err);
      setError('Could not load statistics. API endpoint may not be implemented yet.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Teachers',
      value: stats.totalTeachers,
      icon: UserCheck,
      color: 'bg-purple-500',
      link: '/admin/users?role=Teacher',
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'bg-green-500',
      link: '/admin/users?role=Student',
    },
    {
      title: 'Classes',
      value: stats.totalClasses,
      icon: Library,
      color: 'bg-orange-500',
      link: '/admin/classes',
    },
    {
      title: 'Subjects',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'bg-pink-500',
      link: '/admin/subjects',
    },
    {
      title: 'Assignments',
      value: stats.totalAssignments,
      icon: FileText,
      color: 'bg-teal-500',
      link: '/admin/assignments',
    },
  ];

  const quickActions = [
    { name: 'Manage Users', href: '/admin/users', icon: UserPlus, description: 'Manage user accounts and add new users' },
    { name: 'Manage Classes', href: '/admin/classes', icon: Library, description: 'View and add new classes' },
    { name: 'Manage Subjects', href: '/admin/subjects', icon: BookOpen, description: 'View and add new subjects' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Welcome, {name}</h2>
          <p className="text-slate-600 mt-1">Manage your institution from this central dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-amber-800 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                onClick={() => router.push(card.link)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer border border-slate-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{card.title}</p>
                      <p className="text-3xl font-bold text-slate-800 mt-2">{card.value}</p>
                    </div>
                    <div className={`${card.color} p-3 rounded-xl shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">View details</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.name}
                  onClick={() => router.push(action.href)}
                  className="group flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left bg-white relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="bg-blue-50 group-hover:bg-blue-500 p-3 rounded-xl transition-colors relative z-10">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-bold text-slate-800">{action.name}</h4>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
    </div>
  );
}
