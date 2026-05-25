import db from "$lib/db.js";

export async function load({ cookies }) {
  const userId = cookies.get("userId");

  const offers = await db.getOffers();
  const user = userId ? await db.getUser(userId) : null;

  let favoriteOfferIds = [];

  if (userId) {
    favoriteOfferIds = await db.getFavoriteOfferIds(userId);
  }

  const offersWithFavorites = offers.map((offer) => {
    return {
      ...offer,
      isFavorite: favoriteOfferIds.includes(offer._id),
    };
  });

  return {
    user,
    offers: offersWithFavorites,
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
