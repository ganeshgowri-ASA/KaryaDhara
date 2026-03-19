import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { CommandPaletteKeyboardHandler } from "@/components/command-palette/CommandPaletteKeyboardHandler";

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
  title: "KaryaDhara — Flow of Tasks",
  description:
    "A scalable, API-first task planner built for integration. Inspired by the best of Todoist, Linear, and Asana.",
  keywords: ["task planner", "productivity", "project management", "API-first"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <CommandPalette />
          <CommandPaletteKeyboardHandler />
        </Providers>
      </body>
    </html>
  );
}
