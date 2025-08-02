"use client";

import { FileTable } from "@/components/dashboard/file-browser";
import { useGetFiles } from "@/hooks/useFileOperations";
import { useMoveFile } from "@/hooks/useFileOperations";
import { Header } from "@/components/dashboard/header";
import { useSearchParams } from "next/navigation";
import { DndContext } from "@dnd-kit/core";
import { Suspense } from "react";
import { toast } from "sonner";

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

	const { mutate: moveFile, isPending } = useMoveFile();

	return (
		<>
			<Suspense fallback={null}>
				<DndContext
					onDragStart={() => console.log("drag started")}
					onDragMove={() => console.log("Drag move")}
					onDragOver={() => console.log("drag over")}
					onDragEnd={event => {
						const targetParentId = event.over?.data?.current?.id;
						const sourceId = event.active?.data?.current?.id;
						const newName = event.active?.data?.current?.name;

						console.log(event);

						moveFile(
							{
								sourceId,
								targetParentId,
								newName,
							},
							{
								onSuccess: () => {
									toast.success(`Successfully moved`);
								},
								onError: error => {
									console.error("Error moving file:", error);
								},
							}
						);

						console.log(targetParentId, sourceId, newName);
					}}
					onDragCancel={() => console.log("drag cancel")}
				>
					<Header />
					<FileTable files={data || []} isLoading={isLoading} refetch={refetch} error={error} />
				</DndContext>
			</Suspense>
		</>
	);
}
