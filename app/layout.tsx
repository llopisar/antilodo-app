import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Antilodo Operations",
  description: "Restaurant operations platform scaffold",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-muted/30 font-sans antialiased">{children}</body>
    </html>
  );
}
