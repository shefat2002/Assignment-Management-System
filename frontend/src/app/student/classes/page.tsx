'use client';

import { useEffect, useState } from 'react';
import { Library, BookOpen } from 'lucide-react';
import api from '@/lib/axios';

export default function StudentClasses() {
  const [classes, setClasses] = useState<Array<{ name: string; subject: string; teacher: string; }>>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/student/assignments');
        const assignments = response.data;
        
        // Derive unique classes from assignments
        const uniqueClasses = new Map<string, { name: string; subject: string; teacher: string; }>();
        assignments.forEach((a: any) => {
          if (a.className && !uniqueClasses.has(a.className + a.subjectName)) {
            uniqueClasses.set(a.className + a.subjectName, {
              name: a.className,
              subject: a.subjectName,
              teacher: a.teacherName
            });
          }
        });
        
        setClasses(Array.from(uniqueClasses.values()));
      } catch (error) {
        console.error('Failed to fetch assignments to derive classes', error);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">My Classes & Subjects</h1>
        <p className="text-slate-600 mt-1">Overview of your enrolled subjects for the current year.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{cls.name}</h2>
                <p className="text-sm font-semibold text-orange-600">{cls.subject}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
              Teacher: <span className="font-semibold text-slate-700">{cls.teacher}</span>
            </div>
          </div>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
            No classes found. Classes will appear here once an assignment is posted for them.
          </div>
        )}
      </div>
    </div>
  );
}
