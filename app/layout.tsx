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
  title: {
    default: "RecoupYou - Transform Your Fitness Journey in South Africa",
    template: "%s | RecoupYou Fitness",
  },
  description:
    "Leading fitness company in South Africa offering gym memberships, online 1:1 coaching, personal training, and comprehensive fitness guides. Transform your fitness journey with professional trainers and modern facilities.",
  keywords: [
    "fitness South Africa",
    "gym membership South Africa",
    "personal trainer South Africa",
    "online fitness coaching",
    "fitness training programs",
    "gym Johannesburg",
    "fitness coach",
    "weight training",
    "fitness transformation",
    "RecoupYou",
  ],
  authors: [{ name: "RecoupYou Fitness Team" }],
  creator: "RecoupYou",
  publisher: "RecoupYou",
  category: "fitness",
  classification: "Health & Fitness",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://recoupyou.co.za", // Replace with your actual domain
    siteName: "RecoupYou Fitness",
    title: "RecoupYou - Transform Your Fitness Journey in South Africa",
    description:
      "Leading fitness company in South Africa offering gym memberships, online 1:1 coaching, personal training, and comprehensive fitness guides.",
    images: [
      {
        url: "/og-image.png", // Create this image (1200x630px)
        width: 1200,
        height: 630,
        alt: "RecoupYou Fitness - Transform Your Journey",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "RecoupYou - Transform Your Fitness Journey",
    description:
      "Leading fitness company in South Africa offering gym memberships, online coaching, and personal training.",
    images: ["/twitter-image.jpg"], // Create this image (1200x600px)
    creator: "@RecoupYou", // Replace with actual Twitter handle
  },

  // Robots
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

  // Verification (add your actual verification codes)
  verification: {
    google: "your-google-site-verification-code",
    // bing: "your-bing-verification-code",
    // yandex: "your-yandex-verification-code",
  },

  // Other metadata
  metadataBase: new URL("https://recoupyou.co.za"), // Replace with your actual domain
  alternates: {
    canonical: "/",
  },

  // App specific
  applicationName: "RecoupYou Fitness",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  // Additional metadata for local business
  other: {
    "geo.region": "ZA-GP",
    "geo.placename": "Johannesburg, Gauteng, South Africa",
    "geo.position": "-26.2041;28.0473", // Replace with actual coordinates
    ICBM: "-26.2041, 28.0473", // Replace with actual coordinates
    "business:contact_data:locality": "Johannesburg",
    "business:contact_data:region": "Gauteng",
    "business:contact_data:country_name": "South Africa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA" className={inter.variable}>
      <head>
        {/* Additional SEO tags */}
        <link rel="canonical" href="https://recoupyou.co.za" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://recoupyou.co.za/#organization",
                  name: "RecoupYou",
                  url: "https://recoupyou.co.za",
                  logo: {
                    "@type": "ImageObject",
                    "@id": "https://recoupyou.co.za/#logo",
                    url: "https://recoupyou.co.za/logo.png",
                    contentUrl: "https://recoupyou.co.za/logo.png",
                    width: 300,
                    height: 100,
                    caption: "RecoupYou Fitness",
                  },
                  image: { "@id": "https://recoupyou.co.za/#logo" },
                  description:
                    "Leading fitness company in South Africa offering gym memberships, online coaching, and personal training.",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "Your Street Address", // Replace with actual address
                    addressLocality: "Johannesburg",
                    addressRegion: "Gauteng",
                    postalCode: "2000", // Replace with actual postal code
                    addressCountry: "ZA",
                  },
                  contactPoint: {
                    "@type": "ContactPoint",
                    telephone: "+27-XX-XXX-XXXX", // Replace with actual phone
                    contactType: "customer service",
                    areaServed: "ZA",
                    availableLanguage: ["English", "Afrikaans"],
                  },
                  sameAs: [
                    "https://facebook.com/recoupyou", // Replace with actual social media
                    "https://instagram.com/recoupyou",
                    "https://twitter.com/recoupyou",
                  ],
                },
                {
                  "@type": "LocalBusiness",
                  "@id": "https://recoupyou.co.za/#localbusiness",
                  name: "RecoupYou Fitness",
                  image: "https://recoupyou.co.za/gym-image.jpg",
                  url: "https://recoupyou.co.za",
                  telephone: "+27-XX-XXX-XXXX", // Replace with actual phone
                  priceRange: "$$",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "Your Street Address", // Replace with actual address
                    addressLocality: "Johannesburg",
                    addressRegion: "Gauteng",
                    postalCode: "2000", // Replace with actual postal code
                    addressCountry: "ZA",
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: -26.2041, // Replace with actual coordinates
                    longitude: 28.0473, // Replace with actual coordinates
                  },
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                      ],
                      opens: "05:00",
                      closes: "22:00",
                    },
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: ["Saturday", "Sunday"],
                      opens: "06:00",
                      closes: "20:00",
                    },
                  ],
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.8", // Replace with actual rating
                    reviewCount: "150", // Replace with actual review count
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://recoupyou.co.za/#website",
                  url: "https://recoupyou.co.za",
                  name: "RecoupYou Fitness",
                  description:
                    "Transform your fitness journey with professional training and coaching in South Africa",
                  publisher: { "@id": "https://recoupyou.co.za/#organization" },
                  potentialAction: [
                    {
                      "@type": "SearchAction",
                      target: {
                        "@type": "EntryPoint",
                        urlTemplate:
                          "https://recoupyou.co.za/?s={search_term_string}",
                      },
                      "query-input": "required name=search_term_string",
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
