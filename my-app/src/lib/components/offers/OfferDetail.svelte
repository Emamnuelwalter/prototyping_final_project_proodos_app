<script>
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { getOfferImage, getTrainerImage } from "$lib/utils/images.js";

  let { offer } = $props();

  let location = $derived(offer.location);
  let isFavorite = $state(false);

  $effect(() => {
    isFavorite = offer?.isFavorite === true;
  });

  function googleMapsRouteUrl(offer) {
    const location = offer.location;

    if (!location) {
      return "#";
    }

    if (location.coordinates?.lat && location.coordinates?.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    }

    const address = [
      location.name,
      location.address?.street,
      location.address?.postalCode,
      location.address?.municipality,
      location.address?.canton,
      "Switzerland",
    ]
      .filter(Boolean)
      .join(", ");

    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  }
</script>

<div class="offer-detail">
  <img src={getOfferImage(offer.sport)} alt={offer.sport} class="detail-img" />

  <div class="d-flex justify-content-between align-items-start gap-3 mt-4">
    <h1 class="mb-0">{offer.title}</h1>

    <div class="detail-actions">
      <a
        class="detail-route-button"
        href={googleMapsRouteUrl(offer)}
        target="_blank"
        rel="noreferrer"
        aria-label="Route öffnen"
        title="Route öffnen"
      >
        🧭
      </a>

      <form
        method="POST"
        action="?/toggleFavorite"
        use:enhance={() => {
          return async ({ result }) => {
            if (result.type === "success" && result.data?.success) {
              isFavorite = result.data.isFavorite;
              await invalidateAll();
            }
          };
        }}
      >
        <input type="hidden" name="offerId" value={offer._id} />

        <button
          class:liked-heart={isFavorite}
          class="detail-heart-button"
          type="submit"
          aria-label="Favorit"
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </form>
    </div>
  </div>

  <div>
    <p class="price">
      {offer.pricePerHour}
      {offer.currency} / Stunde
    </p>
    <p class="text-muted">
      📍{location?.name}, {location?.address?.municipality}
    </p>
  </div>

  <hr />

  <h4>Beschreibung</h4>
  <p>{offer.description}</p>

  <h4 class="mt-4">Anforderungen</h4>
  <ul>
    {#each offer.requirements as requirement}
      <li>{requirement}</li>
    {/each}
  </ul>

  <h4 class="mt-4">Standort</h4>
  <p>
    {location?.name}<br />
    {location?.address?.street}<br />
    {location?.address?.postalCode}
    {location?.address?.municipality},
    {location?.address?.canton}
  </p>
</div>

<style>
  .offer-detail {
    background-color: white;
  }

  .detail-img {
    width: 100%;
    height: 320px;
    object-fit: cover;
    border-radius: 20px;
  }

  .price {
    font-weight: 600;
    font-size: 18px;
  }

  .detail-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .detail-actions form {
    margin: 0;
  }

  .detail-route-button {
    border: none;
    border-radius: 10px;
    background-color: #555;
    color: white;
    font-size: 20px;
    width: 48px;
    height: 44px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  .detail-route-button:hover {
    background-color: #333;
    color: white;
  }

  .detail-heart-button {
    border: none;
    border-radius: 10px;
    background-color: #555;
    color: white;
    font-size: 24px;
    width: 48px;
    height: 44px;
    line-height: 1;
  }

  .detail-heart-button:hover {
    background-color: #333;
  }

  .liked-heart {
    background-color: #555;
    color: red;
  }
</style>
