import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, BookOpen, FlaskConical, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';

type SubjectInput = {
  name: string;
  hasLecture: boolean;
  hasLab: boolean;
};

export default function CreateSemester() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [subjects, setSubjects] = useState<SubjectInput[]>([
    { name: '', hasLecture: true, hasLab: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      const created = await api.semesters.create({
        name: name.trim(),
        subjects: validSubjects.map((s) => ({
          name: s.name.trim(),
          hasLecture: s.hasLecture,
          hasLab: s.hasLab,
        })),
      });
      // Activate the new semester
      await api.semesters.activate(created.id);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create semester');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Semester</h1>
        <p className="text-muted-foreground">
          Set up your subjects for the new semester
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Semester Name */}
        <div className="glass rounded-xl p-5">
          <label className="block text-sm font-medium mb-2">Semester Name</label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Semester 5"
              className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Subjects */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">Subjects</label>
            <button
              type="button"
              onClick={addSubject}
              className="flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/25 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Subject
            </button>
          </div>

          <div className="space-y-3">
            {subjects.map((subject, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-border bg-background/30 p-3"
              >
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={subject.name}
                    onChange={(e) =>
                      updateSubject(index, { name: e.target.value })
                    }
                    placeholder={`Subject ${index + 1}`}
                    className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div
                        className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all ${
                          subject.hasLecture
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'bg-secondary text-muted-foreground border border-transparent hover:bg-secondary/80'
                        }`}
                        onClick={() =>
                          updateSubject(index, {
                            hasLecture: !subject.hasLecture,
                          })
                        }
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Lecture
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div
                        className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all ${
                          subject.hasLab
                            ? 'bg-chart-4/15 text-chart-4 border border-chart-4/30'
                            : 'bg-secondary text-muted-foreground border border-transparent hover:bg-secondary/80'
                        }`}
                        onClick={() =>
                          updateSubject(index, { hasLab: !subject.hasLab })
                        }
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        Lab
                      </div>
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSubject(index)}
                  disabled={subjects.length <= 1}
                  className="mt-1 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-danger/15 hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 glow-primary disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create Semester'}
          </button>
        </div>
      </form>
    </div>
  );
}
