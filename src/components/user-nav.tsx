"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserNav() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="flex items-center gap-4">
      <Link href="/profile" className="flex items-center gap-2 hover:opacity-80">
        <Avatar className="h-8 w-8">
          <AvatarImage src={session.user.image || undefined} alt={session.user.name || ""} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden md:block">
          <p className="text-sm font-medium leading-none">{session.user.name}</p>
          <p className="text-xs text-muted-foreground">{session.user.role}</p>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign out
      </Button>
    </div>
  );
}
