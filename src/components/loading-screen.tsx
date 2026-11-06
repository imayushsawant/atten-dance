import { Logo } from '@/components/logo';

export default function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] h-screen w-full flex flex-col items-center justify-center bg-page text-text-primary select-none">
      <div className="flex flex-col items-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel border border-border-subtle text-accent p-3 shadow-xs animate-pulse">
          <Logo className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-semibold tracking-tight text-text-primary font-serif">
            Atten<span className="text-text-primary dark:text-white">-</span>Dance
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
            <span>Checking session…</span>
          </div>
        </div>
      </div>
    </div>
  );
}

