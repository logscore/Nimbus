import { useAccountProvider } from "@/components/providers/account-provider";
import { useQuery } from "@tanstack/react-query";
import type { DriveInfo } from "@nimbus/shared";

export const useDriveInfo = () => {
	const { clientPromise, providerId, accountId } = useAccountProvider();
	return useQuery<DriveInfo>({
		queryKey: ["driveInfo", providerId, accountId],
		queryFn: async () => {
			const client = await clientPromise;
			const response = await client.api.drives.about.$get();
			return (await response.json()) as DriveInfo;
		},
	});
};
