<script>
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";

  let { offer } = $props();

  let location = $derived(offer.location);
  let isFavorite = $state(false);

  $effect(() => {
    isFavorite = offer?.isFavorite === true;
  });
</script>

<div class="offer-detail">
  <img
    src="/img/offers_placeholder.png"
    alt="Trainingsangebot"
    class="detail-img"
  />
  <div class="d-flex justify-content-between align-items-start gap-3 mt-4">
    <h1 class="mb-0">{offer.title}</h1>
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

      <button class="detail-heart-button" type="submit" aria-label="Favorit">
        {isFavorite ? "♥" : "♡"}
      </button>
    </form>
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
</style>
