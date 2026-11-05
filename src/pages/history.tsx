import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { api } from '@/lib/api';
import type { Subject, AttendanceRecord } from '@/lib/api';
import {
  BookOpenIcon,
  FlaskConicalIcon,
  HistoryIcon,
  TrashIcon,
  CheckIcon,
  CloseIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function HistoryPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [noSemester, setNoSemester] = useState(false);
  const [semesterId, setSemesterId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const initSubjectId = searchParams.get('subjectId');

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'lecture' | 'lab'>('lecture');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const active = await api.semesters.getActive();
      if (!active) {
        setNoSemester(true);
        setLoading(false);
        return;
      }
      setSemesterId(active.id);
      setSubjects(active.subjects || []);
      
      const allRecords = await api.attendance.getBySemester(active.id);
      setRecords(allRecords);

      if (active.subjects && active.subjects.length > 0) {
        const targetId = initSubjectId && active.subjects.find(s => s.id === initSubjectId) 
          ? initSubjectId 
          : active.subjects[0].id;
        
        setSelectedSubjectId(targetId);
        const targetSubj = active.subjects.find(s => s.id === targetId);
        setSelectedType(targetSubj?.hasLecture ? 'lecture' : 'lab');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await api.attendance.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch {
      // ignore
    }
  }

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  const filteredRecords = useMemo(() => {
    if (!selectedSubjectId) return [];
    return records
      .filter(r => r.subjectId === selectedSubjectId && r.type === selectedType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, selectedSubjectId, selectedType]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-9 w-56 rounded shimmer" />
        </div>
        <div className="h-12 rounded-xl shimmer" />
        <div className="h-64 rounded-xl shimmer" />
      </div>
    );
  }

  if (noSemester) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto py-12">
        <span className="eyebrow mb-2">No Active Semester</span>
        <h1 className="font-serif text-2xl font-normal text-text-primary mb-2">
          History Unavailable
        </h1>
        <p className="text-sm text-text-secondary">
          Create or select an active semester first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="eyebrow">Workspace / History</span>
        <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
          Attendance log verification
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Inspect individual logged sessions, cross-check class dates, and remove mistaken entries.
        </p>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedSubjectId(s.id);
              setSelectedType(s.hasLecture ? 'lecture' : 'lab');
            }}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-lg text-xs font-medium transition-colors border",
              selectedSubjectId === s.id 
                ? "bg-forest-800 dark:bg-cta-bg text-text-on-dark border-transparent font-semibold shadow-xs" 
                : "bg-card text-text-secondary border-border-subtle hover:bg-panel hover:text-text-primary"
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Subject Ledger Container */}
      {selectedSubject && (
        <div className="ledger-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 pb-4 border-b border-border-subtle">
            <div>
              <span className="eyebrow text-[10px]">Active Subject Log</span>
              <h2 className="font-serif text-xl font-normal text-text-primary mt-0.5">
                {selectedSubject.name}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                <span>Conducted: <strong className="text-text-primary font-medium">{filteredRecords.length}</strong></span>
                <span>•</span>
                <span>Attended: <strong className="text-ok font-medium">{filteredRecords.filter(r => r.status === 'attended').length}</strong></span>
                <span>•</span>
                <span>Skipped: <strong className="text-risk font-medium">{filteredRecords.filter(r => r.status === 'skipped').length}</strong></span>
              </div>
            </div>
            
            {/* Type Toggle */}
            <div className="flex items-center p-1 rounded-lg bg-chip border border-border-subtle self-start sm:self-auto text-xs">
              <button
                onClick={() => setSelectedType('lecture')}
                disabled={!selectedSubject.hasLecture}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase transition-colors",
                  selectedType === 'lecture'
                    ? "bg-forest-800 dark:bg-cta-bg text-text-on-dark shadow-xs"
                    : !selectedSubject.hasLecture 
                      ? "opacity-30 cursor-not-allowed text-text-muted"
                      : "text-text-muted hover:text-text-primary"
                )}
              >
                <BookOpenIcon className="h-3 w-3" /> Lectures
              </button>
              <button
                onClick={() => setSelectedType('lab')}
                disabled={!selectedSubject.hasLab}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase transition-colors",
                  selectedType === 'lab'
                    ? "bg-forest-800 dark:bg-cta-bg text-text-on-dark shadow-xs"
                    : !selectedSubject.hasLab 
                      ? "opacity-30 cursor-not-allowed text-text-muted"
                      : "text-text-muted hover:text-text-primary"
                )}
              >
                <FlaskConicalIcon className="h-3 w-3" /> Labs
              </button>
            </div>
          </div>

          {/* Records Table */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-border-subtle border-dashed bg-panel/20">
              <HistoryIcon className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
              <p className="font-serif text-base font-normal text-text-primary">No records logged</p>
              <p className="text-xs text-text-muted mt-0.5">
                No attendance sessions recorded for {selectedType}s yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-border-subtle text-[11px] font-semibold tracking-[0.18em] text-text-muted uppercase">
                    <th className="py-3 pr-4 font-semibold">Date Logged</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 pl-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredRecords.map(record => {
                    const isAttended = record.status === 'attended';
                    return (
                      <tr key={record.id} className="hover:bg-panel/40 transition-colors">
                        <td className="py-3.5 pr-4 font-medium text-text-primary">
                          {format(new Date(record.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase",
                            isAttended 
                              ? "bg-ok-bg text-ok" 
                              : "bg-risk-bg text-risk"
                          )}>
                            {isAttended ? <CheckIcon className="h-3 w-3" /> : <CloseIcon className="h-3 w-3" />}
                            {isAttended ? 'Present' : 'Bunked'}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 rounded-md text-text-muted hover:bg-risk-bg hover:text-risk transition-colors"
                            title="Delete Record"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
