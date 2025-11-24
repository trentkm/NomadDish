import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "NomadDish",
  description: "Explore regional recipes by spinning and clicking around the globe."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground font-sans")}>
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
