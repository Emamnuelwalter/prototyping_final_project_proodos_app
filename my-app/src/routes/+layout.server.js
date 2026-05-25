import { redirect } from "@sveltejs/kit";

const publicRoutes = ["/", "/login", "/create-profil", "/info"];

export function load({ cookies, url }) {
  const userId = cookies.get("userId");

  const isPublicRoute = publicRoutes.some((route) => {
    return url.pathname === route || url.pathname.startsWith(route + "/");
  });

  if (!userId && !isPublicRoute) {
    throw redirect(303, "/login");
  }

  return {
    userId: userId || null,
  };
}