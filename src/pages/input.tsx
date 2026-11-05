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
  isToday,
  isFuture,
} from 'date-fns';
import {
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  BookOpenIcon,
  FlaskConicalIcon,
  TrashIcon,
  SendIcon,
  MinusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  StickyNoteIcon,
  GripVerticalIcon,
} from '@/components/icons';
import { api } from '@/lib/api';
import type { Subject, AttendanceRecord, Note } from '@/lib/api';
import { cn } from '@/lib/utils';
import NoteModal from '@/components/NoteModal';

type EntryStatus = 'attended' | 'skipped' | null;

type EntryRow = {
  subjectId: string;
  subjectName: string;
  type: 'lecture' | 'lab';
  status: EntryStatus;
  instanceId: string;
};

export default function InputPage() {
  const [searchParams] = useSearchParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesterId, setSemesterId] = useState<string | null>(null);
  const [date, setDate] = useState(searchParams.get('date') || format(new Date(), 'yyyy-MM-dd'));
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [dayRecords, setDayRecords] = useState<AttendanceRecord[]>([]);
  const [markedOrder, setMarkedOrder] = useState<string[]>([]);
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noSemester, setNoSemester] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [showLogged, setShowLogged] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(date + 'T00:00:00'));
  const [note, setNote] = useState<Note | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Drag and drop state for already logged records
  const [draggedRecordIndex, setDraggedRecordIndex] = useState<number | null>(null);
  const [dragOverRecordIndex, setDragOverRecordIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [dragAllowedId, setDragAllowedId] = useState<string | null>(null);

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

  useEffect(() => {
    loadNote();
  }, [date]);

  async function loadNote() {
    try {
      const n = await api.notes.getByDate(date);
      setNote(n);
    } catch {
      setNote(null);
    }
  }

  async function handleNoteSave(content: string, startDate?: string, endDate?: string) {
    try {
      const sDate = startDate || date;
      const eDate = endDate || sDate;
      const saved = await api.notes.upsert(sDate, content, {
        startDate: sDate,
        endDate: eDate,
        noteId: note?.id,
      });
      setNote(saved);
    } catch {
      // ignore
    }
  }

  async function handleNoteDelete() {
    if (!note) return;
    try {
      if (note.id) {
        await api.notes.deleteById(note.id);
      } else {
        await api.notes.delete(date);
      }
      setNote(null);
    } catch {
      // ignore
    }
  }

  function buildEntries(subjectList: Subject[], currentRecords: AttendanceRecord[]) {
    const rows: EntryRow[] = [];
    const loggedKeys = new Set(currentRecords.map(r => `${r.subjectId}-${r.type}`));

    for (const s of subjectList) {
      if (s.hasLecture && !loggedKeys.has(`${s.id}-lecture`)) {
        rows.push({ subjectId: s.id, subjectName: s.name, type: 'lecture', status: null, instanceId: crypto.randomUUID() });
      }
      if (s.hasLab && !loggedKeys.has(`${s.id}-lab`)) {
        rows.push({ subjectId: s.id, subjectName: s.name, type: 'lab', status: null, instanceId: crypto.randomUUID() });
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
      const allRecords = await api.attendance.getBySemester(active.id);
      setLoggedDates(new Set(allRecords.map(r => r.date)));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function loadDayRecords(preserveUnmarked = false) {
    if (!semesterId) return;
    try {
      const records = await api.attendance.getByDate(semesterId, date);
      setDayRecords(records);

      setEntries((prev) => {
        if (preserveUnmarked) {
          const loggedKeys = new Set(records.map(r => `${r.subjectId}-${r.type}`));
          const remaining = prev.filter(p => p.status === null);
          const existingKeys = new Set(remaining.map(e => `${e.subjectId}-${e.type}`));

          for (const s of subjects) {
            if (s.hasLecture && !loggedKeys.has(`${s.id}-lecture`) && !existingKeys.has(`${s.id}-lecture`)) {
              remaining.push({
                subjectId: s.id, subjectName: s.name, type: 'lecture',
                status: null, instanceId: crypto.randomUUID(),
              });
            }
            if (s.hasLab && !loggedKeys.has(`${s.id}-lab`) && !existingKeys.has(`${s.id}-lab`)) {
              remaining.push({
                subjectId: s.id, subjectName: s.name, type: 'lab',
                status: null, instanceId: crypto.randomUUID(),
              });
            }
          }
          return remaining;
        }

        return buildEntries(subjects, records);
      });

      if (!preserveUnmarked) {
        setMarkedOrder([]);
      } else {
        setMarkedOrder((prev) => prev.filter(id => entries.some(e => e.instanceId === id && e.status !== null)));
      }

      setLoggedDates(prev => {
        const next = new Set(prev);
        if (records.length > 0) next.add(date);
        else next.delete(date);
        return next;
      });
    } catch {
      // ignore
    }
  }

  function setEntryStatus(instanceId: string, status: EntryStatus) {
    const currentEntry = entries.find(e => e.instanceId === instanceId);
    const isTogglingOff = currentEntry?.status === status;

    setEntries((prev) =>
      prev.map((e) =>
        e.instanceId === instanceId
          ? { ...e, status: isTogglingOff ? null : status }
          : e
      )
    );

    setMarkedOrder((prev) => {
      if (isTogglingOff) {
        return prev.filter(id => id !== instanceId);
      } else {
        if (prev.includes(instanceId)) {
          return prev;
        }
        return [...prev, instanceId];
      }
    });
  }

  function markSectionAttended(type: 'lecture' | 'lab') {
    setEntries((prev) =>
      prev.map((e) => (e.type === type ? { ...e, status: 'attended' } : e))
    );
    setMarkedOrder((prev) => {
      const sectionIds = entries.filter((e) => e.type === type).map((e) => e.instanceId);
      const existing = new Set(prev);
      const newIds = sectionIds.filter((id) => !existing.has(id));
      return [...prev, ...newIds];
    });
  }

  function markSectionSkipped(type: 'lecture' | 'lab') {
    setEntries((prev) =>
      prev.map((e) => (e.type === type ? { ...e, status: 'skipped' } : e))
    );
    setMarkedOrder((prev) => {
      const sectionIds = entries.filter((e) => e.type === type).map((e) => e.instanceId);
      const existing = new Set(prev);
      const newIds = sectionIds.filter((id) => !existing.has(id));
      return [...prev, ...newIds];
    });
  }

  function resetSection(type: 'lecture' | 'lab') {
    setEntries((prev) =>
      prev.map((e) => (e.type === type ? { ...e, status: null } : e))
    );
    setMarkedOrder((prev) => {
      const sectionIds = new Set(entries.filter((e) => e.type === type).map((e) => e.instanceId));
      return prev.filter((id) => !sectionIds.has(id));
    });
  }

  function resetAll() {
    setEntries((prev) => prev.map((e) => ({ ...e, status: null })));
    setMarkedOrder([]);
  }

  function addInstance(subjectId: string, subjectName: string, type: 'lecture' | 'lab') {
    setEntries((prev) => {
      const lastIndex = prev.reduce((acc, e, i) =>
        e.subjectId === subjectId && e.type === type ? i : acc, -1);
      const newEntry: EntryRow = {
        subjectId,
        subjectName,
        type,
        status: null,
        instanceId: crypto.randomUUID(),
      };
      if (lastIndex === -1) {
        return [...prev, newEntry];
      }
      const result = [...prev];
      result.splice(lastIndex + 1, 0, newEntry);
      return result;
    });
  }

  function removeInstance(instanceId: string) {
    setEntries((prev) => prev.filter(e => e.instanceId !== instanceId));
    setMarkedOrder((prev) => prev.filter(id => id !== instanceId));
  }

  function getEntryLabel(entry: EntryRow): string | null {
    const loggedCount = dayRecords.filter(r =>
      r.subjectId === entry.subjectId && r.type === entry.type
    ).length;
    const entryInstances = entries.filter(e =>
      e.subjectId === entry.subjectId && e.type === entry.type
    );

    if (loggedCount + entryInstances.length <= 1) return null;

    const idx = entryInstances.findIndex(e => e.instanceId === entry.instanceId);
    const ordinal = loggedCount + idx + 1;
    return entry.type === 'lecture' ? `L${ordinal}` : `Lab ${ordinal}`;
  }

  function getRecordLabel(record: AttendanceRecord): string | null {
    const sameRecords = dayRecords.filter(r =>
      r.subjectId === record.subjectId && r.type === record.type
    );
    const entryCount = entries.filter(e =>
      e.subjectId === record.subjectId && e.type === record.type
    ).length;

    if (sameRecords.length + entryCount <= 1) return null;

    const index = sameRecords.findIndex(r => r.id === record.id);
    return record.type === 'lecture' ? `L${index + 1}` : `Lab ${index + 1}`;
  }

  const lectureEntries = entries.filter((e) => e.type === 'lecture');
  const labEntries = entries.filter((e) => e.type === 'lab');

  const orderedMarkedEntries = useMemo(() => {
    const map = new Map(entries.map(e => [e.instanceId, e]));
    const result: EntryRow[] = [];
    for (const id of markedOrder) {
      const entry = map.get(id);
      if (entry && entry.status !== null) {
        result.push(entry);
      }
    }
    for (const entry of entries) {
      if (entry.status !== null && !result.some(r => r.instanceId === entry.instanceId)) {
        result.push(entry);
      }
    }
    return result;
  }, [entries, markedOrder]);

  async function handleSubmit() {
    if (!semesterId || orderedMarkedEntries.length === 0) return;
    setSaving(true);
    setJustSaved(false);
    try {
      const payload = orderedMarkedEntries.map((e, index) => ({
        subjectId: e.subjectId,
        semesterId: semesterId!,
        type: e.type,
        status: e.status!,
        date,
        orderIndex: dayRecords.length + index,
      }));
      await api.attendance.createBulk(payload);
      await loadDayRecords(true);
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
      await loadDayRecords();
    } catch {
      // ignore
    }
  }

  async function persistReorder(records: AttendanceRecord[]) {
    setIsReordering(true);
    try {
      await api.attendance.reorder(records.map((r) => r.id));
    } catch (err) {
      console.error('Failed to save record order', err);
      await loadDayRecords();
    } finally {
      setIsReordering(false);
    }
  }

  async function handleMoveRecord(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dayRecords.length) return;
    const reordered = [...dayRecords];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setDayRecords(reordered);
    await persistReorder(reordered);
  }

  function handleRecordDragStart(e: React.DragEvent, index: number) {
    setDraggedRecordIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }

  function handleRecordDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverRecordIndex !== index) {
      setDragOverRecordIndex(index);
    }
  }

  async function handleRecordDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    if (draggedRecordIndex === null || draggedRecordIndex === targetIndex) {
      setDraggedRecordIndex(null);
      setDragOverRecordIndex(null);
      return;
    }
    const reordered = [...dayRecords];
    const [moved] = reordered.splice(draggedRecordIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setDayRecords(reordered);
    setDraggedRecordIndex(null);
    setDragOverRecordIndex(null);
    await persistReorder(reordered);
  }

  function handleRecordDragEnd() {
    setDraggedRecordIndex(null);
    setDragOverRecordIndex(null);
    setDragAllowedId(null);
  }

  function getSubjectName(subjectId: string) {
    return subjects.find((s) => s.id === subjectId)?.name || 'Unknown';
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-9 w-64 rounded shimmer" />
        </div>
        <div className="h-16 rounded-xl shimmer" />
        <div className="h-48 rounded-xl shimmer" />
      </div>
    );
  }

  if (noSemester) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto py-12">
        <span className="eyebrow mb-2">No Active Semester</span>
        <h1 className="font-serif text-2xl font-normal text-text-primary mb-2">
          Create a semester first
        </h1>
        <p className="text-sm text-text-secondary">
          You need an active semester to log daily attendance records.
        </p>
      </div>
    );
  }

  function renderSection(
    type: 'lecture' | 'lab',
    sectionEntries: EntryRow[],
    icon: React.ReactNode,
  ) {
    if (sectionEntries.length === 0) return null;

    const markedCount = sectionEntries.filter((e) => e.status !== null).length;

    return (
      <div className="space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-forest-700 dark:text-text-primary">
              {icon}
            </div>
            <div>
              <h2 className="font-serif text-base font-normal text-text-primary">
                {type === 'lecture' ? 'Lectures' : 'Labs'}
              </h2>
              <p className="text-[11px] text-text-muted">
                {markedCount} of {sectionEntries.length} marked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => markSectionAttended(type)}
              className="flex items-center gap-1 rounded-md border border-border-strong bg-card px-2.5 py-1 text-[11px] font-medium text-ok hover:bg-ok-bg transition-colors"
            >
              <CheckIcon className="h-3 w-3" />
              All
            </button>
            <button
              onClick={() => markSectionSkipped(type)}
              className="flex items-center gap-1 rounded-md border border-border-strong bg-card px-2.5 py-1 text-[11px] font-medium text-risk hover:bg-risk-bg transition-colors"
            >
              <CloseIcon className="h-3 w-3" />
              All
            </button>
            <button
              onClick={() => resetSection(type)}
              className="flex items-center gap-1 rounded-md border border-border-subtle bg-card px-2.5 py-1 text-[11px] font-medium text-text-muted hover:text-text-primary hover:bg-panel transition-colors"
              title="Reset section"
            >
              <MinusIcon className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Entries Table/List */}
        <div className="ledger-card overflow-hidden divide-y divide-border-subtle">
          {sectionEntries.map((entry) => {
            const label = getEntryLabel(entry);
            const instancesOfKind = entries.filter(
              e => e.subjectId === entry.subjectId && e.type === entry.type
            );
            const canRemove = instancesOfKind.length > 1;
            const markedIndex = markedOrder.indexOf(entry.instanceId);
            const sequenceNumber = entry.status !== null && markedIndex !== -1 ? markedIndex + 1 : null;

            return (
              <div
                key={entry.instanceId}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 transition-colors',
                  entry.status === 'attended' && 'bg-ok-bg/30',
                  entry.status === 'skipped' && 'bg-risk-bg/30'
                )}
              >
                {/* Subject Name + Tags */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {entry.subjectName}
                  </p>
                  {label && (
                    <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-chip text-text-secondary">
                      {label}
                    </span>
                  )}
                  {sequenceNumber !== null && (
                    <span
                      className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-panel text-forest-700 dark:text-text-primary border border-border-subtle"
                      title={`Marked #${sequenceNumber} in sequence`}
                    >
                      #{sequenceNumber}
                    </span>
                  )}
                </div>

                {/* Status Toggles & Instance Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {canRemove && (
                    <button
                      onClick={() => removeInstance(entry.instanceId)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-risk-bg hover:text-risk transition-colors"
                      title="Remove this extra session"
                    >
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => addInstance(entry.subjectId, entry.subjectName, entry.type)}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-panel text-text-secondary hover:text-text-primary hover:border-border-strong border border-border-subtle transition-colors"
                    title={`Add another ${type}`}
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>

                  {/* Present Button */}
                  <button
                    onClick={() => setEntryStatus(entry.instanceId, 'attended')}
                    className={cn(
                      'flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium border transition-colors',
                      entry.status === 'attended'
                        ? 'bg-ok-bg border-ok text-ok font-semibold'
                        : 'border-border-subtle bg-card text-text-secondary hover:bg-ok-bg/50 hover:text-ok'
                    )}
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Present</span>
                  </button>

                  {/* Bunked Button */}
                  <button
                    onClick={() => setEntryStatus(entry.instanceId, 'skipped')}
                    className={cn(
                      'flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium border transition-colors',
                      entry.status === 'skipped'
                        ? 'bg-risk-bg border-risk text-risk font-semibold'
                        : 'border-border-subtle bg-card text-text-secondary hover:bg-risk-bg/50 hover:text-risk'
                    )}
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Bunked</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Full screen click-away overlay for calendar */}
      {showCalendar && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCalendar(false)}
        />
      )}

      {/* Header */}
      <div>
        <span className="eyebrow">Workspace / Log Attendance</span>
        <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
          Record daily sessions
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Mark the classes you attended or skipped in the order they took place today.
        </p>
      </div>

      {/* Date Navigator Card */}
      <div className="ledger-card p-3 sm:p-4 flex items-center justify-between relative z-50">
        <button
          onClick={() => setDate(format(subDays(new Date(date + 'T00:00:00'), 1), 'yyyy-MM-dd'))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-card text-text-secondary hover:bg-panel hover:text-text-primary transition-colors"
          title="Previous day"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        <div className="relative flex-1 flex justify-center">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex flex-col items-center cursor-pointer group px-4 py-1 rounded-lg hover:bg-panel transition-colors"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-0.5">
              {date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(new Date(date + 'T00:00:00'), 'EEEE')}
            </span>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-forest-800 dark:text-accent" />
              <span className="font-serif text-base font-medium text-text-primary group-hover:text-forest-800 dark:group-hover:text-accent transition-colors">
                {format(new Date(date + 'T00:00:00'), 'MMMM d, yyyy')}
              </span>
            </div>
          </button>

          {/* Note Icon */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowNoteModal(true); }}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg transition-all',
              note
                ? 'text-warn bg-warn/15 border border-warn/30'
                : 'text-text-muted hover:bg-panel hover:text-text-primary'
            )}
            title={note ? 'View/edit note' : 'Add a note'}
          >
            <StickyNoteIcon className="h-4 w-4" />
            {note && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-warn" />
            )}
          </button>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 ledger-card p-4 w-[290px] shadow-xl animate-fade-in">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-subtle">
                <button
                  onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-panel transition-colors"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="font-serif font-medium text-sm text-text-primary">
                  {format(calendarMonth, 'MMMM yyyy')}
                </span>
                <button
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-panel transition-colors"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const inMonth = isSameMonth(day, calendarMonth);
                  const today = isToday(day);
                  const future = isFuture(day) && !today;
                  const isSelected = date === dateStr;
                  const hasLog = loggedDates.has(dateStr);

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
                        !inMonth && "opacity-25",
                        future && "opacity-20 cursor-not-allowed",
                        isSelected && "bg-forest-800 dark:bg-cta-bg text-text-on-dark font-semibold",
                        !isSelected && !future && "hover:bg-panel text-text-primary",
                        today && !isSelected && "ring-1 ring-forest-800/40 text-forest-800 dark:text-accent font-semibold",
                        hasLog && !isSelected && "bg-chip font-medium text-text-primary"
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setDate(format(addDays(new Date(date + 'T00:00:00'), 1), 'yyyy-MM-dd'))}
          disabled={date === format(new Date(), 'yyyy-MM-dd')}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-card transition-colors",
            date === format(new Date(), 'yyyy-MM-dd')
              ? "opacity-30 cursor-not-allowed text-text-muted"
              : "text-text-secondary hover:bg-panel hover:text-text-primary"
          )}
          title="Next day"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Note Banner */}
      {note && (
        <button
          onClick={() => setShowNoteModal(true)}
          className="w-full rounded-xl border border-warn/30 bg-warn/10 px-4 py-3 text-left transition-colors hover:bg-warn/15 group"
        >
          <div className="flex items-start gap-2.5">
            <StickyNoteIcon className="h-4 w-4 text-warn mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-semibold text-text-primary">
                  {note.endDate && note.endDate > note.date ? 'Holiday / Multi-day Event' : 'Day Note'}
                </p>
                {note.endDate && note.endDate > note.date && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warn/20 text-warn">
                    {format(new Date(note.date + 'T00:00:00'), 'MMM d')} – {format(new Date(note.endDate + 'T00:00:00'), 'MMM d')}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary leading-relaxed font-normal">{note.content}</p>
            </div>
            <span className="text-[11px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0">Edit</span>
          </div>
        </button>
      )}

      {/* Info Notice */}
      <div className="rounded-lg border border-border-subtle bg-panel/60 px-4 py-2.5 text-xs text-text-secondary flex items-center justify-between">
        <span>Only mark subjects that had classes. Unmarked items are treated as "No Class".</span>
        {orderedMarkedEntries.length > 0 && (
          <button
            onClick={resetAll}
            className="text-[11px] font-medium text-text-primary hover:underline ml-3 shrink-0"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Lectures */}
      {renderSection(
        'lecture',
        lectureEntries,
        <BookOpenIcon className="h-4 w-4" />
      )}

      {/* Labs */}
      {renderSection(
        'lab',
        labEntries,
        <FlaskConicalIcon className="h-4 w-4" />
      )}

      {/* Submit Button */}
      {entries.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={saving || orderedMarkedEntries.length === 0}
          className={cn(
            'w-full rounded-lg py-3.5 text-sm font-medium transition-all flex items-center justify-center gap-2',
            justSaved
              ? 'bg-ok-bg text-ok border border-ok'
              : 'bg-cta-bg text-cta-text hover:opacity-95',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          {justSaved ? (
            <>
              <CheckIcon className="h-4 w-4" />
              Saved to Ledger
            </>
          ) : saving ? (
            'Saving…'
          ) : (
            <>
              <SendIcon className="h-4 w-4" />
              Save {orderedMarkedEntries.length} {orderedMarkedEntries.length === 1 ? 'Session' : 'Sessions'}
            </>
          )}
        </button>
      )}

      {/* All Caught Up Card */}
      {entries.length === 0 && !loading && dayRecords.length > 0 && (
        <div className="ledger-card p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ok-bg text-ok mx-auto mb-3">
            <CheckIcon className="h-6 w-6" />
          </div>
          <p className="font-serif text-lg font-medium text-text-primary">All caught up</p>
          <p className="text-xs text-text-muted mt-1">
            You've logged all available subjects for this date.
          </p>
        </div>
      )}

      {/* Already Logged Section */}
      {dayRecords.length > 0 && (
        <div className="ledger-card overflow-hidden mt-6">
          <button
            onClick={() => setShowLogged(!showLogged)}
            className="flex w-full items-center justify-between px-5 py-4 hover:bg-panel/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text-primary">
                <CheckIcon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-base font-normal text-text-primary">Already Logged</h2>
                  {isReordering && (
                    <span className="text-[10px] text-accent animate-pulse font-medium">
                      Saving sequence…
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  {dayRecords.length} recorded session{dayRecords.length > 1 ? 's' : ''} for {format(new Date(date + 'T00:00:00'), 'MMM d')}
                </p>
              </div>
            </div>
            {showLogged ? (
              <ChevronUpIcon className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-text-muted" />
            )}
          </button>

          {showLogged && (
            <div className="divide-y divide-border-subtle border-t border-border-subtle">
              {dayRecords.map((record, index) => {
                const label = getRecordLabel(record);
                const isBeingDragged = draggedRecordIndex === index;
                const isOver = dragOverRecordIndex === index && draggedRecordIndex !== index;

                return (
                  <div
                    key={record.id}
                    draggable={dragAllowedId === record.id}
                    onDragStart={(e) => handleRecordDragStart(e, index)}
                    onDragOver={(e) => handleRecordDragOver(e, index)}
                    onDrop={(e) => handleRecordDrop(e, index)}
                    onDragEnd={handleRecordDragEnd}
                    className={cn(
                      'flex items-center gap-2.5 sm:gap-3 px-3 sm:px-5 py-3 transition-all select-none',
                      isBeingDragged && 'opacity-40 bg-chip scale-[0.99]',
                      isOver && 'border-t-2 border-forest-800 dark:border-accent bg-panel/60',
                      record.status === 'attended' ? 'hover:bg-ok-bg/10' : 'hover:bg-risk-bg/10'
                    )}
                  >
                    {/* Drag handle */}
                    <div
                      onMouseDown={() => setDragAllowedId(record.id)}
                      onMouseUp={() => setDragAllowedId(null)}
                      onTouchStart={() => setDragAllowedId(record.id)}
                      onTouchEnd={() => setDragAllowedId(null)}
                      className="hidden sm:flex cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary p-1 -ml-1 rounded transition-colors"
                      title="Drag to reorder sequence"
                    >
                      <GripVerticalIcon className="h-4 w-4" />
                    </div>

                    {/* Sequence badge */}
                    <span className="shrink-0 text-[11px] font-semibold text-text-muted w-5 text-center">
                      #{index + 1}
                    </span>

                    {/* Status icon tile */}
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-md shrink-0',
                        record.status === 'attended' ? 'bg-ok-bg text-ok' : 'bg-risk-bg text-risk'
                      )}
                    >
                      {record.status === 'attended' ? (
                        <CheckIcon className="h-3.5 w-3.5" />
                      ) : (
                        <CloseIcon className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Subject info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {getSubjectName(record.subjectId)}
                        </p>
                        {label && (
                          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-chip text-text-secondary">
                            {label}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                        {record.type === 'lecture' ? 'Lecture' : 'Lab'}
                      </p>
                    </div>

                    {/* Up / Down reorder arrows */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        disabled={index === 0 || isReordering}
                        onClick={() => handleMoveRecord(index, 'up')}
                        className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-panel hover:text-text-primary disabled:opacity-20 transition-colors"
                        title="Move earlier"
                      >
                        <ChevronUpIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        disabled={index === dayRecords.length - 1 || isReordering}
                        onClick={() => handleMoveRecord(index, 'down')}
                        className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-panel hover:text-text-primary disabled:opacity-20 transition-colors"
                        title="Move later"
                      >
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-risk-bg hover:text-risk transition-colors shrink-0"
                      title="Delete record"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        date={note?.date || date}
        initialEndDate={note?.endDate || date}
        initialContent={note?.content || ''}
        noteId={note?.id}
        onSave={handleNoteSave}
        onDelete={handleNoteDelete}
      />
    </div>
  );
}
