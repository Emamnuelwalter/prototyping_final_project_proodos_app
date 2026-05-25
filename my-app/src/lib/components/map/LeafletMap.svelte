<script>
  import { onMount } from "svelte";
  import "leaflet/dist/leaflet.css";

  let { offers = [], selectedOffer = null, onSelectOffer = null } = $props();

  let mapElement;
  let map;
  let L;
  let markers = [];

  function getLat(offer) {
    return (
      offer.location?.coordinates?.lat ||
      offer.location?.lat ||
      offer.location?.point?.coordinates?.[1]
    );
  }

  function getLng(offer) {
    return (
      offer.location?.coordinates?.lng ||
      offer.location?.lng ||
      offer.location?.point?.coordinates?.[0]
    );
  }

  function hasCoordinates(offer) {
    return getLat(offer) && getLng(offer);
  }

  function clearMarkers() {
    markers.forEach((marker) => marker.remove());
    markers = [];
  }

  function fitToOffers() {
    const offersWithCoordinates = offers.filter(hasCoordinates);

    if (!map || !L || offersWithCoordinates.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(
      offersWithCoordinates.map((offer) => [
        Number(getLat(offer)),
        Number(getLng(offer)),
      ]),
    );

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 13,
    });
  }

  function zoomToOffer(offer) {
    if (!map || !offer) return;

    const lat = Number(getLat(offer));
    const lng = Number(getLng(offer));

    if (!lat || !lng) return;

    map.invalidateSize();

    setTimeout(() => {
      map.setView([lat, lng], 16, {
        animate: true,
      });
    }, 50);
  }

  function updateMarkers() {
    if (!map || !L) return;

    clearMarkers();

    const offersWithCoordinates = offers.filter(hasCoordinates);

    offersWithCoordinates.forEach((offer) => {
      const lat = Number(getLat(offer));
      const lng = Number(getLng(offer));

      const marker = L.marker([lat, lng]).addTo(map);

      marker.bindPopup(`
        <strong>${offer.title}</strong><br>
        ${offer.location?.name || ""}
      `);

      marker.on("click", () => {
        if (onSelectOffer) {
          onSelectOffer(offer);
        }

        zoomToOffer(offer);
      });

      markers.push(marker);
    });
  }

  $effect(() => {
    offers;

    updateMarkers();

    if (!selectedOffer) {
      setTimeout(() => {
        fitToOffers();
      }, 100);
    }
  });

  $effect(() => {
    const offerId = selectedOffer?._id;

    if (!offerId) {
      setTimeout(() => {
        fitToOffers();
      }, 100);

      return;
    }

    zoomToOffer(selectedOffer);
  });

  onMount(async () => {
    L = await import("leaflet");

    map = L.map(mapElement).setView([47.3769, 8.5417], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
      updateMarkers();
      fitToOffers();
    }, 100);
  });
</script>

<div bind:this={mapElement} class="leaflet-map"></div>

<style>
  .leaflet-map {
    height: 520px;
    width: 100%;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  }
</style>
