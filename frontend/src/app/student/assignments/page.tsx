'use client';

import { useEffect, useState } from 'react';
import { FileCheck, Clock, CheckCircle, UploadCloud, X, Edit, Eye, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function StudentAssignments() {
  const [filter, setFilter] = useState<'pending' | 'submitted'>('pending');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [submitContent, setSubmitContent] = useState('');
  const [submitFiles, setSubmitFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        api.get('/student/assignments'),
        api.get('/student/submissions')
      ]);
      setAssignments(assignmentsRes.data);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const getPendingAssignments = () => {
    const submittedIds = new Set(submissions.map(s => s.assignmentId));
    return assignments.filter(a => !submittedIds.has(a.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('content', submitContent);
    if (submitFiles) {
      Array.from(submitFiles).forEach(file => formData.append('files', file));
    }

    try {
      await api.post(`/student/assignments/${selectedItem.assignmentId || selectedItem.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Assignment submitted successfully!');
      setIsSubmitModalOpen(false);
      setSubmitContent('');
      setSubmitFiles(null);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error submitting assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSubmitModal = (item: any, isResubmit = false) => {
    setSelectedItem(item);
    setSubmitContent(isResubmit ? item.content : '');
    setIsSubmitModalOpen(true);
  };

  const openViewModal = (item: any) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const displayedPending = getPendingAssignments();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My Assignments</h1>
          <p className="text-slate-600 mt-1">Manage and track your coursework</p>
        </div>
        
        {/* Toggle Filter */}
        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${filter === 'pending' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pending ({displayedPending.length})
          </button>
          <button 
            onClick={() => setFilter('submitted')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${filter === 'submitted' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Submitted ({submissions.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filter === 'pending' && displayedPending.map(assignment => (
          <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-orange-400 hover:shadow-md transition-shadow">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{assignment.title}</h2>
              <p className="text-sm text-slate-500 mb-2">{assignment.className} • {assignment.subjectName}</p>
              <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                <span className="flex items-center gap-1"><Clock size={16} /> Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><FileCheck size={16} /> Max Marks: {assignment.maxMarks}</span>
              </div>
            </div>
            <button 
              onClick={() => openSubmitModal(assignment)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors flex-shrink-0"
            >
              Submit Work
            </button>
          </div>
        ))}

        {filter === 'pending' && displayedPending.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <CheckCircle size={48} className="mx-auto text-green-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
            <p className="text-slate-500">You have no pending assignments right now.</p>
          </div>
        )}

        {filter === 'submitted' && submissions.map(sub => (
          <div key={sub.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-green-400 hover:shadow-md transition-shadow">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{sub.assignmentTitle}</h2>
              <p className="text-sm text-slate-500 mb-2">{sub.subjectName}</p>
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sub.status === 'Graded' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {sub.status}
                </span>
                {sub.marksAwarded !== null && (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle size={16} /> {sub.marksAwarded} / {sub.maxMarks} Marks
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => openViewModal(sub)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <Eye size={16} /> View
              </button>
              {sub.allowResubmission && sub.status !== 'Graded' && (
                <button 
                  onClick={() => openSubmitModal(sub, true)}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  <Edit size={16} /> Resubmit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit/Resubmit Modal */}
      {isSubmitModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Submit Assignment</h2>
              <button onClick={() => { setIsSubmitModalOpen(false); setSelectedItem(null); }} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-700">{selectedItem.title || selectedItem.assignmentTitle}</p>
                {selectedItem.description && <p className="text-sm text-slate-500 mt-1">{selectedItem.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Your Answer</label>
                <textarea required value={submitContent} onChange={e => setSubmitContent(e.target.value)} className="w-full px-4 py-3 bg-slate-100 border border-slate-300 text-slate-900 font-medium rounded-xl outline-none focus:ring-2 focus:ring-orange-400" rows={4} placeholder="Type your answer or notes here..."></textarea>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <input type="file" multiple onChange={(e) => setSubmitFiles(e.target.files)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-100 file:text-orange-700 cursor-pointer" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Submission Modal */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 flex justify-between items-center text-white sticky top-0">
              <h2 className="text-xl font-bold">{selectedItem.assignmentTitle}</h2>
              <button onClick={() => { setIsViewModalOpen(false); setSelectedItem(null); }} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${selectedItem.status === 'Graded' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {selectedItem.status}
                </span>
                {selectedItem.marksAwarded !== null && (
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="font-bold text-green-700 text-lg">{selectedItem.marksAwarded}/{selectedItem.maxMarks}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Your Answer</h4>
                <div className="bg-slate-50 rounded-xl p-4 text-slate-700 border border-slate-100 whitespace-pre-wrap">
                  {selectedItem.content || <span className="text-slate-400 italic">No content</span>}
                </div>
              </div>

              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.attachments.map((att: any, idx: number) => (
                      <a key={idx} href={att.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        <UploadCloud size={16} /> {att.originalFileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.feedback && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Teacher Feedback</h4>
                  <div className="bg-green-50 rounded-xl p-4 text-green-800 border border-green-100">
                    {selectedItem.feedback}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
