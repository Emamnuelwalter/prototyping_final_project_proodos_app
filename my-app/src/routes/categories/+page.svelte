<script>
  import { getOfferImage, getSportPictogram } from "$lib/utils/images.js";

  let { data } = $props();

  let sports = $derived(
    (data.sports || []).toSorted((a, b) => {
      return a.localeCompare(b, "de-CH");
    }),
  );
</script>

<div class="container py-5">
  <div>
    <nav class="breadcrumb-nav mb-4">
      <a href="/offers">Angebote</a>
      <span>/</span>
      <span>Sportkategorie</span>
    </nav>
  </div>

  <h1 class="mb-4">Sportkategorien</h1>

  <div class="row g-4">
    {#each sports as sport}
      <div class="col-12 col-sm-6 col-lg-4">
        <a href={"/categories/" + sport} class="category-card">
          <img
            src={getSportPictogram(sport)}
            alt={sport}
            class="category-img"
          />

          <div class="category-title">
            {sport}
          </div>
        </a>
      </div>
    {/each}
  </div>
</div>

<style>
  .category-card {
    background: white;
    border-radius: 14px;
    overflow: hidden;
    text-decoration: none;
    display: block;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  .category-img {
    width: 62%;
    height: 190px;
    object-fit: contain;
    display: block;
    margin: 10px auto 0;
  }

  .category-title {
    background: #999;
    color: white;
    padding: 14px 18px;
    font-weight: bold;
  }

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
