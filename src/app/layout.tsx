import type { Metadata, Viewport } from "next";
import { PT_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import Providers from "@/components/theme/Providers";
import ThemeToggle from "@/components/ThemeToggle";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const ptSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pt-sans",
});

export const metadata: Metadata = {
  title: "DuoSync",
  description: "Il vostro spazio condiviso per calendario e wishlist.",
  manifest: "/manifest.json",
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#E6E6FA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${ptSans.variable} font-body antialiased bg-background`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster />
          <ServiceWorkerRegister />
          {/* Mobile floating theme toggle (so it's visible also on login and non-app pages) */}
          <div className="fixed bottom-4 right-4 z-50 md:hidden">
            <ThemeToggle />
          </div>
        </Providers>
      </body>
    </html>
  );
}