import { useState } from 'react';
import { Link } from 'react-router';
import { calculators, type Calculator } from '@/lib/public-calculators';
import { calculateAttendance } from '@/lib/public-attendance.mjs';

export default function PublicCalculator({ calculator }: { calculator: Calculator }) {
  const [attended, setAttended] = useState('30');
  const [total, setTotal] = useState('40');
  const [target, setTarget] = useState('75');
  const fixed = calculator.mode === 'target';
  const threshold = fixed ? 75 : Number(target);
  let result: ReturnType<typeof calculateAttendance> | null = null;
  try {
    if (attended.trim() && total.trim() && (fixed || target.trim())) {
      result = calculateAttendance(Number(attended), Number(total), threshold);
    }
  } catch { /* invalid inputs are explained below */ }
  const pct = result?.percentage == null ? 'Not available yet' : result.percentage.toFixed(2) + '%';
  const recovery = result?.recovery === null ? 'Not achievable by attending future classes alone' : String(result?.recovery ?? '');
  const results = [
    { key: 'attendance', label: 'Current attendance', value: pct },
    { key: 'bunk', label: 'Safe classes to miss', value: String(result?.safeSkips ?? '') },
    { key: 'recovery', label: 'Consecutive classes to attend', value: recovery },
  ];
  const priority = fixed ? 'attendance' : calculator.mode;
  results.sort((a,b) => Number(b.key === priority) - Number(a.key === priority));
  return (
    <main className="min-h-screen bg-page text-text-primary px-5 py-10">
      <div className="max-w-2xl mx-auto space-y-7">
        <nav className="flex justify-between items-center text-sm"><Link to="/" className="font-semibold">Atten-Dance</Link><Link to="/login?mode=signup">Create free account</Link></nav>
        <header className="space-y-3"><h1 className="font-serif text-4xl">{calculator.title}</h1><p className="text-text-secondary">{calculator.description}</p></header>
        <section className="ledger-card p-6 space-y-5" aria-label="Attendance calculator">
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="text-sm space-y-2">Classes attended<input className="block w-full rounded-lg border border-border-strong bg-page p-3" type="number" min="0" max="1000000" step="1" value={attended} onChange={e=>setAttended(e.target.value)} /></label>
            <label className="text-sm space-y-2">Total classes<input className="block w-full rounded-lg border border-border-strong bg-page p-3" type="number" min="0" max="1000000" step="1" value={total} onChange={e=>setTotal(e.target.value)} /></label>
            <label className="text-sm space-y-2">Target (%)<input className="block w-full rounded-lg border border-border-strong bg-page p-3" type="number" min="1" max="100" step="1" value={fixed?'75':target} readOnly={fixed} onChange={e=>setTarget(e.target.value)} /></label>
          </div>
          <div aria-live="polite" className="space-y-3">
            {!result ? <p className="text-risk">Enter whole numbers: attended must not exceed total, and target must be 1–100%.</p> : <>
              {results.map(item=><div key={item.key} className="rounded-lg bg-panel p-4"><p className="text-sm text-text-secondary">{item.label}</p><p className="text-2xl font-semibold">{item.value}</p></div>)}
              {result.percentage !== null && <p>{result.meetsTarget?'You meet your attendance target.':'You are below your attendance target.'}</p>}
              {result.percentage === null && <p>No classes have been held yet.</p>}
            </>}
          </div>
        </section>
        <section className="space-y-3"><h2 className="font-serif text-2xl">How to calculate attendance</h2>
          <p>Attendance percentage = attended classes ÷ total classes × 100. Safe skips assume every future skipped class increases the total by one. Recovery assumes every future class is attended.</p>
          <p>This calculator counts all sessions equally. If your college calculates lecture and lab percentages separately, use the full Atten-Dance tracker to model your actual rules.</p>
          <Link to="/login?mode=signup" className="inline-block rounded-lg bg-forest-800 text-text-on-dark px-5 py-3">Track my attendance</Link>
        </section>
        <section className="space-y-3"><h2 className="font-serif text-2xl">Other free calculators</h2><nav className="flex flex-wrap gap-4">{calculators.filter(item=>item.path!==calculator.path).map(item=><Link key={item.path} to={item.path} className="underline">{item.title}</Link>)}</nav></section>
      </div>
    </main>
  );
}
