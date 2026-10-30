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

  // Group records by date
  const recordsByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    for (const r of records) {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    }
    return map;
  }, [records]);

  // Map notes across all days in their date range (supporting multi-day spans)
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

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Selected date records sorted by sequence order matching /input
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
      <div className="space-y-6">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="h-96 rounded-xl shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">View your attendance history and timeline</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass rounded-xl p-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
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
                className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
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
              const isNoteStart = isMultiDay && dateStr === dayNote?.date;
              const isNoteEnd = isMultiDay && dateStr === dayNote?.endDate;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(day)}
                  disabled={future}
                  title={dayNote ? `${dayNote.content}${isMultiDay ? ` (${dayNote.date} to ${dayNote.endDate})` : ''}` : undefined}
                  className={cn(
                    'relative flex flex-col items-center py-2 px-1 text-xs transition-all min-h-[52px]',
                    isMultiDay ? (isNoteStart ? 'rounded-l-lg' : isNoteEnd ? 'rounded-r-lg' : 'rounded-none') : 'rounded-lg',
                    !inMonth && 'opacity-30',
                    future && 'cursor-not-allowed opacity-20',
                    isSelected
                      ? 'bg-primary/15 ring-2 ring-primary/60 font-semibold z-10'
                      : 'hover:bg-secondary',
                    today && !isSelected && 'ring-1 ring-primary/30',
                    hasNote && !isSelected && (isMultiDay ? 'bg-amber-500/15 border-y border-amber-500/30' : 'bg-amber-500/10 border border-amber-500/25')
                  )}
                >
                  {hasNote && (
                    <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
                  <span
                    className={cn(
                      'font-medium mb-1',
                      today && 'text-primary font-bold',
                      isSelected && 'text-primary font-bold'
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Attendance dots */}
                  {hasRecords && (
                    <div className="flex items-center gap-0.5 mt-auto">
                      {attended > 0 && (
                        <span className="flex items-center gap-px">
                          <span className="h-1.5 w-1.5 rounded-full bg-success" />
                          {attended > 1 && (
                            <span className="text-[8px] text-success font-bold">{attended}</span>
                          )}
                        </span>
                      )}
                      {skipped > 0 && (
                        <span className="flex items-center gap-px">
                          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                          {skipped > 1 && (
                            <span className="text-[8px] text-danger font-bold">{skipped}</span>
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
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" /> Attended
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger" /> Skipped
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Note / Holiday
            </span>
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">
                      {format(new Date(selectedDate + 'T00:00:00'), 'EEEE')}
                    </h3>
                  </div>
                  {/* Note Icon Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowNoteModal(true); }}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md transition-all relative',
                      selectedNote
                        ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                    title={selectedNote ? 'View/edit note' : 'Add a note'}
                  >
                    <StickyNote className="h-3.5 w-3.5" />
                    {selectedNote && (
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedDate + 'T00:00:00'), 'MMMM d, yyyy')}
                </p>

                {selectedRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <p className="text-xs text-muted-foreground mb-4">
                      No entries for this day
                    </p>
                    <button
                      onClick={() => navigate(`/input?date=${selectedDate}`)}
                      className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Log Attendance
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        {selectedAttended.length} attended
                      </span>
                      <span className="flex items-center gap-1">
                        <X className="h-3 w-3 text-danger" />
                        {selectedSkipped.length} skipped
                      </span>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/input?date=${selectedDate}`)}
                      className="mt-3 w-full rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
                    >
                      Edit Attendance
                    </button>
                  </div>
                )}
              </div>

              {/* Note Banner */}
              {selectedNote && (
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="w-full rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-left transition-colors hover:bg-amber-500/10 group"
                >
                  <div className="flex items-start gap-2.5">
                    <StickyNote className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-semibold text-amber-400/90">
                          {selectedNote.endDate && selectedNote.endDate > selectedNote.date
                            ? 'Holiday / Multi-day Note'
                            : 'Day Note'}
                        </p>
                        {selectedNote.endDate && selectedNote.endDate > selectedNote.date && (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400">
                            {format(new Date(selectedNote.date + 'T00:00:00'), 'MMM d')} – {format(new Date(selectedNote.endDate + 'T00:00:00'), 'MMM d')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                        {selectedNote.content}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                      Edit
                    </span>
                  </div>
                </button>
              )}

              {/* Logged lectures & labs in exact sequence as /input */}
              {selectedRecords.length > 0 && (
                <div className="glass rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Sequence of Lectures ({selectedRecords.length})
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {selectedRecords.map((record, index) => {
                      const label = getRecordLabel(record);
                      return (
                        <div
                          key={record.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          {/* Sequence badge */}
                          <span className="shrink-0 text-[11px] font-bold text-muted-foreground w-5 text-center">
                            #{index + 1}
                          </span>

                          {/* Status icon */}
                          <div
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-md shrink-0',
                              record.status === 'attended' ? 'bg-success/15' : 'bg-danger/15'
                            )}
                          >
                            {record.status === 'attended' ? (
                              <Check className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-danger" />
                            )}
                          </div>

                          {/* Subject and Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {getSubjectName(record.subjectId)}
                              </p>
                              {label && (
                                <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                                  {label}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              {record.type === 'lecture' ? (
                                <BookOpen className="h-2.5 w-2.5" />
                              ) : (
                                <FlaskConical className="h-2.5 w-2.5" />
                              )}
                              {record.type === 'lecture' ? 'Lecture' : 'Lab'}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={cn(
                              'shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md',
                              record.status === 'attended'
                                ? 'bg-success/10 text-success'
                                : 'bg-danger/10 text-danger'
                            )}
                          >
                            {record.status === 'attended' ? 'Attended' : 'Skipped'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a date to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Note Modal — defaults to selectedDate */}
      {selectedDate && (
        <NoteModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          date={selectedNote?.date || selectedDate}
          initialEndDate={selectedNote?.endDate || selectedDate}
          initialContent={selectedNote?.content || ''}
          noteId={selectedNote?.id}
          onSave={handleNoteSave}
          onDelete={handleNoteDelete}
        />
      )}
    </div>
  );
}
