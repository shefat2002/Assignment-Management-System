'use client';

import { useEffect, useState } from 'react';
import { FileCheck, BookOpen, Clock } from 'lucide-react';
import api from '@/lib/axios';

export default function StudentDashboard() {
  const [stats, setStats] = useState({ pending: 0, completed: 0, classes: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [assignmentsRes, submissionsRes] = await Promise.all([
          api.get('/student/assignments'),
          api.get('/student/submissions')
        ]);
        
        const assignments = assignmentsRes.data;
        const submissions = submissionsRes.data;
        
        const classSet = new Set(assignments.map((a: any) => a.className));
        
        const submittedAssignmentIds = new Set(submissions.map((s: any) => s.assignmentId));
        const pendingCount = assignments.filter((a: any) => !submittedAssignmentIds.has(a.id)).length;
        
        setStats({
          pending: pendingCount,
          completed: submissions.length,
          classes: classSet.size
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800">Welcome to your Workspace</h1>
      <p className="text-slate-600">Here's your academic progress at a glance.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 border-l-4 border-l-orange-400">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Assignments</p>
            <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 border-l-4 border-l-green-400">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
            <FileCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 border-l-4 border-l-blue-400">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Classes</p>
            <p className="text-2xl font-bold text-slate-800">{stats.classes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
