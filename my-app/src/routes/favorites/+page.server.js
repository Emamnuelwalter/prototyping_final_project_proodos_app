import { redirect } from "@sveltejs/kit";
import db from "$lib/db.js";

export async function load({ cookies }) {
  const userId = cookies.get("userId");

  if (!userId) {
    throw redirect(303, "/create-profil");
  }

  const offers = await db.getFavoriteOffersByUser(userId);

  return {
    offers,
  };
}


export const actions = {
  toggleFavorite: async ({ request, cookies }) => {
    const userId = cookies.get("userId");

    if (!userId) {
      return {
        success: false,
      };
    }

    const data = await request.formData();
    const offerId = data.get("offerId");

    if (!offerId) {
      return {
        success: false,
      };
    }

    const isFavorite = await db.toggleFavorite(userId, offerId);

    return {
      success: true,
      isFavorite,
    };
  },
};
