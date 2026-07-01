const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Types ───────────────────────────────────────────────
export type Semester = {
  id: string;
  name: string;
  isActive: boolean;
  threshold: number;
  createdAt: string;
  subjects?: Subject[];
};

export type Subject = {
  id: string;
  semesterId: string;
  name: string;
  hasLecture: boolean;
  hasLab: boolean;
};

export type AttendanceRecord = {
  id: string;
  subjectId: string;
  semesterId: string;
  type: 'lecture' | 'lab';
  status: 'attended' | 'skipped';
  date: string;
  createdAt: string;
};

export type SubjectStats = {
  subjectId: string;
  subjectName: string;
  lecture: { attended: number; total: number; percentage: number };
  lab: { attended: number; total: number; percentage: number };
  combined: { attended: number; total: number; percentage: number };
  safeSkips: { lecture: number; lab: number; combined: number };
  recovery: { lecture: number; lab: number };
};

export type Analytics = {
  semester: Semester;
  subjects: Subject[];
  stats: SubjectStats[];
  overall: {
    attended: number;
    total: number;
    percentage: number;
    recovery: { combined: number; lecture: number; lab: number; combinations: { lecture: number; lab: number; resultingPercentage: number }[] };
    safeSkips: { lecture: number; lab: number; combinations: { lecture: number; lab: number; resultingPercentage: number }[] };
  };
  threshold: number;
};

export type TargetResult = {
  target: number;
  overall: {
    current: number;
    sessionsNeeded: { combined: number; lecture: number; lab: number; combinations: { lecture: number; lab: number; resultingPercentage: number }[] };
  };
  results: {
    subjectId: string;
    subjectName: string;
    lecture: { current: number; sessionsNeeded: number };
    lab: { current: number; sessionsNeeded: number };
  }[];
};

// ─── Semesters ───────────────────────────────────────────

export const api = {
  semesters: {
    list: () => request<Semester[]>('/semesters'),
    getActive: () => request<(Semester & { subjects: Subject[] }) | null>('/semesters/active'),
    get: (id: string) => request<Semester & { subjects: Subject[] }>(`/semesters/${id}`),
    create: (data: { name: string; subjects: { name: string; hasLecture: boolean; hasLab: boolean }[]; threshold?: number }) =>
      request<Semester & { subjects: Subject[] }>('/semesters', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string; threshold?: number }) =>
      request<Semester>(`/semesters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    activate: (id: string) =>
      request<Semester>(`/semesters/${id}/activate`, { method: 'PUT' }),
    updateSubjects: (id: string, subjects: { name: string; hasLecture: boolean; hasLab: boolean }[]) =>
      request<Subject[]>(`/semesters/${id}/subjects`, { method: 'PUT', body: JSON.stringify({ subjects }) }),
    delete: (id: string) =>
      request<Semester>(`/semesters/${id}`, { method: 'DELETE' }),
  },

  attendance: {
    getBySemester: (semesterId: string) =>
      request<AttendanceRecord[]>(`/attendance/${semesterId}`),
    getByDate: (semesterId: string, date: string) =>
      request<AttendanceRecord[]>(`/attendance/${semesterId}/date/${date}`),
    create: (data: { subjectId: string; semesterId: string; type: string; status: string; date: string }) =>
      request<AttendanceRecord>('/attendance', { method: 'POST', body: JSON.stringify(data) }),
    createBulk: (records: { subjectId: string; semesterId: string; type: string; status: string; date: string }[]) =>
      request<AttendanceRecord[]>('/attendance/bulk', { method: 'POST', body: JSON.stringify({ records }) }),
    delete: (id: string) =>
      request<AttendanceRecord>(`/attendance/record/${id}`, { method: 'DELETE' }),
  },

  analytics: {
    get: (semesterId: string, threshold?: number) =>
      request<Analytics>(`/analytics/${semesterId}${threshold ? `?threshold=${threshold}` : ''}`),
    getTarget: (semesterId: string, target: number) =>
      request<TargetResult>(`/analytics/${semesterId}/target?target=${target}`),
  },

  settings: {
    get: () => request<Record<string, string>>('/settings'),
    update: (data: Record<string, string>) =>
      request<Record<string, string>>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
};
