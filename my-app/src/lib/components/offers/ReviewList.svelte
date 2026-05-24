<script>
  let { reviews = [], form, isAdmin = false } = $props();
</script>

<div class="card mb-4">
  <div class="card-body">
    <h4 class="mb-3">Bewertung schreiben</h4>

    {#if form?.error}
      <div class="alert alert-danger">
        {form.error}
      </div>
    {/if}

    {#if form?.success}
      <div class="alert alert-success">Aktion erfolgreich ausgeführt.</div>
    {/if}

    <form method="POST" action="?/createReview">
      <div class="mb-3">
        <label for="rating" class="form-label">Bewertung</label>
        <select id="rating" name="rating" class="form-select" required>
          <option value="">Bitte auswählen</option>
          <option value="5">5 Sterne</option>
          <option value="4">4 Sterne</option>
          <option value="3">3 Sterne</option>
          <option value="2">2 Sterne</option>
          <option value="1">1 Stern</option>
        </select>
      </div>

      <div class="mb-3">
        <label for="comment" class="form-label">Kommentar</label>
        <textarea
          id="comment"
          name="comment"
          class="form-control"
          rows="4"
          placeholder="Wie war dein Training?"
          required
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary">
        Bewertung abgeben
      </button>
    </form>
  </div>
</div>

{#if reviews.length > 0}
  {#each reviews as review}
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <strong>⭐ {review.rating} / 5</strong>
            <p class="mt-2 mb-1">
              {review.comment}
            </p>
            <small>
              {new Date(review.createdAt).toLocaleDateString("de-CH")}
            </small>
          </div>

          {#if isAdmin}
            <form method="POST" action="?/deleteReview">
              <input type="hidden" name="reviewId" value={review.id} />

              <button type="submit" class="btn btn-outline-danger btn-sm">
                Löschen
              </button>
            </form>
          {/if}
        </div>
      </div>
    </div>
  {/each}
{:else}
  <p >Noch keine Kommentare vorhanden.</p>
{/if}
