<script>
  let {
    offer,
    selectedDate = "",
    selectedTime = "",
    useCustomLocation = false,
    requestedLocation = null,
  } = $props();

  let defaultLocation = $derived(offer.location);

  let locationName = $derived(
    useCustomLocation
      ? requestedLocation?.name || "Wunschstandort noch nicht angegeben"
      : defaultLocation?.name || "Standort offen",
  );

  let locationDetails = $derived(
    useCustomLocation
      ? `${requestedLocation?.street || ""}, ${requestedLocation?.postalCode || ""} ${requestedLocation?.municipality || ""}`
      : `${defaultLocation?.address?.street || ""}, ${defaultLocation?.address?.postalCode || ""} ${defaultLocation?.address?.municipality || ""}`,
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

<div class="border rounded p-3 mb-4">
  <h4>Zusammenfassung</h4>

  <p class="mb-1">
    <strong>Angebot:</strong>
    {offer.title}
  </p>

  <p class="mb-1">
    <strong>Standort:</strong>
    {locationName}
  </p>

  <p class="mb-1 text-muted">
    {locationDetails}
  </p>

  {#if useCustomLocation && requestedLocation?.note}
    <p class="mb-1 text-muted">
      <strong>Bemerkung:</strong>
      {requestedLocation.note}
    </p>
  {/if}

  <p class="mb-1">
    <strong>Datum:</strong>
    {selectedDate ? formatDateCH(selectedDate) : "Noch nicht ausgewählt"}
  </p>

  <p class="mb-1">
    <strong>Uhrzeit:</strong>
    {selectedTime || "Noch nicht ausgewählt"}
  </p>

  <p class="mb-0">
    <strong>Preis:</strong>
    {offer.pricePerHour}
    {offer.currency}/h
  </p>
</div>
