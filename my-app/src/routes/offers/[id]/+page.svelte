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
      <div>
        <nav class="breadcrumb-nav mb-4">
          <a href="/offers">Angebote</a>
          <span>/</span>
          <span>{offer.title}</span>
        </nav>
      </div>
      <div class="col-lg-8 mb-4">
        <OfferDetail {offer} />

        <div class="mt-5">
          <RatingSummary {reviews} />
          <ReviewList
            reviews={data.reviews}
            {form}
            isAdmin={data.isAdmin}
            canReview={data.canReview}
          />
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

<style>
  .breadcrumb-nav {
    display: flex;
    gap: 8px;
    font-size: 15px;
    color: #6c757d;
  }

  .breadcrumb-nav a {
    color: #0d6efd;
    text-decoration: none;
  }

  .breadcrumb-nav a:hover {
    text-decoration: underline;
  }
</style>
