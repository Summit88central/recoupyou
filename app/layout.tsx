import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RecoupYou - Transform Your Fitness Journey",
  description:
    "Professional fitness training, coaching, and gym membership services in South Africa",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Header />
        <main className="pt-10">
          {" "}
          {/* <-- add padding equal to header height */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
