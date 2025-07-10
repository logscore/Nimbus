import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/app"];
const publicRoutes = new Set(["/", "/signin", "/signup", "/forgot-password", "/reset-password"]);

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
	const isPublic = publicRoutes.has(pathname);

	try {
		const sessionCookie = getSessionCookie(request.headers);

		if (isProtected && !sessionCookie) {
			const signInUrl = new URL("/signin", request.url);
			signInUrl.searchParams.set("redirect", pathname);
			return NextResponse.redirect(signInUrl);
		}

		if (isPublic && sessionCookie && pathname !== "/") {
			return NextResponse.redirect(new URL("/app", request.url));
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		if (isProtected) {
			const signInUrl = new URL("/signin", request.url);
			signInUrl.searchParams.set("redirect", pathname);
			return NextResponse.redirect(signInUrl);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
