<script>
  let { form } = $props();
</script>

<div class="container py-5">
  <div class="login-box mx-auto">
    <h1 class="mb-3">Einloggen</h1>
    <p class="text-muted mb-4">Melden Sie sich mit Ihrem Benutzerkonto an.</p>

    {#if form?.message}
      <div class="alert alert-danger">
        {form.message}
      </div>
    {/if}

    <form method="POST" action="?/login">
      <div class="mb-3">
        <label for="username" class="form-label">Benutzername</label>
        <input id="username" name="username" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Passwort</label>
        <input
          id="password"
          name="password"
          type="password"
          class="form-control"
          required
        />
      </div>

      <button class="btn btn-primary w-100" type="submit"> Einloggen </button>
    </form>

    <div class="text-center mt-4">
      <p class="mb-2">Noch kein Profil?</p>
      <a href="/create-profil" class="btn btn-outline-primary">
        Registrieren
      </a>
    </div>
  </div>
</div>

<style>
  .login-box {
    max-width: 420px;
  }
</style>
