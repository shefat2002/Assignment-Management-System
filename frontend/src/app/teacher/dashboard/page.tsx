'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileText, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ assignments: 0, students: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [assignmentsRes, studentsRes] = await Promise.all([
          api.get('/teacher/assignments'),
          api.get('/teacher/students')
        ]);
        setStats({
          assignments: assignmentsRes.data.length,
          students: studentsRes.data.length
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800">Welcome back, Educator!</h1>
      <p className="text-slate-600">Here's a quick overview of your classes and coursework.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Assignments</p>
            <p className="text-2xl font-bold text-slate-800">{stats.assignments}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Enrolled Students</p>
            <p className="text-2xl font-bold text-slate-800">{stats.students}</p>
          </div>
        </div>
      </div>
    </div>
  );
}