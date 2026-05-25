<script>
  import DateSelect from "$lib/components/booking/DateSelect.svelte";
  import TimeSlotSelect from "$lib/components/booking/TimeSlotSelect.svelte";
  import LocationSelect from "$lib/components/booking/LocationSelect.svelte";
  import BookingSummary from "$lib/components/booking/BookingSummary.svelte";
  import RequestLocation from "$lib/components/booking/RequestLocation.svelte";
  import RepeatBookingRequest from "$lib/components/booking/RepeatBookingRequest.svelte";

  let useCustomLocation = $state(false);
  let wantsRepeat = $state(false);
  let repeatWeeks = $state("3");
  let repeatMessage = $state("");

  let requestedLocation = $state({
    name: "",
    street: "",
    postalCode: "",
    municipality: "",
    note: "",
  });

  let { data, form } = $props();

  let offer = $derived(data.offer);
  let bookings = $derived(data.bookings || []);

  let selectedDate = $state("");
  let selectedTime = $state("");

  function isBooked(time) {
    return bookings.some(
      (booking) =>
        booking.date === time.date &&
        booking.startTime === time.startTime &&
        booking.endTime === time.endTime,
    );
  }

  let freeTimes = $derived(
    offer ? offer.availableTimes.filter((time) => !isBooked(time)) : [],
  );

  let dates = $derived([...new Set(freeTimes.map((time) => time.date))]);

  let times = $derived(freeTimes.filter((time) => time.date === selectedDate));
  $effect(() => {
    selectedDate;

    selectedTime = "";
  });
</script>

<div class="container py-5">
  <h1 class="mb-4">Termin buchen</h1>

  {#if form?.message}
    <div class="alert alert-danger">
      {form.message}
    </div>
  {/if}

  {#if offer}
    <div class="mb-4">
      <h3>{offer.title}</h3>
      <p>
        {offer.pricePerHour}
        {offer.currency}/h
      </p>
    </div>

    <form method="POST" action="?/create">
      <input type="hidden" name="locationId" value={offer.locationId} />
      <input type="hidden" name="date" value={selectedDate} />
      <input
        type="hidden"
        name="startTime"
        value={selectedTime ? selectedTime.split("-")[0] : ""}
      />
      <input
        type="hidden"
        name="endTime"
        value={selectedTime ? selectedTime.split("-")[1] : ""}
      />

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="booking-card mb-4">
            <DateSelect {dates} {freeTimes} bind:selectedDate />
          </div>

          {#if selectedDate}
            <div class="booking-card mb-4">
              <h4>2. Uhrzeit auswählen</h4>
              <TimeSlotSelect {times} bind:selectedTime />
            </div>
          {/if}

          <div class="booking-card mb-4">
            <RepeatBookingRequest
              bind:wantsRepeat
              bind:repeatWeeks
              bind:repeatMessage
            />
          </div>

          <div class="booking-card mb-4">
            <LocationSelect location={offer.location} />

            <div class="mt-4">
              <RequestLocation bind:useCustomLocation bind:requestedLocation />
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="summary-sticky">
            <BookingSummary
              {offer}
              {selectedDate}
              {selectedTime}
              {useCustomLocation}
              {requestedLocation}
            />

            <div class="d-grid gap-2 mt-4">
              <button
                type="submit"
                class="btn btn-primary"
                disabled={!selectedDate || !selectedTime}
              >
                Buchung abschliessen
              </button>

              <a href={"/offers/" + offer._id} class="btn btn-outline-primary">
                Zurück
              </a>
            </div>
          </div>
        </div>
      </div>
    </form>
  {:else}
    <p>Dieses Angebot wurde nicht gefunden.</p>
  {/if}
</div>
