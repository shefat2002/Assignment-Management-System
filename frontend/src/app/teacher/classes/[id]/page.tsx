'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Users, FileText, CheckCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

export default function TeacherClassDetails() {
  const router = useRouter();
  const params = useParams();
  const className = params.id ? decodeURIComponent(params.id as string) : '';
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!className) return;
    
    const fetchData = async () => {
      try {
        const [assignmentsRes, studentsRes] = await Promise.all([
          api.get('/teacher/assignments'),
          api.get('/teacher/students')
        ]);
        
        // Filter assignments for this class
        setAssignments(assignmentsRes.data.filter((a: any) => a.className === className));
        // Note: The students endpoint returns all enrolled students for the teacher, we'd ideally filter by class here if we had class ID.
        // Since we don't, we show all students enrolled with this teacher as a placeholder roster.
        setStudents(studentsRes.data);
      } catch (error) {
        console.error('Failed to fetch class details', error);
      }
    };
    fetchData();
  }, [className]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">{className}</h1>
          <p className="text-slate-600 mt-1">Class overview, roster, and assignments</p>
        </div>
        <button onClick={() => router.push('/teacher/assignments')} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-purple-200">
          + Create Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 font-bold text-slate-700">
            <Users size={18} className="text-purple-500" /> Class Roster
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {students.map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                  {student.firstName[0]}{student.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{student.firstName} {student.lastName}</p>
                  <p className="text-xs text-slate-500">{student.email}</p>
                </div>
              </div>
            ))}
            {students.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No students enrolled</p>}
          </div>
        </div>

        {/* Assignments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-700 text-lg mb-2">
            <FileText size={20} className="text-purple-500" /> Class Assignments
          </div>
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-bold text-slate-800">{assignment.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{assignment.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${assignment.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {assignment.status}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle size={14} className="text-purple-400" /> {assignment.maxMarks} Marks
                  </span>
                </div>
              </div>
              <button onClick={() => router.push(`/teacher/submissions?assignment=${assignment.id}`)} className="text-purple-600 bg-purple-50 hover:bg-purple-100 p-3 rounded-xl transition-colors whitespace-nowrap text-sm font-semibold flex items-center gap-2">
                <Eye size={16} /> View Submissions
              </button>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
              <p className="text-slate-500">No assignments for this class yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
