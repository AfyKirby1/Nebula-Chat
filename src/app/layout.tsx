import type { Metadata } from "next";
import { Geist, Geist_Mono, Mountains_of_Christmas, Dancing_Script, Creepster, Roboto_Slab, Playfair_Display, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HolidayThemeProvider } from "@/components/HolidayThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { NeuralBackground } from "@/components/NeuralBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mountainsOfChristmas = Mountains_of_Christmas({
  weight: ["400", "700"],
  variable: "--font-christmas-heading",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ['cursive'],
  preload: false,
});

const dancingScript = Dancing_Script({
  variable: "--font-christmas-body",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

const creepster = Creepster({
  weight: "400",
  variable: "--font-halloween-heading",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const robotoSlab = Roboto_Slab({
  variable: "--font-halloween-body",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-thanksgiving-heading",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const lora = Lora({
  variable: "--font-thanksgiving-body",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Nebula Chat",
  description: "A smart AI chat interface built with Next.js and Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mountainsOfChristmas.variable} ${dancingScript.variable} ${creepster.variable} ${robotoSlab.variable} ${playfair.variable} ${lora.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <HolidayThemeProvider>
            <NeuralBackground />
            <div className="relative z-10 h-full flex flex-col" suppressHydrationWarning>
              {children}
            </div>
            <Toaster />
          </HolidayThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
