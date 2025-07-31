import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getBaseUrl();

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/dashboard/*", "/api/auth/*", "/reset-password"],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
