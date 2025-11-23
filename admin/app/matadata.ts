import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Smart Mirror Dashboard",
    description: "Organization dashboard for smart mirror analytics and monitoring",

    // Favicon
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },

    // Open Graph (for social sharing)
    openGraph: {
        title: "Smart Mirror Dashboard",
        description: "Monitor smart mirrors across locations with real-time analytics",
        url: "https://yourdomain.com",
        siteName: "Smart Mirror Dashboard",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Smart Mirror Dashboard Preview",
            },
        ],
        type: "website",
    },

    // Twitter Card
    twitter: {
        card: "summary_large_image",
        title: "Smart Mirror Dashboard",
        description: "Organization dashboard for smart mirror analytics",
        images: ["/twitter-image.png"],
        creator: "@YourHandle",
    },

    // Robots & indexing
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },


    // Keywords (optional, still sometimes useful for search)
    keywords: ["Smart Mirror", "Dashboard", "Analytics", "IoT", "Monitoring"],

    // Author info
    authors: [{ name: "LNC", url: "https://yourdomain.com" }],

    // Additional meta
    alternates: {
        canonical: "https://yourdomain.com",
    },
}
