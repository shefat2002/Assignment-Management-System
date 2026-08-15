'use client';

import { useEffect, useState } from 'react';
import { BookOpen, User } from 'lucide-react';
import api from '@/lib/axios';

export default function StudentCourses() {
  const [className, setClassName] = useState<string>('');
  const [courses, setCourses] = useState<Array<{ name: string; teacher: string; }>>([]);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await api.get('/student/assignments');
        const assignments = response.data;
        
        if (assignments.length > 0) {
          const primaryClass = assignments.find((a: any) => a.className)?.className || 'Unknown Class';
          setClassName(primaryClass);

          const uniqueCourses = new Map<string, { name: string; teacher: string; }>();
          assignments.forEach((a: any) => {
            if (a.subjectName && !uniqueCourses.has(a.subjectName)) {
              uniqueCourses.set(a.subjectName, {
                name: a.subjectName,
                teacher: a.teacherName || 'Unknown Teacher'
              });
            }
          });
          
          setCourses(Array.from(uniqueCourses.values()));
        }
      } catch (error) {
        console.error('Failed to fetch assignments to derive courses', error);
      }
    };
    fetchClassDetails();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-3xl p-8 text-white shadow-md">
        <p className="text-orange-100 font-semibold mb-1 uppercase tracking-wider text-sm">Enrolled Class</p>
        <h1 className="text-4xl font-extrabold">{className || 'Loading Class...'}</h1>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{course.name}</h3>
                </div>
              </div>
              <div className="mt-2 pt-4 border-t border-slate-100 text-sm text-slate-500 flex items-center gap-2">
                <User size={16} className="text-orange-400" />
                Teacher: <span className="font-semibold text-slate-700">{course.teacher}</span>
              </div>
            </div>
          ))}
          {courses.length === 0 && className && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
              No courses found. Courses will appear here once an assignment is posted for them.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
