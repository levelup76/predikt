import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Predikt - Közösségi Tippjáték",
  description: "Tippelj eseményekre és oszd meg eredményeiket barátaiddal. Semmi kockázat, csak dicsőség.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <Header />
        <main className="flex-1 container mx-auto p-4 max-w-4xl">
          {children}
        </main>
      </body>
    </html>
  );
}
