<script>
  let { data } = $props();

  let notifications = $derived(data.notifications || []);

  function badgeClass(type) {
    if (type === "success") return "text-bg-success";
    if (type === "warning") return "text-bg-warning";
    if (type === "danger") return "text-bg-danger";
    return "text-bg-info";
  }

  function formatDateTime(date) {
    if (!date) return "";

    return new Date(date).toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<div class="container py-5">
  <div class="notifications-page mx-auto">
    <h1 class="mb-2">Benachrichtigungen</h1>
    <p class="text-muted mb-4">
      Hier sehen Sie aktuelle Hinweise zu Ihren Buchungen.
    </p>

    {#if notifications.length > 0}
      <div class="notification-list">
        {#each notifications as notification}
          <div class="notification-card">
            <div class="notification-header">
              <div>

              <div>
                <span class={"badge " + badgeClass(notification.type)}>
                  {notification.title}
                </span>
                </div>

                {#if notification.offerTitle}
                  <p class="mt-2 mb-2">
                    <strong>{notification.offerTitle}</strong>
                  </p>
                {:else if notification.offer?.title}
                  <p class="mt-3 mb-3">
                    <strong>Angebot:</strong>
                    {notification.offer.title}
                  </p>
                {/if}

                <p class="mt-2 mb-1">
                  {notification.message}
                </p>

                {#if notification.bookingNumber}
                  <p class="text-muted mb-1">
                    <small
                      >Buchungsnummer:
                      {notification.bookingNumber}</small
                    >
                  </p>
                {/if}
              </div>

              <small class="text-muted notification-date">
                {formatDateTime(notification.createdAt)}
              </small>
            </div>

            <form
              method="POST"
              action="?/delete"
              class="mt-3"
              onsubmit={(event) => {
                if (!confirm("Möchten Sie diese Nachricht löschen?")) {
                  event.preventDefault();
                }
              }}
            >
              <input
                type="hidden"
                name="notificationId"
                value={notification._id}
              />

              <button class="btn btn-outline-danger btn-sm" type="submit">
                Nachricht löschen
              </button>
            </form>
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <h4>Noch keine Benachrichtigungen</h4>
        <p class="text-muted mb-3">
          Sobald Sie Termine buchen, verschieben oder stornieren, erscheinen
          hier Hinweise.
        </p>

        <a href="/offers" class="btn btn-primary">Angebote entdecken</a>
      </div>
    {/if}
  </div>
</div>

<style>
  .notifications-page {
    max-width: 900px;
  }

  .notification-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .notification-card {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 18px;
    background-color: white;
  }

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .notification-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    white-space: nowrap;
  }

  .notification-date {
    font-size: 13px;
  }

  .empty-state {
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 32px;
    background-color: white;
    text-align: center;
  }
</style>
