export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Welcome to KaryaDhara. Your tasks await.</p>
      <div className="mt-8 rounded-lg border bg-card p-8 text-center text-muted-foreground">
        <p className="text-lg">Task management coming soon.</p>
        <p className="mt-2 text-sm">Press <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">Ctrl+K</kbd> to open the command palette.</p>
      </div>
    </div>
  );
}
