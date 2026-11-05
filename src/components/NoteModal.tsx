import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  CloseIcon,
  SaveIcon,
  TrashIcon,
  StickyNoteIcon,
  CalendarIcon,
  ClockIcon,
} from '@/components/icons';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { cn } from '@/lib/utils';

const MAX_NOTE_LENGTH = 200;

type NoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  date: string;
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
    { label: '3 Days (Weekend)', days: 3 },
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
        className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-lg ledger-card shadow-xl animate-fade-in overflow-y-auto max-h-[calc(100dvh-2rem)] overscroll-contain"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warn/15 text-warn">
              <StickyNoteIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="eyebrow text-[10px]">
                {durationDays > 1 ? 'Multi-day Event / Holiday' : 'Day Note'}
              </span>
              <h3 className="font-serif text-lg font-normal text-text-primary">
                {durationDays > 1 ? 'Event details' : 'Record a note'}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">{dateRangeSummary}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-panel hover:text-text-primary transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Date & Duration Controls */}
        <div className="px-6 py-4 bg-panel/40 border-b border-border-subtle space-y-4">
          {/* Preset Duration Chips */}
          <div>
            <label className="eyebrow text-[10px] block mb-2 flex items-center gap-1.5">
              <ClockIcon className="h-3 w-3" />
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
                      'text-xs font-medium px-3 py-1 rounded-md transition-colors border',
                      isSelected
                        ? 'bg-forest-800 dark:bg-cta-bg text-text-on-dark border-transparent font-semibold'
                        : 'bg-card text-text-secondary border-border-subtle hover:bg-panel hover:text-text-primary'
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
              <label className="eyebrow text-[10px] block mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3 text-forest-800 dark:text-accent" />
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full rounded-md border border-border-strong bg-card px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="eyebrow text-[10px] block mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3 text-forest-800 dark:text-accent" />
                To Date ({durationDays} {durationDays === 1 ? 'day' : 'days'})
              </label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full rounded-md border border-border-strong bg-card px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 py-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add note or holiday details... (e.g. Mid-term break, Fest rehearsal, Sick leave, College holiday)"
            maxLength={MAX_NOTE_LENGTH + 10}
            className={cn(
              'w-full h-28 resize-none rounded-lg border bg-card p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors',
              isOverLimit
                ? 'border-risk'
                : 'border-border-strong focus:border-forest-800 dark:focus:border-accent'
            )}
          />

          <div className="flex items-center justify-between mt-2 px-0.5">
            <p className="text-[11px] text-text-muted">
              {text.trim().length > 0 ? 'Ctrl+Enter to save' : ''}
            </p>
            <p
              className={cn(
                'text-[11px] font-medium tabular-nums',
                isOverLimit
                  ? 'text-risk'
                  : charCount > MAX_NOTE_LENGTH * 0.85
                    ? 'text-warn'
                    : 'text-text-muted'
              )}
            >
              {charCount}/{MAX_NOTE_LENGTH}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6 pt-2">
          <div>
            {onDelete && initialContent.trim().length > 0 && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-risk bg-risk-bg/60 hover:bg-risk-bg transition-colors disabled:opacity-40"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border-strong bg-card px-4 py-2 text-xs font-medium text-text-secondary hover:bg-panel transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-colors',
                'bg-forest-800 dark:bg-cta-bg text-text-on-dark hover:opacity-95',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <SaveIcon className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
