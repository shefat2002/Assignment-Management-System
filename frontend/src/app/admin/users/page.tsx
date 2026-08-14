'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { ArrowLeft, Users, UserPlus, Edit, Trash2, Eye, Filter, X } from 'lucide-react';
import api from '@/lib/axios';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFilter = searchParams.get('role');

  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Student'
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
      if (roleFilter) {
        setFiltered(response.data.filter((u: User) => u.role === roleFilter));
      } else {
        setFiltered(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', formData);
      setIsCreateModal(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'Student' });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}`, formData);
      setIsEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating user');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      setIsDeleteConfirm(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', role: user.role });
    setIsEditModal(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteConfirm(true);
  };

  const viewUser = (user: User) => setSelectedUser(user);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-700';
      case 'Teacher': return 'bg-purple-100 text-purple-700';
      case 'Student': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-slate-800 shadow-md p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="hover:text-slate-300 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-bold flex items-center gap-2"><Users /> Users Management</div>
        </div>
        <button onClick={() => { Cookies.remove('token'); Cookies.remove('role'); router.push('/'); }} className="hover:text-slate-300 transition-colors">
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">All Users</h1>
            <p className="text-slate-600">Manage user accounts</p>
          </div>
          <button onClick={() => setIsCreateModal(true)} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2">
            <UserPlus size={18} /> Add User
          </button>
        </div>

        {roleFilter && (
          <div className="mb-4 flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
            <Filter size={16} className="text-slate-600" />
            <span className="text-slate-600">Filtered by role: <strong>{roleFilter}</strong></span>
            <button onClick={() => router.push('/admin/users')} className="ml-auto text-slate-500 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Created</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{user.firstName} {user.lastName}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => viewUser(user)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => openEdit(user)} className="p-2 hover:bg-purple-50 rounded-lg text-purple-600" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => openDelete(user)} className="p-2 hover:bg-red-50 rounded-lg text-red-600" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {isCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Create User</h2>
              <button onClick={() => setIsCreateModal(false)} className="hover:bg-slate-700 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors">
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button onClick={() => { setIsEditModal(false); setSelectedUser(null); }} className="hover:bg-slate-700 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">New Password (optional)</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-400" placeholder="Leave blank to keep current" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors">
                Update User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Delete User?</h2>
              <p className="text-slate-600 mb-6">Are you sure you want to delete <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => { setIsDeleteConfirm(false); setSelectedUser(null); }} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-colors">
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
      {selectedUser && !isCreateModal && !isEditModal && !isDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="hover:bg-slate-700 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-slate-600">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">User ID</span>
                  <span className="font-semibold text-slate-800">#{selectedUser.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-800">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Created</span>
                  <span className="font-semibold text-slate-800">{new Date(selectedUser.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => { setSelectedUser(null); openEdit(selectedUser); }} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors">
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
