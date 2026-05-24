import { fail, redirect } from "@sveltejs/kit";
import db from "$lib/db.js";

export async function load({ cookies }) {
  const userId = cookies.get("userId");

  if (!userId) {
    throw redirect(303, "/create-profil");
  }

  const user = await db.getUser(userId);

  return {
    user,
  };
}

export const actions = {
  update: async ({ request, cookies }) => {
    const userId = cookies.get("userId");

    if (!userId) {
      throw redirect(303, "/create-profil");
    }

    const data = await request.formData();

    const interestedSports = [];

    for (let i = 1; i <= 5; i++) {
      const sport = data.get(`sport${i}`);
      const level = data.get(`level${i}`);

      if (sport && level) {
        interestedSports.push({
          sport,
          level,
        });
      }
    }

    const updatedUser = {
      firstname: data.get("firstname"),
      lastname: data.get("lastname"),
      birthday: data.get("birthday"),
      email: data.get("email"),
      phone: data.get("phone"),
      canton: data.get("canton"),
      municipality: data.get("municipality"),
      interestedSports,
      gender: data.get("gender"),
      goal: data.get("goal"),
    };

    if (
      !updatedUser.firstname ||
      !updatedUser.lastname ||
      !updatedUser.email ||
      !updatedUser.gender
    ) {
      return fail(400, {
        message: "Bitte füllen Sie alle Pflichtfelder aus.",
      });
    }

    await db.updateUser(userId, updatedUser);

    return {
      message: "Profil wurde gespeichert.",
    };
  },

  delete: async ({ cookies }) => {
    const userId = cookies.get("userId");

    if (userId) {
      await db.deleteUser(userId);
    }

    cookies.delete("userId", {
      path: "/",
    });

    throw redirect(303, "/");
  },
};
