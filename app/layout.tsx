import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientHeader from "./ClientHeader";




// Load Geist Sans font and assign it to a CSS variable
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});




// Load Geist Mono font and assign it to a CSS variable
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});




// Metadata for the Next.js app (used in <head>)
export const metadata: Metadata = {
  title: "Flashcards App",
  description: "A study tool built with Next.js and Prisma",
};




// RootLayout component: wraps all pages in the app
export default function RootLayout({
  children, // The content of the page
}: {

  children: React.ReactNode;

}) {

  return (

    <html lang="en">

      <body

        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-900`}>

        {/* Header with app title and navigation */}
        {/* ClientHeader is a client component that handles hover + fetch */}

        <ClientHeader />

        {/* Main content area */}
        <main className="max-w-5xl mx-auto p-6">{children}</main>

      </body>

    </html>
  );

}



