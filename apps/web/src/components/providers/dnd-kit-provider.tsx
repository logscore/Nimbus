import { useMoveFile } from "@/hooks/useFileOperations";
import { DndContext } from "@dnd-kit/core";
import React from "react";

export default function DndKitProvider({ children }: { children: React.ReactNode }) {
	const { mutate: moveFile, isPending } = useMoveFile();

	return (
		<DndContext
			onDragStart={() => console.log("drag started")}
			onDragMove={() => console.log("Drag move")}
			onDragOver={() => console.log("drag over")}
			onDragEnd={event => {
				const targetParentId = event.over?.data?.current?.id;
				const sourceId = event.active?.data?.current?.id;
				const newName = event.active?.data?.current?.name;
				console.log(event);
				moveFile({
					sourceId,
					targetParentId,
					newName,
				});

				console.log(targetParentId, sourceId, newName);
			}}
			onDragCancel={() => console.log("drag cancel")}
		>
			{children}
		</DndContext>
	);
}
