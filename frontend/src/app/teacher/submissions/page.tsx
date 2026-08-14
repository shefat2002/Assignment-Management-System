'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { ArrowLeft, CheckCircle, Clock, FileText, Download, User, Calendar } from 'lucide-react';
import api from '@/lib/axios';

export default function AssignmentSubmissions() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [submissions, setSubmissions] = useState<Array<{
    id: number;
    content: string;
    submittedAt: string;
    marksAwarded: number | null;
    feedback: string | null;
    status: string;
    studentName: string;
    attachments: Array<{ originalFileName: string; filePath: string }>;
    assignmentMaxMarks?: number;
  }>>([]);

  const [selectedSubmission, setSelectedSubmission] = useState<typeof submissions[0] | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [gradeData, setGradeData] = useState({
    marksAwarded: 0,
    feedback: '',
    status: 'Graded'
  });

  const fetchSubmissions = async () => {
    try {
      const response = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    }
  };

  useEffect(() => { fetchSubmissions(); }, [assignmentId]);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      await api.post(`/teacher/submissions/${selectedSubmission.id}/grade`, gradeData);
      setIsGrading(false);
      setSelectedSubmission(null);
      setGradeData({ marksAwarded: 0, feedback: '', status: 'Graded' });
      fetchSubmissions();
    } catch (error) {
      console.error('Failed to grade submission', error);
      alert('Error grading submission');
    }
  };

  const openGrading = (submission: typeof submissions[0]) => {
    setSelectedSubmission(submission);
    setGradeData({
      marksAwarded: submission.marksAwarded || 0,
      feedback: submission.feedback || '',
      status: submission.status === 'Graded' ? 'Graded' : 'Submitted'
    });
    setIsGrading(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Graded': return 'bg-green-100 text-green-700';
      case 'Submitted': return 'bg-blue-100 text-blue-700';
      case 'Resubmitted': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-md p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="hover:text-purple-100 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-bold flex items-center gap-2">Submissions</div>
        </div>
        <button onClick={() => { Cookies.remove('token'); Cookies.remove('role'); router.push('/'); }} className="hover:text-purple-100 transition-colors">
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Student Submissions</h1>
          <p className="text-slate-600">Review and grade student work</p>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No submissions yet</p>
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
                        <Calendar size={14} />
                        {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}
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
                    <FileText size={18} className="text-purple-600" />
                    Submission Content
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-4 text-slate-700 border border-slate-100">
                    {submission.content || <span className="text-slate-400 italic">No text content provided</span>}
                  </div>
                </div>

                {submission.attachments && submission.attachments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-700 mb-2">Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {submission.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download size={16} />
                          {att.originalFileName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {submission.feedback && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-700 mb-2">Teacher Feedback</h4>
                    <div className="bg-green-50 rounded-xl p-4 text-green-800 border border-green-100">
                      {submission.feedback}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => openGrading(submission)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-xl font-semibold transition-all shadow-md shadow-purple-200"
                  >
                    {submission.status === 'Graded' ? 'Update Grade' : 'Grade Submission'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Grading Modal */}
      {isGrading && selectedSubmission && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">Grade Submission</h2>
                <p className="text-purple-100 text-sm">{selectedSubmission.studentName}</p>
              </div>
              <button onClick={() => {
                setIsGrading(false);
                setSelectedSubmission(null);
              }} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <ArrowLeft size={24} />
              </button>
            </div>

            <form onSubmit={handleGrade} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Marks Awarded</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={gradeData.marksAwarded}
                  onChange={e => setGradeData({ ...gradeData, marksAwarded: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={gradeData.status}
                  onChange={e => setGradeData({ ...gradeData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Graded">Graded</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Resubmitted">Resubmitted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Feedback</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={e => setGradeData({ ...gradeData, feedback: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                  rows={4}
                  placeholder="Provide feedback to the student..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl mt-4 transition-all shadow-md"
              >
                Submit Grade
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
