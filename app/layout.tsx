import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thailand Energy Price Tracker",
  description:
    "Track daily oil prices and electricity rates across Thailand's major energy companies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-[var(--card-border)] sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Thailand Energy Tracker
                </h1>
                <p className="text-xs text-[var(--muted)]">
                  Oil &amp; Electricity Prices
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <a
                href="#prices"
                className="text-[var(--muted)] hover:text-white transition-colors"
              >
                Prices
              </a>
              <a
                href="#charts"
                className="text-[var(--muted)] hover:text-white transition-colors"
              >
                Charts
              </a>
              <a
                href="#electricity"
                className="text-[var(--muted)] hover:text-white transition-colors"
              >
                Electricity
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
