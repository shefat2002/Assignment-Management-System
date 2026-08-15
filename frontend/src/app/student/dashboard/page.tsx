'use client';

import { useEffect, useState } from 'react';
import { FileCheck, BookOpen, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/axios';

export default function StudentDashboard() {
  const [stats, setStats] = useState({ pending: 0, completed: 0, classes: 0 });
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [assignmentsRes, submissionsRes] = await Promise.all([
          api.get('/student/assignments'),
          api.get('/student/submissions')
        ]);
        
        const fetchedAssignments = assignmentsRes.data;
        const fetchedSubmissions = submissionsRes.data;
        
        setAssignments(fetchedAssignments);
        setSubmissions(fetchedSubmissions);
        
        const classSet = new Set(fetchedAssignments.map((a: any) => a.className));
        
        const submittedAssignmentIds = new Set(fetchedSubmissions.map((s: any) => s.assignmentId));
        const pendingCount = fetchedAssignments.filter((a: any) => !submittedAssignmentIds.has(a.id)).length;
        
        setStats({
          pending: pendingCount,
          completed: fetchedSubmissions.length,
          classes: classSet.size
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  const submittedAssignmentIds = new Set(submissions.map(s => s.assignmentId));

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map events to days
  const getEventsForDay = (day: number) => {
    return assignments.filter(a => {
      if (!a.deadline) return false;
      const d = new Date(a.deadline);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800">Welcome to your Workspace</h1>
      <p className="text-slate-600">Here's your academic progress at a glance.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 border-l-4 border-l-orange-400">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Assignments</p>
            <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 border-l-4 border-l-green-400">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
            <FileCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 border-l-4 border-l-blue-400">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Classes</p>
            <p className="text-2xl font-bold text-slate-800">{stats.classes}</p>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <CalendarIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Assignment Calendar</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
            <span className="font-semibold text-slate-700 w-32 text-center">{monthName}</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-4">
            {/* Empty slots before the 1st of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] rounded-xl border border-dashed border-slate-200 bg-slate-50 opacity-50"></div>
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
              const dayEvents = getEventsForDay(day);
              
              return (
                <div key={day} className={`min-h-[100px] p-2 rounded-xl border transition-colors ${isToday ? 'border-orange-300 bg-orange-50' : 'border-slate-100 hover:border-slate-300'} flex flex-col`}>
                  <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-orange-600' : 'text-slate-600'}`}>
                    {day}
                  </div>
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                    {dayEvents.map(evt => {
                      const isCompleted = submittedAssignmentIds.has(evt.id);
                      return (
                        <div key={evt.id} className={`text-xs px-2 py-1 rounded-md font-medium truncate ${isCompleted ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`} title={evt.title}>
                          {evt.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-6 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400"></span> Pending
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400"></span> Completed
          </div>
        </div>
      </div>
    </div>
  );
}
