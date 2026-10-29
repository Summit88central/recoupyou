import type { Metadata } from "next";

// Base URL - replace with your actual domain
const BASE_URL = "https://www.recoupyou.co.za";

// Default metadata that can be shared across pages
export const defaultMetadata = {
  siteName: "RecoupYou Fitness",
  locale: "en_ZA",
  type: "website" as const,
  baseUrl: BASE_URL,
};

// Generate page-specific metadata
export function generateMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle =
    title === "RecoupYou" ? title : `${title} | RecoupYou Fitness`;
  const url = `${BASE_URL}${path}`;
  const imageUrl = image ? `${BASE_URL}${image}` : `${BASE_URL}/og-image.jpg`;

  return {
    title: fullTitle,
    description,
    keywords: [
      ...keywords,
      "fitness South Africa",
      "gym membership",
      "personal training",
      "RecoupYou",
    ],
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: defaultMetadata.siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: defaultMetadata.locale,
      type: defaultMetadata.type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

// Page-specific metadata
export const pageMetadata = {
  home: generateMetadata({
    title: "RecoupYou - Transform Your Fitness Journey",
    description:
      "Leading fitness company in South Africa offering gym memberships, online 1:1 coaching, personal training, and comprehensive fitness guides. Transform your fitness journey with professional trainers and modern facilities.",
    keywords: [
      "fitness transformation",
      "gym Johannesburg",
      "fitness coaching South Africa",
      "workout programs",
      "strength training",
    ],
  }),

  shop: generateMetadata({
    title: "Shop Fitness Programs & Memberships",
    description:
      "Browse RecoupYou's fitness programs, gym memberships, and training packages. Find the perfect fitness solution for your goals with our comprehensive range of services.",
    path: "/shop",
    keywords: [
      "fitness programs",
      "gym membership plans",
      "training packages",
      "fitness shop South Africa",
    ],
  }),

  membershipApplication: generateMetadata({
    title: "Gym Membership Application",
    description:
      "Apply for RecoupYou gym membership and start your fitness transformation today. Join South Africa's premier fitness facility with state-of-the-art equipment and professional trainers.",
    path: "/membership-application",
    keywords: [
      "gym membership application",
      "join gym South Africa",
      "fitness membership",
      "gym registration",
    ],
  }),

  onlineCoaching: generateMetadata({
    title: "Online 1:1 Personal Fitness Coaching",
    description:
      "Get personalized online fitness coaching from certified trainers. Custom workout plans, nutrition guidance, and 24/7 support to help you achieve your fitness goals from anywhere.",
    path: "/online-coaching",
    keywords: [
      "online personal trainer",
      "virtual fitness coaching",
      "online workout plans",
      "remote fitness training",
      "1:1 coaching",
    ],
  }),

  personalTraining: generateMetadata({
    title: "In-Person Personal Training Services",
    description:
      "Experience personalized in-person training with RecoupYou's certified personal trainers. Get customized workouts, form correction, and motivation in our state-of-the-art facilities.",
    path: "/personal-training",
    keywords: [
      "personal trainer Johannesburg",
      "in-person fitness training",
      "one-on-one training",
      "personal fitness coach",
      "strength training coach",
    ],
  }),
};

// Structured data generators
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RecoupYou",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "Leading fitness company in South Africa offering gym memberships, online coaching, and personal training.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Your Street Address", // Replace with actual
      addressLocality: "Johannesburg",
      addressRegion: "Gauteng",
      postalCode: "2000", // Replace with actual
      addressCountry: "ZA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+27-XX-XXX-XXXX", // Replace with actual
      contactType: "customer service",
      areaServed: "ZA",
      availableLanguage: ["English", "Afrikaans"],
    },
    sameAs: [
      "https://facebook.com/recoupyou", // Replace with actual
      "https://instagram.com/recoupyou",
      "https://twitter.com/recoupyou",
    ],
  };
}

export function generateServiceSchema(service: {
  name: string;
  description: string;
  price?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: "RecoupYou",
    },
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
    url: `${BASE_URL}${service.url}`,
    ...(service.price && {
      offers: {
        "@type": "Offer",
        price: service.price,
        priceCurrency: "ZAR",
      },
    }),
  };
}

export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
