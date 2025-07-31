import { PublicRoute } from "@/components/providers/public-route";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return <PublicRoute redirectTo="/dashboard">{children}</PublicRoute>;
}
