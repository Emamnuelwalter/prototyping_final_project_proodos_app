<script>
  let { booking } = $props();

  let trainerName = $derived(
    (booking.trainer?.firstname || booking.trainer?.firstName || "") +
      " " +
      (booking.trainer?.lastname || booking.trainer?.lastName || ""),
  );
  function formatDateCH(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
</script>

<div class="booking-confirmation text-center mx-auto">
  {#if booking}
    <h2>Danke für Ihre Buchung!</h2>
    <hr />

    <h3 class="mt-5">{booking.offer?.title}</h3>
    <h4>{trainerName}</h4>

    <p class="mt-4">
      Termin: {formatDateCH(booking.date)} - {booking.startTime} - {booking.endTime}
    </p>

    {#if booking.bookingNumber}
      <p>Buchungsnummer: {booking.bookingNumber}</p>
    {/if}

    <div class="d-flex justify-content-center gap-3 mt-5">
      <a href="/offers" class="btn btn-outline-primary">
        Zurück zur Startseite
      </a>

      <a href="/appointments" class="btn btn-primary"> Meine Termine </a>
    </div>
  {:else}
    <p>Keine Buchung gefunden.</p>
  {/if}
</div>

<style>
  .booking-confirmation {
    max-width: 1000px;
  }
</style>
