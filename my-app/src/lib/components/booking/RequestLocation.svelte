<script>
  let {
    useCustomLocation = $bindable(false),
    requestedLocation = $bindable({
      name: "",
      street: "",
      postalCode: "",
      municipality: "",
      note: "",
    }),
  } = $props();
</script>

<h4 class="mt-4">Trainingsstandort</h4>

<div class="form-check mb-2">
  <input
    id="defaultLocation"
    class="form-check-input"
    type="radio"
    name="locationChoice"
    value="default"
    checked={!useCustomLocation}
    onchange={() => (useCustomLocation = false)}
  />

  <label class="form-check-label" for="defaultLocation">
    Vorgeschlagenen Standort verwenden
  </label>
</div>

<div class="form-check mb-3">
  <input
    id="customLocation"
    class="form-check-input"
    type="radio"
    name="locationChoice"
    value="custom"
    checked={useCustomLocation}
    onchange={() => (useCustomLocation = true)}
  />

  <label class="form-check-label" for="customLocation">
    Eigenen Wunschstandort anfragen
  </label>
</div>

{#if useCustomLocation}
  <div class="row">
    <div class="col-md-6 mb-3">
      <label for="requestedLocationName" class="form-label">
        Name des Ortes
      </label>
      <input
        id="requestedLocationName"
        name="requestedLocationName"
        class="form-control"
        bind:value={requestedLocation.name}
      />
    </div>

    <div class="col-md-6 mb-3">
      <label for="requestedStreet" class="form-label"> Adresse </label>
      <input
        id="requestedStreet"
        name="requestedStreet"
        class="form-control"
        bind:value={requestedLocation.street}
      />
    </div>

    <div class="col-md-4 mb-3">
      <label for="requestedPostalCode" class="form-label"> PLZ </label>
      <input
        id="requestedPostalCode"
        name="requestedPostalCode"
        class="form-control"
        bind:value={requestedLocation.postalCode}
      />
    </div>

    <div class="col-md-8 mb-3">
      <label for="requestedMunicipality" class="form-label">
        Gemeinde / Stadt
      </label>
      <input
        id="requestedMunicipality"
        name="requestedMunicipality"
        class="form-control"
        bind:value={requestedLocation.municipality}
      />
    </div>

    <div class="col-12 mb-3">
      <label for="requestedLocationNote" class="form-label"> Bemerkung </label>
      <textarea
        id="requestedLocationNote"
        name="requestedLocationNote"
        class="form-control"
        rows="3"
        bind:value={requestedLocation.note}
      ></textarea>
    </div>
  </div>
{/if}
