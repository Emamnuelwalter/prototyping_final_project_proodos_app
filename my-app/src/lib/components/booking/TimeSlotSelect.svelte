<script>
  let { times = [], selectedTime = $bindable("") } = $props();

  function slotValue(time) {
    return `${time.startTime}-${time.endTime}`;
  }
</script>

<div>
  {#if times.length > 0}
    <p class="text-muted mb-3">
      {times.length} freie Slots verfügbar.
    </p>

    <div class="time-grid">
      {#each times as time}
        <button
          type="button"
          class:selected-slot={selectedTime === slotValue(time)}
          class="time-slot"
          onclick={() => (selectedTime = slotValue(time))}
        >
          {time.startTime} - {time.endTime}
        </button>
      {/each}
    </div>
  {:else}
    <p class="text-danger mb-0">
      Für dieses Datum sind keine freien Uhrzeiten verfügbar.
    </p>
  {/if}
</div>

<style>
  .time-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .time-slot {
    border: 1px solid #0d6efd;
    background-color: white;
    color: #0d6efd;
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 14px;
    min-width: 120px;
  }

  .time-slot:hover {
    background-color: #f0f6ff;
  }

  .selected-slot {
    background-color: #0d6efd;
    color: white;
  }
</style>
