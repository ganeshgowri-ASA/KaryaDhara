"use client";

import { Command, Zap, Globe, LayoutGrid, KeyboardIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommandPaletteStore } from "@/stores/commandPaletteStore";

const features = [
  {
    icon: KeyboardIcon,
    title: "Keyboard-First UX",
    description:
      "Control everything from your keyboard. Press Ctrl+K to open the command palette and navigate at lightning speed.",
  },
  {
    icon: LayoutGrid,
    title: "Multiple Views",
    description:
      "Switch between List, Kanban Board, Calendar, and Timeline/Gantt views. See your work the way you think.",
  },
  {
    icon: Zap,
    title: "Smart Suggestions",
    description:
      "AI-powered task prioritization and natural language date parsing. Just type 'tomorrow 3pm' and we handle the rest.",
  },
  {
    icon: Globe,
    title: "API-First",
    description:
      "Public REST API v1 with OAuth2 and webhook support. Connect KaryaDhara to Slack, GitHub, Zapier, and 200+ tools.",
  },
];

export default function Home() {
  const { open } = useCommandPaletteStore();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container flex flex-col items-center gap-6 py-20 text-center md:py-32">
        <div className="flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          <Command className="h-3.5 w-3.5" />
          <span>API-First Task Planner</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="block">कार्यधारा</span>
          <span className="block text-primary">Flow of Tasks</span>
        </h1>

        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          A scalable, keyboard-first task planner built for developers and power users. Integrate
          with everything. Stay in flow.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="gap-2" onClick={open}>
            <Command className="h-4 w-4" />
            Open Command Palette
            <kbd className="pointer-events-none ml-1 hidden select-none items-center gap-1 rounded border bg-primary-foreground/20 px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
              ⌘K
            </kbd>
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            View on GitHub
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Press{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">Ctrl+K</kbd> or{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> to
          open the command palette
        </p>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need to stay in flow</h2>
          <p className="mt-4 text-muted-foreground">
            Built with the best ideas from Todoist, Linear, Asana, and TickTick.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container text-center">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">Built with modern tech</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              "Next.js 14",
              "TypeScript",
              "Tailwind CSS",
              "shadcn/ui",
              "Prisma",
              "PostgreSQL",
              "Zustand",
              "Vercel",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full border bg-background px-4 py-1.5 text-sm font-medium shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
