import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { api } from '@/lib/api';
import type { Subject, AttendanceRecord } from '@/lib/api';
import { BookOpen, FlaskConical, History as HistoryIcon, Trash2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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
    if (!confirm('Are you sure you want to delete this record?')) return;
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
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="h-12 rounded-xl shimmer" />
        <div className="h-64 rounded-xl shimmer" />
      </div>
    );
  }

  if (noSemester) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-lg font-medium mb-2">No active semester</p>
        <p className="text-sm text-muted-foreground">
          Create a semester first to view history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground">
          Review your attendance logs and cross-check records
        </p>
      </div>

      {/* Subject Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedSubjectId(s.id);
              setSelectedType(s.hasLecture ? 'lecture' : 'lab');
            }}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all",
              selectedSubjectId === s.id 
                ? "bg-primary text-primary-foreground shadow-lg glow-primary" 
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      {selectedSubject && (
        <div className="glass rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-lg font-bold">{selectedSubject.name} Log</h2>
              <div className="flex items-center gap-3 mt-1.5 text-sm">
                <span className="text-muted-foreground">
                  Conducted: <strong className="text-foreground">{filteredRecords.length}</strong>
                </span>
                <span className="text-muted-foreground/30">•</span>
                <span className="text-muted-foreground">
                  Attended: <strong className="text-foreground">{filteredRecords.filter(r => r.status === 'attended').length}</strong>
                </span>
              </div>
            </div>
            
            {/* Type Toggle */}
            <div className="flex bg-background/50 rounded-lg p-1 border border-border">
              <button
                onClick={() => setSelectedType('lecture')}
                disabled={!selectedSubject.hasLecture}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  selectedType === 'lecture'
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : !selectedSubject.hasLecture 
                      ? "opacity-30 cursor-not-allowed text-muted-foreground"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BookOpen className="h-4 w-4" /> Lectures
              </button>
              <button
                onClick={() => setSelectedType('lab')}
                disabled={!selectedSubject.hasLab}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  selectedType === 'lab'
                    ? "bg-chart-4 text-primary-foreground shadow-sm glow-primary" // Using chart-4 for lab color distinction
                    : !selectedSubject.hasLab 
                      ? "opacity-30 cursor-not-allowed text-muted-foreground"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FlaskConical className="h-4 w-4" /> Labs
              </button>
            </div>
          </div>

          {/* Records Table */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 border border-border border-dashed rounded-2xl bg-background/30">
              <HistoryIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No records logged for {selectedType}s yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background/20">
                  {filteredRecords.map(record => {
                    const isAttended = record.status === 'attended';
                    return (
                      <tr key={record.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          {format(new Date(record.date + 'T00:00:00'), 'MMM d, yyyy (EEEE)')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                            isAttended 
                              ? "bg-success/10 text-success border border-success/20" 
                              : "bg-danger/10 text-danger border border-danger/20"
                          )}>
                            {isAttended ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {isAttended ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-muted-foreground hover:text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
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
