export { default } from "@/lib/middlewares/is_admin";

export const config = {
  matcher: ["/admin/:path*"],
};