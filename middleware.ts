import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const user = req.auth?.user;

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.redirect(
      new URL("/", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};