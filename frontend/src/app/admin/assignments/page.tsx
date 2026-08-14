'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { FileText, Eye, Edit, Trash2 } from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  deadline: string;
  maxMarks: number;
  status: string;
  teacherName: string;
  className: string;
  subjectName: string;
}

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/admin/assignments');
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto text-slate-800 font-sans">
      <main>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Assignments</h1>
            <p className="text-slate-600">View all assignments</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Class & Subject</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Teacher</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Deadline</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {assignment.title}
                      <div className="text-xs text-slate-500 font-normal mt-1">Max Marks: {assignment.maxMarks}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{assignment.className}</div>
                      <div className="text-xs text-slate-500">{assignment.subjectName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{assignment.teacherName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(assignment.deadline).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        {assignment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      <FileText size={48} className="mx-auto text-slate-300 mb-2" />
                      No assignments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
