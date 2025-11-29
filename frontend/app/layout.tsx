import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// -------------------------------------------------------
// Font Configuration
// -------------------------------------------------------

// Geist Sans font (primary UI font)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Geist Mono font (used for code-style text)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// -------------------------------------------------------
// Global Metadata for SEO, OG, Twitter, etc.
// -------------------------------------------------------
export const metadata: Metadata = {
  title: "E-Commerce ETL Analytics",
  description:
    "A serverless analytics platform built with AWS Step Functions, S3, DynamoDB, Athena, Flask, and Next.js. Upload order datasets and view automated insights.",
  icons: {
    icon: "/site-logo.jpg",
  },
  openGraph: {
    title: "E-Commerce ETL Analytics Dashboard",
    description:
      "Upload CSV datasets and generate weekly revenue, orders, and product insights using a fully automated AWS ETL workflow.",
    type: "website",
    url: "https://your-app-url.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Commerce ETL Analytics",
    description:
      "Serverless ETL + Analytics powered by AWS, Flask, and Next.js.",
  },
};

// -------------------------------------------------------
// Root Layout Component
// Wraps the entire application
// -------------------------------------------------------
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} 
                    antialiased bg-slate-950 text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
