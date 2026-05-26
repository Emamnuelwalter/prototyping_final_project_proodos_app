<script>
  import AppointmentList from "$lib/components/appointments/AppointmentList.svelte";

  let { data, form } = $props();

  let bookings = $derived(data.bookings);
</script>

<div class="container py-5">
  <h1 class="mb-4">Meine Termine</h1>

  {#if form?.message}
    <div class="alert alert-success">
      {form.message}
    </div>
  {/if}
  {#if bookings.length > 0}
    <AppointmentList {bookings} />
  {:else}
    <p class="text-muted">Du hast noch keine Angebote gebucht.</p>
    <a href="/offers" class="btn btn-primary">Angebote entdecken</a>
  {/if}
</div>
