import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('token')?.value;
    const userCookie = request.cookies.get('user')?.value;
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/register', '/tasks'];

    // Check if current path is a public route
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith('/tasks/')
    );

    // If no token and trying to access protected route
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If token exists, check role-based access
    if (token && userCookie) {
        try {
            const user = JSON.parse(userCookie);
            const role = user.role;

            // Admin routes
            if (pathname.startsWith('/admin') && role !== 'admin') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            // Company routes
            if (pathname.startsWith('/company') && role !== 'company') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            // Worker routes
            if (pathname.startsWith('/worker') && role !== 'worker') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            // Redirect authenticated users away from login/register
            if ((pathname === '/login' || pathname === '/register') && token) {
                switch (role) {
                    case 'admin':
                        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
                    case 'company':
                        return NextResponse.redirect(new URL('/company/dashboard', request.url));
                    case 'worker':
                        return NextResponse.redirect(new URL('/worker/dashboard', request.url));
                }
            }
        } catch (error) {
            console.error('Middleware error:', error);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
