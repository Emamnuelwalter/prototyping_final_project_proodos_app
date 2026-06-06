<script>
  import AppointmentStatusBadge from "$lib/components/appointments/AppointmentStatusBadge.svelte";
  import { getOfferImage } from "$lib/utils/images.js";

  let { booking, offer } = $props();

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

  let allRepeatBookingsCancelled = $derived(
    booking.isRepeatGroup &&
      booking.repeatBookings?.length > 0 &&
      booking.repeatBookings.every((repeatBooking) => {
        return repeatBooking.status === "cancelled";
      }),
  );
  function formatDateCH(dateString) {
    if (!dateString) return "";

    return new Date(dateString).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  let today = new Date().toISOString().split("T")[0];

  function getFutureFreeTimes(freeTimes = []) {
    return freeTimes
      .filter((time) => time.date >= today)
      .sort((a, b) => {
        return (a.date + a.startTime).localeCompare(b.date + b.startTime);
      })
      .slice(0, 5);
  }
</script>

<div class="card appointment-card">
  <img
    src={getOfferImage(booking.offer?.sport || offer?.sport)}
    alt={booking.offer?.sport || offer?.sport || "Training"}
    class="card-img-top"
  />

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
        {formatDateCH(booking.repeatBookings[0].date)} bis {formatDateCH(
          booking.repeatBookings[booking.repeatBookings.length - 1].date,
        )}
      </p>
    {:else}
      <p class="mb-1">
        {formatDateCH(booking.date)} · {booking.startTime} - {booking.endTime}
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
        {:else}{/if}

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
                {formatDateCH(repeatBooking.date)} · {repeatBooking.startTime} -
                {repeatBooking.endTime}
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

        {#if !booking.isRepeatGroup}
          {#if booking.status === "cancelled"}
            <div class="alert alert-secondary mt-2 mb-2">
              Dieser Termin wurde bereits storniert.
            </div>

            <form
              method="POST"
              action="?/remove"
              onsubmit={(event) => {
                if (
                  !confirm(
                    "Möchten Sie diesen stornierten Termin endgültig löschen?",
                  )
                ) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="bookingId" value={booking._id} />

              <button class="btn btn-outline-danger w-100 mt-2" type="submit">
                Endgültig löschen
              </button>
            </form>
          {:else}
            {#if getFutureFreeTimes(booking.freeTimes).length > 0}
              <form method="POST" action="?/reschedule" class="mt-2">
                <input type="hidden" name="bookingId" value={booking._id} />

                <label class="mt-2 mb-2" for="selectedSlot">
                  Neuen Termin:</label
                >
                <select
                  class="form-select mb-2"
                  name="selectedSlot"
                  id="selectedSlot"
                  required
                >
                  <option class="mb-3" value="">Neuen Termin auswählen</option>

                  {#each getFutureFreeTimes(booking.freeTimes) as time}
                    <option
                      value={`${time.date}_${time.startTime}_${time.endTime}`}
                    >
                      {formatDateCH(time.date)} · {time.startTime} - {time.endTime}
                    </option>
                  {/each}
                </select>

                <button class="btn btn-outline-secondary w-100" type="submit">
                  Termin verschieben
                </button>
              </form>
            {/if}

            <form
              method="POST"
              action="?/cancel"
              onsubmit={(event) => {
                if (
                  !confirm("Möchten Sie diesen Termin wirklich stornieren?")
                ) {
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
        {/if}

        {#if booking.isRepeatGroup}
          <p class="mb-2">
            <strong>Termine dieser Wiederholungsanfrage:</strong>
          </p>

          <div class="repeat-list mb-3">
            {#each booking.repeatBookings as repeatBooking}
              <div class="repeat-item">
                <div class="repeat-info">
                  <strong>{formatDateCH(repeatBooking.date)}</strong><br />
                  <span class="text-muted">
                    {repeatBooking.startTime} - {repeatBooking.endTime}
                  </span>

                  {#if repeatBooking.status === "cancelled"}
                    <div class="badge text-bg-secondary mt-2">
                      Bereits storniert
                    </div>
                  {/if}
                </div>

                <div class="repeat-actions">
                  {#if repeatBooking.status === "cancelled"}
                    <form
                      method="POST"
                      action="?/remove"
                      onsubmit={(event) => {
                        if (
                          !confirm(
                            "Möchten Sie diesen stornierten Termin endgültig löschen?",
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
                        Löschen
                      </button>
                    </form>
                  {:else}
                    {#if getFutureFreeTimes(repeatBooking.freeTimes).length > 0}
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

                          {#each getFutureFreeTimes(repeatBooking.freeTimes) as time}
                            <option
                              value={`${time.date}_${time.startTime}_${time.endTime}`}
                            >
                              {formatDateCH(time.date)} · {time.startTime} - {time.endTime}
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
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if booking.isRepeatGroup}
          {#if allRepeatBookingsCancelled}
            <div class="alert alert-secondary mt-2 mb-2">
              Diese Wiederholungsserie wurde bereits storniert.
            </div>

            <form
              method="POST"
              action="?/removeSeries"
              onsubmit={(event) => {
                if (
                  !confirm(
                    "Möchten Sie diese stornierte Serie endgültig löschen?",
                  )
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

              <button class="btn btn-outline-danger w-100 mt-2" type="submit">
                Ganze Serie endgültig löschen
              </button>
            </form>
          {:else}
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
              <input
                type="hidden"
                name="bookingId"
                value={booking.repeatBookings[0]._id}
              />

              <button class="btn btn-danger w-100 mt-2" type="submit">
                Ganze Serie stornieren
              </button>
            </form>
          {/if}
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
