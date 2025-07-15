import { useQuery } from "@tanstack/react-query";
import { protectedClient } from "@/utils/client";
import type { DriveInfo } from "@nimbus/shared";

export const useDriveInfo = () => {
	return useQuery<DriveInfo>({
		queryKey: ["driveInfo"],
		queryFn: async () => {
			const response = await protectedClient.api.drives.about.$get();
			return (await response.json()) as DriveInfo;
		},
	});
};
