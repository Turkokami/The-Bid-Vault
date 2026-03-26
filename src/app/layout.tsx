import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Bid Vault",
  description:
    "Track the past, predict the future, and win more contracts without paying finder fees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
