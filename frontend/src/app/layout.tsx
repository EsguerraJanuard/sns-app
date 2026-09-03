import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SNS",
  description: "Personal Financial Memory Assistant",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-200 text-zinc-900 font-sans">
        {/* Redmi Note 9s / Large Android dimensions: width ~393px to 400px */}
        <div className="flex-1 w-full max-w-[400px] mx-auto bg-zinc-50 shadow-2xl min-h-screen flex flex-col relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
