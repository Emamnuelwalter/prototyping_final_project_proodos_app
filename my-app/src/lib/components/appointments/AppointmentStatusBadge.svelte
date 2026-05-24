<script>
  let { status } = $props();

  let label = $derived(
    status === "confirmed"
      ? "Bestätigt"
      : status === "pending"
        ? "Ausstehend"
        : status === "cancelled"
          ? "Storniert"
          : status === "rescheduled"
            ? "Verschoben"
            : "Unbekannt",
  );

  let badgeClass = $derived(
    status === "confirmed"
      ? "text-bg-success"
      : status === "pending"
        ? "text-bg-warning"
        : status === "cancelled"
          ? "text-bg-danger"
          : status === "rescheduled"
            ? "text-bg-info"
            : "text-bg-secondary",
  );
</script>

<span class={"badge " + badgeClass}>
  {label}
</span>
