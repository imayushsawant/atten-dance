import { useState } from 'react';
import { Link } from 'react-router';
import {
  ShieldCheckIcon,
  HeartPulseIcon,
  CalculatorIcon,
  HistoryIcon,
  ChevronRightIcon,
  MenuIcon,
  CloseIcon,
  SunIcon,
  MoonIcon,
  TargetIcon,
  CheckCircleIcon,
} from '@/components/icons';
import { Logo } from '@/components/logo';
import { useTheme } from '@/lib/theme-provider';
import { InteractiveDemo } from './landing/interactive-demo';

export default function LandingPage() {
  const { resolved, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-page text-text-primary font-sans antialiased selection:bg-accent/20 selection:text-text-primary">
      {/* ──────────────── Sticky Header ──────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-page/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-accent rounded-lg"
            aria-label="Atten-Dance Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-panel border border-border-subtle text-accent p-1.5 shadow-2xs group-hover:border-border-strong transition-colors">
              <Logo className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-text-primary flex items-center leading-none">
                Atten<span className="text-text-primary dark:text-white">-</span>Dance
              </div>
              <span className="text-xs text-text-muted hidden sm:block mt-1 font-normal">
                Because colleges make you dance for attendance.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-text-secondary" aria-label="Main Navigation">
            <button
              onClick={() => scrollToSection('demo')}
              className="hover:text-text-primary transition-colors cursor-pointer py-1"
            >
              Live Demo
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-text-primary transition-colors cursor-pointer py-1"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-text-primary transition-colors cursor-pointer py-1"
            >
              How It Works
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-panel rounded-lg transition-colors border border-transparent hover:border-border-subtle"
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
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-panel border border-border-subtle hover:border-border-strong transition-colors"
            >
              Log in
            </Link>

            {/* Primary CTA: Sign up */}
            <Link
              to="/login?mode=signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-forest-800 dark:bg-cta-bg text-text-on-dark text-xs font-medium hover:opacity-95 transition-opacity shadow-xs focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span>Sign up</span>
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Actions: Theme + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
              className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {resolved === 'dark' ? (
                <SunIcon className="h-4 w-4 text-warn" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-panel transition-colors border border-border-subtle"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border-subtle bg-card px-4 pt-3 pb-5 space-y-3 animate-fade-in shadow-sm">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-text-secondary">
              <button
                onClick={() => scrollToSection('demo')}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-panel text-left cursor-pointer"
              >
                <span>Live Interactive Demo</span>
                <ChevronRightIcon className="h-4 w-4 text-text-muted" />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-panel text-left cursor-pointer"
              >
                <span>Product Features</span>
                <ChevronRightIcon className="h-4 w-4 text-text-muted" />
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-panel text-left cursor-pointer"
              >
                <span>How It Works</span>
                <ChevronRightIcon className="h-4 w-4 text-text-muted" />
              </button>
            </nav>

            <div className="pt-3 border-t border-border-subtle flex flex-col gap-2">
              <Link
                to="/login?mode=signup"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-forest-800 dark:bg-cta-bg text-text-on-dark py-3 text-xs font-semibold shadow-xs"
              >
                <span>Sign up for free</span>
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/login?mode=login"
                className="w-full flex items-center justify-center rounded-lg border border-border-strong py-2.5 text-xs font-medium text-text-secondary hover:bg-panel"
              >
                Log in to existing account
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ──────────────── Hero Section ──────────────── */}
        <section className="pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            {/* Editorial Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chip border border-border-subtle text-[11px] font-semibold text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="tracking-[0.18em] uppercase">Attendance Intelligence For College</span>
            </div>

            {/* H1 Display Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-text-primary leading-[1.12]">
              Stop guessing. Know your attendance margin before you skip.
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
            <div className="mb-6 text-center max-w-2xl mx-auto space-y-1.5">
              <span className="eyebrow">Interactive Live Demo</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary">
                Experience Atten-Dance with real components
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                This is the actual production app running completely in-memory. Test actions, inspect safe bunks, and watch your percentage adapt.
              </p>
            </div>

            <InteractiveDemo />
          </div>
        </section>

        {/* ──────────────── Feature Grid Section ──────────────── */}
        <section id="features" className="py-16 sm:py-24 bg-panel/30 border-y border-border-subtle scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16 space-y-2">
              <span className="eyebrow">Engineered For College Realities</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary">
                Every calculation your college makes, solved for you
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Colleges enforce rigid 75% or 80% attendance thresholds with debarment consequences. Atten-Dance gives you complete mathematical foresight.
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
