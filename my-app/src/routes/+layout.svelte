<script>
  let { data, children } = $props();

  let isLoggedIn = $derived(Boolean(data.userId));
  let showProfileMenu = $state(false);

  function toggleProfileMenu() {
    showProfileMenu = !showProfileMenu;
  }
</script>

<nav class="app-navbar">
  <div class="navbar-left">
    <a href={isLoggedIn ? "/offers" : "/"} class="brand">Proodos</a>
  </div>

  {#if isLoggedIn}
    <div class="navbar-center">
      <a href="/offers">Angebote</a>
      <a href="/categories">Sportarten</a>
      <a href="/map">Karte</a>
      <a href="/favorites">Favoriten</a>
      <a href="/appointments">Meine Termine</a>
    </div>

    <div class="navbar-right">
      <div class="profile-menu-wrapper">
        <button
          class="profile-button"
          type="button"
          onclick={toggleProfileMenu}
          aria-label="Profilmenü öffnen"
        >
          👤
        </button>

        {#if showProfileMenu}
          <div class="profile-dropdown">
            <a href="/profil">Mein Profil</a>
            <a href="/notifications">Benachrichtigungen</a>
            <a href="/info">Info</a>

            <form method="POST" action="/profil?/logout">
              <button type="submit">Ausloggen</button>
            </form>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="navbar-center"></div>

    <div class="navbar-right">
      <a href="/login" class="btn btn-outline-primary">Einloggen</a>
      <a href="/create-profil" class="btn btn-primary">Registrieren</a>
    </div>
  {/if}
</nav>

<main class="app-main">
  {@render children()}
</main>

<footer class="app-footer">
  <div>
    <strong>Proodos</strong>
    <span>Trainingsangebote einfach finden und buchen.</span>
  </div>

  <div class="footer-links">
    <a href="/info">Info</a>
  </div>
</footer>

<style>
  .app-navbar {
    height: 76px;
    padding: 0 48px;
    border-bottom: 1px solid #e5e7eb;
    background-color: white;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .brand {
    font-size: 26px;
    font-weight: 700;
    color: #212529;
    text-decoration: none;
  }

  .navbar-center {
    display: flex;
    gap: 34px;
    align-items: center;
  }

  .navbar-center a {
    color: #212529;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
  }

  .navbar-center a:hover {
    color: #0d6efd;
  }

  .navbar-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 14px;
  }

  .notification-button,
  .profile-button {
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    background-color: #f1f3f5;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notification-button:hover,
  .profile-button:hover {
    background-color: #e9ecef;
  }

  .profile-menu-wrapper {
    position: relative;
  }

  .profile-dropdown {
    position: absolute;
    right: 0;
    top: 54px;
    width: 220px;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    padding: 10px;
    z-index: 100;
  }

  .profile-dropdown a,
  .profile-dropdown button {
    display: block;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: none;
    text-align: left;
    color: #212529;
    text-decoration: none;
    border-radius: 10px;
    font-size: 15px;
  }

  .profile-dropdown a:hover,
  .profile-dropdown button:hover {
    background-color: #f8f9fa;
  }

  .app-main {
    min-height: calc(100vh - 156px);
    background: radial-gradient(
        circle at top left,
        rgba(13, 110, 253, 0.08),
        transparent 280px
      ),
      radial-gradient(
        circle at top right,
        rgba(51, 153, 255, 0.08),
        transparent 260px
      ),
      #ffffff;
  }

  .app-footer {
    min-height: 80px;
    padding: 24px 48px;
    border-top: 1px solid #e5e7eb;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #6c757d;
  }

  .app-footer strong {
    color: #212529;
    margin-right: 12px;
  }

  .footer-links {
    display: flex;
    gap: 22px;
  }

  .footer-links a {
    color: #6c757d;
    text-decoration: none;
  }

  .footer-links a:hover {
    color: #0d6efd;
  }

  @media (max-width: 768px) {
    .app-navbar {
      height: auto;
      padding: 18px 24px;
      grid-template-columns: 1fr auto;
      row-gap: 16px;
    }

    .navbar-center {
      grid-column: 1 / -1;
      justify-content: center;
      flex-wrap: wrap;
      gap: 18px;
    }

    .app-footer {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }
  }
</style>
