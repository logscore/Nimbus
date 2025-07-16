export const DRIVE_PROVIDER_HEADERS = ["X-Provider-Id", "X-Account-Id"] as const;

export interface DriveProviderHeaders extends Record<(typeof DRIVE_PROVIDER_HEADERS)[number], string> {}
