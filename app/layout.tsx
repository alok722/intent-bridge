import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased text-zinc-300 bg-black min-h-screen flex selection:bg-red-500 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
