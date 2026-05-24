<script>
  import OfferCard from "$lib/components/offers/OfferCard.svelte";

  let { title, offers = [] } = $props();

  let visibleCount = $state(4);

  let visibleOffers = $derived(offers.slice(0, visibleCount));

  function showMore() {
    visibleCount = visibleCount + 8;
  }

  function showLess() {
    visibleCount = visibleCount - 8;

    if (visibleCount < 4) {
      visibleCount = 4;
    }
  }
</script>

<section class="mb-5">
  <h3 class="mb-4">{title}</h3>

  <div class="row g-4">
    {#each visibleOffers as offer}
      <div class="col-12 col-md-6 col-xl-3">
        <OfferCard {offer} />
      </div>
    {/each}
  </div>

  {#if offers.length > 4}
    <div class="text-center mt-4 d-flex justify-content-center gap-2">
      {#if visibleCount > 4}
        <button class="btn btn-outline-secondary" onclick={showLess}>
          Weniger anzeigen
        </button>
      {/if}

      {#if visibleCount < offers.length}
        <button class="btn btn-outline-primary" onclick={showMore}>
          Mehr anzeigen
        </button>
      {/if}
    </div>
  {/if}
</section>
