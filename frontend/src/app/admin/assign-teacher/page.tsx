'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AssignTeacherPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    teacherId: '',
    classId: '',
    subjectId: '',
    section: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersRes, classesRes, subjectsRes] = await Promise.all([
        api.get('/admin/users', { params: { role: 'Teacher', pageSize: 1000 } }),
        api.get('/admin/classes'),
        api.get('/admin/subjects')
      ]);
      setTeachers(teachersRes.data.users || []);
      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSubmitting(true);
    
    try {
      await api.post('/admin/assign-teacher', {
        teacherId: parseInt(formData.teacherId),
        classId: parseInt(formData.classId),
        subjectId: parseInt(formData.subjectId),
        section: formData.section
      });
      setMessage({ type: 'success', text: 'Teacher assigned successfully!' });
      setFormData({ teacherId: '', classId: '', subjectId: '', section: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error assigning teacher.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClass = classes.find(c => c.id === parseInt(formData.classId));
  const numberOfSections = selectedClass?.numberOfSections || 1;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
          <UserPlus className="text-indigo-500" size={32} />
          Assign Teacher
        </h1>
        <p className="text-slate-600 mt-2">Assign a teacher to a specific class, subject, and section.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Class</label>
              <select 
                required 
                value={formData.classId} 
                onChange={e => setFormData({...formData, classId: e.target.value, section: '', subjectId: ''})}
                className="w-full px-4 py-3 bg-slate-100 text-slate-900 font-medium border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="" disabled>-- Select a Class --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.year})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Subject</label>
              <select 
                required 
                disabled={!formData.classId}
                value={formData.subjectId} 
                onChange={e => setFormData({...formData, subjectId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-100 text-slate-900 font-medium border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>-- Select a Subject --</option>
                {subjects.filter(s => s.classId === parseInt(formData.classId)).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Section</label>
              <select 
                required 
                disabled={!formData.classId}
                value={formData.section} 
                onChange={e => setFormData({...formData, section: e.target.value})}
                className="w-full px-4 py-3 bg-slate-100 text-slate-900 font-medium border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>-- Select a Section --</option>
                {Array.from({length: numberOfSections}, (_, i) => String.fromCharCode(65 + i)).map(char => (
                  <option key={char} value={char}>Section {char}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Teacher</label>
              <select 
                required 
                value={formData.teacherId} 
                onChange={e => setFormData({...formData, teacherId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-100 text-slate-900 font-medium border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="" disabled>-- Select a Teacher --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.email})</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Assigning...' : 'Assign Teacher'}
          </button>
        </form>
      </div>
    </div>
  );
}
