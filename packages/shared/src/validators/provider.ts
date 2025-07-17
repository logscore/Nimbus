import z from "zod";

// const providers = ["google", "microsoft", "dropbox", "box", "nimbus", "apple", "github"] as const;
// const providerSlugs = ["g", "m", "d", "b", "n", "a", "gh"] as const;
const providers = ["google", "microsoft"] as const;
const providerSlugs = ["g", "m"] as const;

// Define social providers first
export const driveProviderSchema = z.enum(providers);
export const driveProviderSlugSchema = z.enum(providerSlugs);
export const driveProviderParamSchema = z.object({
	providerId: driveProviderSchema,
	accountId: z.string(),
});
export const driveProviderSlugParamSchema = z.object({
	providerSlug: driveProviderSlugSchema,
	accountId: z.string(),
});
export type DriveProvider = z.infer<typeof driveProviderSchema>;
export type DriveProviderSlug = z.infer<typeof driveProviderSlugSchema>;
export type DriveProviderSlugParamSchema = z.infer<typeof driveProviderSlugParamSchema>;

// Create provider schema by combining social providers with "credential"
// https://www.better-auth.com/docs/authentication/email-password#configuration
export const providerSchema = z.enum(["credential", ...driveProviderSchema.options]).nullable();

// Create a single source of truth for provider <-> slug mappings
type SlugToProviderMap = Map<DriveProviderSlug, DriveProvider>;
type ProviderToSlugMap = Map<DriveProvider, DriveProviderSlug>;
interface ProviderMapping {
	slugToProvider: SlugToProviderMap;
	providerToSlug: ProviderToSlugMap;
}

const providerMappings = providerSlugs.reduce<ProviderMapping>(
	(acc, slug, index) => {
		const provider = providers[index];

		if (!provider) {
			throw new Error(`Provider not found for slug: ${slug}`);
		}
		if (!slug) {
			throw new Error(`Slug not found for provider: ${provider}`);
		}

		acc.slugToProvider.set(slug, provider);
		acc.providerToSlug.set(provider, slug);

		return acc;
	},
	{
		slugToProvider: new Map<DriveProviderSlug, DriveProvider>(),
		providerToSlug: new Map<DriveProvider, DriveProviderSlug>(),
	}
);

export function slugToProvider(slug: DriveProviderSlug): DriveProvider | undefined {
	return providerMappings.slugToProvider.get(slug);
}

export function providerToSlug(provider: DriveProvider): DriveProviderSlug | undefined {
	return providerMappings.providerToSlug.get(provider);
}
