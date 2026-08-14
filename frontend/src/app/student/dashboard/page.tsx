"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  GraduationCap,
  Calendar,
  FileCheck,
  LogOut,
  UploadCloud,
  X,
  History,
} from "lucide-react";
import api from "@/lib/axios";

export default function StudentDashboard() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);

  // Modal State
  const [activeAssignmentId, setActiveAssignmentId] = useState<number | null>(
    null,
  );
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get("/student/assignments");
        setAssignments(response.data);
      } catch (error) {
        console.error("Failed to fetch assignments", error);
      }
    };
    fetchAssignments();
  }, [activeAssignmentId]); // Refresh when modal closes

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    router.push("/");
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentId) return;
    setIsSubmitting(true);

    // Prepare Multipart Form Data
    const formData = new FormData();
    formData.append("content", content);
    if (files) {
      Array.from(files).forEach((file) => formData.append("files", file));
    }

    try {
      await api.post(
        `/student/assignments/${activeAssignmentId}/submit`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      alert("Assignment submitted successfully!");
      setActiveAssignmentId(null);
      setContent("");
      setFiles(null);
    } catch (error: any) {
      alert(error.response?.data?.message || "Error submitting assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-gradient-to-r from-orange-500 to-yellow-400 shadow-md p-4 flex justify-between items-center text-white">
        <div className="text-xl font-bold flex items-center gap-2">
          <GraduationCap /> Student Portal
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/student/submissions')}
            className="flex items-center gap-2 hover:text-orange-100 transition-colors px-3 py-1 hover:bg-white/10 rounded-lg"
          >
            <History size={20} /> My Submissions
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:text-orange-100 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <h1 className="text-3xl font-extrabold mb-8 text-slate-800">
          Pending Coursework
        </h1>

        <div className="space-y-4">
          {assignments.map((assignment: any) => (
            <div
              key={assignment.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-orange-300 transition-colors border-l-4 border-l-orange-400"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-800">
                    {assignment.title}
                  </h2>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {assignment.subjectName}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-3">
                  {assignment.description}
                </p>
                <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={16} className="text-orange-500" /> Due:{" "}
                    {new Date(assignment.deadline).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCheck size={16} className="text-green-500" /> Max
                    Marks: {assignment.maxMarks}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveAssignmentId(assignment.id)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm whitespace-nowrap"
              >
                Submit Work
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* File Upload Modal */}
      {activeAssignmentId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UploadCloud /> Upload Submission
              </h2>
              <button
                onClick={() => setActiveAssignmentId(null)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Answer Context / Remarks
                </label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                  rows={4}
                  placeholder="Type your answer or notes for the teacher here..."
                ></textarea>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Attach documents, PDFs, or images (Max 100MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl mt-4 transition-colors"
              >
                {isSubmitting ? "Uploading..." : "Confirm Submission"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
