'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Library, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';

export default function TeacherClasses() {
  const router = useRouter();
  const [classes, setClasses] = useState<Array<{ name: string; assignmentCount: number }>>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/teacher/assignments');
        const assignments = response.data;
        const classMap = new Map<string, number>();
        assignments.forEach((a: any) => {
          if (a.className) {
            classMap.set(a.className, (classMap.get(a.className) || 0) + 1);
          }
        });
        setClasses(Array.from(classMap.entries()).map(([name, count]) => ({ name, assignmentCount: count })));
      } catch (error) {
        console.error('Failed to fetch assignments to derive classes', error);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">My Classes</h1>
        <p className="text-slate-600 mt-1">Select a class to view its roster and assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/teacher/classes/${encodeURIComponent(cls.name)}`)}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <Library size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{cls.name}</h2>
            </div>
            <p className="text-slate-500 text-sm">{cls.assignmentCount} Assignments</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-purple-600 font-semibold text-sm">
              View Class Details <ArrowRight size={16} />
            </div>
          </div>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
            No classes found. You must create an assignment to see a class here.
          </div>
        )}
      </div>
    </div>
  );
}
