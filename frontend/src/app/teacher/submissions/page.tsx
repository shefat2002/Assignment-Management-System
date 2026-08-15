'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, User, CheckCircle, Clock, X } from 'lucide-react';
import api from '@/lib/axios';

export default function SubmissionsDashboard() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [gradeData, setGradeData] = useState({ marks: 0, feedback: '', status: 'Graded' });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/teacher/assignments');
      setAssignments(response.data);
      if (response.data.length > 0) {
        setSelectedAssignment(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    }
  };

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions(selectedAssignment);
    }
  }, [selectedAssignment]);

  const fetchSubmissions = async (assignmentId: number) => {
    try {
      const response = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    try {
      await api.post(`/teacher/submissions/${selectedSubmission.id}/grade`, gradeData);
      setSelectedSubmission(null);
      if (selectedAssignment) fetchSubmissions(selectedAssignment);
    } catch (error) {
      console.error('Failed to grade', error);
      alert('Error grading submission.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Graded': return 'bg-green-100 text-green-700';
      case 'Submitted': return 'bg-blue-100 text-blue-700';
      case 'LateSubmission': return 'bg-yellow-100 text-yellow-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Student Submissions</h1>
        <p className="text-slate-600">Review and grade student work across your assignments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Assignment Selector */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">Assignments</div>
          <div className="max-h-[600px] overflow-y-auto">
            {assignments.map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAssignment(a.id)}
                className={`w-full text-left p-4 border-b border-slate-100 transition-colors ${selectedAssignment === a.id ? 'bg-purple-50 border-l-4 border-l-purple-500' : 'hover:bg-slate-50'}`}
              >
                <div className="font-semibold text-sm text-slate-800">{a.title}</div>
                <div className="text-xs text-slate-500 mt-1">{a.className} • {a.subjectName}</div>
              </button>
            ))}
            {assignments.length === 0 && <div className="p-4 text-sm text-slate-500">No assignments found</div>}
          </div>
        </div>

        {/* Submissions List */}
        <div className="lg:col-span-3 space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No submissions yet for this assignment</p>
            </div>
          ) : (
            submissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{submission.studentName}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={14} />
                        {new Date(submission.submittedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                    {submission.marksAwarded !== null && (
                      <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="font-bold text-green-700">{submission.marksAwarded} marks</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-purple-600" /> Answer Content
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-4 text-slate-700 border border-slate-100 text-sm whitespace-pre-wrap">
                    {submission.content || <span className="text-slate-400 italic">No text content provided</span>}
                  </div>
                </div>

                {submission.attachments && submission.attachments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-700 mb-2">Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {submission.attachments.map((att: any, idx: number) => (
                        <a key={idx} href={att.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                          {att.originalFileName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setGradeData({ marks: submission.marksAwarded || 0, feedback: submission.feedback || '', status: 'Graded' });
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-xl font-semibold transition-all shadow-md shadow-purple-200 text-sm"
                  >
                    Grade Submission
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grade Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">Grade Submission</h2>
                <p className="text-purple-100 text-sm">{selectedSubmission.studentName}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleGrade} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Marks Awarded</label>
                <input type="number" required min="0" value={gradeData.marks} onChange={e => setGradeData({...gradeData, marks: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 font-medium rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                <select value={gradeData.status} onChange={e => setGradeData({...gradeData, status: e.target.value})} className="w-full px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 font-medium rounded-xl outline-none">
                  <option value="Graded">Graded</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Feedback</label>
                <textarea value={gradeData.feedback} onChange={e => setGradeData({...gradeData, feedback: e.target.value})} className="w-full px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 font-medium rounded-xl outline-none" rows={3}></textarea>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all shadow-md">
                Submit Grade
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
