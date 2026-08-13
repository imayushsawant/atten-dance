import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Trash2, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_NOTE_LENGTH = 200;

type NoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  formattedDate: string;
  initialContent: string;
  onSave: (content: string) => void;
  onDelete?: () => void;
};

export default function NoteModal({
  isOpen,
  onClose,
  date,
  formattedDate,
  initialContent,
  onSave,
  onDelete,
}: NoteModalProps) {
  const [text, setText] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(initialContent);
  }, [initialContent, isOpen]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to allow the animation to start
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const charCount = text.length;
  const isOverLimit = charCount > MAX_NOTE_LENGTH;
  const hasChanges = text.trim() !== initialContent.trim();
  const canSave = text.trim().length > 0 && !isOverLimit && hasChanges;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(text.trim());
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
    // Ctrl/Cmd + Enter to save
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
        className="relative w-full max-w-md glass rounded-2xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <StickyNote className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Day Note</h3>
              <p className="text-[10px] text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a note for this day... (e.g., was sick, college fest, cancelled classes)"
            maxLength={MAX_NOTE_LENGTH + 10} // allow slight overflow for UX, but show warning
            className={cn(
              'w-full h-28 resize-none rounded-xl border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all',
              isOverLimit
                ? 'border-danger/50 focus:ring-danger/30'
                : 'border-border focus:ring-primary/30'
            )}
          />

          {/* Character counter */}
          <div className="flex items-center justify-between mt-1.5 px-1">
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
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all',
                'bg-primary text-primary-foreground hover:opacity-90',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
