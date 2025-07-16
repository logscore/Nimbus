import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { useQuery } from "@tanstack/react-query";
import type { DriveInfo } from "@nimbus/shared";

export const useDriveInfo = () => {
	const { clientPromise } = useUserInfoProvider();
	return useQuery<DriveInfo>({
		queryKey: ["driveInfo"],
		queryFn: async () => {
			const client = await clientPromise;
			const response = await client.api.drives.about.$get();
			return (await response.json()) as DriveInfo;
		},
	});
};
