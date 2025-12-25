import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PhoneFrame } from "@/components/phone-frame";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background overflow-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="invoice-creator-theme"
        >
          <PhoneFrame>
            {children}
          </PhoneFrame>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
