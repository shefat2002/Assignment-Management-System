'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Users, CheckCircle, LogOut, X, Edit2, Trash2, Eye } from 'lucide-react';
import api from '@/lib/axios';

export default function TeacherDashboard() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Array<{
    id: number;
    title: string;
    description: string;
    status: string;
    maxMarks: number;
    deadline?: string;
    allowResubmission?: boolean;
  }>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', dueDate: '', totalMarks: 100, classId: 1, subjectId: 1, allowResubmission: false, status: 'Active'
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
      if (isEditMode && editingId) {
        await api.put(`/teacher/assignments/${editingId}`, {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          totalMarks: formData.totalMarks,
          allowResubmission: formData.allowResubmission,
          status: formData.status
        });
      } else {
        await api.post('/teacher/assignments', formData);
      }
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      fetchAssignments();
      setFormData({ title: '', description: '', dueDate: '', totalMarks: 100, classId: 1, subjectId: 1, allowResubmission: false, status: 'Active' });
    } catch (error) {
      console.error('Failed to create/update assignment', error);
      alert(isEditMode ? 'Error updating assignment.' : 'Error creating assignment. Ensure you are assigned to this Class and Subject.');
    }
  };

  const handleEditAssignment = (assignment: typeof assignments[0]) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.deadline ? new Date(assignment.deadline).toISOString().slice(0, 16) : '',
      totalMarks: assignment.maxMarks,
      classId: 1,
      subjectId: 1,
      allowResubmission: assignment.allowResubmission || false,
      status: assignment.status
    });
    setEditingId(assignment.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/teacher/assignments/${id}`);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to delete assignment', error);
      alert('Error deleting assignment.');
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
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/teacher/submissions/${assignment.id}`)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600" title="View Submissions">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => handleEditAssignment(assignment)} className="p-2 hover:bg-purple-50 rounded-lg transition-colors text-purple-600" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteAssignment(assignment.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create/Edit Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">{isEditMode ? 'Edit Assignment' : 'Create New Assignment'}</h2>
              <button onClick={() => {
                setIsModalOpen(false);
                setIsEditMode(false);
                setEditingId(null);
              }} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={24} /></button>
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
              {!isEditMode && (
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
              )}
              {isEditMode && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="allowResubmission" checked={formData.allowResubmission} onChange={e => setFormData({...formData, allowResubmission: e.target.checked})} className="w-4 h-4 text-purple-600 rounded" />
                <label htmlFor="allowResubmission" className="text-sm font-medium text-slate-700">Allow Resubmission</label>
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl mt-4 transition-colors">
                {isEditMode ? 'Update Assignment' : 'Publish Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}