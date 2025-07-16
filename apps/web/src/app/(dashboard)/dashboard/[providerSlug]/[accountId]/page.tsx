"use client";

import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { FileBrowser } from "@/components/dashboard/file-browser";
import { UploadButton } from "@/components/upload-button";
import { Header } from "@/components/dashboard/header";
import { useParams } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function DrivePage() {
	const { providerSlug, accountId } = useParams();
	const { setDriveProvider } = useUserInfoProvider();

	useEffect(() => {
		if (providerSlug && accountId) {
			setDriveProvider(providerSlug as string, accountId as string);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [providerSlug, accountId]);
	return (
		<>
			<Suspense fallback={null}>
				<Header />
				<div className="flex flex-1 flex-col p-2">
					<div className="mb-6 flex items-center justify-between">
						<h1 className="text-2xl font-semibold">My Files</h1>
						<UploadButton />
					</div>
					<div className="flex-1">
						<FileBrowser />
					</div>
				</div>
			</Suspense>
		</>
	);
}
