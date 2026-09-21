import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ieegeetauniversity.vercel.app";

const siteName = "IEEE Geeta University";

const siteDescription =
  "Official IEEE Geeta University Student Branch platform for events, announcements, activities, membership, and student engagement.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: siteName,
    template: "%s | IEEE Geeta University",
  },

  description: siteDescription,

  keywords: [
    "IEEE Geeta University",
    "IEEE GU",
    "IEEE GU Student Branch",
    "IEEE Student Branch",
    "Geeta University IEEE",
    "Geeta University",
    "Geeta University School of Computer Science and Engineering",
    "IEEE Geeta University Student Branch",
    "IEEE events Geeta University",
    "IEEE activities Geeta University",
    "IEEE membership Geeta University",
    "student events Geeta University",
  ],

  authors: [
    {
      name: siteName,
    },
  ],

  creator: siteName,
  publisher: siteName,

  applicationName: siteName,

  category: "education",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    shortcut: ["/icon.png"],
    apple: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName,
    title: siteName,
    description: siteDescription,
  },

  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    description: siteDescription,
    url: siteUrl,
    inLanguage: "en-IN",
  };

  return (
    <html lang="en-IN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>

      <body>{children}</body>
    </html>
  );
}