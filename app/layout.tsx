import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { GoogleAnalyticsScript } from "@/components/google-analytics-script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IntentBridge | Tactical Dashboard",
  description: "AI-powered real-time parsing engine for unstructured societal data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased text-zinc-900 bg-zinc-50 min-h-screen flex selection:bg-red-200 selection:text-zinc-900`}
      >
        {children}
        <GoogleAnalyticsScript />
      </body>
    </html>
  );
}
