<script>
  import OfferList from "$lib/components/offers/OfferList.svelte";

  let { data } = $props();
</script>

<div class="container py-5">
  <div>
    <nav class="breadcrumb-nav mb-4">
      <a href="/offers">Angebote</a>
      <span>/</span>
      <a href="/categories">Sportkategorien</a>
      <span>/</span>
      <span>{data.sport}</span>
    </nav>
  </div>

  <h1 class="mb-4">{data.sport}</h1>

  <OfferList title={"Angebote für " + data.sport} offers={data.offers} />
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
