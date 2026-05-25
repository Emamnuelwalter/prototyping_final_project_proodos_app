<script>
  import AppointmentCard from "$lib/components/appointments/AppointmentCard.svelte";

  let { bookings = [] } = $props();

  function groupBookings(bookings) {
    const groupedBookings = [];
    const repeatGroups = {};

    for (const booking of bookings) {
      if (booking.repeatGroupId) {
        if (!repeatGroups[booking.repeatGroupId]) {
          repeatGroups[booking.repeatGroupId] = {
            ...booking,
            isRepeatGroup: true,
            repeatBookings: [],
          };
        }

        repeatGroups[booking.repeatGroupId].repeatBookings.push(booking);
      } else {
        groupedBookings.push(booking);
      }
    }

    for (const group of Object.values(repeatGroups)) {
      group.repeatBookings.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      groupedBookings.push(group);
    }

    return groupedBookings;
  }

  let groupedBookings = $derived(groupBookings(bookings));
</script>

{#if groupedBookings.length > 0}
  <div class="row g-4">
    {#each groupedBookings as booking (booking.repeatGroupId || booking._id)}
      <div class="col-md-6 col-xl-4">
        <AppointmentCard {booking} />
      </div>
    {/each}
  </div>
{:else}
  <p class="text-muted">Du hast noch keine Termine gebucht.</p>
{/if}
