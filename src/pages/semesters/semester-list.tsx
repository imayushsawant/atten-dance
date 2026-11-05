import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Plus, Trash2, Check, GraduationCap, Edit3, PowerOff, Share2, Download, Copy, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import type { Semester } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function SemesterList() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [endConfirmId, setEndConfirmId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSemesters();
  }, []);

  async function loadSemesters() {
    try {
      const data = await api.semesters.list();
      setSemesters(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate(id: string) {
    try {
      await api.semesters.activate(id);
      await loadSemesters();
    } catch {
      // ignore
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await api.semesters.deactivate(id);
      await loadSemesters();
    } catch {
      // ignore
    } finally {
      setEndConfirmId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.semesters.delete(id);
      await loadSemesters();
    } catch {
      // ignore
    } finally {
      setDeleteConfirmId(null);
    }
  }

  async function handleShare(id: string) {
    try {
      const res = await api.semesters.share(id);
      setShareCode(res.shareCode);
    } catch {
      // ignore
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importCode.trim()) return;
    setImporting(true);
    setImportError('');
    try {
      await api.semesters.import(importCode.trim());
      setImportModalOpen(false);
      setImportCode('');
      await loadSemesters();
    } catch (err: any) {
      setImportError(err.message || 'Failed to import semester');
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-9 w-48 rounded shimmer" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="eyebrow">Semester / Management</span>
          <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
            Manage semesters
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Configure terms, active subjects, and target attendance thresholds.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border-strong bg-card px-3.5 py-2 text-xs font-medium text-text-secondary hover:bg-panel hover:text-text-primary transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Import
          </button>
          <Link
            to="/semesters/new"
            className="flex items-center gap-1.5 rounded-lg bg-forest-800 dark:bg-cta-bg px-4 py-2 text-xs font-medium text-text-on-dark hover:opacity-95 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            New Semester
          </Link>
        </div>
      </div>

      {semesters.length === 0 ? (
        <div className="ledger-card p-12 text-center">
          <GraduationCap className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-60" />
          <h2 className="font-serif text-xl font-normal text-text-primary mb-1">No semesters enrolled</h2>
          <p className="text-xs text-text-secondary mb-6">Create your first semester to begin logging attendance.</p>
          <Link
            to="/semesters/new"
            className="inline-flex items-center gap-2 rounded-lg bg-forest-800 dark:bg-cta-bg px-5 py-2.5 text-xs font-medium text-text-on-dark hover:opacity-95 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Create Semester
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {semesters.map((sem) => (
            <div
              key={sem.id}
              className={cn(
                'ledger-card p-5 transition-colors',
                sem.isActive && 'border-forest-800/40 dark:border-accent/40 bg-panel/30'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
                      sem.isActive
                        ? 'bg-forest-800 dark:bg-cta-bg text-text-on-dark'
                        : 'bg-chip text-text-muted'
                    )}
                  >
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-base font-medium text-text-primary">
                        {sem.name}
                      </h3>
                      {sem.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-ok-bg text-ok">
                          Active
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-chip text-text-secondary">
                        {sem.calculationMethod === 'total_sessions' ? 'Total Sessions' : '50 / 50 Split'}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      Target Threshold: {sem.threshold}%
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleShare(sem.id)}
                    className="flex h-8 items-center gap-1.5 rounded-md border border-border-strong bg-card px-2.5 text-xs font-medium text-text-secondary hover:bg-panel hover:text-text-primary transition-colors"
                    title="Share semester"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                  <Link
                    to={`/semesters/${sem.id}/edit`}
                    className="flex h-8 items-center gap-1.5 rounded-md border border-border-strong bg-card px-2.5 text-xs font-medium text-text-secondary hover:bg-panel hover:text-text-primary transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Link>

                  {sem.isActive ? (
                    <button
                      onClick={() => setEndConfirmId(sem.id)}
                      className="flex h-8 items-center gap-1.5 rounded-md border border-warn/30 bg-warn/10 px-2.5 text-xs font-medium text-warn hover:bg-warn/20 transition-colors"
                      title="End semester"
                    >
                      <PowerOff className="h-3.5 w-3.5" />
                      End
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(sem.id)}
                      className="flex h-8 items-center gap-1.5 rounded-md border border-border-strong bg-card px-2.5 text-xs font-medium text-text-secondary hover:bg-ok-bg hover:text-ok transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Activate
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteConfirmId(sem.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-risk-bg hover:text-risk transition-colors"
                    title="Delete semester"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* End Semester Modal */}
      {endConfirmId && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="ledger-card w-full max-w-sm p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warn/15 text-warn mx-auto mb-3">
              <PowerOff className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-xl font-normal text-text-primary mb-1">End Semester?</h2>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              This will deactivate the current semester and freeze attendance tracking. You can reactivate it at any time.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setEndConfirmId(null)}
                className="flex-1 rounded-md border border-border-strong py-2 text-xs font-medium text-text-secondary hover:bg-panel transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeactivate(endConfirmId)}
                className="flex-1 rounded-md bg-warn text-white py-2 text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Confirm End
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Semester Modal */}
      {deleteConfirmId && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="ledger-card w-full max-w-sm p-6 text-center border-risk/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-risk-bg text-risk mx-auto mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-xl font-normal text-text-primary mb-1">Delete Semester?</h2>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              This permanently removes the semester and all logged attendance records. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-md border border-border-strong py-2 text-xs font-medium text-text-secondary hover:bg-panel transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-md bg-risk text-white py-2 text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Share Modal */}
      {shareCode && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="ledger-card w-full max-w-sm p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chip text-forest-800 dark:text-accent mx-auto mb-3">
              <Share2 className="h-6 w-6" />
            </div>
            <span className="eyebrow text-[10px]">Share Code</span>
            <h2 className="font-serif text-xl font-normal text-text-primary mt-1 mb-2">Share Semester</h2>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Friends can use this code to copy this semester structure without your attendance logs.
            </p>
            <div className="flex items-center justify-center gap-2 p-3 bg-panel rounded-lg border border-border-strong mb-4">
              <span className="font-mono text-2xl font-bold tracking-widest text-text-primary">{shareCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-1.5 rounded hover:bg-chip transition-colors text-text-muted hover:text-text-primary"
                title="Copy code"
              >
                {copied ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={() => setShareCode(null)}
              className="w-full rounded-md border border-border-strong py-2 text-xs font-medium text-text-secondary hover:bg-panel transition-colors"
            >
              Done
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Import Modal */}
      {importModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="ledger-card w-full max-w-sm p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chip text-forest-800 dark:text-accent mx-auto mb-3">
              <Download className="h-6 w-6" />
            </div>
            <span className="eyebrow text-[10px]">Import Structure</span>
            <h2 className="font-serif text-xl font-normal text-text-primary mt-1 mb-2">Import Semester</h2>
            <p className="text-xs text-text-secondary mb-4">
              Enter a 6-character code from a classmate to copy their subject setup.
            </p>
            <form onSubmit={handleImport}>
              <input
                type="text"
                placeholder="CODE"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                className="w-full rounded-md border border-border-strong bg-card px-3 py-2.5 text-center text-lg font-mono tracking-widest uppercase text-text-primary outline-none focus:border-forest-800 dark:focus:border-accent mb-2"
                maxLength={6}
                required
              />
              {importError && (
                <p className="text-xs text-risk text-center mb-3">{importError}</p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setImportModalOpen(false);
                    setImportCode('');
                    setImportError('');
                  }}
                  className="flex-1 rounded-md border border-border-strong py-2 text-xs font-medium text-text-secondary hover:bg-panel transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !importCode.trim()}
                  className="flex-1 rounded-md bg-forest-800 dark:bg-cta-bg text-text-on-dark py-2 text-xs font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {importing ? 'Importing…' : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
