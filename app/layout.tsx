import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PhoneFrame } from "@/components/phone-frame";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Invoice Creator",
  description: "Create and manage invoices with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background overflow-hidden`}>
        <PhoneFrame>
          {children}
        </PhoneFrame>
      </body>
    </html>
  );
}
