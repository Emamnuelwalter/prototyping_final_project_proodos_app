<script>
  import { enhance } from "$app/forms";
  import SearchBar from "$lib/components/search bar/SearchBar.svelte";
  import LeafletMap from "$lib/components/map/LeafletMap.svelte";

  let { data } = $props();

  let offers = $derived(data.offers || []);
  let user = $derived(data.user);

  let search = $state("");
  let searchFilteredOffers = $state([]);
  let searchIsActive = $state(false);
  let selectedOffer = $state(null);
  let visibleLimit = $state(5);

  function trainerName(offer) {
    return (
      (offer.trainer?.firstname || offer.trainer?.firstName || "") +
      " " +
      (offer.trainer?.lastname || offer.trainer?.lastName || "")
    ).trim();
  }

  function matchesUserInterests(offer) {
    if (!user || !user.interestedSports || user.interestedSports.length === 0) {
      return true;
    }

    return user.interestedSports.some((interest) => {
      return (
        offer.sport === interest.sport &&
        offer.levels &&
        offer.levels.includes(interest.level)
      );
    });
  }

  function offerScore(offer) {
    let score = 0;

    if (
      user?.municipality &&
      offer.location?.address?.municipality === user.municipality
    ) {
      score += 5;
    }

    if (user?.canton && offer.location?.address?.canton === user.canton) {
      score += 3;
    }

    if (user?.interestedSports) {
      user.interestedSports.forEach((interest) => {
        if (offer.sport === interest.sport) {
          score += 2;
        }

        if (offer.levels?.includes(interest.level)) {
          score += 1;
        }
      });
    }

    if (offer.averageRating) {
      score += Number(offer.averageRating) / 10;
    }

    return score;
  }

  let defaultOffers = $derived(
    offers
      .filter(matchesUserInterests)
      .sort((a, b) => offerScore(b) - offerScore(a)),
  );

  let baseVisibleOffers = $derived(
    searchIsActive ? searchFilteredOffers : defaultOffers,
  );

  let visibleOffers = $derived(baseVisibleOffers.slice(0, visibleLimit));

  function selectOffer(offer) {
    if (selectedOffer?._id === offer._id) {
      selectedOffer = null;
      return;
    }

    selectedOffer = offer;
  }

  function showMoreOffers() {
    visibleLimit += 8;
  }

  function showLessOffers() {
    visibleLimit = searchIsActive ? 8 : 5;
  }

  function googleMapsRouteUrl(offer) {
    const lat =
      offer.location?.coordinates?.lat ||
      offer.location?.lat ||
      offer.location?.point?.coordinates?.[1];

    const lng =
      offer.location?.coordinates?.lng ||
      offer.location?.lng ||
      offer.location?.point?.coordinates?.[0];

    if (lat && lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    const address = [
      offer.location?.name,
      offer.location?.address?.street,
      offer.location?.address?.postalCode,
      offer.location?.address?.municipality,
    ]
      .filter(Boolean)
      .join(", ");

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  $effect(() => {
    searchIsActive;
    search;

    visibleLimit = searchIsActive ? 8 : 5;
    selectedOffer = null;
  });
</script>

<div class="container py-5">
  <h1 class="mb-2">Trainingsstandorte entdecken</h1>
  <p class="text-muted mb-4">Finden Sie passende Angebote auf der Karte.</p>

  <div class="map-search mb-4">
    <SearchBar
      {offers}
      bind:search
      bind:filteredOffers={searchFilteredOffers}
      bind:isActive={searchIsActive}
      showResults={false}
    />
  </div>

  <div class="row g-4">
    <div class="col-lg-8">
      <LeafletMap
        offers={visibleOffers}
        {selectedOffer}
        onSelectOffer={selectOffer}
      />
    </div>

    <div class="col-lg-4">
      <div class="result-panel">
        <h4 class="mb-3">
          {searchIsActive ? "Suchergebnisse" : "Passende Angebote"}
        </h4>

        {#if visibleOffers.length > 0}
          <div class="result-list">
            {#each visibleOffers as offer (offer._id)}
              <div class="result-card">
                <button
                  class:selected-result={selectedOffer?._id === offer._id}
                  class="result-item"
                  type="button"
                  onclick={() => selectOffer(offer)}
                >
                  <strong>{offer.title}</strong>
                  <br />
                  <span>
                    {trainerName(offer)} · {offer.location?.name} ·
                    {offer.pricePerHour}
                    {offer.currency}/h
                  </span>
                  <br />

                  {#if !offer.averageRating || offer.averageRating === 0}
                    <small class="text-muted">Noch keine Bewertungen</small>
                  {:else}
                    <small>⭐ {offer.averageRating}</small>
                  {/if}
                </button>

                {#if selectedOffer?._id === offer._id}
                  <div class="selected-offer-card">
                    <div class="d-grid gap-2">
                      <form
                        method="POST"
                        action="?/toggleFavorite"
                        use:enhance={() => {
                          return async ({ result }) => {
                            if (
                              result.type === "success" &&
                              result.data?.success
                            ) {
                              offer.isFavorite = result.data.isFavorite;
                            }
                          };
                        }}
                      >
                        <input type="hidden" name="offerId" value={offer._id} />

                        <button
                          class="btn btn-outline-primary w-100"
                          type="submit"
                        >
                          {offer.isFavorite
                            ? "♥ Favorit entfernen"
                            : "♡ Favorisieren"}
                        </button>
                      </form>

                      <a
                        class="btn btn-outline-secondary"
                        href={googleMapsRouteUrl(offer)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Route öffnen
                      </a>

                      <a class="btn btn-primary" href={"/offers/" + offer._id}>
                        Angebot ansehen
                      </a>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          {#if baseVisibleOffers.length > visibleLimit}
            <button
              class="btn btn-outline-primary w-100 mt-3"
              type="button"
              onclick={showMoreOffers}
            >
              Mehr anzeigen
            </button>
          {/if}

          {#if visibleLimit > (searchIsActive ? 8 : 5)}
            <button
              class="btn btn-outline-secondary w-100 mt-2"
              type="button"
              onclick={showLessOffers}
            >
              Weniger anzeigen
            </button>
          {/if}
        {:else}
          <p class="text-muted mb-0">Keine passenden Angebote gefunden.</p>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .map-search {
    max-width: 760px;
  }

  .result-panel {
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 20px;
    background-color: white;
    max-height: 520px;
    overflow-y: auto;
  }

  .result-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .result-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    background-color: white;
  }

  .result-item {
    display: block;
    width: 100%;
    text-align: left;
    border: none;
    padding: 12px;
    color: black;
    text-decoration: none;
    background-color: white;
  }

  .result-item:hover {
    background-color: #f8f9fa;
  }

  .selected-result {
    background-color: #f0f6ff;
  }

  .selected-offer-card {
    border-top: 1px solid #e5e7eb;
    padding: 12px;
    background-color: #f8f9fa;
  }
</style>
