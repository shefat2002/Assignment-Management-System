'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { CheckSquare } from 'lucide-react';

interface Submission {
  id: number;
  assignmentId: number;
  submittedAt: string;
  status: string;
  marksAwarded: number | null;
  studentName: string;
  assignmentTitle: string;
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/admin/submissions');
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto text-slate-800 font-sans">
      <main>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Submissions</h1>
            <p className="text-slate-600">View all student submissions</p>
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
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Student</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Assignment</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Submitted At</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Marks</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {submission.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {submission.assignmentTitle}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {submission.marksAwarded !== null ? (
                        <span className="text-emerald-600">{submission.marksAwarded}</span>
                      ) : (
                        <span className="text-slate-400">Not Graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        submission.status === 'Graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {submission.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      <CheckSquare size={48} className="mx-auto text-slate-300 mb-2" />
                      No submissions found.
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
