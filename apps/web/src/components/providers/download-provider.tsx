"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { DownloadProgress } from "@/components/ui/download-progress";

interface DownloadState {
	id: string;
	fileName: string;
	progress: number;
	isDownloading: boolean;
	error?: string;
}

interface DownloadContextType {
	downloads: DownloadState[];
	startDownload: (id: string, fileName: string) => void;
	updateProgress: (id: string, progress: number) => void;
	completeDownload: (id: string) => void;
	errorDownload: (id: string, error: string) => void;
	cancelDownload: (id: string) => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export function DownloadProvider({ children }: { children: ReactNode }) {
	const [downloads, setDownloads] = useState<DownloadState[]>([]);

	const startDownload = useCallback((id: string, fileName: string) => {
		setDownloads(prev => [...prev.filter(d => d.id !== id), { id, fileName, progress: 0, isDownloading: true }]);
	}, []);

	const updateProgress = useCallback((id: string, progress: number) => {
		setDownloads(prev => prev.map(d => (d.id === id ? { ...d, progress } : d)));
	}, []);

	const completeDownload = useCallback((id: string) => {
		setDownloads(prev => prev.map(d => (d.id === id ? { ...d, progress: 100, isDownloading: false } : d)));

		// Remove completed download after a delay
		const timeout = setTimeout(() => {
			setDownloads(prev => prev.filter(d => d.id !== id));
		}, 2000);

		return () => clearTimeout(timeout);
	}, []);

	const errorDownload = useCallback((id: string, error: string) => {
		setDownloads(prev => prev.map(d => (d.id === id ? { ...d, error, isDownloading: false } : d)));

		setTimeout(() => {
			setDownloads(prev => prev.filter(d => d.id !== id));
		}, 5000);
	}, []);

	const cancelDownload = useCallback((id: string) => {
		setDownloads(prev => prev.filter(d => d.id !== id));
	}, []);

	return (
		<DownloadContext.Provider
			value={{
				downloads,
				startDownload,
				updateProgress,
				completeDownload,
				errorDownload,
				cancelDownload,
			}}
		>
			{children}

			{downloads.map((download, index) => (
				<DownloadProgress
					key={download.id}
					isDownloading={download.isDownloading}
					progress={download.progress}
					fileName={download.fileName}
					error={download.error}
					onCancel={() => cancelDownload(download.id)}
					style={{
						position: "fixed",
						right: "1rem",
						bottom: `${1 + index * 8}rem`, // Correct math with unit
						zIndex: 50,
					}}
				/>
			))}
		</DownloadContext.Provider>
	);
}

export function useDownloadContext() {
	const context = useContext(DownloadContext);
	if (context === undefined) {
		throw new Error("useDownloadContext must be used within a DownloadProvider");
	}
	return context;
}
