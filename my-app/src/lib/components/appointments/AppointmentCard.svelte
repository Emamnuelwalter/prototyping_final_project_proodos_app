<script>
  import AppointmentStatusBadge from "$lib/components/appointments/AppointmentStatusBadge.svelte";

  let { booking } = $props();

  let trainerName = $derived(
    (booking.trainer?.firstname || booking.trainer?.firstName || "") +
      " " +
      (booking.trainer?.lastname || booking.trainer?.lastName || ""),
  );

  let today = new Date().toISOString().split("T")[0];
</script>

<div class="card appointment-card">
  <img src="/img/offers_placeholder.png" class="card-img-top" alt="Training" />

  <div class="card-body">
    <div class="mb-2 d-flex gap-2 flex-wrap">
      <AppointmentStatusBadge status={booking.status} />

      {#if booking.requestedLocation}
        <span class="badge location-badge"> Standortvorschlag </span>
      {/if}
    </div>

    <h5 class="card-title">{booking.offer?.title}</h5>

    <p class="mb-1">{trainerName}</p>

    <p class="mb-1">
      {booking.date} · {booking.startTime} - {booking.endTime}
    </p>

    {#if booking.requestedLocation}
      <p class="mb-1 text-name">
        {booking.requestedLocation.name}
      </p>

      <p class="mb-3 text-muted">
        {booking.requestedLocation.street},
        {booking.requestedLocation.postalCode}
        {booking.requestedLocation.municipality}
      </p>
    {:else}
      <p class="mb-3 text-name">
        {booking.location?.name}
      </p>
    {/if}

    <a
      href={"/offers/" + booking.offerId}
      class="btn btn-outline-primary w-100"
    >
      Angebot ansehen
    </a>

    <details class="mt-2">
      <summary class="btn btn-outline-secondary w-100">
        Termin verschieben
      </summary>

      {#if booking.freeTimes?.length > 0}
        <form method="POST" action="?/reschedule" class="mt-3">
          <input type="hidden" name="bookingId" value={booking._id} />

          <div class="mb-3">
            <label for={"slot-" + booking._id} class="form-label">
              Neuer freier Termin
            </label>

            <select
              id={"slot-" + booking._id}
              name="selectedSlot"
              class="form-select"
              required
            >
              <option value="">Bitte Termin auswählen</option>

              {#each booking.freeTimes as time}
                <option
                  value={`${time.date}_${time.startTime}_${time.endTime}`}
                >
                  {time.date} · {time.startTime} - {time.endTime}
                </option>
              {/each}
            </select>
          </div>

          <button class="btn btn-primary w-100" type="submit">
            Termin verschieben
          </button>
        </form>
      {:else}
        <p class="text-muted mt-3 mb-0">
          Aktuell sind keine freien Ersatztermine verfügbar.
        </p>
      {/if}

      {#if booking.requestedLocation}
        <p class="mb-1">
          Wunschstandort: {booking.requestedLocation.name}
        </p>

        <p class="mb-3 text-muted">
          {booking.requestedLocation.street},
          {booking.requestedLocation.postalCode}
          {booking.requestedLocation.municipality}
        </p>
      {:else}
        <p class="mb-3 text-name">
          {booking.location?.name}
        </p>
      {/if}
    </details>

    <form
      method="POST"
      action="?/cancel"
      onsubmit={(event) => {
        if (!confirm("Möchten Sie diesen Termin wirklich stornieren?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="bookingId" value={booking._id} />

      <button class="btn btn-outline-danger w-100 mt-2" type="submit">
        Termin stornieren
      </button>
    </form>
  </div>
</div>

<style>
  .appointment-card {
    height: 100%;
    border-radius: 16px;
    overflow: hidden;
  }

  .card-img-top {
    height: 140px;
    object-fit: cover;
  }

  summary {
    list-style: none;
    cursor: pointer;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  .location-badge {
    background-color: #e8f0ff;
    color: #2457d6;
  }
</style>
