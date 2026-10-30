import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Trash2, StickyNote, Calendar, Clock } from 'lucide-react';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { cn } from '@/lib/utils';

const MAX_NOTE_LENGTH = 200;

type NoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  date: string; // The specific date selected when opened
  formattedDate?: string;
  initialEndDate?: string | null;
  initialContent: string;
  noteId?: string;
  onSave: (content: string, startDate: string, endDate: string) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

export default function NoteModal({
  isOpen,
  onClose,
  date,
  initialEndDate,
  initialContent,
  onSave,
  onDelete,
}: NoteModalProps) {
  const [text, setText] = useState(initialContent);
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState(initialEndDate || date);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialContent);
      setStartDate(date);
      setEndDate(initialEndDate && initialEndDate >= date ? initialEndDate : date);
    }
  }, [isOpen, date, initialEndDate, initialContent]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const durationDays = useMemo(() => {
    try {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      const diff = differenceInCalendarDays(end, start);
      return Math.max(1, diff + 1);
    } catch {
      return 1;
    }
  }, [startDate, endDate]);

  const dateRangeSummary = useMemo(() => {
    try {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      if (startDate === endDate) {
        return `${format(start, 'EEE, MMMM d, yyyy')} • 1 day`;
      }
      return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')} • ${durationDays} days`;
    } catch {
      return '';
    }
  }, [startDate, endDate, durationDays]);

  const presets = [
    { label: '1 Day', days: 1 },
    { label: '2 Days', days: 2 },
    { label: '3 Days (Long weekend)', days: 3 },
    { label: '4 Days', days: 4 },
    { label: '1 Week', days: 7 },
  ];

  function applyPreset(days: number) {
    try {
      const start = new Date(startDate + 'T00:00:00');
      const nextEnd = format(addDays(start, days - 1), 'yyyy-MM-dd');
      setEndDate(nextEnd);
    } catch {
      // ignore
    }
  }

  function handleStartDateChange(newStart: string) {
    setStartDate(newStart);
    if (endDate < newStart) {
      setEndDate(newStart);
    }
  }

  function handleEndDateChange(newEnd: string) {
    if (newEnd < startDate) {
      setEndDate(startDate);
    } else {
      setEndDate(newEnd);
    }
  }

  if (!isOpen) return null;

  const charCount = text.length;
  const isOverLimit = charCount > MAX_NOTE_LENGTH;
  const hasChanges =
    text.trim() !== initialContent.trim() ||
    startDate !== date ||
    endDate !== (initialEndDate || date);
  const canSave = text.trim().length > 0 && !isOverLimit && (hasChanges || initialContent.trim().length === 0);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(text.trim(), startDate, endDate);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canSave) {
      handleSave();
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg glass rounded-2xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <StickyNote className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                {durationDays > 1 ? 'Long-spanning Event / Holiday' : 'Day Note'}
              </h3>
              <p className="text-[11px] text-muted-foreground">{dateRangeSummary}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Date & Duration Controls */}
        <div className="px-5 py-3 border-y border-border/50 bg-secondary/20 space-y-3">
          {/* Preset Duration Chips */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Duration Preset
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => {
                const isSelected = durationDays === preset.days;
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => applyPreset(preset.days)}
                    className={cn(
                      'text-xs font-medium px-2.5 py-1 rounded-lg transition-all border',
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20'
                        : 'bg-background/80 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-500" />
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-500" />
                To Date (Duration: {durationDays} {durationDays === 1 ? 'day' : 'days'})
              </label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-5 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add note or event title... (e.g., Diwali vacation, Long weekend holiday, Sick leave, College fest)"
            maxLength={MAX_NOTE_LENGTH + 10}
            className={cn(
              'w-full h-28 resize-none rounded-xl border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all',
              isOverLimit
                ? 'border-danger/50 focus:ring-danger/30'
                : 'border-border focus:ring-primary/30'
            )}
          />

          {/* Character counter */}
          <div className="flex items-center justify-between mt-1 px-1">
            <p className="text-[10px] text-muted-foreground">
              {text.trim().length > 0 ? 'Ctrl+Enter to save' : ''}
            </p>
            <p
              className={cn(
                'text-[10px] font-medium tabular-nums transition-colors',
                isOverLimit
                  ? 'text-danger'
                  : charCount > MAX_NOTE_LENGTH * 0.85
                    ? 'text-amber-500'
                    : 'text-muted-foreground'
              )}
            >
              {charCount}/{MAX_NOTE_LENGTH}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-5 pt-2">
          <div>
            {onDelete && initialContent.trim().length > 0 && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all',
                'bg-primary text-primary-foreground hover:opacity-90',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
