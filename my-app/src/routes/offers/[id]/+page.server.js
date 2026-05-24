import db from "$lib/db.js";
import { fail } from "@sveltejs/kit";

export async function load({ params, cookies }) {
  const userId = cookies.get("userId");

  const offer = await db.getOffer(params.id);
  const reviews = await db.getReviewsByOffer(params.id);

  let isFavorite = false;

  if (userId) {
    const favoriteOfferIds = await db.getFavoriteOfferIds(userId);
    isFavorite = favoriteOfferIds.includes(params.id);
  }

  if (offer) {
    offer.isFavorite = isFavorite;
  }

  return {
    offer,
    reviews,
    isAdmin: true,
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

  createReview: async ({ request, params }) => {
    try {
      const formData = await request.formData();

      const rating = Number(formData.get("rating"));
      const comment = formData.get("comment");

      if (!rating || rating < 1 || rating > 5) {
        return fail(400, {
          error: "Bitte eine Bewertung zwischen 1 und 5 auswählen.",
        });
      }

      if (!comment || comment.trim().length < 3) {
        return fail(400, {
          error: "Bitte einen Kommentar eingeben.",
        });
      }

      const review = {
        id: crypto.randomUUID(),
        bookingId: null,
        customerId: "user_mock",
        trainerId: null,
        offerId: params.id,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        isMock: false,
      };

      await db.createReview(review);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Fehler beim Speichern der Bewertung:", error);

      return fail(500, {
        error: "Bewertung konnte nicht gespeichert werden.",
      });
    }
  },

  deleteReview: async ({ request }) => {
    const currentUser = {
      id: "user_001",
      role: "admin",
    };

    if (currentUser.role !== "admin") {
      return fail(403, {
        error: "Du hast keine Berechtigung, Bewertungen zu löschen.",
      });
    }

    const formData = await request.formData();
    const reviewId = formData.get("reviewId");

    if (!reviewId) {
      return fail(400, {
        error: "Keine Bewertung ausgewählt.",
      });
    }

    await db.deleteReview(reviewId);

    return {
      success: true,
    };
  },
};
