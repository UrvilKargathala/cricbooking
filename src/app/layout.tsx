import type { Metadata } from "next";
import Script from "next/script";
import { ChatWidget } from "@/components/ai/ChatWidget";
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
      <body className="min-h-screen bg-surface-50">
        {children}
        <ChatWidget />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
