import { redirect } from "@sveltejs/kit";
import db from "$lib/db.js";

const publicRoutes = ["/", "/login", "/create-profil", "/info"];

export async function load({ cookies, url }) {
  const userId = cookies.get("userId");

  const isPublicRoute = publicRoutes.some((route) => {
    return url.pathname === route || url.pathname.startsWith(route + "/");
  });

  if (!userId && !isPublicRoute) {
    throw redirect(303, "/login");
  }

  let unreadNotificationCount = 0;

  if (userId) {
    unreadNotificationCount = await db.getUnreadNotificationCount(userId);
  }

  return {
    userId: userId || null,
    unreadNotificationCount,
  };
}
