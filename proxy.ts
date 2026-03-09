import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { UserRole } from "@prisma/client";

import { canAccessRoute } from "@/lib/permissions";

const publicPaths = ["/", "/login", "/auth/error"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (!token?.role) {
      return;
    }

    if (publicPaths.includes(pathname)) {
      return;
    }

    if (!canAccessRoute(token.role as UserRole, pathname)) {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        if (publicPaths.includes(pathname)) {
          return true;
        }

        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/kitchen/:path*", "/floor/:path*", "/oversight/:path*", "/settings/:path*"],
};
