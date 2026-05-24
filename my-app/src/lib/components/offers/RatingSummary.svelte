<script>
  let { reviews = [] } = $props();

  let average = $derived(
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
      : 0
  );
</script>

<div class="mb-4">
  <h2>Bewertungen</h2>

  {#if reviews.length > 0}
    <p class="mb-1">
      ⭐ {average.toFixed(1)} / 5
    </p>
    <p>
      {reviews.length} Bewertungen
    </p>
  {:else}
    <p>
      Noch keine Bewertungen vorhanden.
    </p>
  {/if}
</div>