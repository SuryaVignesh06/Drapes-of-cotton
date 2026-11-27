import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const { NEXT_PUBLIC_APP_URL } = getPublicEnv();
  const baseUrl = NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/checkout", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
