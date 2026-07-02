import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Plus, Trash2, Check, GraduationCap, BookOpen, FlaskConical, Edit3, PowerOff } from 'lucide-react';
import { api } from '@/lib/api';
import type { Semester } from '@/lib/api';

export default function SemesterList() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [endConfirmId, setEndConfirmId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
        <Link
          to="/semesters/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Semester
        </Link>
      </div>

      {semesters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No semesters yet</p>
          <p className="text-sm text-muted-foreground mb-6">Create your first semester to start tracking</p>
          <Link
            to="/semesters/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
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
    </div>
  );
}
