import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Plus, Trash2, Check, GraduationCap, BookOpen, Edit3, PowerOff, Share2, Download, Copy } from 'lucide-react';
import { api } from '@/lib/api';
import type { Semester } from '@/lib/api';

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
      <div className="space-y-4">
        <div className="h-8 w-48 rounded shimmer" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Semesters</h1>
          <p className="text-muted-foreground">Manage your semesters</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary/80"
          >
            <Download className="h-4 w-4" />
            Import
          </button>
          <Link
            to="/semesters/new"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Semester
          </Link>
        </div>
      </div>

      {semesters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No semesters yet</p>
          <p className="text-sm text-muted-foreground mb-8">Create your first semester to start tracking</p>
          <Link
            to="/semesters/new"
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg hover:opacity-90 transition-all"
          >
            <Plus className="h-5 w-5" />
            Create Semester
          </Link>
          <div className="mt-6 flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">or</span>
            <button
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Import semester from a friend
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {semesters.map((sem) => (
            <div
              key={sem.id}
              className={`glass rounded-xl p-4 transition-all ${
                sem.isActive ? 'ring-1 ring-foreground/20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      sem.isActive ? 'bg-primary/15' : 'bg-secondary'
                    }`}
                  >
                    <GraduationCap
                      className={`h-5 w-5 ${
                        sem.isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      {sem.name}
                      {sem.isActive && (
                        <span className="text-[10px] font-medium uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> Threshold: {sem.threshold}%
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleShare(sem.id)}
                    className="flex h-8 items-center gap-1.5 rounded-md bg-secondary px-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                  <Link
                    to={`/semesters/${sem.id}/edit`}
                    className="flex h-8 items-center gap-1.5 rounded-md bg-secondary px-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Link>

                  {sem.isActive ? (
                    <button
                      onClick={() => setEndConfirmId(sem.id)}
                      className="flex h-8 items-center gap-1.5 rounded-md bg-warning/15 px-3 text-xs font-medium text-warning hover:bg-warning/25 transition-colors"
                    >
                      <PowerOff className="h-3.5 w-3.5" />
                      End
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(sem.id)}
                      className="flex h-8 items-center gap-1.5 rounded-md bg-secondary px-3 text-xs font-medium text-foreground hover:bg-primary/15 hover:text-primary transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirmId(sem.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-danger/15 hover:text-danger transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {endConfirmId && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl border border-border mt-4">
            <PowerOff className="h-10 w-10 text-warning mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">End Semester?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This will deactivate the semester, freezing your logs. You can always reactivate it later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEndConfirmId(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeactivate(endConfirmId)}
                className="flex-1 rounded-lg bg-warning text-warning-foreground py-2.5 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm glow-warning"
              >
                End Semester
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {deleteConfirmId && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl border border-danger/20 mt-4">
            <Trash2 className="h-10 w-10 text-danger mx-auto mb-4" />
            <h2 className="text-lg font-bold text-danger mb-2">Delete Semester?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This is permanent! All your attendance data for this semester will be destroyed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-lg bg-danger text-danger-foreground py-2.5 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm glow-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {shareCode && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl border border-border mt-4">
            <Share2 className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Share Semester</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Give this code to your friends so they can import your semester structure.
            </p>
            <div className="flex items-center gap-2 mb-6">
              <code className="flex-1 bg-secondary py-3 px-4 rounded-lg text-lg font-mono tracking-widest text-foreground font-bold">
                {shareCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareCode);
                  // Optional: add a tiny toast or visual feedback here
                }}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-primary/15 hover:text-primary transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => setShareCode(null)}
              className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>,
        document.body
      )}

      {importModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-border mt-4">
            <div className="text-center mb-6">
              <Download className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-lg font-bold mb-2">Import Semester</h2>
              <p className="text-sm text-muted-foreground">
                Enter a share code from a friend to copy their semester structure.
              </p>
            </div>
            <form onSubmit={handleImport}>
              <input
                type="text"
                placeholder="Enter 6-character code"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-lg font-mono tracking-widest uppercase outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-2"
                maxLength={6}
                required
              />
              {importError && (
                <p className="text-sm text-danger text-center mb-4">{importError}</p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setImportModalOpen(false);
                    setImportCode('');
                    setImportError('');
                  }}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !importCode.trim()}
                  className="flex-1 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Import'}
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
