import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router';
import { Plus, Trash2, BookOpen, FlaskConical, GraduationCap, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { CalculationMethod } from '@/lib/api';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type SubjectInput = {
  id?: string;
  name: string;
  hasLecture: boolean;
  hasLab: boolean;
};

export default function EditSemester() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState(75);
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>('total_sessions');
  const [expandedMethod, setExpandedMethod] = useState<CalculationMethod | null>(null);

  function toggleExpand(method: CalculationMethod, e: React.MouseEvent) {
    e.stopPropagation();
    setExpandedMethod(expandedMethod === method ? null : method);
  }

  const [subjects, setSubjects] = useState<SubjectInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [usage, setUsage] = useState<Record<string, { lecture: number, lab: number }>>({});

  useEffect(() => {
    if (id) {
      loadSemester(id);
    }
  }, [id]);

  async function loadSemester(semesterId: string) {
    try {
      const [data, attendance] = await Promise.all([
        api.semesters.get(semesterId),
        api.attendance.getBySemester(semesterId)
      ]);
      
      setName(data.name);
      setThreshold(data.threshold);
      setCalculationMethod(data.calculationMethod ?? 'split_average');
      setSubjects(
        data.subjects.map(s => ({
          id: s.id,
          name: s.name,
          hasLecture: s.hasLecture,
          hasLab: s.hasLab
        }))
      );

      const stats: Record<string, { lecture: number, lab: number }> = {};
      attendance.forEach(r => {
        if (!stats[r.subjectId]) stats[r.subjectId] = { lecture: 0, lab: 0 };
        stats[r.subjectId][r.type as 'lecture' | 'lab']++;
      });
      setUsage(stats);
    } catch {
      setError('Failed to load semester data.');
    } finally {
      setLoading(false);
    }
  }

  function addSubject() {
    setSubjects([...subjects, { name: '', hasLecture: true, hasLab: false }]);
  }

  function removeSubject(index: number) {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((_, i) => i !== index));
  }

  function updateSubject(index: number, updates: Partial<SubjectInput>) {
    setSubjects(
      subjects.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  }

  function handleToggleType(index: number, type: 'lecture' | 'lab') {
    setError('');
    const subject = subjects[index];
    const isCurrentlyOn = type === 'lecture' ? subject.hasLecture : subject.hasLab;
    
    if (isCurrentlyOn && subject.id) {
      const stats = usage[subject.id];
      if (stats && stats[type] > 0) {
        setModalError(`Cannot disable ${type} for "${subject.name}" because it already has attendance records logged.`);
        return;
      }
    }
    
    updateSubject(index, { [type === 'lecture' ? 'hasLecture' : 'hasLab']: !isCurrentlyOn });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a semester name');
      return;
    }

    const validSubjects = subjects.filter((s) => s.name.trim());
    if (validSubjects.length === 0) {
      setError('Add at least one subject');
      return;
    }

    const invalidSubjects = validSubjects.filter(
      (s) => !s.hasLecture && !s.hasLab
    );
    if (invalidSubjects.length > 0) {
      setError(`"${invalidSubjects[0].name}" must have at least lecture or lab enabled`);
      return;
    }

    setSaving(true);
    try {
      if (!id) throw new Error('No semester ID found');

      await api.semesters.update(id, { name: name.trim(), threshold, calculationMethod });
      
      await api.semesters.updateSubjects(
        id,
        validSubjects.map((s) => ({
          id: s.id,
          name: s.name.trim(),
          hasLecture: s.hasLecture,
          hasLab: s.hasLab,
        }))
      );

      navigate('/semesters');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save semester');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-9 w-48 rounded shimmer" />
        </div>
        <div className="h-44 rounded-xl shimmer" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="eyebrow">Semester / Edit</span>
        <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
          Edit semester
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Modify semester properties, threshold target, and active course list.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Semester Name */}
        <div className="ledger-card p-6">
          <label className="eyebrow block mb-2">Semester Title</label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Semester 5"
              className="w-full rounded-lg border border-border-strong bg-card py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Threshold */}
        <div className="ledger-card p-6">
          <span className="eyebrow block mb-1">Target Threshold</span>
          <h2 className="font-serif text-xl font-normal text-text-primary mb-1">
            Minimum Attendance Required
          </h2>
          <p className="text-xs text-text-secondary mb-6">
            Recalibrates safe skips and recovery targets across your classes.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Target</span>
              <span className="font-serif text-2xl font-semibold text-text-primary tabular-nums">
                {threshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-forest-800 dark:accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>50%</span>
              <span>75% (Standard)</span>
              <span>95%</span>
            </div>
          </div>
        </div>

        {/* Calculation Method */}
        <div className="ledger-card p-6">
          <span className="eyebrow block mb-1">Calculation Policy</span>
          <h2 className="font-serif text-xl font-normal text-text-primary mb-1">
            Attendance calculation method
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            How your university calculates lab vs lecture weights.
          </p>

          <div className="space-y-3">
            {/* Total Sessions Option */}
            <div
              onClick={() => setCalculationMethod('total_sessions')}
              className={cn(
                'rounded-lg border p-4 transition-colors cursor-pointer',
                calculationMethod === 'total_sessions'
                  ? 'border-forest-800 dark:border-accent bg-panel/60 shadow-xs'
                  : 'border-border-subtle bg-card hover:bg-panel/30'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      calculationMethod === 'total_sessions'
                        ? 'border-forest-800 dark:border-accent bg-forest-800 dark:bg-cta-bg text-text-on-dark'
                        : 'border-border-strong bg-card'
                    )}
                  >
                    {calculationMethod === 'total_sessions' && <Check className="h-3 w-3" />}
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    Total Sessions (Raw Combined)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleExpand('total_sessions', e)}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary py-1 px-2 rounded transition-colors"
                >
                  <span>{expandedMethod === 'total_sessions' ? 'Hide details' : 'View formula'}</span>
                  {expandedMethod === 'total_sessions' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {expandedMethod === 'total_sessions' && (
                <div className="mt-3 pt-3 border-t border-border-subtle text-xs text-text-secondary space-y-1.5">
                  <p>Every lecture and lab carries equal weight. Missing 1 lab counts the same as missing 1 lecture.</p>
                  <div className="rounded bg-panel p-2 font-mono text-[11px] text-text-primary">
                    Formula: (Total Attended / Total Conducted) × 100
                  </div>
                </div>
              )}
            </div>

            {/* Split Average Option */}
            <div
              onClick={() => setCalculationMethod('split_average')}
              className={cn(
                'rounded-lg border p-4 transition-colors cursor-pointer',
                calculationMethod === 'split_average'
                  ? 'border-forest-800 dark:border-accent bg-panel/60 shadow-xs'
                  : 'border-border-subtle bg-card hover:bg-panel/30'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      calculationMethod === 'split_average'
                        ? 'border-forest-800 dark:border-accent bg-forest-800 dark:bg-cta-bg text-text-on-dark'
                        : 'border-border-strong bg-card'
                    )}
                  >
                    {calculationMethod === 'split_average' && <Check className="h-3 w-3" />}
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    Component Average (50 / 50 Split)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleExpand('split_average', e)}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary py-1 px-2 rounded transition-colors"
                >
                  <span>{expandedMethod === 'split_average' ? 'Hide details' : 'View formula'}</span>
                  {expandedMethod === 'split_average' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {expandedMethod === 'split_average' && (
                <div className="mt-3 pt-3 border-t border-border-subtle text-xs text-text-secondary space-y-1.5">
                  <p>Lectures and labs are averaged independently. Missing a lab hurts significantly more due to fewer total sessions.</p>
                  <div className="rounded bg-panel p-2 font-mono text-[11px] text-text-primary">
                    Formula: (Lecture % + Lab %) / 2
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="ledger-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="eyebrow">Curriculum</span>
              <h2 className="font-serif text-xl font-normal text-text-primary mt-0.5">
                Enrolled subjects
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {subjects.map((subject, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-border-subtle bg-panel/20 p-3.5"
              >
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={subject.name}
                    onChange={(e) => updateSubject(index, { name: e.target.value })}
                    placeholder={`Subject ${index + 1} Name`}
                    className="w-full rounded-md border border-border-strong bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleType(index, 'lecture')}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border transition-colors',
                        subject.hasLecture
                          ? 'border-forest-800 dark:border-accent bg-forest-800 dark:bg-cta-bg text-text-on-dark font-semibold'
                          : 'border-border-strong bg-card text-text-muted hover:text-text-primary'
                      )}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Lectures
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleType(index, 'lab')}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border transition-colors',
                        subject.hasLab
                          ? 'border-forest-800 dark:border-accent bg-forest-800 dark:bg-cta-bg text-text-on-dark font-semibold'
                          : 'border-border-strong bg-card text-text-muted hover:text-text-primary'
                      )}
                    >
                      <FlaskConical className="h-3.5 w-3.5" />
                      Labs
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSubject(index)}
                  disabled={subjects.length <= 1}
                  className="mt-1 flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-risk-bg hover:text-risk transition-colors disabled:opacity-20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSubject}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-card px-4 py-2.5 text-xs font-medium text-text-primary hover:bg-panel transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Another Subject
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-risk/40 bg-risk-bg/20 p-3 text-xs text-risk">
            {error}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/semesters')}
            className="rounded-lg border border-border-strong bg-card px-4 py-2 text-xs font-medium text-text-secondary hover:bg-panel transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-forest-800 dark:bg-cta-bg text-text-on-dark px-6 py-2 text-xs font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Modal Error */}
      {modalError && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="ledger-card w-full max-w-sm p-6 text-center border-risk/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-risk-bg text-risk mx-auto mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-xl font-normal text-text-primary mb-2">Cannot Disable Component</h2>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              {modalError}
            </p>
            <button
              onClick={() => setModalError('')}
              className="w-full rounded-md border border-border-strong bg-card py-2 text-xs font-medium text-text-primary hover:bg-panel transition-colors"
            >
              Understood
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
