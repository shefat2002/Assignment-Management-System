'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Users, CheckCircle, LogOut, X } from 'lucide-react';
import api from '@/lib/axios';

export default function TeacherDashboard() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Array<{
    id: number;
    title: string;
    description: string;
    status: string;
    maxMarks: number;
  }>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', dueDate: '', totalMarks: 100, classId: 1, subjectId: 1, allowResubmission: false
  });

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/teacher/assignments');
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    }
  };

  // eslint-disable-next-line -- data fetch on mount is acceptable
  useEffect(() => { fetchAssignments(); }, []);

  const handleLogout = () => {
    Cookies.remove('token'); Cookies.remove('role'); router.push('/');
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teacher/assignments', formData);
      setIsModalOpen(false);
      fetchAssignments(); // Refresh the list
      setFormData({ title: '', description: '', dueDate: '', totalMarks: 100, classId: 1, subjectId: 1, allowResubmission: false });
    } catch (error) {
      console.error('Failed to create assignment', error);
      alert('Error creating assignment. Ensure you are assigned to this Class and Subject.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-md p-4 flex justify-between items-center text-white">
        <div className="text-xl font-bold flex items-center gap-2"><Users /> Educator Portal</div>
        <button onClick={handleLogout} className="flex items-center gap-2 hover:text-purple-100 transition-colors"><LogOut size={20} /> Logout</button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">My Assignments</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-xl font-semibold transition-all shadow-md shadow-purple-200">
            + New Assignment
          </button>
        </div>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow border-t-4 border-t-purple-500">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold">{assignment.title}</h2>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{assignment.status}</span>
              </div>
              <p className="text-slate-600 text-sm mb-6 flex-grow">{assignment.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-500 flex items-center gap-1"><CheckCircle size={16} className="text-purple-500" /> {assignment.maxMarks} Marks</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Create New Assignment</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none" placeholder="e.g., Chapter 5 Essay" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                  <input type="datetime-local" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Max Marks</label>
                  <input type="number" required min="1" value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Class ID</label>
                  <input type="number" required value={formData.classId} onChange={e => setFormData({...formData, classId: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subject ID</label>
                  <input type="number" required value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Publish Assignment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}