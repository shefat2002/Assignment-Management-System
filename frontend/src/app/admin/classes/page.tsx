'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ArrowLeft, Library, Plus, Edit, Trash2, Eye, Users, X, UserMinus } from 'lucide-react';
import api from '@/lib/axios';

interface Class {
  id: number;
  name: string;
  grade: number;
  section: string;
  academicYear: string;
  students?: Array<{ id: number; firstName: string; lastName: string }>;
}

export default function AdminClasses() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    grade: 1,
    section: 'A',
    academicYear: new Date().getFullYear().toString()
  });

  const fetchClasses = async () => {
    try {
      const response = await api.get('/admin/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/classes', formData);
      setIsCreateModal(false);
      setFormData({ name: '', grade: 1, section: 'A', academicYear: new Date().getFullYear().toString() });
      fetchClasses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating class');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    try {
      await api.put(`/admin/classes/${selectedClass.id}`, formData);
      setIsEditModal(false);
      setSelectedClass(null);
      fetchClasses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating class');
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    try {
      await api.delete(`/admin/classes/${selectedClass.id}`);
      setIsDeleteConfirm(false);
      setSelectedClass(null);
      fetchClasses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting class');
    }
  };

  const openEdit = (cls: Class) => {
    setSelectedClass(cls);
    setFormData({ name: cls.name, grade: cls.grade, section: cls.section, academicYear: cls.academicYear });
    setIsEditModal(true);
  };

  const openDelete = (cls: Class) => {
    setSelectedClass(cls);
    setIsDeleteConfirm(true);
  };

  const viewClass = async (cls: Class) => {
    try {
      const response = await api.get(`/admin/classes/${cls.id}`);
      setSelectedClass({ ...cls, ...response.data });
    } catch (error) {
      console.error('Failed to fetch class details', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-slate-800 shadow-md p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="hover:text-slate-300 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-bold flex items-center gap-2"><Library /> Classes Management</div>
        </div>
        <button onClick={() => { Cookies.remove('token'); Cookies.remove('role'); router.push('/'); }} className="hover:text-slate-300 transition-colors">
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">All Classes</h1>
            <p className="text-slate-600">Manage class sections</p>
          </div>
          <button onClick={() => setIsCreateModal(true)} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2">
            <Plus size={18} /> Add Class
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{cls.name}</h3>
                    <p className="text-sm text-slate-500">Grade {cls.grade} - {cls.section}</p>
                  </div>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                    {cls.academicYear}
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button onClick={() => viewClass(cls)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="View Details">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => openEdit(cls)} className="p-2 hover:bg-purple-50 rounded-lg text-purple-600" title="Edit">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => openDelete(cls)} className="p-2 hover:bg-red-50 rounded-lg text-red-600" title="Delete">
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
              <h2 className="text-xl font-bold">Create Class</h2>
              <button onClick={() => setIsCreateModal(false)} className="hover:bg-slate-700 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Class Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" placeholder="e.g., Class 10-A" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Grade</label>
                  <input type="number" min="1" max="12" required value={formData.grade} onChange={e => setFormData({...formData, grade: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Section</label>
                  <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    {['A','B','C','D','E','F'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Year</label>
                  <input type="text" required value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="2024" />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors">
                Create Class
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModal && selectedClass && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Edit Class</h2>
              <button onClick={() => { setIsEditModal(false); setSelectedClass(null); }} className="hover:bg-slate-700 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Class Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Grade</label>
                  <input type="number" min="1" max="12" required value={formData.grade} onChange={e => setFormData({...formData, grade: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Section</label>
                  <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    {['A','B','C','D','E','F'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Year</label>
                  <input type="text" required value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors">
                Update Class
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteConfirm && selectedClass && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Class?</h2>
              <p className="text-slate-600 mb-6">Are you sure you want to delete <strong>{selectedClass.name}</strong>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => { setIsDeleteConfirm(false); setSelectedClass(null); }} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-colors">
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
      {selectedClass && !isCreateModal && !isEditModal && !isDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white sticky top-0">
              <div>
                <h2 className="text-xl font-bold">{selectedClass.name}</h2>
                <p className="text-slate-300 text-sm">Class Details</p>
              </div>
              <button onClick={() => setSelectedClass(null)} className="hover:bg-slate-700 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-500">Grade</p>
                  <p className="text-xl font-bold text-slate-800">{selectedClass.grade}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-500">Section</p>
                  <p className="text-xl font-bold text-slate-800">{selectedClass.section}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-500">Year</p>
                  <p className="text-xl font-bold text-slate-800">{selectedClass.academicYear}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <p className="text-sm text-orange-600">Students</p>
                  <p className="text-xl font-bold text-orange-700">{selectedClass.students?.length || 0}</p>
                </div>
              </div>

              {selectedClass.students && selectedClass.students.length > 0 ? (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users size={20} /> Enrolled Students
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedClass.students.map((student) => (
                      <div key={student.id} className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-slate-500">ID: #{student.id}</p>
                        </div>
                        <button className="p-2 hover:bg-red-100 rounded-lg text-red-600" title="Remove Student">
                          <UserMinus size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <Users size={48} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500">No students enrolled</p>
                </div>
              )}

              <button onClick={() => { setSelectedClass(null); openEdit(selectedClass); }} className="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors">
                Edit Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
