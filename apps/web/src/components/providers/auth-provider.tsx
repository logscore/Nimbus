import { createContext, useContext, useState, useCallback } from "react";

type AuthContextType = {
	showSignIn: boolean;
	openSignIn: () => void;
	closeSignIn: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [showSignIn, setShowSignIn] = useState(false);

	const openSignIn = useCallback(() => setShowSignIn(true), []);
	const closeSignIn = useCallback(() => setShowSignIn(false), []);

	return (
		<AuthContext.Provider
			value={{
				showSignIn,
				openSignIn,
				closeSignIn,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
