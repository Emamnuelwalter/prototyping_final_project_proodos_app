import { fail, redirect } from "@sveltejs/kit";
import db from "$lib/db.js";

export async function load({ cookies }) {
  const userId = cookies.get("userId");

  if (!userId) {
    throw redirect(303, "/create-profil");
  }

  const bookings = await db.getBookingsByUser(userId);

  const bookingsWithFreeTimes = await Promise.all(
    bookings.map(async (booking) => {
      const freeTimes = await db.getFreeTimesByOffer(
        booking.offerId,
        booking._id,
      );

      return {
        ...booking,
        freeTimes,
      };
    }),
  );

  return {
    bookings: bookingsWithFreeTimes,
  };
}

export const actions = {
  cancel: async ({ request, cookies }) => {
  const userId = cookies.get("userId");

  if (!userId) {
    throw redirect(303, "/create-profil");
  }

  const data = await request.formData();
  const bookingId = data.get("bookingId");
  const repeatGroupId = data.get("repeatGroupId");

  if (repeatGroupId) {
    await db.deleteBookingSeries(repeatGroupId, userId);
    throw redirect(303, "/appointments");
  }

  if (!bookingId) {
    return fail(400, {
      message: "Der Termin konnte nicht storniert werden.",
    });
  }

  await db.deleteBooking(bookingId, userId);

  throw redirect(303, "/appointments");
},

  reschedule: async ({ request, cookies }) => {
    const userId = cookies.get("userId");

    if (!userId) {
      throw redirect(303, "/create-profil");
    }

    const data = await request.formData();

    const bookingId = data.get("bookingId");
    const selectedSlot = data.get("selectedSlot");

    if (!bookingId || !selectedSlot) {
      return fail(400, {
        message: "Der Termin konnte nicht verschoben werden.",
      });
    }

    const booking = await db.getBooking(bookingId);

    if (!booking || booking.customerId !== userId) {
      return fail(403, {
        message: "Sie dürfen diesen Termin nicht verschieben.",
      });
    }

    const freeTimes = await db.getFreeTimesByOffer(
      booking.offerId,
      booking._id,
    );

    const freeSlot = freeTimes.find((time) => {
      const slotKey = `${time.date}_${time.startTime}_${time.endTime}`;
      return slotKey === selectedSlot;
    });

    if (!freeSlot) {
      return fail(400, {
        message: "Dieser Termin ist nicht mehr verfügbar.",
      });
    }

    await db.rescheduleBooking(
      bookingId,
      userId,
      freeSlot.date,
      freeSlot.startTime,
      freeSlot.endTime,
    );

    throw redirect(303, "/appointments");
  },
};
