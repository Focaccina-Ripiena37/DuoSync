import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import Providers from "@/components/theme/Providers";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "DuoSync",
  description: "Your shared space for calendars and wishlists.",
  manifest: "/manifest.json",
  icons: { apple: "/icon.png" },
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
          {/* Mobile floating theme toggle (so it's visible also on login and non-app pages) */}
          <div className="fixed bottom-4 right-4 z-50 md:hidden">
            <ThemeToggle />
          </div>
        </Providers>
      </body>
    </html>
  );
}
