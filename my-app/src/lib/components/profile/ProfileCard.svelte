<script>
  import { sports, levels } from "$lib/data/sports.js";

  let { user, form } = $props();

  let editMode = $state(false);
  let formUser = $derived(copyUser(user));

  function copyUser(user) {
    return {
      ...user,
      interestedSports: user?.interestedSports
        ? user.interestedSports.map((interest) => ({ ...interest }))
        : [],
    };
  }

  function formatDate(date) {
    if (!date) return "";

    let parts = date.split("-");
    return parts[2] + "." + parts[1] + "." + parts[0];
  }

  function startEdit() {
    formUser = copyUser(user);
    editMode = true;
  }

  function cancelEdit() {
    formUser = copyUser(user);
    editMode = false;
  }

  function addSport() {
    formUser.interestedSports = [
      ...formUser.interestedSports,
      {
        sport: "",
        level: "",
      },
    ];
  }

  function removeSport(index) {
    formUser.interestedSports = formUser.interestedSports.filter(
      (_, i) => i !== index,
    );
  }
</script>

<div class="container py-5">
  <div class="profile-wrapper mx-auto">
    <h2 class="mb-4">Mein Profil</h2>

    {#if user}
      <form method="POST" action="?/update">
        <div class="profile-header mb-4">
          <div class="avatar">
            <img
              src="/img/placeholder_user.png"
              alt=""
              height="auto"
              width="130px"
              class="rounded-circle"
            />
          </div>

          <div class="mt-2">
            <button class="btn btn-primary btn-sm" type="button">
              Profilbild ändern
            </button>
          </div>
        </div>

        {#if form?.message}
          <div class="alert alert-success">
            {form.message}
          </div>
        {/if}

        <div class="col-md-6 mb-3">
          <label for="gender" class="form-label">Geschlecht</label>

          {#if editMode}
            <select
              id="gender"
              name="gender"
              class="form-select"
              bind:value={formUser.gender}
              required
            >
              <option value="">Bitte auswählen</option>
              <option value="Männlich">Männlich</option>
              <option value="Weiblich">Weiblich</option>
              <option value="Divers">Divers</option>
            </select>
          {:else}
            <input
              id="gender"
              class="form-control"
              value={formUser.gender}
              readonly
            />
          {/if}
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="firstname" class="form-label">Vorname</label>
            <input
              id="firstname"
              name="firstname"
              class="form-control"
              bind:value={formUser.firstname}
              readonly={!editMode}
              required
            />
          </div>

          <div class="col-md-6 mb-3">
            <label for="lastname" class="form-label">Nachname</label>
            <input
              id="lastname"
              name="lastname"
              class="form-control"
              bind:value={formUser.lastname}
              readonly={!editMode}
              required
            />
          </div>

          <div class="col-md-6 mb-3">
            <label for="birthday" class="form-label">Geburtsdatum</label>

            {#if editMode}
              <input
                id="birthday"
                name="birthday"
                type="date"
                class="form-control"
                bind:value={formUser.birthday}
                required
              />
            {:else}
              <input
                id="birthday"
                class="form-control"
                value={formatDate(formUser.birthday)}
                readonly
              />
            {/if}
          </div>

          <div class="col-md-6 mb-3">
            <label for="email" class="form-label">E-Mail</label>
            <input
              id="email"
              name="email"
              type="email"
              class="form-control"
              bind:value={formUser.email}
              readonly={!editMode}
              required
            />
          </div>

          <div class="col-md-6 mb-3">
            <label for="phone" class="form-label">Telefonnummer</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              class="form-control"
              bind:value={formUser.phone}
              readonly={!editMode}
            />
          </div>

          <div class="col-md-6 mb-3">
            <label for="role" class="form-label">Rolle</label>
            <input
              id="role"
              class="form-control"
              value={formUser.roles?.join(", ")}
              readonly
            />
          </div>
          
          <div class="col-md-6 mb-3">
            <label for="canton" class="form-label">Kanton</label>
            <input
              id="canton"
              name="canton"
              class="form-control"
              bind:value={formUser.canton}
              readonly={!editMode}
            />
          </div>

          <div class="col-md-6 mb-3">
            <label for="municipality" class="form-label">Gemeinde</label>
            <input
              id="municipality"
              name="municipality"
              class="form-control"
              bind:value={formUser.municipality}
              readonly={!editMode}
            />
          </div>
        </div>

        <h4 class="mt-4">Interessierte Sportarten</h4>
        <hr />

        <div class="row">
          {#each formUser.interestedSports as interest, index}
            <div class="col-md-4 mb-3">
              <div class="sport-card">
                {#if editMode}
                  <label class="form-label" for={"sport" + index}
                    >Sportart</label
                  >
                  <select
                    id={"sport" + index}
                    class="form-select mb-2"
                    name={`sport${index + 1}`}
                    bind:value={interest.sport}
                    required
                  >
                    <option value="">Sportart auswählen</option>

                    {#each sports as sport}
                      <option value={sport}>{sport}</option>
                    {/each}
                  </select>

                  <label class="form-label" for={"level" + index}>Niveau</label>
                  <select
                    id={"level" + index}
                    class="form-select"
                    name={`level${index + 1}`}
                    bind:value={interest.level}
                    required
                  >
                    <option value="">Niveau auswählen</option>

                    {#each levels as level}
                      <option value={level}>{level}</option>
                    {/each}
                  </select>
                {:else}
                  <p class="mb-1"><strong>{interest.sport}</strong></p>
                  <p class="mb-0 text-muted">{interest.level}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
        <h4 class="mt-4">Mein Ziel</h4>
        <hr />

        <div class="mb-3">
          <textarea
            id="goal"
            name="goal"
            class="form-control"
            rows="4"
            bind:value={formUser.goal}
            readonly={!editMode}
            placeholder="Beschreibe dein persönliches Trainingsziel..."
          ></textarea>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4">
          <button
            class="btn btn-outline-danger"
            type="submit"
            formaction="?/delete"
            onclick={(event) => {
              if (!confirm("Möchten Sie Ihr Konto wirklich löschen?")) {
                event.preventDefault();
              }
            }}
          >
            Konto löschen
          </button>

          {#if editMode}
            <div>
              <button
                class="btn btn-outline-secondary me-2"
                type="button"
                onclick={cancelEdit}
              >
                Abbrechen
              </button>

              <button class="btn btn-primary" type="submit"> Speichern </button>
            </div>
          {:else}
            <button class="btn btn-primary" type="button" onclick={startEdit}>
              Profil bearbeiten
            </button>
          {/if}
        </div>
      </form>
    {:else}
      <p>Kein Profil gefunden.</p>
      <a href="/create-profil" class="btn btn-primary">Profil erstellen</a>
    {/if}
  </div>
</div>

<style>
  .profile-wrapper {
    max-width: 900px;
  }

  .profile-header {
    background-color: #3399ff;
    border-radius: 24px;
    height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .avatar {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background-color: white;
    border: 3px solid #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
    margin-bottom: 12px;
  }

  .sport-card {
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 16px;
  }
</style>
