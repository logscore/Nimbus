import { RouteGuard } from "./route-guard";

interface PublicRouteProps {
	children: React.ReactNode;
	redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = "/dashboard" }: PublicRouteProps) {
	return (
		<RouteGuard requireAuth={false} redirectTo={redirectTo}>
			{children}
		</RouteGuard>
	);
}
