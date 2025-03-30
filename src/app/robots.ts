import { MetadataRoute } from "next";

/**
 * Generates the robots.txt file for the website
 * This follows the Robots Exclusion Standard
 * @see https://developers.google.com/search/docs/advanced/robots/create-robots-txt
 */
export default function robots(): MetadataRoute.Robots {
  // Domain configuration - using the same domain as in sitemap.ts
  const DOMAIN =
    process.env.NEXT_PUBLIC_BASE_URL || "https://utkarshchaudhary.vercel.app";

  return {
    // Define rules for all search engine crawlers
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/home/", "/about/", "/contact/", "/blog/", "/projects/"],
        disallow: [
          "/api/",
          "/(Auth)/",
          "/sign-in/",
          "/sign-up/",
          "/admin/",
          "/_next/",
          "/private/",
          "/*.json$",
        ],
      },
    ],
    // Link to the sitemap
    sitemap: `${DOMAIN}/sitemap.xml`,
    // Set the canonical host
    host: DOMAIN,
  };
}
