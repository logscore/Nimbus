"use client";

import { useSearchParams as useNextSearchParams } from "next/navigation";
import { useCallback } from "react";

export const useSearchParamsSafely = () => {
	const searchParams = useNextSearchParams();

	const getParam = useCallback(
		(key: string) => {
			return searchParams?.get(key);
		},
		[searchParams]
	);

	return { getParam, searchParams };
};
