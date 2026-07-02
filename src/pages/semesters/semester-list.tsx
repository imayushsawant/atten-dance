import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Trash2, Check, GraduationCap, BookOpen, FlaskConical } from 'lucide-react';
import { api } from '@/lib/api';
import type { Semester } from '@/lib/api';

export default function SemesterList() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function handleDelete(id: string) {
    if (!confirm('Delete this semester? All attendance data will be lost.')) return;
    try {
      await api.semesters.delete(id);
      await loadSemesters();
    } catch {
      // ignore
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
                  {!sem.isActive && (
                    <button
                      onClick={() => handleActivate(sem.id)}
                      className="flex h-8 items-center gap-1.5 rounded-md bg-secondary px-3 text-xs font-medium text-foreground hover:bg-primary/15 hover:text-primary transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(sem.id)}
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
    </div>
  );
}
