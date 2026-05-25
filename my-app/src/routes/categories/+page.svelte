<script>
  const sports = [
    "Krafttraining",
    "Tennis",
    "Schwimmen",
    "Boxen",
    "Yoga",
    "Golf",
  ];
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

  <div class="row">
    {#each sports as sport}
      <div class="col-12 col-sm-6 col-lg-4 mb-4">
        <a href={"/categories/" + sport} class="category-card">
          <img
            src="/img/offers_placeholder.png"
            alt={sport}
            class="category-img"
          />

          <div class="category-text">
            <h4>{sport}</h4>
          </div>
        </a>
      </div>
    {/each}
  </div>
</div>

<style>
  .category-card {
    display: block;
    border-radius: 16px;
    overflow: hidden;
    text-decoration: none;
    color: white;
    background-color: #999;
  }

  .category-img {
    width: 100%;
    height: 160px;
    object-fit: cover;
    display: block;
  }

  .category-text {
    padding: 16px;
  }

  .category-text h4 {
    margin: 0;
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
