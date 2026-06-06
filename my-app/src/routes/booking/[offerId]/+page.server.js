import { fail, redirect } from "@sveltejs/kit";
import db from "$lib/db.js";

export async function load({ params }) {
  const offer = await db.getOffer(params.offerId);
  const bookings = await db.getBookingsByOffer(params.offerId);

  return {
    offer,
    bookings,
  };
}

export const actions = {
  create: async ({ request, cookies, params }) => {
    const userId = cookies.get("userId");

    if (!userId) {
      throw redirect(303, "/create-profil");
    }

    const data = await request.formData();

    const locationChoice = data.get("locationChoice");
    const hasRequestedLocation = locationChoice === "custom";

    const wantsRepeat = data.get("wantsRepeat") === "yes";
    const repeatWeeks = Number(data.get("repeatWeeks") || 1);
    const repeatMessage = data.get("repeatMessage") || "";

    let requestedLocation = null;

    if (locationChoice === "custom") {
      requestedLocation = {
        name: data.get("requestedLocationName"),
        street: data.get("requestedStreet"),
        postalCode: data.get("requestedPostalCode"),
        municipality: data.get("requestedMunicipality"),
        note: data.get("requestedLocationNote"),
      };
    }

    const booking = {
      customerId: userId,
      offerId: params.offerId,
      locationId: data.get("locationId"),
      date: data.get("date"),
      startTime: data.get("startTime"),
      endTime: data.get("endTime"),
      requestedLocation: requestedLocation,
    };

    if (!booking.date || !booking.startTime || !booking.endTime) {
      return fail(400, {
        message: "Bitte wählen Sie einen Termin aus.",
      });
    }

    const bookings = await db.getBookingsByOffer(params.offerId);

    const alreadyBooked = bookings.some(
      (item) =>
        item.date === booking.date &&
        item.startTime === booking.startTime &&
        item.endTime === booking.endTime,
    );

    if (alreadyBooked) {
      return fail(400, {
        message:
          "Dieser Termin ist bereits gebucht. Bitte wählen Sie einen anderen Termin.",
      });
    }

    let bookingId = null;
    let bookingNumber = null;

    if (wantsRepeat && repeatWeeks > 1) {
      const createdBooking = await db.createRecurringBookingRequest(
        booking,
        repeatWeeks,
        repeatMessage,
      );

      if (createdBooking) {
        bookingId = createdBooking.id;
        bookingNumber = createdBooking.bookingNumber;
      }
    } else if (hasRequestedLocation) {
      const createdBooking = await db.createBookingRequest(booking);

      if (createdBooking) {
        bookingId = createdBooking.id;
        bookingNumber = createdBooking.bookingNumber;
      }
    } else {
      const createdBooking = await db.createBooking(booking);

      if (createdBooking) {
        bookingId = createdBooking.id;
        bookingNumber = createdBooking.bookingNumber;
      }
    }
    const offer = await db.getOffer(params.offerId);

    await db.createNotification({
      userId: userId,
      sender: "System",
      title: wantsRepeat
        ? "Wiederholungsanfrage gesendet"
        : hasRequestedLocation
          ? "Standortanfrage gesendet"
          : "Buchung bestätigt",
      message: wantsRepeat
        ? "Deine Wiederholungsanfrage wurde an den Trainer gesendet."
        : hasRequestedLocation
          ? `Deine Anfrage für den Wunschstandort ${requestedLocation.name} wurde an den Trainer gesendet.`
          : "Deine Buchung wurde erfolgreich bestätigt.",
      type: wantsRepeat || hasRequestedLocation ? "warning" : "success",
      bookingId: bookingId,
      offerId: params.offerId,
      offerTitle: offer.title,
      bookingNumber: bookingNumber,
    });

    throw redirect(303, `/booking/success?bookingId=${bookingId}`);
  },
};
