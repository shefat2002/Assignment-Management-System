'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ArrowLeft, BookOpen, Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import api from '@/lib/axios';

interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  credits: number;
}

export default function AdminSubjects() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3
  });

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/admin/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/subjects', formData);
      setIsCreateModal(false);
      setFormData({ name: '', code: '', description: '', credits: 3 });
      fetchSubjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating subject');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    try {
      await api.put(`/admin/subjects/${selectedSubject.id}`, formData);
      setIsEditModal(false);
      setSelectedSubject(null);
      fetchSubjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating subject');
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;
    try {
      await api.delete(`/admin/subjects/${selectedSubject.id}`);
      setIsDeleteConfirm(false);
      setSelectedSubject(null);
      fetchSubjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting subject');
    }
  };

  const openEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({ name: subject.name, code: subject.code, description: subject.description || '', credits: subject.credits });
    setIsEditModal(true);
  };

  const openDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteConfirm(true);
  };

  const viewSubject = (subject: Subject) => setSelectedSubject(subject);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-slate-800 shadow-md p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="hover:text-slate-300 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-bold flex items-center gap-2"><BookOpen /> Subjects Management</div>
        </div>
        <button onClick={() => { Cookies.remove('token'); Cookies.remove('role'); router.push('/'); }} className="hover:text-slate-300 transition-colors">
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">All Subjects</h1>
            <p className="text-slate-600">Manage course subjects</p>
          </div>
          <button onClick={() => setIsCreateModal(true)} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2">
            <Plus size={18} /> Add Subject
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div key={subject.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-slate-800">{subject.name}</h3>
                    <p className="text-sm text-slate-500 font-mono">{subject.code}</p>
                  </div>
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold">
                    {subject.credits} Credits
                  </span>
                </div>
                {subject.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{subject.description}</p>
                )}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button onClick={() => viewSubject(subject)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="View Details">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => openEdit(subject)} className="p-2 hover:bg-purple-50 rounded-lg text-purple-600" title="Edit">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => openDelete(subject)} className="p-2 hover:bg-red-50 rounded-lg text-red-600" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {isCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Create Subject</h2>
              <button onClick={() => setIsCreateModal(false)} className="hover:bg-slate-700 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subject Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" placeholder="e.g., Mathematics" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Code</label>
                  <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" placeholder="e.g., MATH101" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" rows={3} placeholder="Brief description of the subject"></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Credits</label>
                <input type="number" min="1" max="10" required value={formData.credits} onChange={e => setFormData({...formData, credits: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors">
                Create Subject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModal && selectedSubject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Edit Subject</h2>
              <button onClick={() => { setIsEditModal(false); setSelectedSubject(null); }} className="hover:bg-slate-700 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subject Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Code</label>
                  <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Credits</label>
                <input type="number" min="1" max="10" required value={formData.credits} onChange={e => setFormData({...formData, credits: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors">
                Update Subject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteConfirm && selectedSubject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Subject?</h2>
              <p className="text-slate-600 mb-6">Are you sure you want to delete <strong>{selectedSubject.name}</strong>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => { setIsDeleteConfirm(false); setSelectedSubject(null); }} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold text-white transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedSubject && !isCreateModal && !isEditModal && !isDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Subject Details</h2>
              <button onClick={() => setSelectedSubject(null)} className="hover:bg-slate-700 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center text-2xl font-bold text-pink-700">
                  {selectedSubject.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedSubject.name}</h3>
                  <p className="text-sm text-slate-500 font-mono">{selectedSubject.code}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Subject ID</span>
                  <span className="font-semibold text-slate-800">#{selectedSubject.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Credits</span>
                  <span className="font-semibold text-slate-800">{selectedSubject.credits}</span>
                </div>
                {selectedSubject.description && (
                  <div className="py-2">
                    <p className="text-slate-500 mb-1">Description</p>
                    <p className="text-slate-700">{selectedSubject.description}</p>
                  </div>
                )}
              </div>
              <button onClick={() => { setSelectedSubject(null); openEdit(selectedSubject); }} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors">
                Edit Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
