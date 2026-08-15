'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EnrollStudentPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
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
      const [studentsRes, classesRes] = await Promise.all([
        api.get('/admin/users', { params: { role: 'Student', pageSize: 1000 } }),
        api.get('/admin/classes')
      ]);
      setStudents(studentsRes.data.users || []);
      setClasses(classesRes.data || []);
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
      await api.post('/admin/enroll-student', {
        studentId: parseInt(formData.studentId),
        classId: parseInt(formData.classId),
        section: formData.section
      });
      setMessage({ type: 'success', text: 'Student enrolled successfully!' });
      setFormData({ studentId: '', classId: '', section: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error enrolling student.' });
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
          Enroll Student
        </h1>
        <p className="text-slate-600 mt-2">Enroll a student into a specific class and section.</p>
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
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Class</label>
                <select 
                  required 
                  value={formData.classId} 
                  onChange={e => setFormData({...formData, classId: e.target.value, section: ''})}
                  className="w-full px-4 py-3 bg-slate-100 text-slate-900 font-medium border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                >
                  <option value="" disabled>-- Select a Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.year})</option>
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
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Student</label>
              <select 
                required 
                value={formData.studentId} 
                onChange={e => setFormData({...formData, studentId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-100 text-slate-900 font-medium border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="" disabled>-- Select a Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.email})</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
          </button>
        </form>
      </div>
    </div>
  );
}
