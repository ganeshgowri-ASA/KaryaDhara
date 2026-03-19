export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        KaryaDhara
      </h1>
      <p className="max-w-[600px] text-lg text-muted-foreground sm:text-xl">
        A scalable task planner to organize, prioritize, and manage your work
        efficiently. Plan smarter, deliver faster.
      </p>
      <div className="flex gap-4">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground">
          Get Started
        </div>
        <div className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
          Learn More
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Press{" "}
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
          Ctrl+K
        </kbd>{" "}
        to open the command palette
      </p>
    </div>
  );
}
