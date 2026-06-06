import { fail, redirect } from "@sveltejs/kit";
import db from "$lib/db.js";

function formatDateCH(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export async function load({ cookies }) {
  const userId = cookies.get("userId");

  if (!userId) {
    throw redirect(303, "/login");
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
      throw redirect(303, "/login");
    }

    const data = await request.formData();
    const bookingId = data.get("bookingId");
    const repeatGroupId = data.get("repeatGroupId");

    if (repeatGroupId) {
      const booking = bookingId ? await db.getBooking(bookingId) : null;

      await db.deleteBookingSeries(repeatGroupId, userId);

      await db.createNotification({
        userId: userId,
        sender: "System",
        title: "Wiederholungsserie storniert",
        message: `Deine Wiederholungsserie${booking?.offer?.title ? ` für "${booking.offer.title}"` : ""} wurde storniert.`,
        type: "danger",
        bookingId: bookingId,
        offerId: booking?.offerId,
        offerTitle: booking?.offer?.title,
        bookingNumber: booking?.bookingNumber,
      });

      throw redirect(303, "/appointments");
    }

    if (!bookingId) {
      return fail(400, {
        message: "Der Termin konnte nicht storniert werden.",
      });
    }

    const booking = await db.getBooking(bookingId);

    await db.deleteBooking(bookingId, userId);

    await db.createNotification({
      userId: userId,
      sender: "System",
      title: "Termin storniert",
      message: `Dein Termin für "${booking?.offer?.title || "ein Training"}" am ${formatDateCH(booking?.date)} von ${booking?.startTime} bis ${booking?.endTime} wurde storniert.`,
      type: "danger",
      bookingId: bookingId,
      offerId: booking?.offerId,
      offerTitle: booking?.offer?.title,
      bookingNumber: booking?.bookingNumber,
    });

    throw redirect(303, "/appointments");
  },

  reschedule: async ({ request, cookies }) => {
    const userId = cookies.get("userId");

    if (!userId) {
      throw redirect(303, "/login");
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

    await db.createNotification({
      userId: userId,
      sender: "System",
      title: "Termin verschoben",
      message: `Dein Termin "${booking.offer?.title || "Training"}" findet neu am ${formatDateCH(freeSlot.date)} von ${freeSlot.startTime} bis ${freeSlot.endTime} Uhr statt.`,
      type: "info",
      bookingId: bookingId,
      offerId: booking.offerId,
      bookingNumber: booking?.bookingNumber,
    });

    throw redirect(303, "/appointments");
  },

  remove: async ({ request, cookies }) => {
    const userId = cookies.get("userId");

    if (!userId) {
      throw redirect(303, "/login");
    }

    const data = await request.formData();
    const bookingId = data.get("bookingId");

    if (!bookingId) {
      return fail(400, {
        message: "Der Termin konnte nicht gelöscht werden.",
      });
    }

    await db.removeBooking(bookingId, userId);

    throw redirect(303, "/appointments");
  },
  removeSeries: async ({ request, cookies }) => {
    const userId = cookies.get("userId");

    if (!userId) {
      throw redirect(303, "/login");
    }

    const data = await request.formData();
    const repeatGroupId = data.get("repeatGroupId");

    if (!repeatGroupId) {
      return fail(400, {
        message: "Die Serie konnte nicht gelöscht werden.",
      });
    }

    await db.removeBookingSeries(repeatGroupId, userId);

    throw redirect(303, "/appointments");
  },
};
