import db from "$lib/db.js";

export async function load({ cookies, url }) {
  const userId = cookies.get("userId");
  const profileCreated = url.searchParams.get("profileCreated") === "true";

  const user = userId ? await db.getUser(userId) : null;
  const offers = await db.getOffers();

  const favoriteOfferIds = userId ? await db.getFavoriteOfferIds(userId) : [];

  const offersWithFavorites = offers.map((offer) => {
    return {
      ...offer,
      isFavorite: favoriteOfferIds.includes(offer._id),
    };
  });

  let matchingOffers = [];
  let recommendedOffers = [];

  if (user) {
    matchingOffers = offersWithFavorites.filter((offer) => {
      return user.interestedSports.some((interest) => {
        return (
          offer.sport === interest.sport &&
          offer.levels &&
          offer.levels.includes(interest.level)
        );
      });
    });

    recommendedOffers = offersWithFavorites.filter((offer) => {
      return !matchingOffers.includes(offer);
    });
  } else {
    recommendedOffers = offersWithFavorites;
  }

  return {
    user,
    offers: offersWithFavorites,
    matchingOffers,
    recommendedOffers,
    profileCreated,
  };
}

export const actions = {
  toggleFavorite: async ({ request, cookies }) => {
    const userId = cookies.get("userId");

    console.log("TOGGLE FAVORITE ACTION AUFGERUFEN");
    console.log("userId:", userId);

    const data = await request.formData();
    const offerId = data.get("offerId");

    console.log("offerId:", offerId);

    if (!userId || !offerId) {
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
