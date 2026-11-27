import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/config/env";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const { NEXT_PUBLIC_APP_URL } = getPublicEnv();
  const baseUrl =
    NEXT_PUBLIC_APP_URL ?? "https://suryavignesh06.github.io/Drapes-of-cotton";

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
