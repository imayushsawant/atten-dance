import { GithubIcon } from '@/components/icons';

export function GitHubLink() {
  return (
    <a
      href="https://github.com/imayushsawant/atten-dance"
      target="_blank"
      rel="noopener noreferrer"
      title="Star on GitHub"
      aria-label="Star on GitHub"
      className="hidden lg:flex fixed top-5 right-5 z-30 h-8 w-8 items-center justify-center rounded-lg border border-border-strong bg-card text-text-muted transition-colors hover:bg-panel hover:text-text-primary"
    >
      <GithubIcon className="h-4 w-4" />
    </a>
  );
}
