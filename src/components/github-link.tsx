import { GithubIcon } from '@/components/icons';

export function GitHubLink({ className }: { className?: string }) {
  return (
    <a
      href="https://github.com/imayushsawant/atten-dance"
      target="_blank"
      rel="noopener noreferrer"
      title="Star on GitHub"
      aria-label="Star on GitHub"
      className={
        className ||
        'inline-flex items-center gap-2 rounded-lg border border-border-strong bg-card px-3.5 py-2 text-xs font-medium text-text-secondary hover:bg-panel hover:text-text-primary transition-colors shadow-xs'
      }
    >
      <GithubIcon className="h-4 w-4" />
      <span>Star on GitHub</span>
    </a>
  );
}
