import { DragDropProvider, KeyboardSensor, PointerSensor } from "@dnd-kit/react";
import { useMoveFile } from "@/hooks/useFileOperations";

export default function DndKitProvider({ children, parentId }: { children: React.ReactNode; parentId: string }) {
	const { mutate: moveFile } = useMoveFile();

	return (
		<DragDropProvider
			sensors={[PointerSensor, KeyboardSensor]}
			onDragEnd={event => {
				const { operation, canceled } = event;
				const { source, target } = operation;

				if (canceled || !target || !source) return;

				const targetParentId = target.data.id;
				const sourceId = source.data.id;

				console.log(targetParentId, sourceId);

				if (targetParentId === sourceId) return;

				moveFile({
					sourceId,
					targetParentId,
					parentId,
				});
			}}
		>
			{children}
		</DragDropProvider>
	);
}
