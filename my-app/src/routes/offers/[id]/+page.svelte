<script>
  import OfferDetail from "$lib/components/offers/OfferDetail.svelte";
  import TrainerCard from "$lib/components/offers/TrainerCard.svelte";
  import RatingSummary from "$lib/components/offers/RatingSummary.svelte";
  import ReviewList from "$lib/components/offers/ReviewList.svelte";

  let { data, form } = $props();

  let offer = $derived(data.offer);
  let reviews = $derived(data.reviews);
  
</script>

<div class="container py-5">
  {#if offer}
    <div class="row">
      <div class="col-lg-8 mb-4">
        <OfferDetail {offer} />

        <div class="mt-5">
          <RatingSummary {reviews} />
          <ReviewList {reviews} {form} isAdmin={data.isAdmin} />
        </div>
      </div>

      <div class="col-lg-4">
        <TrainerCard {offer} />
      </div>
    </div>
  {:else}
    <p>Dieses Angebot wurde nicht gefunden.</p>
  {/if}
</div>
