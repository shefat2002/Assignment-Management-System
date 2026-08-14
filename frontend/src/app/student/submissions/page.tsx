'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ArrowLeft, FileCheck, Clock, CheckCircle, AlertCircle, Edit, Eye, UploadCloud, X } from 'lucide-react';
import api from '@/lib/axios';

export default function SubmissionsHistory() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Array<{
    id: number;
    assignmentId: number;
    assignmentTitle: string;
    subjectName: string;
    deadline: string;
    maxMarks: number;
    content: string;
    submittedAt: string;
    marksAwarded: number | null;
    feedback: string | null;
    status: string;
    allowResubmission: boolean;
    attachments: Array<{ originalFileName: string; filePath: string }>;
  }>>([]);

  const [selectedSubmission, setSelectedSubmission] = useState<typeof submissions[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editFiles, setEditFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/student/submissions');
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('content', editContent);
    if (editFiles) {
      Array.from(editFiles).forEach((file) => formData.append('files', file));
    }

    try {
      await api.post(
        `/student/assignments/${selectedSubmission.assignmentId}/submit`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      alert('Assignment resubmitted successfully!');
      setIsEditing(false);
      setSelectedSubmission(null);
      setEditContent('');
      setEditFiles(null);
      fetchSubmissions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error resubmitting assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (submission: typeof submissions[0]) => {
    setSelectedSubmission(submission);
    setEditContent(submission.content);
    setIsEditing(true);
  };

  const viewSubmission = (submission: typeof submissions[0]) => {
    setSelectedSubmission(submission);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Graded': return 'bg-green-100 text-green-700';
      case 'Submitted': return 'bg-blue-100 text-blue-700';
      case 'LateSubmission': return 'bg-yellow-100 text-yellow-700';
      case 'Resubmitted': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'LateSubmission': return 'Late';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-gradient-to-r from-orange-500 to-yellow-400 shadow-md p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="hover:text-orange-100 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-bold flex items-center gap-2">Submission History</div>
        </div>
        <button onClick={() => { Cookies.remove('token'); Cookies.remove('role'); router.push('/'); }} className="hover:text-orange-100 transition-colors">
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">My Submissions</h1>
        <p className="text-slate-600 mb-6">Track your assignment status and grades</p>

        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <FileCheck size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No submissions yet</p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow border-l-4 border-l-orange-400">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{sub.assignmentTitle}</h3>
                    <p className="text-sm text-slate-500 mb-2">{sub.subjectName}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={14} /> Due: {new Date(sub.deadline).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <FileCheck size={14} /> Max: {sub.maxMarks}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(sub.status)}`}>
                      {getStatusLabel(sub.status)}
                    </span>
                    {sub.marksAwarded !== null && (
                      <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="font-bold text-green-700">{sub.marksAwarded}/{sub.maxMarks}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    Submitted: {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString()}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => viewSubmission(sub)} className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors text-slate-700">
                      <Eye size={16} /> View
                    </button>
                    {sub.allowResubmission && sub.status !== 'Graded' && (
                      <button onClick={() => openEditModal(sub)} className="flex items-center gap-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors text-white">
                        <Edit size={16} /> Resubmit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* View Modal */}
      {selectedSubmission && !isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 flex justify-between items-center text-white sticky top-0">
              <div>
                <h2 className="text-xl font-bold">{selectedSubmission.assignmentTitle}</h2>
                <p className="text-orange-100 text-sm">{selectedSubmission.subjectName}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(selectedSubmission.status)}`}>
                  {getStatusLabel(selectedSubmission.status)}
                </span>
                {selectedSubmission.marksAwarded !== null && (
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="font-bold text-green-700 text-lg">{selectedSubmission.marksAwarded}/{selectedSubmission.maxMarks}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Your Answer</h4>
                <div className="bg-slate-50 rounded-xl p-4 text-slate-700 border border-slate-100">
                  {selectedSubmission.content || <span className="text-slate-400 italic">No text content provided</span>}
                </div>
              </div>

              {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubmission.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <UploadCloud size={16} />
                        {att.originalFileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubmission.feedback && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Teacher Feedback</h4>
                  <div className="bg-green-50 rounded-xl p-4 text-green-800 border border-green-100">
                    {selectedSubmission.feedback}
                  </div>
                </div>
              )}

              {selectedSubmission.allowResubmission && selectedSubmission.status !== 'Graded' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Resubmit Assignment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit/Resubmit Modal */}
      {isEditing && selectedSubmission && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit /> Resubmit Assignment
              </h2>
              <button onClick={() => { setIsEditing(false); setSelectedSubmission(null); }} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleResubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Assignment</label>
                <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium">{selectedSubmission.assignmentTitle}</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Updated Answer</label>
                <textarea
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                  rows={4}
                  placeholder="Update your answer or notes..."
                ></textarea>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setEditFiles(e.target.files)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Add or replace documents (Max 100MB)
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">Resubmitting will reset your grade and previous feedback.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Resubmission'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
