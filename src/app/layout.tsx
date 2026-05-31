import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Base",
  description: "Setlists, charts, and gigs for working musicians",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-[#080810] font-sans text-white antialiased",
        )}
        style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
      >
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              colorBackground: "#12121a",
              colorForeground: "#ffffff",
              colorMutedForeground: "rgba(255, 255, 255, 0.6)",
              colorPrimary: "#6366f1",
            },
          }}
        >
          {children}
          <Toaster richColors position="top-center" />
        </ClerkProvider>
      </body>
    </html>
  );
}
