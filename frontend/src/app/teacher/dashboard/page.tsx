'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FileText, Users, CheckCircle, LogOut } from 'lucide-react';
import api from '@/lib/axios';

export default function TeacherDashboard() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get('/teacher/assignments');
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
      <nav className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-md p-4 flex justify-between items-center text-white">
        <div className="text-xl font-bold flex items-center gap-2">
          <Users /> Educator Portal
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 hover:text-purple-100 transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">My Assignments</h1>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold transition-colors shadow-sm">
            + New Assignment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.length === 0 ? (
            <p className="text-slate-500 col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center">
              You haven't created any assignments yet.
            </p>
          ) : (
            assignments.map((assignment: any) => (
              <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow border-t-4 border-t-purple-500">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-bold">{assignment.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${assignment.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {assignment.status}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-6 flex-grow">{assignment.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-500 flex items-center gap-1">
                    <CheckCircle size={16} className="text-purple-500" /> {assignment.maxMarks} Marks
                  </span>
                  <button className="text-purple-600 hover:text-purple-800 text-sm font-bold">
                    View Submissions &rarr;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}