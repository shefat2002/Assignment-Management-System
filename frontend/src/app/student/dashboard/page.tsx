'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { GraduationCap, Calendar, FileCheck, LogOut } from 'lucide-react';
import api from '@/lib/axios';

export default function StudentDashboard() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get('/student/assignments');
        setAssignments(response.data);
      } catch (error) {
        console.error('Failed to fetch assignments', error);
      }
    };
    fetchAssignments();
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="bg-gradient-to-r from-orange-500 to-yellow-400 shadow-md p-4 flex justify-between items-center text-white">
        <div className="text-xl font-bold flex items-center gap-2">
          <GraduationCap /> Student Portal
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 hover:text-orange-100 transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <h1 className="text-3xl font-extrabold mb-8 text-slate-800">Pending Coursework</h1>

        <div className="space-y-4">
          {assignments.length === 0 ? (
            <p className="text-slate-500 bg-white p-8 rounded-2xl border border-slate-200 text-center">
              You are all caught up! No pending assignments.
            </p>
          ) : (
            assignments.map((assignment: any) => (
              <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-orange-200 transition-colors">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-slate-800">{assignment.title}</h2>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {assignment.subjectName}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{assignment.description}</p>
                  <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} className="text-orange-500" />
                      Due: {new Date(assignment.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck size={16} className="text-green-500" />
                      Max Marks: {assignment.maxMarks}
                    </span>
                  </div>
                </div>
                
                <button className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm whitespace-nowrap">
                  Submit Work
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}