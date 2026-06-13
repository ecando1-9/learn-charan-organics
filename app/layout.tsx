import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://learn.charanorganics.com"),
  title: {
    default: "Charan Organics Academy | Natural Product Making Courses",
    template: "%s | Charan Organics Academy"
  },
  description: "Premium online LMS for soap making, shampoo making, herbal oils, skin care, candles, perfumes, incense sticks, detergents and organic product manufacturing courses.",
  icons: {
    icon: "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png",
    shortcut: "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png",
    apple: "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png",
  },
  openGraph: {
    title: "Charan Organics Academy",
    description: "Learn organic and natural product manufacturing from practical instructors.",
    url: "https://learn.charanorganics.com",
    siteName: "Charan Organics Academy",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#12382a",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
