import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          KaryaDhara
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Flow of Tasks — A scalable, API-first task planner built for
          integration
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signup">Create account</Link>
        </Button>
      </div>
    </div>
  );
}
