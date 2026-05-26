import db from "$lib/db.js";
import { fail } from "@sveltejs/kit";

export async function load({ params, cookies }) {
  const userId = cookies.get("userId");

  const offer = await db.getOffer(params.id);
  const reviews = await db.getReviewsByOffer(params.id);
  const userBookings = await db.getBookingsByUser(userId);

  let isFavorite = false;
  let canReview = false;
  let userBooking = null;

  if (userId) {
    const favoriteOfferIds = await db.getFavoriteOfferIds(userId);
    isFavorite = favoriteOfferIds.includes(params.id);

    const userBookings = await db.getBookingsByUser(userId);

    userBooking = userBookings.find((booking) => {
      return booking.offerId === params.id && booking.status !== "cancelled";
    });

    canReview = userBooking ? true : false;
  }

  if (offer) {
    offer.isFavorite = isFavorite;
  }

  return {
    offer,
    reviews,
    canReview,
    userBooking,
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

  createReview: async ({ request, params, cookies }) => {
    try {
      const userId = cookies.get("userId");

      if (!userId) {
        return fail(401, {
          error: "Bitte zuerst ein Profil erstellen.",
        });
      }

      const userBookings = await db.getBookingsByUser(userId);

      const userBooking = userBookings.find((booking) => {
        return booking.offerId === params.id && booking.status !== "cancelled";
      });

      if (!userBooking) {
        return fail(403, {
          error:
            "Sie können dieses Angebot nur bewerten, wenn Sie eine Buchung dazu haben.",
        });
      }

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
        bookingId: userBooking._id,
        customerId: userId,
        trainerId: userBooking.trainerId,
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
};
