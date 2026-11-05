import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isFuture,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  BookOpen,
  FlaskConical,
  Calendar as CalendarIcon,
  StickyNote,
  PenLine,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Subject, AttendanceRecord, Note } from '@/lib/api';
import { cn } from '@/lib/utils';
import NoteModal from '@/components/NoteModal';

export default function CalendarPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
  );
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesterId, setSemesterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (semesterId) {
      loadRecords();
      loadNotes();
    }
  }, [semesterId, currentMonth]);

  async function loadData() {
    try {
      const active = await api.semesters.getActive();
      if (!active) {
        setLoading(false);
        return;
      }
      setSemesterId(active.id);
      setSubjects(active.subjects || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function loadRecords() {
    if (!semesterId) return;
    try {
      const data = await api.attendance.getBySemester(semesterId);
      setRecords(data);
    } catch {
      // ignore
    }
  }

  async function loadNotes() {
    try {
      const start = format(startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const end = format(endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const data = await api.notes.getByRange(start, end);
      setNotes(data);
    } catch {
      // ignore
    }
  }

  const recordsByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    for (const r of records) {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    }
    return map;
  }, [records]);

  const notesByDate = useMemo(() => {
    const map: Record<string, Note> = {};
    for (const n of notes) {
      const start = n.date;
      const end = n.endDate || n.date;
      let cur = new Date(start + 'T00:00:00');
      const endObj = new Date(end + 'T00:00:00');
      while (cur <= endObj) {
        map[format(cur, 'yyyy-MM-dd')] = n;
        cur = addDays(cur, 1);
      }
    }
    return map;
  }, [notes]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const selectedRecords = useMemo(() => {
    if (!selectedDate) return [];
    const list = recordsByDate[selectedDate] || [];
    return [...list].sort(
      (a, b) =>
        (a.orderIndex ?? 0) - (b.orderIndex ?? 0) ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [recordsByDate, selectedDate]);

  const selectedAttended = selectedRecords.filter((r) => r.status === 'attended');
  const selectedSkipped = selectedRecords.filter((r) => r.status === 'skipped');

  function getRecordLabel(record: AttendanceRecord): string | null {
    const sameRecords = selectedRecords.filter(r =>
      r.subjectId === record.subjectId && r.type === record.type
    );

    if (sameRecords.length <= 1) return null;

    const index = sameRecords.findIndex(r => r.id === record.id);
    return record.type === 'lecture' ? `L${index + 1}` : `Lab ${index + 1}`;
  }

  function getSubjectName(subjectId: string) {
    return subjects.find((s) => s.id === subjectId)?.name || 'Unknown';
  }

  function handleDateClick(date: Date) {
    if (isFuture(date) && !isToday(date)) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setSearchParams({ date: dateStr });
  }

  const selectedNote = selectedDate ? notesByDate[selectedDate] : null;

  async function handleNoteSave(content: string, startDate?: string, endDate?: string) {
    if (!selectedDate) return;
    try {
      const sDate = startDate || selectedDate;
      const eDate = endDate || sDate;
      await api.notes.upsert(sDate, content, {
        startDate: sDate,
        endDate: eDate,
        noteId: selectedNote?.id,
      });
      await loadNotes();
    } catch {
      // ignore
    }
  }

  async function handleNoteDelete() {
    if (!selectedNote) return;
    try {
      if (selectedNote.id) {
        await api.notes.deleteById(selectedNote.id);
      } else {
        await api.notes.delete(selectedNote.date);
      }
      await loadNotes();
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-9 w-56 rounded shimmer" />
        </div>
        <div className="h-96 rounded-xl shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <span className="eyebrow">Workspace / Calendar</span>
        <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
          Attendance timeline
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Review daily attendance patterns, bunk history, and multi-day notes across the semester.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 cols on desktop) */}
        <div className="ledger-card p-6 lg:col-span-8">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-subtle">
            <h2 className="font-serif text-xl font-normal text-text-primary">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-muted hover:bg-panel hover:text-text-primary transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="rounded-lg border border-border-subtle px-3 py-1 text-xs font-medium text-text-secondary hover:bg-panel hover:text-text-primary transition-colors"
              >
                Current
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-muted hover:bg-panel hover:text-text-primary transition-colors"
                title="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold text-text-muted uppercase tracking-wider py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayRecords = recordsByDate[dateStr] || [];
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const future = isFuture(day) && !today;
              const isSelected = selectedDate === dateStr;
              const attended = dayRecords.filter((r) => r.status === 'attended').length;
              const skipped = dayRecords.filter((r) => r.status === 'skipped').length;
              const hasRecords = dayRecords.length > 0;
              const dayNote = notesByDate[dateStr];
              const hasNote = !!dayNote;
              const isMultiDay = Boolean(dayNote && dayNote.endDate && dayNote.endDate > dayNote.date);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(day)}
                  disabled={future}
                  title={dayNote ? `${dayNote.content}` : undefined}
                  className={cn(
                    'relative flex flex-col items-center py-2 px-1 text-xs transition-all min-h-[58px] rounded-lg border',
                    !inMonth && 'opacity-25',
                    future && 'cursor-not-allowed opacity-20',
                    isSelected
                      ? 'border-forest-800 dark:border-accent bg-panel font-semibold shadow-xs'
                      : 'border-transparent hover:bg-panel/60',
                    today && !isSelected && 'border-forest-800/30 text-forest-800 dark:text-accent font-semibold',
                    hasNote && !isSelected && 'bg-warn/10 border-warn/30'
                  )}
                >
                  {hasNote && (
                    <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-warn" />
                  )}

                  <span
                    className={cn(
                      'font-medium mb-1',
                      today && 'text-forest-800 dark:text-accent font-bold',
                      isSelected && 'text-text-primary'
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Attendance dots */}
                  {hasRecords && (
                    <div className="flex items-center gap-1 mt-auto">
                      {attended > 0 && (
                        <span className="flex items-center gap-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                          {attended > 1 && (
                            <span className="text-[8px] text-ok font-semibold">{attended}</span>
                          )}
                        </span>
                      )}
                      {skipped > 0 && (
                        <span className="flex items-center gap-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-risk" />
                          {skipped > 1 && (
                            <span className="text-[8px] text-risk font-semibold">{skipped}</span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border-subtle text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ok" /> Attended
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-risk" /> Skipped
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warn" /> Note / Holiday
            </span>
          </div>
        </div>

        {/* Day Detail Inspection Panel (4 cols on desktop) */}
        <div className="space-y-4 lg:col-span-4">
          {selectedDate ? (
            <>
              <div className="ledger-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="eyebrow text-[10px]">Day Details</span>
                    <h3 className="font-serif text-xl font-normal text-text-primary mt-0.5">
                      {format(new Date(selectedDate + 'T00:00:00'), 'EEEE')}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {format(new Date(selectedDate + 'T00:00:00'), 'MMMM d, yyyy')}
                    </p>
                  </div>

                  {/* Note Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowNoteModal(true); }}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg border transition-all',
                      selectedNote
                        ? 'text-warn bg-warn/15 border-warn/30'
                        : 'text-text-muted border-border-subtle hover:bg-panel hover:text-text-primary'
                    )}
                    title={selectedNote ? 'Edit note' : 'Add note'}
                  >
                    <StickyNote className="h-4 w-4" />
                  </button>
                </div>

                {selectedRecords.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-text-muted mb-4">
                      No records logged for this date.
                    </p>
                    <button
                      onClick={() => navigate(`/input?date=${selectedDate}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-forest-800 dark:bg-cta-bg px-4 py-2 text-xs font-medium text-text-on-dark hover:opacity-95 transition-opacity"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      Log Attendance
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {/* Summary Counters */}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-ok">
                        <Check className="h-3.5 w-3.5" />
                        {selectedAttended.length} attended
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-risk">
                        <X className="h-3.5 w-3.5" />
                        {selectedSkipped.length} skipped
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/input?date=${selectedDate}`)}
                      className="w-full rounded-md border border-border-strong bg-card py-2 text-xs font-medium text-text-primary hover:bg-panel transition-colors"
                    >
                      Edit or Add to this Day
                    </button>
                  </div>
                )}
              </div>

              {/* Note Banner */}
              {selectedNote && (
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="w-full ledger-card border-warn/40 bg-warn/10 p-4 text-left transition-colors hover:bg-warn/15 group"
                >
                  <div className="flex items-start gap-2.5">
                    <StickyNote className="h-4 w-4 text-warn mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary">
                        {selectedNote.endDate && selectedNote.endDate > selectedNote.date
                          ? 'Multi-day Holiday'
                          : 'Day Note'}
                      </p>
                      <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                        {selectedNote.content}
                      </p>
                    </div>
                    <span className="text-[11px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Edit
                    </span>
                  </div>
                </button>
              )}

              {/* Detailed Session List for Day */}
              {selectedRecords.length > 0 && (
                <div className="ledger-card p-4 space-y-2">
                  <span className="eyebrow text-[10px] block mb-2">Sessions Order</span>
                  <div className="space-y-1.5 divide-y divide-border-subtle">
                    {selectedRecords.map((record, index) => {
                      const label = getRecordLabel(record);
                      const isAttended = record.status === 'attended';

                      return (
                        <div
                          key={record.id}
                          className="flex items-center justify-between pt-2 first:pt-0 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-text-muted font-mono text-[10px] w-4">
                              #{index + 1}
                            </span>
                            <div className={cn(
                              'h-5 w-5 rounded flex items-center justify-center shrink-0',
                              isAttended ? 'bg-ok-bg text-ok' : 'bg-risk-bg text-risk'
                            )}>
                              {isAttended ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </div>
                            <span className="font-medium text-text-primary truncate">
                              {getSubjectName(record.subjectId)}
                            </span>
                            {label && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-chip text-text-secondary">
                                {label}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-text-muted capitalize shrink-0 ml-2">
                            {record.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="ledger-card p-6 text-center text-text-muted text-xs">
              Select any date on the calendar to inspect attendance sessions.
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        date={selectedNote?.date || selectedDate || format(new Date(), 'yyyy-MM-dd')}
        initialEndDate={selectedNote?.endDate || selectedDate}
        initialContent={selectedNote?.content || ''}
        noteId={selectedNote?.id}
        onSave={handleNoteSave}
        onDelete={handleNoteDelete}
      />
    </div>
  );
}
