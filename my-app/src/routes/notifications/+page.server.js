import { fail, redirect } from "@sveltejs/kit";
import db from "$lib/db.js";

export async function load({ cookies }) {
  const userId = cookies.get("userId");

  if (!userId) {
    throw redirect(303, "/login");
  }

  const notifications = await db.getNotificationsByUser(userId);

  await db.markNotificationsAsRead(userId);

  return {
    notifications,
  };
}

export const actions = {
  delete: async ({ request, cookies }) => {
    const userId = cookies.get("userId");

    if (!userId) {
      throw redirect(303, "/login");
    }

    const data = await request.formData();
    const notificationId = data.get("notificationId");

    if (!notificationId) {
      return fail(400, {
        message: "Die Nachricht konnte nicht gelöscht werden.",
      });
    }

    await db.deleteNotification(notificationId, userId);

    throw redirect(303, "/notifications");
  },
};
