import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://predikt.hu'),
  title: {
    default: "Predikt - Közösségi Tippjáték",
    template: "%s | Predikt"
  },
  description: "Tippelj eseményekre és oszd meg eredményeiket barátaiddal. Semmi kockázat, csak dicsőség.",
  openGraph: {
    title: "Predikt - Közösségi Tippjáték",
    description: "Tippelj eseményekre és oszd meg eredményeiket barátaiddal.",
    url: 'https://predikt.hu', // Cseréld le a végleges domainre, ha van
    siteName: 'Predikt',
    locale: 'hu_HU',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-mono antialiased flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        <Header />
        <main className="flex-1 container mx-auto p-4 max-w-7xl">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
