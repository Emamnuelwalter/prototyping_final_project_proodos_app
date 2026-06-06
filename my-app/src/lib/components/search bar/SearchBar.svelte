<script>
  import { onMount, tick } from "svelte";
  import { browser } from "$app/environment";
  import { sports } from "$lib/data/sports.js";
  import { cantonMunicipalities } from "$lib/data/locations.js";

  let {
    offers = [],
    search = $bindable(""),
    showResults = true,
    filteredOffers = $bindable([]),
    isActive = $bindable(false),
  } = $props();

  let showFilters = $state(false);

  let selectedSport = $state("");
  let selectedCanton = $state("");
  let selectedMunicipality = $state("");
  let selectedLevel = $state("");
  let selectedDate = $state("");
  let maxPrice = $state("");
  let minRating = $state("");

  let readyToSave = $state(false);

  const storageKey = "offerSearchFilters";
  const scrollKey = "offerSearchScrollY";

  function trainerName(offer) {
    return (
      (offer.trainer?.firstname || offer.trainer?.firstName || "") +
      " " +
      (offer.trainer?.lastname || offer.trainer?.lastName || "")
    ).trim();
  }

  function getRating(offer) {
    return Number(offer.ratingAvg || 0);
  }

  function uniqueValues(values) {
    return [...new Set(values.filter(Boolean))].sort();
  }

  let cantonOptions = $derived(Object.keys(cantonMunicipalities));

  let municipalities = $derived(
    selectedCanton && cantonMunicipalities[selectedCanton]
      ? cantonMunicipalities[selectedCanton]
      : [],
  );

  let levels = $derived(
    uniqueValues(offers.flatMap((offer) => offer.levels || [])),
  );

  let hasActiveSearch = $derived(
    search.length > 1 ||
      selectedSport ||
      selectedCanton ||
      selectedMunicipality ||
      selectedLevel ||
      selectedDate ||
      maxPrice ||
      minRating,
  );

  function handleCantonInput() {
    selectedMunicipality = "";
  }

  function matchesSearch(offer) {
    if (search.length < 2) {
      return true;
    }

    let text = "";
    text += offer.title + " ";
    text += offer.sport + " ";
    text += trainerName(offer) + " ";
    text += offer.location?.name + " ";
    text += offer.location?.address?.municipality + " ";
    text += offer.location?.address?.canton + " ";

    return text.toLowerCase().includes(search.toLowerCase());
  }

  function matchesFilters(offer) {
    const offerSport = offer.sport?.toLowerCase() || "";
    const offerCanton = offer.location?.address?.canton?.toLowerCase() || "";
    const offerMunicipality =
      offer.location?.address?.municipality?.toLowerCase() || "";

    if (selectedSport && !offerSport.includes(selectedSport.toLowerCase())) {
      return false;
    }

    if (selectedCanton && !offerCanton.includes(selectedCanton.toLowerCase())) {
      return false;
    }

    if (
      selectedMunicipality &&
      !offerMunicipality.includes(selectedMunicipality.toLowerCase())
    ) {
      return false;
    }

    if (selectedLevel && !offer.levels?.includes(selectedLevel)) {
      return false;
    }

    if (maxPrice && Number(offer.pricePerHour) > Number(maxPrice)) {
      return false;
    }

    if (minRating && getRating(offer) < Number(minRating)) {
      return false;
    }

    if (selectedDate) {
      const hasAvailableDate = offer.availableTimes?.some((time) => {
        return time.date === selectedDate && time.isAvailable !== false;
      });

      if (!hasAvailableDate) {
        return false;
      }
    }

    return true;
  }

  function resetFilters() {
    search = "";
    selectedSport = "";
    selectedCanton = "";
    selectedMunicipality = "";
    selectedLevel = "";
    selectedDate = "";
    maxPrice = "";
    minRating = "";
    showFilters = false;

    if (browser) {
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem(scrollKey);
    }
  }

  function saveScrollPosition() {
    if (browser) {
      sessionStorage.setItem(scrollKey, String(window.scrollY));
    }
  }

  let results = $derived(
    hasActiveSearch
      ? offers.filter(matchesSearch).filter(matchesFilters).slice(0, 12)
      : [],
  );

  $effect(() => {
    filteredOffers = results;
    isActive = hasActiveSearch;
  });

  onMount(async () => {
    const savedFilters = sessionStorage.getItem(storageKey);

    if (savedFilters) {
      const filters = JSON.parse(savedFilters);

      search = filters.search || "";
      showFilters = filters.showFilters || false;
      selectedSport = filters.selectedSport || "";
      selectedCanton = filters.selectedCanton || "";
      selectedMunicipality = filters.selectedMunicipality || "";
      selectedLevel = filters.selectedLevel || "";
      selectedDate = filters.selectedDate || "";
      maxPrice = filters.maxPrice || "";
      minRating = filters.minRating || "";
    }

    await tick();

    const savedScroll = sessionStorage.getItem(scrollKey);

    if (savedScroll) {
      window.scrollTo(0, Number(savedScroll));
    }

    readyToSave = true;
  });

  $effect(() => {
    if (!browser || !readyToSave) return;

    const filters = {
      search,
      showFilters,
      selectedSport,
      selectedCanton,
      selectedMunicipality,
      selectedLevel,
      selectedDate,
      maxPrice,
      minRating,
    };

    sessionStorage.setItem(storageKey, JSON.stringify(filters));
  });
</script>

<div class="search-area mb-5">
  <div class="search-row">
    <input
      id="main-search"
      class="form-control search-input"
      type="text"
      placeholder="Suche nach Sportart, Trainer oder Standort"
      bind:value={search}
    />

    <button
      class="btn btn-outline-primary filter-button"
      type="button"
      onclick={() => (showFilters = !showFilters)}
    >
      Filter
    </button>
  </div>

  {#if showFilters}
    <div class="filter-panel mt-3">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="filter-label" for="sport-filter">Sportart</label>
          <input
            id="sport-filter"
            class="form-control"
            type="text"
            list="sport-options"
            placeholder="Sportart suchen"
            bind:value={selectedSport}
          />

          <datalist id="sport-options">
            {#each sports as sport}
              <option value={sport}></option>
            {/each}
          </datalist>
        </div>

        <div class="col-md-3">
          <label class="filter-label" for="canton-filter">Kanton</label>
          <input
            id="canton-filter"
            class="form-control"
            type="text"
            list="canton-options"
            placeholder="Kanton suchen"
            bind:value={selectedCanton}
            oninput={handleCantonInput}
          />

          <datalist id="canton-options">
            {#each cantonOptions as canton}
              <option value={canton}></option>
            {/each}
          </datalist>
        </div>

        <div class="col-md-3">
          <label class="filter-label" for="municipality-filter">Gemeinde</label>
          <input
            id="municipality-filter"
            class="form-control"
            type="text"
            list="municipality-options"
            placeholder="Gemeinde suchen"
            bind:value={selectedMunicipality}
            disabled={!selectedCanton}
          />

          <datalist id="municipality-options">
            {#each municipalities as municipality}
              <option value={municipality}></option>
            {/each}
          </datalist>
        </div>

        <div class="col-md-3">
          <label class="filter-label" for="level-filter">Niveau</label>
          <select
            id="level-filter"
            class="form-select"
            bind:value={selectedLevel}
          >
            <option value="">Alle Niveaus</option>

            {#each levels as level}
              <option value={level}>{level}</option>
            {/each}
          </select>
        </div>

        <div class="col-md-3">
          <label class="filter-label" for="price-filter">Max. Preis / h</label>
          <input
            id="price-filter"
            class="form-control"
            type="number"
            min="0"
            placeholder="z. B. 120"
            bind:value={maxPrice}
          />
        </div>

        <div class="col-md-3">
          <label class="filter-label" for="date-filter">Verfügbar am</label>
          <input
            id="date-filter"
            class="form-control"
            type="date"
            bind:value={selectedDate}
          />
        </div>

        <div class="col-md-3">
          <label class="filter-label" for="rating-filter">Bewertung</label>
          <select id="rating-filter" class="form-select" bind:value={minRating}>
            <option value="">Alle Bewertungen</option>
            <option value="5">ab 5 Sterne</option>
            <option value="4">ab 4 Sterne</option>
            <option value="3">ab 3 Sterne</option>
          </select>
        </div>

        <div class="col-md-3 d-flex align-items-end">
          <button
            class="btn btn-outline-secondary w-100"
            type="button"
            onclick={resetFilters}
          >
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showResults && hasActiveSearch}
    <div class="search-result-section mt-4">
      <h4 class="mb-3">Suchergebnisse</h4>

      {#if results.length > 0}
        <p class="text-muted mb-3">
          {results.length} passende Angebote gefunden
        </p>

        <div class="result-list">
          {#each results as offer (offer._id)}
            <a
              href={"/offers/" + offer._id}
              class="search-result"
              onclick={saveScrollPosition}
            >
              <strong>{offer.title}</strong>
              <br />

              <small>
                {trainerName(offer)}
                · {offer.sport}
                · {offer.levels?.join(", ")}
                · {offer.location?.address?.municipality},
                {offer.location?.address?.canton}
                · {offer.pricePerHour}
                {offer.currency}/h · ⭐
                {getRating(offer) > 0
                  ? getRating(offer).toFixed(1)
                  : "keine Bewertung"}
              </small>
            </a>
          {/each}
        </div>
      {:else}
        <div class="empty-result">Keine passenden Angebote gefunden.</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .search-area {
    max-width: 100%;
  }

  .search-row {
    max-width: 760px;
    display: flex;
    gap: 12px;
  }

  .search-input {
    height: 52px;
    border-radius: 12px;
    font-size: 18px;
    padding-left: 18px;
  }

  .filter-button {
    min-width: 110px;
    border-radius: 12px;
  }

  .filter-panel {
    max-width: 1000px;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px;
    background-color: #fafafa;
  }

  .filter-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    display: block;
  }

  .search-result-section {
    max-width: 1000px;
    border-top: 1px solid #e5e7eb;
    padding-top: 24px;
  }

  .result-list {
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    overflow: hidden;
    background-color: white;
  }

  .search-result {
    display: block;
    padding: 14px 18px;
    color: black;
    text-decoration: none;
    border-bottom: 1px solid #eee;
  }

  .search-result:last-child {
    border-bottom: none;
  }

  .search-result:hover {
    background-color: #f5f5f5;
  }

  .empty-result {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 18px;
    color: #6b7280;
    background-color: #fafafa;
  }
</style>
