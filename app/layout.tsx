import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import SnowfallToggle from "./components/SnowfallToggle";

export const metadata: Metadata = {
  title: "NomadDish",
  description: "Explore regional recipes by spinning and clicking around the globe.",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground font-sans overflow-x-hidden")}>
        <SnowfallToggle />
        <div className="min-h-screen flex flex-col overflow-x-hidden">{children}</div>
      </body>
    </html>
  );
}
