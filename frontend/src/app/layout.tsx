import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/lib/auth-context";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snipli — High-Velocity Short Links & Real-Time Analytics",
  description:
    "Production-grade URL shortener with sub-12ms edge redirects, custom aliases, expiration schedules, and real-time analytics.",
  icons: {
    icon: "/snipli-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-canvas-bg text-text-charcoal selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>
          <Header />
          <main className="flex-1 w-full pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
