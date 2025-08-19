"use client";

import SmallScreenError from "@/components/dashboard/screen-size-error";
import DndKitProvider from "@/components/providers/dnd-kit-provider";
import { FileTable } from "@/components/dashboard/file-browser";
import { useGetFiles } from "@/hooks/useFileOperations";
import { Header } from "@/components/dashboard/header";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DrivePage() {
	const searchParams = useSearchParams();
	const folderId = searchParams.get("folderId") ?? "root";

	const { data, isLoading, refetch, error } = useGetFiles({
		parentId: folderId,
		pageSize: 30,
		pageToken: undefined,
		// TODO: implement sorting, filtering, pagination, and a generalized web content/view interfaces
		returnedValues: ["id", "name", "mimeType", "size", "modifiedTime", "webContentLink", "webViewLink"],
	});

	// This prevents screens that are too small from using the app
	const [isSmallScreen, setIsSmallScreen] = useState(false);

	useEffect(() => {
		function handleResize() {
			setIsSmallScreen(window.innerWidth < 700);
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (isSmallScreen) {
		return <SmallScreenError />;
	}

	return (
		<>
			<Suspense fallback={null}>
				<DndKitProvider parentId={folderId}>
					<Header />
					<FileTable files={data || []} isLoading={isLoading} refetch={refetch} error={error} />
				</DndKitProvider>
			</Suspense>
		</>
	);
}
