import { ThemeToggle } from "@/components/theme-toggle";
import { CheckSquare, Layers, Zap, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">KaryaDhara</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <span>Ctrl</span>+<span>K</span>
          </kbd>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              KaryaDhara
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              A scalable task planner to organize, prioritize, and track your
              work efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card">
              <Layers className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Organize</h3>
              <p className="text-sm text-muted-foreground">
                Structure tasks with boards, lists, and cards
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card">
              <Zap className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Prioritize</h3>
              <p className="text-sm text-muted-foreground">
                Focus on what matters with smart prioritization
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card">
              <Search className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Find Fast</h3>
              <p className="text-sm text-muted-foreground">
                Command palette (Ctrl+K) for instant access
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        KaryaDhara &mdash; Built with Next.js, Tailwind CSS & shadcn/ui
      </footer>
    </div>
  );
}
