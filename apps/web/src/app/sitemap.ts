import { getBaseUrl, buildUrl } from "@/lib/utils";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = getBaseUrl();
	const now = new Date();

	return [
		{
			url: baseUrl,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: buildUrl("/signin"),
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.6,
		},
		{
			url: buildUrl("/signup"),
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.6,
		},
		{
			url: buildUrl("/contributors"),
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.7,
		},
	];
}
