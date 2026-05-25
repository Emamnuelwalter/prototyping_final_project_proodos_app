<script>
  let { dates = [], selectedDate = $bindable(""), freeTimes = [] } = $props();

  function formatDateWithWeekday(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("de-CH", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function formatShortDate(dateString) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("de-CH", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  }

  function countSlotsForDate(date) {
    return freeTimes.filter((time) => time.date === date).length;
  }

  let nextAvailableDates = $derived(dates.slice(0, 3));
</script>

<div>
  <label for="bookingDate" class="form-label">Datum auswählen</label>

  <input
    id="bookingDate"
    type="date"
    class="form-control"
    bind:value={selectedDate}
  />

  {#if selectedDate}
    

    {#if countSlotsForDate(selectedDate) > 0}
      <p class="text-success mb-0">
        {countSlotsForDate(selectedDate)} freie Slots an diesem Tag verfügbar.
      </p>
    {:else}
      <p class="text-danger mb-0">
        Für dieses Datum sind keine freien Slots verfügbar.
      </p>
    {/if}
  {/if}

  {#if nextAvailableDates.length > 0}
    <div class="mt-3">
      <p class="mb-2 text-muted">Nächste verfügbare Tage:</p>

      <div class="d-flex flex-wrap gap-2">
        {#each nextAvailableDates as date}
          <button
            type="button"
            class:selected-date={selectedDate === date}
            class="btn btn-outline-primary btn-sm"
            onclick={() => (selectedDate = date)}
          >
            {formatShortDate(date)} · {countSlotsForDate(date)} Termin(e)
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .selected-date {
    background-color: #0d6efd;
    color: white;
  }
</style>
