import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CricBooking - Book Cricket Turfs & Grounds in Surat",
  description: "Book cricket turfs and grounds across Surat, Gujarat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-50">{children}</body>
    </html>
  );
}
