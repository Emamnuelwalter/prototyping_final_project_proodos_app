<div class="container py-5">
  <div class="info-page mx-auto">
    <h1 class="mb-3">Über Proodos</h1>

    <p class="text-muted">
      Proodos ist ein Prototyp für eine Trainingsplattform, auf der Nutzerinnen
      und Nutzer passende Trainer, Kurse und Trainingsstandorte finden,
      favorisieren und buchen können.
    </p>

    <div class="info-card mt-4">
      <h4>Hauptfunktionen</h4>

      <ul>
        <li>Trainingsangebote suchen und filtern</li>
        <li>Angebote als Favoriten speichern</li>
        <li>Termine buchen, verschieben oder stornieren</li>
        <li>Wiederholungsanfragen für mehrere Wochen erstellen</li>
        <li>Trainingsstandorte auf einer Karte entdecken</li>
        <li>Bewertungen nach einer Buchung schreiben</li>
      </ul>
    </div>

    <div class="info-card mt-4">
      <h4>Hinweis zum Prototyp</h4>

      <p>
        Diese Anwendung wurde als Prototyp im Rahmen eines Hochschulprojekts
        entwickelt. Einige Funktionen sind bewusst vereinfacht umgesetzt. Dazu
        gehören insbesondere Login, Passwortspeicherung, Kartenkoordinaten,
        Buchungsbestätigung und Trainerverwaltung.
      </p>

      <p class="mb-0">
        In einer produktiven Version müssten Sicherheit, Datenschutz,
        Passwort-Hashing, Rollenrechte, Adressvalidierung und externe
        Schnittstellen weiter ausgebaut werden.
      </p>
    </div>

    <div class="info-card mt-4">
      <h4>Datenschutz und Demo-Daten</h4>

      <p class="mb-0">
        Im Prototyp werden Daten nur zu Demonstrationszwecken verwendet.
        Gespeichert werden Profilinformationen, Favoriten, Buchungen,
        Bewertungen und einfache Login-Daten. Die Anwendung ist nicht für den
        produktiven Einsatz mit echten sensiblen Personendaten vorgesehen.
      </p>
    </div>

    <div class="info-card mt-4">
      <h4>Projekt-Repository</h4>

      <p>Der Quellcode des Prototyps ist im GitHub-Repository verfügbar.</p>

      <a
        href="https://github.com/Emamnuelwalter/prototyping_final_project_proobos_app"
        target="_blank"
        rel="noreferrer"
        class="btn btn-dark github-button"
      >
        GitHub Repository öffnen
      </a>
    </div>
  </div>
</div>

<style>
  .info-page {
    max-width: 850px;
  }

  .info-page h1 {
    font-size: 42px;
    font-weight: 700;
  }

  .info-card {
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 24px;
    background-color: white;
  }

  .info-card h4 {
    margin-bottom: 14px;
    font-weight: 600;
  }

  .info-card p,
  .info-card li {
    font-size: 16px;
    line-height: 1.6;
  }

  .github-button {
    border-radius: 10px;
    padding: 10px 18px;
    font-weight: 500;
  }
</style>
