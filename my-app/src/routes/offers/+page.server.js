import db from "$lib/db.js";

function getOfferScore(offer, user) {
  let score = 0;

  const interestedSports =
    user?.interestedSports?.map((interest) => interest.sport) || [];

  if (interestedSports.includes(offer.sport)) {
    score += 100;
  }

  if (offer.location?.address?.municipality === user?.municipality) {
    score += 50;
  }

  if (offer.location?.address?.canton === user?.canton) {
    score += 25;
  }

  return score;
}

export async function load({ cookies, url }) {
  const userId = cookies.get("userId");
  const profileCreated = url.searchParams.get("profileCreated") === "true";

  const [user, offers, favoriteOfferIds] = await Promise.all([
    userId ? db.getUser(userId) : null,
    db.getOffers(),
    userId ? db.getFavoriteOfferIds(userId) : [],
  ]);

  const offersWithRatings = offers.map((offer) => {
    return {
      ...offer,
      ratingAvg: offer.ratingAvg || 0,
      reviewCount: offer.reviewCount || 0,
    };
  });

  const offersWithFavorites = offersWithRatings.map((offer) => {
    return {
      ...offer,
      isFavorite: favoriteOfferIds.includes(offer._id),
    };
  });

  let sortedOffers = offersWithFavorites;
  let matchingOffers = [];
  let recommendedOffers = [];

  if (user) {
    const interestedSports =
      user.interestedSports?.map((interest) => interest.sport) || [];

    sortedOffers = offersWithFavorites
      .map((offer) => {
        return {
          ...offer,
          matchScore: getOfferScore(offer, user),
        };
      })
      .sort((a, b) => {
        return b.matchScore - a.matchScore;
      });

    matchingOffers = sortedOffers.filter((offer) => {
      return interestedSports.includes(offer.sport);
    });

    recommendedOffers = sortedOffers.filter((offer) => {
      return (
        offer.location?.address?.canton === user.canton &&
        !interestedSports.includes(offer.sport)
      );
    });
  } else {
    recommendedOffers = offersWithFavorites;
  }

  return {
    user,

    // wichtig: für die Suche alle Offers zurückgeben
    offers: sortedOffers,

    // nur die Cards auf der Startseite kürzen
    matchingOffers: matchingOffers.slice(0, 6),
    recommendedOffers: recommendedOffers.slice(0, 6),

    profileCreated,
  };
}

export const actions = {
  toggleFavorite: async ({ request, cookies }) => {
    const userId = cookies.get("userId");

    const data = await request.formData();
    const offerId = data.get("offerId");

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
