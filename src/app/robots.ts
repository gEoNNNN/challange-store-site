import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import { isSiteLocked } from "../lib/siteLock";

export default function robots(): MetadataRoute.Robots {
  // While the site is password-protected, keep every crawler out.
  if (isSiteLocked()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
