import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
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
  isSameDay,
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
  Minus,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Subject, AttendanceRecord } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
  );
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesterId, setSemesterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (semesterId) loadRecords();
  }, [semesterId]);

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

  // Group records by date
  const recordsByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    for (const r of records) {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    }
    return map;
  }, [records]);

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

  // Selected date records
  const selectedRecords = selectedDate ? recordsByDate[selectedDate] || [] : [];
  const selectedAttended = selectedRecords.filter((r) => r.status === 'attended');
  const selectedSkipped = selectedRecords.filter((r) => r.status === 'skipped');

  function getSubjectName(subjectId: string) {
    return subjects.find((s) => s.id === subjectId)?.name || 'Unknown';
  }

  function handleDateClick(date: Date) {
    if (isFuture(date) && !isToday(date)) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setSearchParams({ date: dateStr });
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
        <p className="text-muted-foreground">Your attendance history at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Calendar Grid */}
        <div className="glass rounded-xl p-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(day)}
                  disabled={future}
                  className={cn(
                    'relative flex flex-col items-center rounded-lg py-2 px-1 text-xs transition-all min-h-[52px]',
                    !inMonth && 'opacity-30',
                    future && 'cursor-not-allowed opacity-20',
                    isSelected
                      ? 'bg-primary/15 ring-1 ring-primary/40'
                      : 'hover:bg-secondary',
                    today && !isSelected && 'ring-1 ring-primary/20'
                  )}
                >
                  <span
                    className={cn(
                      'font-medium mb-1',
                      today && 'text-primary font-bold',
                      isSelected && 'text-primary'
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
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" /> No entry
            </span>
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    {format(new Date(selectedDate + 'T00:00:00'), 'EEEE')}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedDate + 'T00:00:00'), 'MMMM d, yyyy')}
                </p>

                {selectedRecords.length === 0 ? (
                  <p className="text-xs text-muted-foreground mt-4 text-center py-4">
                    No entries for this day
                  </p>
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
                  </div>
                )}
              </div>

              {/* Attended list */}
              {selectedAttended.length > 0 && (
                <div className="glass rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-success flex items-center gap-1.5">
                      <Check className="h-3 w-3" />
                      Attended ({selectedAttended.length})
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {selectedAttended.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                        {r.type === 'lecture' ? (
                          <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : (
                          <FlaskConical className="h-3.5 w-3.5 text-chart-4 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {getSubjectName(r.subjectId)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {r.type === 'lecture' ? 'Lecture' : 'Lab'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skipped list */}
              {selectedSkipped.length > 0 && (
                <div className="glass rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-danger flex items-center gap-1.5">
                      <X className="h-3 w-3" />
                      Skipped ({selectedSkipped.length})
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {selectedSkipped.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                        {r.type === 'lecture' ? (
                          <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : (
                          <FlaskConical className="h-3.5 w-3.5 text-chart-4 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {getSubjectName(r.subjectId)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {r.type === 'lecture' ? 'Lecture' : 'Lab'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects with no entry (no class that day) */}
              {(() => {
                const loggedKeys = new Set(
                  selectedRecords.map((r) => `${r.subjectId}-${r.type}`)
                );
                const noEntry: { name: string; type: string }[] = [];
                for (const s of subjects) {
                  if (s.hasLecture && !loggedKeys.has(`${s.id}-lecture`))
                    noEntry.push({ name: s.name, type: 'Lecture' });
                  if (s.hasLab && !loggedKeys.has(`${s.id}-lab`))
                    noEntry.push({ name: s.name, type: 'Lab' });
                }
                if (noEntry.length === 0 || selectedRecords.length === 0) return null;

                return (
                  <div className="glass rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Minus className="h-3 w-3" />
                        No Class ({noEntry.length})
                      </p>
                    </div>
                    <div className="divide-y divide-border">
                      {noEntry.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2 opacity-50">
                          {item.type === 'Lecture' ? (
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <FlaskConical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate text-muted-foreground">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{item.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a date to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
