import { fail, redirect } from "@sveltejs/kit";
import db from "$lib/db.js";

export const actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();

    const username = data.get("username");
    const password = data.get("password");

    if (!username || !password) {
      return fail(400, {
        message: "Bitte Benutzername und Passwort eingeben.",
      });
    }

    const user = await db.getUserByLogin(username, password);

    if (!user) {
      return fail(400, {
        message: "Benutzername oder Passwort ist falsch.",
      });
    }

    cookies.set("userId", user._id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    throw redirect(303, "/offers");
  },
};
