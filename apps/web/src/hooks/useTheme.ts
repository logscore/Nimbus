import { useTheme as useNextTheme } from "next-themes";
import { useIsMounted } from "./useIsMounted";

export const useTheme = () => {
	const { theme, setTheme } = useNextTheme();
	const isMounted = useIsMounted();

	const toggleTheme = (): void => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return { theme, toggleTheme, isMounted };
};
