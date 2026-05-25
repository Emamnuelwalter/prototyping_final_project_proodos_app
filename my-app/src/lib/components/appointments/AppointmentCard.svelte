<script>
  import AppointmentStatusBadge from "$lib/components/appointments/AppointmentStatusBadge.svelte";

  let { booking } = $props();

  let showDetails = $state(false);

  let trainerName = $derived(
    (booking.trainer?.firstname || booking.trainer?.firstName || "") +
      " " +
      (booking.trainer?.lastname || booking.trainer?.lastName || ""),
  );

  let hasRequestedLocation = $derived(
    booking.requestedLocation !== null &&
      booking.requestedLocation !== undefined,
  );
  let isRepeatedBooking = $derived(booking.repeat === "weekly");
</script>

<div class="card appointment-card">
  <img src="/img/offers_placeholder.png" class="card-img-top" alt="Training" />

  <div class="card-body">
    <div class="mb-2 d-flex gap-2 flex-wrap">
      <AppointmentStatusBadge status={booking.status} />

      {#if hasRequestedLocation}
        <span class="badge location-badge"> Standortvorschlag </span>
      {/if}

      {#if isRepeatedBooking}
        <span class="badge repeat-badge"> Wiederholungsanfrage </span>
      {/if}
    </div>

    <h5 class="card-title">{booking.offer?.title}</h5>

    {#if booking.bookingNumber}
      <p class="text-muted mb-1">
        {booking.bookingNumber}
      </p>
    {/if}

    <p class="mb-1">{trainerName}</p>

    {#if booking.isRepeatGroup}
      <p class="mb-1">
        {booking.repeatBookings.length} Termine · {booking.startTime} - {booking.endTime}
      </p>

      <p class="mb-1 text-muted">
        {booking.repeatBookings[0].date} bis {booking.repeatBookings[
          booking.repeatBookings.length - 1
        ].date}
      </p>
    {:else}
      <p class="mb-1">
        {booking.date} · {booking.startTime} - {booking.endTime}
      </p>
    {/if}

    {#if hasRequestedLocation}
      <p class="mb-1 text-name">
        {booking.requestedLocation.name}
      </p>
    {:else}
      <p class="mb-1 text-name">
        {booking.location?.name}
      </p>
    {/if}

    <button
      class="btn btn-outline-primary w-100 mt-3"
      type="button"
      onclick={() => (showDetails = !showDetails)}
    >
      {showDetails ? "Details ausblenden" : "Termin verwalten"}
    </button>

    {#if showDetails}
      <div class="appointment-details mt-3">
        <hr />

        {#if hasRequestedLocation}
          <p class="mb-1">
            <strong>Wunschstandort:</strong>
            {booking.requestedLocation.name}
          </p>

          <p class="mb-1 text-muted">
            {booking.requestedLocation.street},
            {booking.requestedLocation.postalCode}
            {booking.requestedLocation.municipality}
          </p>

          {#if booking.requestedLocation.note}
            <p class="mb-3 text-muted">
              <strong>Bemerkung:</strong>
              {booking.requestedLocation.note}
            </p>
          {/if}
        {:else}
          <p class="mb-3">
            <strong>Standort:</strong>
            {booking.location?.name}
          </p>
        {/if}

        {#if isRepeatedBooking}
          <p class="mb-3 text-muted">
            Dieser Termin ist Teil einer Wiederholungsanfrage.
          </p>
        {/if}

        {#if booking.isRepeatGroup}
          <p class="mb-2">
            <strong>Termine dieser Anfrage:</strong>
          </p>

          <ul class="mb-3">
            {#each booking.repeatBookings as repeatBooking}
              <li>
                {repeatBooking.date} · {repeatBooking.startTime} - {repeatBooking.endTime}
              </li>
            {/each}
          </ul>
        {/if}

        <a
          href={"/offers/" + booking.offerId}
          class="btn btn-outline-primary w-100"
        >
          Angebot ansehen
        </a>

        {#if !booking.isRepeatGroup && booking.freeTimes?.length > 0}
          <form method="POST" action="?/reschedule" class="mt-2">
            <input type="hidden" name="bookingId" value={booking._id} />

            <select class="form-select mb-2" name="selectedSlot" required>
              <option value="">Neuen Termin auswählen</option>

              {#each booking.freeTimes as time}
                <option
                  value={`${time.date}_${time.startTime}_${time.endTime}`}
                >
                  {time.date} · {time.startTime} - {time.endTime}
                </option>
              {/each}
            </select>

            <button class="btn btn-outline-secondary w-100" type="submit">
              Termin verschieben
            </button>
          </form>
        {/if}

        {#if !booking.isRepeatGroup}
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
        {/if}

        {#if booking.isRepeatGroup}
          <p class="mb-2">
            <strong>Termine dieser Wiederholungsanfrage:</strong>
          </p>

          <div class="repeat-list mb-3">
            {#each booking.repeatBookings as repeatBooking}
              <div class="repeat-item">
                <div class="repeat-info">
                  <strong>{repeatBooking.date}</strong><br />
                  <span class="text-muted">
                    {repeatBooking.startTime} - {repeatBooking.endTime}
                  </span>
                </div>

                <div class="repeat-actions">
                  {#if repeatBooking.freeTimes?.length > 0}
                    <form method="POST" action="?/reschedule" class="mb-2">
                      <input
                        type="hidden"
                        name="bookingId"
                        value={repeatBooking._id}
                      />

                      <select
                        class="form-select form-select-sm mb-2"
                        name="selectedSlot"
                        required
                      >
                        <option value="">Neuer Termin</option>

                        {#each repeatBooking.freeTimes as time}
                          <option
                            value={`${time.date}_${time.startTime}_${time.endTime}`}
                          >
                            {time.date} · {time.startTime} - {time.endTime}
                          </option>
                        {/each}
                      </select>

                      <button
                        class="btn btn-outline-secondary btn-sm w-100"
                        type="submit"
                      >
                        Verschieben
                      </button>
                    </form>
                  {/if}

                  <form
                    method="POST"
                    action="?/cancel"
                    onsubmit={(event) => {
                      if (
                        !confirm(
                          "Möchten Sie diesen einzelnen Termin stornieren?",
                        )
                      ) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input
                      type="hidden"
                      name="bookingId"
                      value={repeatBooking._id}
                    />

                    <button
                      class="btn btn-outline-danger btn-sm w-100"
                      type="submit"
                    >
                      Stornieren
                    </button>
                  </form>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if booking.isRepeatGroup}
          <form
            method="POST"
            action="?/cancel"
            onsubmit={(event) => {
              if (
                !confirm("Möchten Sie wirklich die ganze Serie stornieren?")
              ) {
                event.preventDefault();
              }
            }}
          >
            <input
              type="hidden"
              name="repeatGroupId"
              value={booking.repeatGroupId}
            />

            <button class="btn btn-danger w-100 mt-2" type="submit">
              Ganze Serie stornieren
            </button>
          </form>
        {/if}
      </div>
    {/if}
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

  .location-badge {
    background-color: #e8f0ff;
    color: #2457d6;
  }

  .repeat-badge {
    background-color: #f1f3f5;
    color: #495057;
  }

  .appointment-details {
    font-size: 15px;
  }

  .repeat-list {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
  }

  .repeat-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .repeat-item:last-child {
    border-bottom: none;
  }

  .repeat-info {
    min-width: 120px;
  }

  .repeat-actions {
    width: 220px;
  }
</style>
