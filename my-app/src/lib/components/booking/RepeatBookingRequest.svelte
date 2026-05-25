<script>
  let {
    wantsRepeat = $bindable(false),
    repeatWeeks = $bindable("3"),
    repeatMessage = $bindable("")
  } = $props();
</script>

<div class="booking-repeat">
  <h4>Wiederholung</h4>

  <div class="form-check mb-3">
    <input
      id="wantsRepeat"
      class="form-check-input"
      type="checkbox"
      name="wantsRepeat"
      value="yes"
      bind:checked={wantsRepeat}
    />

    <label class="form-check-label" for="wantsRepeat">
      Diesen Termin wiederholen
    </label>
  </div>

  {#if wantsRepeat}
    <div class="row">
      <div class="col-md-4 mb-3">
        <label for="repeatWeeks" class="form-label">
          Anzahl Wochen
        </label>

        <select
          id="repeatWeeks"
          name="repeatWeeks"
          class="form-select"
          bind:value={repeatWeeks}
        >
          <option value="2">2 Wochen</option>
          <option value="3">3 Wochen</option>
          <option value="4">4 Wochen</option>
          <option value="5">5 Wochen</option>
          <option value="6">6 Wochen</option>
        </select>
      </div>

      <div class="col-md-8 mb-3">
        <label for="repeatMessage" class="form-label">
          Nachricht an den Trainer
        </label>

        <textarea
          id="repeatMessage"
          name="repeatMessage"
          class="form-control"
          rows="3"
          bind:value={repeatMessage}
          placeholder="z. B. Ich möchte diesen Slot gerne für die nächsten 3 Wochen wiederholen."
        ></textarea>
      </div>
    </div>

    <p class="text-muted mb-0">
      Die wiederholten Termine werden als Anfrage gespeichert und müssen vom Trainer bestätigt werden.
    </p>
  {/if}
</div>