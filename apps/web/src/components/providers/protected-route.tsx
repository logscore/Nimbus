"use client";

import { RouteGuard } from "./route-guard";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	return <RouteGuard requireAuth={true}>{children}</RouteGuard>;
}
