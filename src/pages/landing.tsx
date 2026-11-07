import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  ShieldCheckIcon,
  HeartPulseIcon,
  CalculatorIcon,
  HistoryIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  TargetIcon,
  CheckCircleIcon,
  GithubIcon,
} from '@/components/icons';
import { Logo } from '@/components/logo';
import { useTheme } from '@/lib/theme-provider';
import { InteractiveDemo } from './landing/interactive-demo';

export default function LandingPage() {
  const { resolved, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 30;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-page text-text-primary font-sans antialiased selection:bg-accent/20 selection:text-text-primary">
      {/* ──────────────── Animated Floating Dynamic Navbar ──────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled ? 'pt-3 sm:pt-4' : 'pt-4 sm:pt-6'
        }`}
      >
        <div
          className={`mx-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? 'w-full max-w-full px-4 sm:px-6 lg:px-8'
              : 'w-full max-w-4xl px-4 sm:px-6'
          }`}
        >
          <div
            className={`flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isScrolled
                ? 'bg-transparent border-transparent shadow-none p-0'
                : 'bg-card/85 dark:bg-panel/85 backdrop-blur-md border border-border-subtle shadow-sm rounded-full p-2 sm:px-4 sm:py-2'
            }`}
          >
            {/* Left Section: Logo & Brand Name */}
            <div
              className={`pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isScrolled
                  ? 'bg-card/90 dark:bg-panel/90 backdrop-blur-md border border-border-subtle shadow-md rounded-full px-3.5 py-1.5'
                  : 'bg-transparent border-transparent shadow-none p-0'
              }`}
            >
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-2 focus-visible:outline-accent rounded-full"
                aria-label="Atten-Dance Home"
              >
                <div className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-panel border border-border-subtle text-accent p-1.5 shadow-2xs group-hover:border-border-strong transition-colors shrink-0">
                  <Logo className="h-full w-full object-contain" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-semibold tracking-tight text-text-primary leading-none">
                    Atten<span className="text-text-primary dark:text-white">-</span>Dance
                  </span>
                  {!isScrolled && (
                    <span className="text-[11px] text-text-muted hidden md:inline font-normal pl-2 border-l border-border-subtle leading-none">
                      Because colleges make you dance for attendance.
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Right Section: GitHub, Theme Toggle, Login, Signup */}
            <div
              className={`pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isScrolled
                  ? 'bg-card/90 dark:bg-panel/90 backdrop-blur-md border border-border-subtle shadow-md rounded-full px-3 py-1.5'
                  : 'bg-transparent border-transparent shadow-none p-0'
              }`}
            >
              {/* GitHub Link */}
              <a
                href="https://github.com/imayushsawant/atten-dance"
                target="_blank"
                rel="noopener noreferrer"
                title="Star Atten-Dance on GitHub"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-panel transition-colors"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span className="hidden md:inline text-[11px]">GitHub</span>
              </a>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-panel rounded-full transition-colors"
                aria-label="Toggle visual theme"
              >
                {resolved === 'dark' ? (
                  <SunIcon className="h-4 w-4 text-warn" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
              </button>

              {/* Secondary CTA: Log in */}
              <Link
                to="/login?mode=login"
                className="px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-panel transition-colors"
              >
                Log in
              </Link>

              {/* Primary CTA: Sign up */}
              <Link
                to="/login?mode=signup"
                className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-full bg-forest-800 dark:bg-cta-bg text-text-on-dark text-xs font-medium hover:opacity-95 transition-opacity shadow-xs focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span>Sign up</span>
                <ChevronRightIcon className="h-3 w-3 hidden sm:inline" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ──────────────── Hero Section ──────────────── */}
        <section className="pt-24 sm:pt-28 lg:pt-36 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            {/* H1 Display Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-text-primary leading-[1.15]">
              Stop guessing,<br />
              know exactly how many<br />
              lectures you can skip.
            </h1>

            {/* Benefit-Driven One-Sentence Subheadline */}
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Know exactly how many lectures you can skip, how many you must attend to recover, and where your attendance is heading, before it becomes a problem.
            </p>

            {/* CTA Cluster */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/login?mode=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-forest-800 dark:bg-cta-bg px-6 py-3.5 text-sm font-medium text-text-on-dark hover:opacity-95 transition-opacity shadow-sm"
              >
                <span>Create free account</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Link>

              <button
                onClick={() => scrollToSection('demo')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong bg-card px-5 py-3.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-panel transition-colors"
              >
                <TargetIcon className="h-4 w-4 text-forest-800 dark:text-accent" />
                <span>Try the live demo below</span>
              </button>
            </div>

            {/* Micro Feature Chips */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="h-3.5 w-3.5 text-ok" />
                Exact Safe Skips
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="h-3.5 w-3.5 text-ok" />
                Consecutive Recovery Quotas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="h-3.5 w-3.5 text-ok" />
                Scenario Simulator
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="h-3.5 w-3.5 text-ok" />
                100% Free & Private
              </span>
            </div>
          </div>

          {/* ──────────────── Interactive Demo (Visual Centerpiece) ──────────────── */}
          <div id="demo" className="mt-12 sm:mt-16 scroll-mt-24">
            <div className="mb-6 text-center max-w-2xl mx-auto space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary">
                Experience attendance
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                See how it works in real time: select subjects, mark sessions, and watch your safe skips and recovery targets calculate dynamically below.
              </p>
            </div>

            <InteractiveDemo />
          </div>
        </section>

        {/* ──────────────── Feature Grid Section ──────────────── */}
        <section id="features" className="py-16 sm:py-24 bg-panel/30 border-y border-border-subtle scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16 space-y-2">
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary">
                Know if you can safely sleep in tomorrow.
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Stop guessing on back-of-the-napkin math. Atten-Dance calculates your real-time safe skips, recovery streaks, and exam buffers for every course.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1: Safe Skips */}
              <div className="ledger-card p-6 flex flex-col justify-between hover:border-border-strong transition-colors">
                <div>
                  <div className="h-11 w-11 rounded-xl bg-ok-bg text-ok flex items-center justify-center mb-5">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>
                  <span className="eyebrow text-[10px] block mb-1">Threshold Buffer</span>
                  <h3 className="font-serif text-xl font-normal text-text-primary mb-2.5">
                    Safe Skips Planning
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Calculate the exact number of lectures and labs you can miss right now without breaching your university minimum threshold.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border-subtle text-[11px] font-semibold text-ok flex items-center gap-1">
                  <span>Know before you sleep in</span>
                  <ChevronRightIcon className="h-3 w-3" />
                </div>
              </div>

              {/* Feature 2: Recovery Calculator */}
              <div className="ledger-card p-6 flex flex-col justify-between hover:border-border-strong transition-colors">
                <div>
                  <div className="h-11 w-11 rounded-xl bg-risk-bg text-risk flex items-center justify-center mb-5">
                    <HeartPulseIcon className="h-5 w-5" />
                  </div>
                  <span className="eyebrow text-[10px] block mb-1">Debarment Avoidance</span>
                  <h3 className="font-serif text-xl font-normal text-text-primary mb-2.5">
                    Recovery Calculator
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Fallen below 75%? Avoid guesswork. Get the exact streak of consecutive classes or balanced lecture/lab combinations required to recover good standing.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border-subtle text-[11px] font-semibold text-risk flex items-center gap-1">
                  <span>Clear attendance shortages</span>
                  <ChevronRightIcon className="h-3 w-3" />
                </div>
              </div>

              {/* Feature 3: Predictor */}
              <div className="ledger-card p-6 flex flex-col justify-between hover:border-border-strong transition-colors">
                <div>
                  <div className="h-11 w-11 rounded-xl bg-chip text-text-primary flex items-center justify-center mb-5 border border-border-subtle">
                    <CalculatorIcon className="h-5 w-5 text-forest-800 dark:text-accent" />
                  </div>
                  <span className="eyebrow text-[10px] block mb-1">Scenario Simulator</span>
                  <h3 className="font-serif text-xl font-normal text-text-primary mb-2.5">
                    Attendance Predictor
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Test "what-if" scenarios ahead of time. See how attending next week's labs or missing Friday's lectures alters your final semester percentage.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border-subtle text-[11px] font-semibold text-forest-700 dark:text-text-primary flex items-center gap-1">
                  <span>Forecast term trajectories</span>
                  <ChevronRightIcon className="h-3 w-3" />
                </div>
              </div>

              {/* Feature 4: Verification History */}
              <div className="ledger-card p-6 flex flex-col justify-between hover:border-border-strong transition-colors">
                <div>
                  <div className="h-11 w-11 rounded-xl bg-panel text-forest-700 dark:text-text-primary flex items-center justify-center mb-5 border border-border-subtle">
                    <HistoryIcon className="h-5 w-5" />
                  </div>
                  <span className="eyebrow text-[10px] block mb-1">Tamper-Proof Audit</span>
                  <h3 className="font-serif text-xl font-normal text-text-primary mb-2.5">
                    Verification History
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Inspect your chronological session records by subject and date. Dispute inaccurate college attendance sheets with verified historical data.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border-subtle text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                  <span>Cross-check professor registers</span>
                  <ChevronRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────── How It Works Section ──────────────── */}
        <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16 space-y-2">
            <span className="eyebrow">Three Simple Steps</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary">
              How Atten-Dance keeps you safe
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Designed for speed so you can update attendance between classes in under five seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="ledger-card p-6 sm:p-8 relative flex flex-col">
              <span className="font-serif text-4xl font-semibold text-accent/80 mb-4 block">01</span>
              <h3 className="font-serif text-xl font-normal text-text-primary mb-2">
                Set up subjects & target
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Add your course schedule, toggle whether each subject has lectures and labs, and set your college threshold (e.g. 75% or 80%).
              </p>
            </div>

            {/* Step 2 */}
            <div className="ledger-card p-6 sm:p-8 relative flex flex-col">
              <span className="font-serif text-4xl font-semibold text-accent/80 mb-4 block">02</span>
              <h3 className="font-serif text-xl font-normal text-text-primary mb-2">
                Log attendance in two taps
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Tap Present or Bunked right from your phone. Atten-Dance records the class order, date, and updates your margin instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="ledger-card p-6 sm:p-8 relative flex flex-col">
              <span className="font-serif text-4xl font-semibold text-accent/80 mb-4 block">03</span>
              <h3 className="font-serif text-xl font-normal text-text-primary mb-2">
                Know where you stand
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Check safe skips before taking off, simulate exam weeks, and follow consecutive recovery quotas whenever a subject drops into risk.
              </p>
            </div>
          </div>
        </section>

        {/* ──────────────── Call to Action Banner ──────────────── */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border-strong bg-panel/70 p-8 sm:p-12 text-center shadow-xs space-y-6">
            <span className="eyebrow block">Ready For Total Attendance Control?</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary tracking-tight max-w-xl mx-auto">
              Never get debarred from semester exams again.
            </h2>
            <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
              Join thousands of students who track their attendance with mathematical certainty. No spreadsheets, no mental arithmetic, no surprises.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/login?mode=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-forest-800 dark:bg-cta-bg px-7 py-3.5 text-sm font-medium text-text-on-dark hover:opacity-95 transition-opacity shadow-sm"
              >
                <span>Create free account</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to="/login?mode=login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-border-strong bg-card text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-panel transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ──────────────── Footer ──────────────── */}
      <footer className="border-t border-border-subtle bg-card py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel border border-border-subtle text-accent p-1.5 shadow-2xs">
              <Logo className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-semibold text-sm text-text-primary tracking-tight">
                Atten<span className="text-text-primary dark:text-white">-</span>Dance
              </span>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                Because colleges make you dance for attendance.
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-text-secondary">
            <button
              onClick={() => scrollToSection('demo')}
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              Demo
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <Link to="/login?mode=login" className="hover:text-text-primary transition-colors">
              Log in
            </Link>
            <Link to="/login?mode=signup" className="hover:text-text-primary transition-colors font-medium">
              Sign up
            </Link>
          </div>

          {/* Copyright & Local First Notice */}
          <div className="text-xs text-text-muted text-center sm:text-right">
            <span>© {new Date().getFullYear()} Atten-Dance. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
