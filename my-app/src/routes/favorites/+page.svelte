<script>
  import OfferCard from "$lib/components/offers/OfferCard.svelte";

  let { data } = $props();

  let offers = $state([]);

  $effect(() => {
    offers = data.offers || [];
  });

  function removeFavorite(offerId) {
    offers = offers.filter((offer) => offer._id !== offerId);
  }
</script>

<div class="container py-5">
  <h1 class="mb-4">Favorisierte Angebote</h1>

  {#if offers.length > 0}
    <div class="row">
      {#each offers as offer (offer._id)}
        <div class="col-md-4 mb-4">
          <OfferCard
            {offer}
            removeOnUnfavorite={true}
            onUnfavorite={removeFavorite}
          />
        </div>
      {/each}
    </div>
  {:else}
    <p class="text-muted">Du hast noch keine Angebote favorisiert.</p>
    <a href="/offers" class="btn btn-primary">Angebote entdecken</a>
  {/if}
</div>
