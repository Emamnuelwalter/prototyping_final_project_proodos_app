<script>
  import { enhance } from "$app/forms";
  import { tick } from "svelte";
  import SearchBar from "$lib/components/search bar/SearchBar.svelte";
  import LeafletMap from "$lib/components/map/LeafletMap.svelte";

  let { data } = $props();

  let offers = $derived(data.offers || []);
  let defaultMapOffers = $derived(data.defaultMapOffers || []);
  let user = $derived(data.user);

  let search = $state("");
  let sortBy = $state("relevance");
  let searchFilteredOffers = $state([]);
  let searchIsActive = $state(false);
  let selectedOffer = $state(null);
  let visibleLimit = $state(5);
  let resultPanel;

  let baseVisibleOffers = $derived(
    sortOffers(searchIsActive ? searchFilteredOffers : defaultMapOffers),
  );

  let visibleOffers = $derived.by(() => {
    const visible = baseVisibleOffers.slice(0, visibleLimit);

    if (!selectedOffer) {
      return visible;
    }

    return [
      selectedOffer,
      ...visible.filter((offer) => {
        return offer._id !== selectedOffer._id;
      }),
    ];
  });

  function trainerName(offer) {
    return (
      (offer.trainer?.firstname || offer.trainer?.firstName || "") +
      " " +
      (offer.trainer?.lastname || offer.trainer?.lastName || "")
    ).trim();
  }

  function isInterestedSport(offer) {
    if (!user?.interestedSports) return false;

    return user.interestedSports.some((interest) => {
      return interest.sport === offer.sport;
    });
  }

  function getNextDate(offer) {
    if (!offer.availableTimes || offer.availableTimes.length === 0) {
      return "9999-12-31";
    }

    return offer.availableTimes[0].date;
  }

  function sortOffers(list) {
    let sorted = [...list];

    if (sortBy === "relevance") {
      sorted.sort((a, b) => {
        const aInterested = isInterestedSport(a);
        const bInterested = isInterestedSport(b);

        if (aInterested && !bInterested) return -1;
        if (!aInterested && bInterested) return 1;

        return 0;
      });
    }

    if (sortBy === "location") {
      sorted.sort((a, b) => {
        const aIsMunicipality =
          a.location?.address?.municipality === user?.municipality;
        const bIsMunicipality =
          b.location?.address?.municipality === user?.municipality;

        if (aIsMunicipality && !bIsMunicipality) return -1;
        if (!aIsMunicipality && bIsMunicipality) return 1;

        return 0;
      });
    }

    if (sortBy === "rating") {
      sorted.sort((a, b) => {
        return Number(b.averageRating || 0) - Number(a.averageRating || 0);
      });
    }

    if (sortBy === "priceLow") {
      sorted.sort((a, b) => {
        return Number(a.pricePerHour || 0) - Number(b.pricePerHour || 0);
      });
    }

    if (sortBy === "priceHigh") {
      sorted.sort((a, b) => {
        return Number(b.pricePerHour || 0) - Number(a.pricePerHour || 0);
      });
    }

    if (sortBy === "date") {
      sorted.sort((a, b) => {
        return getNextDate(a).localeCompare(getNextDate(b));
      });
    }

    return sorted;
  }

  async function selectOffer(offer) {
    selectedOffer = offer;

    await tick();

    if (resultPanel) {
      resultPanel.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
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

    const destinationText = [
      offer.location?.name,
      offer.location?.address?.street,
      offer.location?.address?.postalCode,
      offer.location?.address?.municipality,
      offer.location?.address?.canton,
      "Schweiz",
    ]
      .filter(Boolean)
      .join(", ");

    if (lat && lng) {
      return (
        "https://www.google.com/maps/dir/?api=1" +
        `&destination=${encodeURIComponent(`${lat},${lng}`)}` +
        `&travelmode=driving`
      );
    }

    return (
      "https://www.google.com/maps/dir/?api=1" +
      `&destination=${encodeURIComponent(destinationText)}` +
      `&travelmode=driving`
    );
  }

  $effect(() => {
    searchIsActive;
    search;
    sortBy;

    visibleLimit = searchIsActive ? 8 : 5;
    selectedOffer = null;
  });
</script>

<div class="container py-5">
  <h1 class="mb-2">Trainingsstandorte entdecken</h1>
  <p class="text-muted mb-4">Finden Sie passende Angebote auf der Karte.</p>

  {#if !searchIsActive}
    {#if !searchIsActive && data.mapMode === "sports"}
      <div class="alert alert-info mb-4">
        In Ihrem Kanton wurden keine Angebote gefunden. Es werden Angebote zu
        Ihren Sportarten angezeigt.
      </div>
    {:else if !searchIsActive && data.mapMode === "all"}
      <div class="alert alert-secondary mb-4">
        Es werden alle verfügbaren Trainingsangebote angezeigt.
      </div>
    {/if}
  {/if}

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
      <div class="result-panel" bind:this={resultPanel}>
        <h4 class="mb-3">
          {searchIsActive ? "Suchergebnisse" : "Angezeigte Angebote"}
        </h4>
        <select
          class="form-select mb-3"
          value={sortBy}
          onchange={(event) => {
            sortBy = event.target.value;
          }}
        >
          <option value="relevance">Relevanz</option>
          <option value="location">Standortnähe</option>
          <option value="rating">Beste Bewertung</option>
          <option value="priceLow">Preis aufsteigend</option>
          <option value="priceHigh">Preis absteigend</option>
          <option value="date">Nächster Termin</option>
        </select>

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
                    {offer.location?.address?.municipality}
                  </span>

                  <br />

                  <small>
                    {offer.sport} · {offer.pricePerHour}
                    {offer.currency}/h
                  </small>

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
