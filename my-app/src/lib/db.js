import { MongoClient, ObjectId } from "mongodb";
import { DB_URI } from "$env/static/private";

const client = new MongoClient(DB_URI);

await client.connect();
const db = client.db("proobosapp"); //database

// Wandelt MongoDB ObjectIds in Strings um
function convertId(document) {
  if (!document) return null;

  if (document._id && typeof document._id !== "string") {
    document._id = document._id.toString();
  }

  return document;
}

// Unterstützt sowohl echte ObjectIds als auch Mock-IDs wie "offer_001"
function createIdQuery(id) {
  if (ObjectId.isValid(id) && id.length === 24) {
    return { _id: new ObjectId(id) };
  }

  return { _id: id };
}

// Users / Profile

// Get user by id
async function getUser(id) {
  let user = null;

  try {
    const collection = db.collection("users");
    const query = createIdQuery(id);

    user = await collection.findOne(query);

    if (!user) {
      console.log("No user with id " + id);
    } else {
      user = convertId(user);
    }
  } catch (error) {
    console.log(error.message);
  }

  return user;
}

// Create user profile
// Example user object:
/*
{
  firstName: "Mark",
  lastName: "Meier",
  email: "mark.meier@email.ch",
  phone: "+41 79 123 45 67",
  canton: "Zürich",
  municipality: "Winterthur",
  roles: ["customer"],
  interestedSports: [
    { sport: "Krafttraining", level: "Anfänger" },
    { sport: "Tennis", level: "Mittel" },
    { sport: "Schwimmen", level: "Anfänger" }
  ]
}
*/
async function createUser(user) {
  try {
    const collection = db.collection("users");

    user.roles = ["customer"];
    user.createdAt = new Date().toISOString();
    user.isMock = false;

    const result = await collection.insertOne(user);
    return result.insertedId.toString();
  } catch (error) {
    console.log(error.message);
  }

  return null;
}

// Sports

// Get all sports for the sports catalog
async function getSports() {
  return ["Krafttraining", "Tennis", "Schwimmen", "Boxen", "Yoga", "Golf"];
}

// Training Offers

// Get all offers, optional filtered by sport
async function getOffers(sport = null) {
  let offers = [];

  try {
    const collection = db.collection("trainingOffers");

    const query = sport ? { sport: sport } : {};

    offers = await collection.find(query).toArray();

    for (const offer of offers) {
      convertId(offer);

      const trainer = await db.collection("users").findOne({
        _id: offer.trainerId,
      });

      const location = await db.collection("trainingLocations").findOne({
        _id: offer.locationId,
      });

      offer.trainer = trainer;
      offer.location = location;
    }
  } catch (error) {
    console.log(error.message);
  }

  return offers;
}

// Get offer by id including trainer and location
async function getOffer(id) {
  let offer = null;

  try {
    const collection = db.collection("trainingOffers");
    const query = createIdQuery(id);

    offer = await collection.findOne(query);

    if (!offer) {
      console.log("No offer with id " + id);
      return null;
    }

    offer = convertId(offer);

    // Trainer ergänzen
    const usersCollection = db.collection("users");
    const trainer = await usersCollection.findOne(
      createIdQuery(offer.trainerId),
    );
    offer.trainer = convertId(trainer);

    // Standort ergänzen
    const locationsCollection = db.collection("trainingLocations");
    const location = await locationsCollection.findOne(
      createIdQuery(offer.locationId),
    );
    offer.location = convertId(location);
  } catch (error) {
    console.log(error.message);
  }

  return offer;
}

// Bookings

// Create booking
// Example booking object:
/*
{
  customerId: "user_001",
  offerId: "offer_001",
  locationId: "location_009",
  date: "2026-04-26",
  startTime: "10:00",
  endTime: "11:00"
}
*/
async function createBookingNumber() {
  const year = new Date().getFullYear();
  const prefix = `BKG-${year}-`;

  const bookingsCollection = db.collection("bookings");

  const lastBooking = await bookingsCollection
    .find({
      bookingNumber: { $regex: `^${prefix}` },
    })
    .sort({
      bookingNumber: -1,
    })
    .limit(1)
    .toArray();

  let nextNumber = 1;

  if (lastBooking.length > 0) {
    const lastNumber = lastBooking[0].bookingNumber.split("-")[2];
    nextNumber = Number(lastNumber) + 1;
  }

  return prefix + String(nextNumber).padStart(4, "0");
}
async function createBooking(booking) {
  try {
    const offersCollection = db.collection("trainingOffers");
    const offer = await offersCollection.findOne(
      createIdQuery(booking.offerId),
    );

    if (!offer) {
      console.log("No offer with id " + booking.offerId);
      return null;
    }

    const bookingNumber = await createBookingNumber();

    const newBooking = {
      bookingNumber: bookingNumber,
      customerId: booking.customerId,
      trainerId: offer.trainerId,
      offerId: booking.offerId,
      locationId: booking.locationId || offer.locationId,
      requestedLocation: booking.requestedLocation || null,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      repeat: booking.repeat || "none",
      status: "confirmed",
      price: offer.pricePerHour,
      currency: offer.currency,
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      isMock: false,
    };

    const bookingsCollection = db.collection("bookings");
    const result = await bookingsCollection.insertOne(newBooking);

    return {
      id: result.insertedId.toString(),
      bookingNumber: newBooking.bookingNumber,
    };
  } catch (error) {
    console.log(error.message);
  }

  return null;
}

// Get booking by id including offer, trainer and location
async function getBooking(id) {
  let booking = null;

  try {
    const collection = db.collection("bookings");
    booking = await collection.findOne(createIdQuery(id));

    if (!booking) {
      return null;
    }

    convertId(booking);

    const offer = await db.collection("trainingOffers").findOne({
      _id: booking.offerId,
    });

    const trainer = await db.collection("users").findOne({
      _id: booking.trainerId,
    });

    const location = await db.collection("trainingLocations").findOne({
      _id: booking.locationId,
    });

    booking.offer = offer;
    booking.trainer = trainer;
    booking.location = location;
  } catch (error) {
    console.log(error.message);
  }

  return booking;
}

// Get all bookings of one user
async function getBookingsByUser(userId) {
  let bookings = [];

  try {
    const collection = db.collection("bookings");

    bookings = await collection
      .find({
        customerId: userId,
      })
      .toArray();

    for (const booking of bookings) {
      convertId(booking);

      const offer = await db.collection("trainingOffers").findOne({
        _id: booking.offerId,
      });

      const trainer = await db.collection("users").findOne({
        _id: booking.trainerId,
      });

      const location = await db.collection("trainingLocations").findOne({
        _id: booking.locationId,
      });

      booking.offer = offer;
      booking.trainer = trainer;
      booking.location = location;
    }
  } catch (error) {
    console.log(error.message);
  }

  return bookings;
}

// Training Locations

// Get all training locations
async function getTrainingLocations() {
  let locations = [];

  try {
    const collection = db.collection("trainingLocations");

    locations = await collection.find({}).toArray();

    locations.forEach((location) => {
      convertId(location);
    });
  } catch (error) {
    console.log(error.message);
  }

  return locations;
}

// Get locations by sport
async function getTrainingLocationsBySport(sport) {
  let locations = [];

  try {
    const collection = db.collection("trainingLocations");
    const query = { sports: sport };

    locations = await collection.find(query).toArray();

    locations.forEach((location) => {
      convertId(location);
    });
  } catch (error) {
    console.log(error.message);
  }

  return locations;
}
// Get confirmed bookings for one offer
async function getBookingsByOffer(offerId) {
  let bookings = [];

  try {
    const collection = db.collection("bookings");

    bookings = await collection
      .find({
        offerId: offerId,
        status: "confirmed",
      })
      .toArray();

    bookings.forEach((booking) => {
      convertId(booking);
    });
  } catch (error) {
    console.log(error.message);
  }

  return bookings;
}

async function deleteUser(userId) {
  try {
    const users = db.collection("users");
    const bookings = db.collection("bookings");

    await bookings.deleteMany({ customerId: userId });

    const result = await users.deleteOne(createIdQuery(userId));

    if (result.deletedCount === 0) {
      console.log("No user with id " + userId);
      return null;
    }

    return userId;
  } catch (error) {
    console.log(error.message);
  }

  return null;
}

async function deleteBooking(bookingId, userId) {
  try {
    const collection = db.collection("bookings");

    const result = await collection.updateOne(
      {
        ...createIdQuery(bookingId),
        customerId: userId,
      },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.log(error.message);
  }

  return false;
}

async function deleteBookingSeries(repeatGroupId, userId) {
  try {
    const collection = db.collection("bookings");

    const result = await collection.updateMany(
      {
        repeatGroupId: repeatGroupId,
        customerId: userId,
      },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.log(error.message);
  }

  return false;
}

async function getReviewsByOffer(offerId) {
  const collection = db.collection("reviews");

  const reviews = await collection
    .find({ offerId: offerId })
    .sort({ createdAt: -1 })
    .toArray();

  return reviews.map((review) => ({
    ...review,
    _id: review._id.toString(),
  }));
}

async function updateOfferRating(offerId) {
  const reviewsCollection = db.collection("reviews");
  const trainingOffersCollection = db.collection("trainingOffers");

  const reviews = await reviewsCollection.find({ offerId: offerId }).toArray();

  const reviewCount = reviews.length;

  let averageRating = 0;

  if (reviewCount > 0) {
    const totalRating = reviews.reduce((sum, review) => {
      return sum + Number(review.rating);
    }, 0);

    averageRating = totalRating / reviewCount;
  }

  await trainingOffersCollection.updateOne(
    { _id: offerId },
    {
      $set: {
        averageRating: Number(averageRating.toFixed(1)),
        reviewCount: reviewCount,
      },
    },
  );
}

async function createReview(review) {
  const collection = db.collection("reviews");

  await collection.insertOne(review);

  await updateOfferRating(review.offerId);
}

async function deleteReview(reviewId) {
  const collection = db.collection("reviews");

  const review = await collection.findOne({ id: reviewId });

  if (!review) {
    return;
  }

  await collection.deleteOne({ id: reviewId });

  await updateOfferRating(review.offerId);
}

async function getFreeTimesByOffer(offerId, currentBookingId) {
  const offersCollection = db.collection("trainingOffers");
  const bookingsCollection = db.collection("bookings");

  const offer = await offersCollection.findOne({ _id: offerId });

  if (!offer || !offer.availableTimes) {
    return [];
  }

  const bookings = await bookingsCollection
    .find({
      offerId: offerId,
      status: { $ne: "cancelled" },
    })
    .toArray();

  const blockedSlots = bookings
    .filter((booking) => booking._id !== currentBookingId)
    .map((booking) => {
      return `${booking.date}_${booking.startTime}_${booking.endTime}`;
    });

  const freeTimes = offer.availableTimes.filter((time) => {
    const slotKey = `${time.date}_${time.startTime}_${time.endTime}`;

    return !blockedSlots.includes(slotKey);
  });

  return freeTimes;
}

async function rescheduleBooking(
  bookingId,
  userId,
  newDate,
  newStartTime,
  newEndTime,
) {
  try {
    const collection = db.collection("bookings");

    const result = await collection.updateOne(
      {
        ...createIdQuery(bookingId),
        customerId: userId,
      },
      {
        $set: {
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          status: "rescheduled",
          updatedAt: new Date().toISOString(),
        },
      },
    );

    console.log("Reschedule result:", result);
  } catch (error) {
    console.log(error.message);
  }
}

async function updateUser(userId, updatedUser) {
  try {
    const collection = db.collection("users");

    await collection.updateOne(createIdQuery(userId), {
      $set: {
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        birthday: updatedUser.birthday,
        email: updatedUser.email,
        phone: updatedUser.phone,
        canton: updatedUser.canton,
        municipality: updatedUser.municipality,
        interestedSports: updatedUser.interestedSports,
        gender: updatedUser.gender,
        goal: updatedUser.goal,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function toggleFavorite(userId, offerId) {
  try {
    const collection = db.collection("favorites");

    const existingFavorite = await collection.findOne({
      userId: userId,
      offerId: offerId,
    });

    if (existingFavorite) {
      await collection.deleteOne({
        userId: userId,
        offerId: offerId,
      });

      return false;
    } else {
      await collection.insertOne({
        userId: userId,
        offerId: offerId,
        createdAt: new Date().toISOString(),
      });

      return true;
    }
  } catch (error) {
    console.log("Fehler in toggleFavorite:", error);
    return null;
  }
}

async function getFavoriteOfferIds(userId) {
  let favorites = [];

  try {
    favorites = await db
      .collection("favorites")
      .find({ userId: userId })
      .toArray();
  } catch (error) {
    console.log(error.message);
  }

  return favorites.map((favorite) => favorite.offerId);
}

async function getFavoriteOffersByUser(userId) {
  try {
    const favorites = await db
      .collection("favorites")
      .find({ userId: userId })
      .toArray();

    const favoriteOfferIds = favorites.map((favorite) => favorite.offerId);

    if (favoriteOfferIds.length === 0) {
      return [];
    }

    const offers = await getOffers();

    const favoriteOffers = offers
      .filter((offer) => favoriteOfferIds.includes(offer._id))
      .map((offer) => {
        return {
          ...offer,
          isFavorite: true,
        };
      });

    return favoriteOffers;
  } catch (error) {
    console.log("Fehler in getFavoriteOffersByUser:", error);
  }

  return [];
}

async function createRecurringBookingRequest(
  booking,
  repeatWeeks,
  repeatMessage,
) {
  try {
    const offersCollection = db.collection("trainingOffers");
    const offer = await offersCollection.findOne(
      createIdQuery(booking.offerId),
    );

    if (!offer) {
      console.log("No offer with id " + booking.offerId);
      return null;
    }

    const bookingsCollection = db.collection("bookings");
    const repeatGroupId = crypto.randomUUID();

    const createdBookings = [];

    for (let i = 0; i < repeatWeeks; i++) {
      const bookingDate = new Date(booking.date);
      bookingDate.setDate(bookingDate.getDate() + i * 7);

      const dateString = bookingDate.toISOString().split("T")[0];

      const bookingNumber = await createBookingNumber();

      const newBooking = {
        bookingNumber: bookingNumber,
        repeatGroupId: repeatGroupId,
        customerId: booking.customerId,
        trainerId: offer.trainerId,
        offerId: booking.offerId,
        locationId: booking.locationId || offer.locationId,
        requestedLocation: booking.requestedLocation || null,
        date: dateString,
        startTime: booking.startTime,
        endTime: booking.endTime,
        repeat: "weekly",
        repeatWeeks: repeatWeeks,
        repeatMessage: repeatMessage,
        status: "pending",
        price: offer.pricePerHour,
        currency: offer.currency,
        createdAt: new Date().toISOString(),
        confirmedAt: null,
        isMock: false,
      };

      const result = await bookingsCollection.insertOne(newBooking);
      createdBookings.push(result.insertedId.toString());
    }

    return createdBookings[0];
  } catch (error) {
    console.log(error.message);
  }

  return null;
}

async function getUserByLogin(username, password) {
  try {
    const collection = db.collection("users");

    const user = await collection.findOne({
      username: username,
      password: password,
    });

    if (user) {
      convertId(user);
    }

    return user;
  } catch (error) {
    console.log(error.message);
  }

  return null;
}

async function createNotification(notification) {
  const notificationsCollection = db.collection("notifications");

  const newNotification = {
    userId: notification.userId,
    sender: notification.sender || "System",
    title: notification.title,
    message: notification.message,
    type: notification.type || "info",
    bookingId: notification.bookingId || null,
    offerId: notification.offerId || null,
    offerTitle: notification.offerTitle || null,
    bookingNumber: notification.bookingNumber || null,
    isRead: false,
    createdAt: new Date().toISOString(),
    isMock: false,
  };

  const result = await notificationsCollection.insertOne(newNotification);

  return result.insertedId.toString();
}

async function getNotificationsByUser(userId) {
  try {
    const notifications = await db
      .collection("notifications")
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    notifications.forEach(convertId);

    return notifications;
  } catch (error) {
    console.log(error.message);
  }

  return [];
}

async function getUnreadNotificationCount(userId) {
  try {
    return await db.collection("notifications").countDocuments({
      userId: userId,
      isRead: false,
    });
  } catch (error) {
    console.log(error.message);
  }

  return 0;
}

async function markNotificationsAsRead(userId) {
  try {
    await db.collection("notifications").updateMany(
      {
        userId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date().toISOString(),
        },
      },
    );
  } catch (error) {
    console.log(error.message);
  }
}

async function removeBooking(bookingId, userId) {
  try {
    const collection = db.collection("bookings");

    const result = await collection.deleteOne({
      ...createIdQuery(bookingId),
      customerId: userId,
      status: "cancelled",
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.log(error.message);
  }

  return false;
}
async function deleteNotification(notificationId, userId) {
  try {
    const collection = db.collection("notifications");

    const result = await collection.deleteOne({
      ...createIdQuery(notificationId),
      userId: userId,
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.log(error.message);
  }

  return false;
}
async function removeBookingSeries(repeatGroupId, userId) {
  try {
    const collection = db.collection("bookings");

    const result = await collection.deleteMany({
      repeatGroupId: repeatGroupId,
      customerId: userId,
      status: "cancelled",
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.log(error.message);
  }

  return false;
}

export default {
  getFavoriteOfferIds,
  toggleFavorite,
  getFavoriteOffersByUser,

  updateUser,
  getFreeTimesByOffer,
  rescheduleBooking,
  getReviewsByOffer,
  updateOfferRating,

  deleteReview,
  createReview,
  getReviewsByOffer,

  getUser,
  getUserByLogin,
  createUser,
  getSports,
  deleteUser,

  getOffers,
  getOffer,

  deleteBooking,
  deleteBookingSeries,
  createBooking,
  createBookingNumber,
  getBooking,
  getBookingsByOffer,
  getBookingsByUser,
  createRecurringBookingRequest,
  removeBooking,
  removeBookingSeries,
  deleteNotification,

  getTrainingLocations,
  getTrainingLocationsBySport,

  createNotification,
  getNotificationsByUser,
  getUnreadNotificationCount,
  markNotificationsAsRead,
};
