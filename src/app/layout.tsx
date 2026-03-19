import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "KaryaDhara - Scalable Task Planner",
  description:
    "A scalable, API-first task planner built for seamless integration with your entire tool stack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center justify-between">
                <span className="text-lg font-bold tracking-tight">
                  KaryaDhara
                </span>
                <div className="flex items-center gap-2">
                  <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                    <span className="text-xs">Ctrl</span>K
                  </kbd>
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main>{children}</main>
            <CommandPalette />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
