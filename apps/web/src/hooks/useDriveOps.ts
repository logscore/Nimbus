import type { DriveInfo } from "@nimbus/server/shared";
import { useQuery } from "@tanstack/react-query";
import { clientEnv } from "@/lib/env/client-env";
import axios from "axios";

// TODO(typing): fix DriveInfo import because it does not work. response.data is 'any' :(

export const useDriveInfo = () => {
	return useQuery<DriveInfo>({
		queryKey: ["driveInfo"],
		queryFn: async () => {
			const response = await axios.get(`${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api/drives/about`, {
				withCredentials: true,
				signal: new AbortController().signal,
			});
			return response.data;
		},
	});
};
