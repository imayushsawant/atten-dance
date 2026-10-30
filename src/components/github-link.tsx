export function GitHubLink() {
  return (
    <a
      href="https://github.com/imayushsawant/atten-dance"
      target="_blank"
      rel="noopener noreferrer"
      title="Star on GitHub"
      aria-label="Star on GitHub"
      className="fixed top-2.5 right-4 lg:top-6 lg:right-6 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-border hover:bg-secondary hover:text-foreground shadow-sm group"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4.5 w-4.5 fill-current transition-transform duration-200 group-hover:scale-110"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    </a>
  );
}
