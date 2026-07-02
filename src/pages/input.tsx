import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isFuture,
} from 'date-fns';
import {
  CalendarDays,
  Check,
  X,
  BookOpen,
  FlaskConical,
  Trash2,
  Send,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Subject, AttendanceRecord } from '@/lib/api';
import { cn } from '@/lib/utils';

type EntryStatus = 'attended' | 'skipped' | null;

type EntryRow = {
  subjectId: string;
  subjectName: string;
  type: 'lecture' | 'lab';
  status: EntryStatus;
};

export default function InputPage() {
  const [searchParams] = useSearchParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesterId, setSemesterId] = useState<string | null>(null);
  const [date, setDate] = useState(searchParams.get('date') || format(new Date(), 'yyyy-MM-dd'));
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [dayRecords, setDayRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noSemester, setNoSemester] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [showLogged, setShowLogged] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(date + 'T00:00:00'));

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calendarMonth]);

  useEffect(() => {
    loadActiveSemester();
  }, []);

  useEffect(() => {
    if (semesterId) {
      loadDayRecords();
    }
  }, [semesterId, date]);

  // We filter out subjects that already have an entry for the selected date
  function buildEntries(subjectList: Subject[], currentRecords: AttendanceRecord[]) {
    const rows: EntryRow[] = [];
    const loggedKeys = new Set(currentRecords.map(r => `${r.subjectId}-${r.type}`));

    for (const s of subjectList) {
      if (s.hasLecture && !loggedKeys.has(`${s.id}-lecture`)) {
        rows.push({ subjectId: s.id, subjectName: s.name, type: 'lecture', status: null });
      }
      if (s.hasLab && !loggedKeys.has(`${s.id}-lab`)) {
        rows.push({ subjectId: s.id, subjectName: s.name, type: 'lab', status: null });
      }
    }
    return rows;
  }

  async function loadActiveSemester() {
    try {
      const active = await api.semesters.getActive();
      if (!active) {
        setNoSemester(true);
        setLoading(false);
        return;
      }
      setSemesterId(active.id);
      setSubjects(active.subjects || []);
      // Entries will be built by loadDayRecords
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function loadDayRecords() {
    if (!semesterId) return;
    try {
      const records = await api.attendance.getByDate(semesterId, date);
      setDayRecords(records);
      
      // Update entries to only show subjects not yet logged today
      setEntries((prev) => {
        // We preserve any 'status' the user has already tapped for items that remain unlogged
        const newEntries = buildEntries(subjects, records);
        return newEntries.map(ne => {
          const existing = prev.find(p => p.subjectId === ne.subjectId && p.type === ne.type);
          return existing ? { ...ne, status: existing.status } : ne;
        });
      });
    } catch {
      // ignore
    }
  }

  function setEntryStatus(subjectId: string, type: 'lecture' | 'lab', status: EntryStatus) {
    setEntries((prev) =>
      prev.map((e) =>
        e.subjectId === subjectId && e.type === type
          ? { ...e, status: e.status === status ? null : status }
          : e
      )
    );
  }

  function markSectionAttended(type: 'lecture' | 'lab') {
    setEntries((prev) =>
      prev.map((e) => (e.type === type ? { ...e, status: 'attended' } : e))
    );
  }

  function markSectionSkipped(type: 'lecture' | 'lab') {
    setEntries((prev) =>
      prev.map((e) => (e.type === type ? { ...e, status: 'skipped' } : e))
    );
  }

  function resetSection(type: 'lecture' | 'lab') {
    setEntries((prev) =>
      prev.map((e) => (e.type === type ? { ...e, status: null } : e))
    );
  }

  function resetAll() {
    setEntries((prev) => prev.map((e) => ({ ...e, status: null })));
  }

  const lectureEntries = entries.filter((e) => e.type === 'lecture');
  const labEntries = entries.filter((e) => e.type === 'lab');
  const markedEntries = entries.filter((e) => e.status !== null);

  async function handleSubmit() {
    if (!semesterId || markedEntries.length === 0) return;
    setSaving(true);
    setJustSaved(false);
    try {
      await api.attendance.createBulk(
        markedEntries.map((e) => ({
          subjectId: e.subjectId,
          semesterId: semesterId!,
          type: e.type,
          status: e.status!,
          date,
        }))
      );
      // Re-load to hide submitted and move to 'logged' section
      await loadDayRecords();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRecord(id: string) {
    try {
      await api.attendance.delete(id);
      await loadDayRecords(); // will add it back to the input list
    } catch {
      // ignore
    }
  }

  function getSubjectName(subjectId: string) {
    return subjects.find((s) => s.id === subjectId)?.name || 'Unknown';
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="h-12 rounded-xl shimmer" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (noSemester) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-lg font-medium mb-2">No active semester</p>
        <p className="text-sm text-muted-foreground">
          Create a semester first to start logging attendance.
        </p>
      </div>
    );
  }

  function renderSection(
    type: 'lecture' | 'lab',
    sectionEntries: EntryRow[],
    icon: React.ReactNode,
    accentClass: string,
    bgClass: string
  ) {
    if (sectionEntries.length === 0) return null;

    const markedCount = sectionEntries.filter((e) => e.status !== null).length;

    return (
      <div className="space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', bgClass)}>
              {icon}
            </div>
            <div>
              <h2 className="text-sm font-semibold">
                {type === 'lecture' ? 'Lectures' : 'Labs'}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {markedCount}/{sectionEntries.length} marked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => markSectionAttended(type)}
              className="flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-[10px] font-medium text-success hover:bg-success/20 transition-colors"
            >
              <Check className="h-2.5 w-2.5" />
              All
            </button>
            <button
              onClick={() => markSectionSkipped(type)}
              className="flex items-center gap-1 rounded-md bg-danger/10 px-2 py-1 text-[10px] font-medium text-danger hover:bg-danger/20 transition-colors"
            >
              <X className="h-2.5 w-2.5" />
              All
            </button>
            <button
              onClick={() => resetSection(type)}
              className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-secondary/80 transition-colors"
            >
              <Minus className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="glass rounded-xl overflow-hidden divide-y divide-border">
          {sectionEntries.map((entry) => (
            <div
              key={`${entry.subjectId}-${entry.type}`}
              className={cn(
                'flex items-center gap-4 px-4 py-3.5 transition-colors',
                entry.status === 'attended' && 'bg-success/[0.04]',
                entry.status === 'skipped' && 'bg-danger/[0.04]'
              )}
            >
              {/* Subject Name — prominent */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {entry.subjectName}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setEntryStatus(entry.subjectId, entry.type, 'attended')}
                  className={cn(
                    'flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium transition-all',
                    entry.status === 'attended'
                      ? 'bg-success text-success-foreground shadow-sm shadow-success/25'
                      : 'bg-secondary text-muted-foreground hover:bg-success/15 hover:text-success'
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Present</span>
                </button>
                <button
                  onClick={() => setEntryStatus(entry.subjectId, entry.type, 'skipped')}
                  className={cn(
                    'flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium transition-all',
                    entry.status === 'skipped'
                      ? 'bg-danger text-danger-foreground shadow-sm shadow-danger/25'
                      : 'bg-secondary text-muted-foreground hover:bg-danger/15 hover:text-danger'
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Bunked</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log Attendance</h1>
        <p className="text-muted-foreground">Mark all your subjects for the day</p>
      </div>

      {/* Date Picker */}
      <div className="glass rounded-xl p-3 flex items-center justify-between">
        <button 
          onClick={() => setDate(format(subDays(new Date(date + 'T00:00:00'), 1), 'yyyy-MM-dd'))}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="relative flex-1 flex justify-center">
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex flex-col items-center cursor-pointer group px-4 py-1 rounded-lg hover:bg-secondary/30 transition-colors"
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5 group-hover:text-foreground transition-colors">
              {date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(new Date(date + 'T00:00:00'), 'EEEE')}
            </span>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold group-hover:text-primary transition-colors">
                {format(new Date(date + 'T00:00:00'), 'MMMM d, yyyy')}
              </span>
            </div>
          </button>

          {showCalendar && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowCalendar(false)}
              />
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 glass rounded-xl p-4 w-[280px] shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                    className="flex h-7 w-7 items-center justify-center rounded hover:bg-secondary transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <span className="font-semibold text-sm">
                    {format(calendarMonth, 'MMMM yyyy')}
                  </span>
                  <button 
                    onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                    className="flex h-7 w-7 items-center justify-center rounded hover:bg-secondary transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 mb-2">
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                    <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">{d}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const inMonth = isSameMonth(day, calendarMonth);
                    const today = isToday(day);
                    const future = isFuture(day) && !today;
                    const isSelected = date === dateStr;

                    return (
                      <button
                        key={dateStr}
                        disabled={future}
                        onClick={() => {
                          setDate(dateStr);
                          setShowCalendar(false);
                          setCalendarMonth(day);
                        }}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md text-xs transition-colors",
                          !inMonth && "opacity-30",
                          future && "opacity-20 cursor-not-allowed",
                          isSelected && "bg-primary text-primary-foreground font-bold shadow-sm",
                          !isSelected && !future && "hover:bg-secondary",
                          today && !isSelected && "ring-1 ring-primary/30 text-primary font-bold"
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <button 
          onClick={() => setDate(format(addDays(new Date(date + 'T00:00:00'), 1), 'yyyy-MM-dd'))}
          disabled={date === format(new Date(), 'yyyy-MM-dd')}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
            date === format(new Date(), 'yyyy-MM-dd') 
              ? "opacity-30 cursor-not-allowed bg-transparent text-muted-foreground" 
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Information Banner */}
      <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
        Only mark subjects that had classes. Unmarked items are treated as "No Class" when you submit.
      </div>

      {/* Lectures Section */}
      {renderSection(
        'lecture',
        lectureEntries,
        <BookOpen className="h-4 w-4 text-primary" />,
        'text-primary',
        'bg-primary/10'
      )}

      {/* Labs Section */}
      {renderSection(
        'lab',
        labEntries,
        <FlaskConical className="h-4 w-4 text-chart-4" />,
        'text-chart-4',
        'bg-chart-4/10'
      )}

      {/* Submit Button */}
      {entries.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={saving || markedEntries.length === 0}
          className={cn(
            'w-full rounded-xl py-3.5 text-sm font-semibold transition-all flex items-center justify-center gap-2',
            justSaved
              ? 'bg-success text-success-foreground'
              : 'bg-primary text-primary-foreground hover:opacity-90 glow-primary',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          {justSaved ? (
            <>
              <Check className="h-4 w-4" />
              Saved Successfully!
            </>
          ) : saving ? (
            'Saving…'
          ) : (
            <>
              <Send className="h-4 w-4" />
              Log {markedEntries.length} {markedEntries.length === 1 ? 'Entry' : 'Entries'}
            </>
          )}
        </button>
      )}

      {entries.length === 0 && !loading && dayRecords.length > 0 && (
        <div className="glass rounded-xl p-8 text-center text-success glow-success">
          <Check className="h-10 w-10 mx-auto mb-3" />
          <p className="font-semibold text-lg">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">You've logged all available subjects for this date.</p>
        </div>
      )}

      {/* Already logged for this date */}
      {dayRecords.length > 0 && (
        <div className="glass rounded-xl overflow-hidden mt-8">
          <button
            onClick={() => setShowLogged(!showLogged)}
            className="flex w-full items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <Check className="h-4 w-4 text-foreground" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-semibold">Already Logged</h2>
                <p className="text-xs text-muted-foreground">
                  {dayRecords.length} entries for {format(new Date(date + 'T00:00:00'), 'MMM d')}
                </p>
              </div>
            </div>
            {showLogged ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showLogged && (
            <div className="divide-y divide-border border-t border-border">
              {dayRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md',
                      record.status === 'attended' ? 'bg-success/15' : 'bg-danger/15'
                    )}
                  >
                    {record.status === 'attended' ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-danger" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getSubjectName(record.subjectId)}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      {record.type === 'lecture' ? (
                        <BookOpen className="h-2.5 w-2.5" />
                      ) : (
                        <FlaskConical className="h-2.5 w-2.5" />
                      )}
                      {record.type === 'lecture' ? 'Lecture' : 'Lab'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-danger/15 hover:text-danger transition-colors"
                    title="Delete to re-log"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
