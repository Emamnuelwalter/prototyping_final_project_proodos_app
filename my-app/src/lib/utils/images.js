const sportImages = {
  Krafttraining: "/img/offers/strength.jpg",
  Tennis: "/img/offers/tennis.jpg",
  Schwimmen: "/img/offers/swimming.jpg",
  Boxen: "/img/offers/boxing.jpg",
  Yoga: "/img/offers/yoga.jpg",
  Golf: "/img/offers/golf.jpg",
  Pilates: "/img/offers/pilates.jpg",
  Laufcoaching: "/img/offers/running.jpg",
  Hyrox: "/img/offers/hyrox.jpg",
  Triathlon: "/img/offers/triathlon.jpg",
  Athletiktraining: "/img/offers/athletics.jpg",
};

const sportPictograms = {
  Krafttraining: "/img/pictograms/pik_strength.jpg",
  Tennis: "/img/pictograms/pik_tennis.jpg",
  Schwimmen: "/img/pictograms/pik_swimming.jpg",
  Boxen: "/img/pictograms/pik_boxing.jpg",
  Yoga: "/img/pictograms/pik_yoga.jpg",
  Golf: "/img/pictograms/pik_golfing.jpg",
  Pilates: "/img/pictograms/pik_pilates.jpg",
  Laufcoaching: "/img/pictograms/pik_running.jpg",
  Hyrox: "/img/pictograms/pik_hyrox.jpg",
  Triathlon: "/img/pictograms/pik_triathlon.jpg",
  Athletiktraining: "/img/pictograms/pik_athletics.jpg",
};

const trainerImages = {
  Weiblich: ["/img/trainers/women.jpg", "/img/trainers/women2.jpg"],
  Männlich: ["/img/trainers/man.jpg", "/img/trainers/man2.jpg"],
  Divers: ["/img/trainers/neutral1.jpg", "/img/trainers/neutral2.jpg"],
};

export function getOfferImage(sport) {
  return sportImages[sport] || "/img/offers/default.jpg";
}

export function getSportPictogram(sport) {
  return sportPictograms[sport] || "/img/pictograms/pik_default.png";
}

export function getTrainerImage(trainer) {
  const gender = trainer?.gender || "Divers";

  const images =
    gender === "Weiblich"
      ? trainerImages.Weiblich
      : gender === "Männlich"
        ? trainerImages.Männlich
        : trainerImages.Divers;

  const id =
    trainer?._id || trainer?.id || trainer?.email || trainer?.firstName || "";
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash += id.charCodeAt(i);
  }

  const index = hash % images.length;

  return images[index];
}
