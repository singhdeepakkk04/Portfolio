import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans as FontSans } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/google-analytics";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { Suspense } from "react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === "development" ? "http://localhost:3000" : DATA.url),
  title: {
    default: DATA.name,
    template: `%s | ${DATA.name}`,
  },
  description: DATA.description,
  keywords: [
    "Deepak Singh",
    "Deepak",
    "Portfolio",
    "Product Manager",
    "Software Engineer",
    "IIT Roorkee",
    "Data Engineering",
    "Web Development",
    "AI",
  ],
  openGraph: {
    title: `${DATA.name}`,
    description: DATA.description,
    url: DATA.url,
    siteName: `${DATA.name}`,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: `${DATA.name}`,
    card: "summary_large_image",
  },
  verification: {
    google: "",
    yandex: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-pattern" />
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider delayDuration={0}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
        
        {/* JSON-LD Schema for World-Class SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: DATA.name,
              url: DATA.url,
              image: DATA.avatarUrl,
              // `sameAs` asserts to search engines that these profiles are the
              // same person, so only real absolute profile URLs may appear.
              // Anything relative or a "#" placeholder is filtered out rather
              // than published as an identity claim.
              sameAs: Object.values(DATA.contact.social)
                .map((s) => s.url)
                .filter((url) => url.startsWith("http")),
              jobTitle: "Product Manager & Software Engineer",
              alumniOf: {
                "@type": "CollegeOrUniversity",
                name: "IIT Roorkee",
              },
              knowsAbout: [
                "Product Management",
                "Data Engineering",
                "Machine Learning",
                "Web Development",
              ],
            }),
          }}
        />
        
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
