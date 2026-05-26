import db from "$lib/db.js";

function sortByUserSports(offers, user) {
  const interestedSports =
    user?.interestedSports?.map((interest) => interest.sport) || [];

  return [...offers].sort((a, b) => {
    const aMatchesSport = interestedSports.includes(a.sport);
    const bMatchesSport = interestedSports.includes(b.sport);

    if (aMatchesSport && !bMatchesSport) return -1;
    if (!aMatchesSport && bMatchesSport) return 1;

    return 0;
  });
}

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

  let defaultMapOffers = offersWithFavorites;
  let mapMode = "all";

  if (user) {
    const interestedSports =
      user.interestedSports?.map((interest) => interest.sport) || [];

    const cantonOffers = offersWithFavorites.filter((offer) => {
      return offer.location?.address?.canton === user.canton;
    });

    const interestedSportOffers = offersWithFavorites.filter((offer) => {
      return interestedSports.includes(offer.sport);
    });

    if (cantonOffers.length > 0) {
      defaultMapOffers = sortByUserSports(cantonOffers, user);
      mapMode = "canton";
    } else if (interestedSportOffers.length > 0) {
      defaultMapOffers = interestedSportOffers;
      mapMode = "sports";
    } else {
      defaultMapOffers = offersWithFavorites;
      mapMode = "all";
    }
  }

  return {
    user,
    offers: offersWithFavorites,
    defaultMapOffers,
    mapMode,
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
