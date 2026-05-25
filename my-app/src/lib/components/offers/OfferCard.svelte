<script>
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";

  let { offer, removeOnUnfavorite = false, onUnfavorite = null } = $props();

  let isFavorite = $state(false);
  let isVisible = $state(true);

  $effect(() => {
    isFavorite = offer.isFavorite === true;
  });

  // dein restlicher Code bleibt

  let trainerName = $derived(
    (offer.trainer?.firstname || offer.trainer?.firstName || "") +
      " " +
      (offer.trainer?.lastname || offer.trainer?.lastName || ""),
  );

  let locationName = $derived(offer.location?.name || "Standort offen");
  let municipality = $derived(offer.location?.address?.municipality || "");
  let canton = $derived(offer.location?.address?.canton || "");
</script>

{#if isVisible}
  <div class="offer-card">
    <div class="offer-card">
      <div class="image-box">
        <a href={"/offers/" + offer._id} class="offer-link">
          <img src="/img/offers_placeholder.png" alt="Trainingsangebot" />
        </a>

        <form
          method="POST"
          action="?/toggleFavorite"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === "success" && result.data?.success) {
                isFavorite = result.data.isFavorite;

                if (removeOnUnfavorite && !isFavorite) {
                  isVisible = false;

                  if (onUnfavorite) {
                    onUnfavorite(offer._id);
                  }
                }

                await invalidateAll();
              }
            };
          }}
        >
          <input type="hidden" name="offerId" value={offer._id} />

          <button class:liked-heart={isFavorite} class="heart-button" type="submit">
            {isFavorite ? "♥" : "♡"}
          </button>
        </form>
      </div>

      <a href={"/offers/" + offer._id} class="offer-link">
        <div class="offer-info">
          <h5>{offer.title}</h5>
          <p>{trainerName}</p>
          <p>{offer.levels?.join(", ")}</p>
          <p>{municipality}, {canton}</p>
          <p class="price">{offer.pricePerHour} {offer.currency}/h</p>
        </div>
      </a>
    </div>
  </div>
{/if}

<style>
  .offer-link {
    color: inherit;
    text-decoration: none;
    height: 100%;
    display: block;
  }

  .offer-card {
    height: 100%;
    min-height: 350px;
    border-radius: 16px;
    overflow: hidden;
    background-color: #999;
    color: white;
  }

  .image-box {
    position: relative;
    background-color: #f3f4f6;
  }

  .image-box img {
    width: 100%;
    height: 170px;
    object-fit: cover;
    display: block;
  }

  .heart-button {
    position: absolute;
    top: 12px;
    right: 12px;
    border: none;
    border-radius: 8px;
    background-color: #555;
    color: white;
    font-size: 22px;
    width: 44px;
    height: 40px;
  }

  .offer-info {
    padding: 14px;
  }

  .offer-info h5 {
    min-height: 58px;
    margin-bottom: 12px;
    font-size: 20px;
    font-weight: 600;
  }

  .offer-info p {
    margin: 0;
    font-size: 15px;
  }

  .price {
    margin-top: 6px;
    font-weight: 600;
  }

  .liked-heart {
  background-color: #555;
  color: red;
}
</style>
