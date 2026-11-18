# Changelog

[🇬🇧 English version](changelog_eng.md)

## v1.1.0

### Hinzugefügt
- **Screenshots und Bilder in Notizen:** Screenshot machen und mit Strg+V direkt in eine Notiz einfügen – ohne Zwischenspeichern. Das geht im Markdown-Editor und beim direkten Bearbeiten einer Notiz-Kachel. Im Editor gibt es außerdem einen Bild-Knopf in der Toolbar (praktisch am Handy, z. B. Screenshot aus der Galerie) und Bilddateien lassen sich ins Textfeld ziehen.
  - Bilder werden im Medienordner von Home Assistant im Unterordner „Easy Notes Pictures“ gespeichert (bei älteren HA-Versionen, die keinen Unterordner anlegen, direkt im Medienordner). In der Notiz steht nur der Verweis `![Screenshot](/media/local/…)`. So bleibt der Notizspeicher klein.
  - Beim Löschen einer Notiz werden ihre Bilder im Medienordner mit gelöscht. Bilder, die eine andere Notiz noch verwendet, bleiben erhalten. Bei Notizen mit Bildern fragt die Card vorher nach – ohne Admin-Rechte mit dem Hinweis, dass die Bilder im Medienordner liegen bleiben.
  - Neuer Export „Mit Bildern exportieren (ZIP)“: Die Bilder kommen in einen Ordner `images/` im ZIP, die Notizen verweisen darauf (auch in Obsidian & Co. lesbar). Beim Import eines solchen ZIP werden die Bilder wieder hochgeladen (nur Administratoren).
  - Hochladen können nur Administratoren (Vorgabe von Home Assistant), anzeigen können alle Benutzer. Ein Klick auf ein Bild öffnet es in voller Größe.
  - Board-Karten zeigen das erste Bild einer Notiz als kleine Vorschau.
  - Markdown-Bilder `![Text](https://…)` aus dem Internet werden ebenfalls angezeigt.
- **Eigene Farben:** Im Farb-Werkzeug einer Notiz gibt es neben den festen Farben ein Farbfeld für eine beliebige eigene Farbe (Auswahl per Farbwähler, keine Code-Eingabe). Auch für neue Notizen wählbar: im Card-Editor unter „Farbe neuer Notizen“ → „Eigene Farbe …“ mit Farbfeld, in YAML `note_color: "#ff5722"`.
- **Ordner-Import:** Heißt jetzt „Ordner importieren (.md)“, damit klar ist, dass ein Ordner mit Markdown-Dateien gemeint ist. Liegt darin ein ausgepackter Export mit `images/`, werden die Bilder wie beim ZIP wieder hochgeladen.
- **Board: Karten umbrechen** (`board_wrap`, Editor: „Board: Karten umbrechen statt seitlich scrollen“): Alle Karten einer Kategorie stehen in mehreren Reihen untereinander statt in einer seitlich scrollbaren Zeile – praktisch auf dem Handy. Drag & Drop funktioniert auch zwischen den Reihen.
- **Werkzeuge in der Board-Ansicht:** Jede Karte im Board hat links neben dem Griff einen Menü-Knopf (☰). Er öffnet ein Menü mit denselben Werkzeugen wie an der Notiz-Kachel: Kategorien festlegen, Erinnerung festlegen, Farbe wählen, Sichtbarkeit (wenn `note_visibility` aktiv ist) und Notiz löschen. Ein Wechsel in die Notizansicht ist dafür nicht mehr nötig.
  - Farbe und Erinnerung werden sofort an der Karte angezeigt. Ändern sich die Kategorien, wandert die Karte beim Schließen des Menüs in die passende Zeile.
  - Löschen fragt im Menü einmal nach.
  - Schließen per Klick außerhalb, Escape oder erneutem Klick auf ☰. Mit der Tastatur: Pfeil hoch/runter wechselt zwischen den Einträgen.
  - Für Benutzer ohne Admin-Rechte gibt es keinen Menü-Knopf (wie bisher nur lesen).

### Geändert
- Die Werkzeug-Panels (Farbe, Erinnerung, Sichtbarkeit, Kategorien) sind jetzt gemeinsamer Code für Notiz-Kachel und Board-Menü, damit beide immer gleich funktionieren.

## v1.0.9

### Behoben
- **Keine überschriebenen Notizen mehr bei mehreren Geräten/Browsern:** Bisher schrieb eine Card beim Speichern ihren kompletten Stand in den Speicher. War die Card auf einem anderen Gerät, in einem anderen Browser-Tab oder auf einem Wandtablet schon länger offen, konnte eine Änderung dort Notizen überschreiben, die inzwischen woanders angelegt oder geändert wurden. Jetzt liest die Card vor jedem Speichern den aktuellen Stand und führt ihn zusammen: Neue und geänderte Notizen anderer Geräte bleiben erhalten, Löschungen werden übernommen, bei gleichzeitiger Änderung derselben Notiz gewinnt die zuletzt gespeicherte. Schlägt das Lesen fehl, wird nicht geschrieben.
- **Aktueller Stand auch bei lange offenen Dashboards:** Die Card lädt jetzt etwa jede Minute still nach und auch, wenn man zur Dashboard-Ansicht zurückkehrt (bisher nur beim Wechsel zurück in den Browser-Tab).
- **Übernahme persönlicher Notizen:** Bisher wurde die Übernahme nur angeboten, wenn der gemeinsame Speicher komplett leer war. Wer dort schon (Test-)Notizen hatte, bekam keinen Hinweis, und ältere persönliche Notizen wirkten verschwunden. Jetzt bietet die Card „Fehlende übernehmen“ an, sobald persönliche Notizen im gemeinsamen Speicher fehlen. „Nicht mehr anzeigen“ wird pro Benutzer gemerkt. Benutzer ohne Admin-Rechte sehen einen Hinweis, dass ihre persönlichen Notizen nicht verloren sind.
- **Export enthält jetzt die festgelegten Kategorien:** Markdown- und ZIP-Export schreiben die Board-Kategorien samt Reihenfolge mit (im ZIP als `_easy-notes-categories.md`), der Import stellt sie wieder her. Bisher fehlten nach einem Wiederherstellen leere Kategorien und die Reihenfolge der Zeilen.
- **Seitenleisten-Benachrichtigung bei Benutzern ohne Admin-Rechte:** Eine weggeklickte Benachrichtigung kam bei jedem Öffnen bzw. Nachladen wieder, weil diese Benutzer „benachrichtigt“ nicht speichern können. Das merkt sich jetzt der Browser.
- **Board:** Die seitliche Scroll-Position der Zeilen bleibt beim Neuzeichnen erhalten (z. B. nach Änderungen oder Nachladen).
- **Kein Neuzeichnen mitten in einer Eingabe:** Auch das Laden der Benutzerliste (Sichtbarkeit pro Notiz) und Ziehen/Zoomen in der Netzansicht unterbrechen nichts mehr.
- **Aufgeräumt:** ungenutzter Code entfernt, Netzansicht merkt sich keine Positionen gelöschter Notizen mehr.

### Hinzugefügt
- **Anzahl der Notizen** (`show_count`, Editor: „Anzahl der Notizen anzeigen“): Zeigt die Summe aller Notizen als Badge neben dem Titel. Bei Suche oder Kategorie-Filter erscheint „gefunden / alle“.

### Hinweise
- Persönliche Notizen aus v1.0.6 wurden nie gelöscht. Sie liegen weiterhin im persönlichen Speicher und werden ab v1.0.9 zur Übernahme angeboten (oder mit `storage: user` angezeigt).

## v1.0.8

### Hinzugefügt
- **Board-Ansicht:** Neuer dritter Umschalter oben in der Card (zwischen Notiz- und Netzansicht), auch auf kleinen Bildschirmen. Jede Kategorie ist eine Zeile, darin stehen die Notizen als kompakte Karten. Ideal, um Ideen und Aufgaben z. B. nach „In Arbeit“, „Prio A“, „Prio B“ … zu ordnen.
  - **Drag & Drop:** Innerhalb einer Zeile nach links/rechts ziehen ändert die Reihenfolge, in eine andere Zeile ziehen wechselt die Kategorie. Mit der Maus geht das an der ganzen Karte, auf Touch-Geräten am Griff. Tastatur: Griff fokussieren, Pfeil links/rechts = Reihenfolge, hoch/runter = Kategorie.
  - Ziehen nach **„Ohne Kategorie“** entfernt die Kategorien der Notiz.
  - **+** in einer Zeile legt direkt eine Notiz in dieser Kategorie an und öffnet den Editor. Bleibt sie leer, wird sie beim Schließen wieder entfernt.
  - Zeilen lassen sich mit den Pfeilen **nach oben/unten** sortieren, leere Kategorien mit dem Papierkorb entfernen.
  - Karte antippen öffnet den Editor. Karten zeigen Erinnerung, Checklisten-Fortschritt (z. B. 1/2) und weitere Kategorien.
  - `default_view: board` startet die Card direkt im Board.
- **Kategorien vorab festlegen:** Im Board über „Neue Kategorie anlegen“, auch ohne Notiz. Die Kategorien und ihre Reihenfolge werden zusammen mit den Notizen gespeichert.
- **Kategorie-Auswahl an der Notiz:** Neben dem Eingabefeld gibt es ein Auswahlfeld mit allen vorhandenen Kategorien.
- **Kategorien im Markdown-Editor:** Im Editor-Popup gibt es unten eine Kategorie-Leiste – Kategorien entfernen, eintippen (mit Autovervollständigung) oder aus der Liste wählen. Übernommen wird erst mit „Speichern“, „Abbrechen“ fragt bei geänderten Kategorien nach. Rücktaste im leeren Feld entfernt die letzte Kategorie.
- **Autovervollständigung:** Beim Tippen einer Kategorie wird ein vorhandener Name ergänzt (Enter oder Tab übernimmt). Groß-/Kleinschreibung wird an die vorhandene Kategorie angepasst, so entstehen keine Doppelungen.
- **Sichtbarkeit pro Notiz** (`note_visibility`, nur bei `storage: shared`): Administratoren legen an jeder Notiz fest, welche Benutzer sie sehen. Administratoren sehen immer alle Notizen.

### Hinweise
- Ältere Card-Versionen kennen die festgelegten Kategorien nicht. Speichert eine ältere Version, gehen leere, vorab angelegte Kategorien verloren – Notizen und ihre Kategorien bleiben erhalten.

## v1.0.7

### Hinzugefügt
- **Gemeinsame Notizen für alle Benutzer:** Neues Editor-Feld „Speicherort“ (`storage` in YAML) mit den Optionen *Gemeinsam für alle Benutzer* (`storage: shared`, **Standard**) und *Pro Benutzer* (`storage: user`, wie in v1.0.6). Gemeinsame Notizen liegen in `.storage/frontend.system_data` und sind im Backup enthalten. Braucht eine aktuelle Home-Assistant-Version.
- **Eigene Notizen übernehmen:** Ist der gemeinsame Speicher noch leer und du hast als Administrator eigene Notizen, bietet die Card „In den gemeinsamen Speicher übernehmen“ oder „Leer starten“ an. Übernommen wird eine Kopie, die persönlichen Notizen bleiben erhalten.
- **Nur lesen für Nicht-Administratoren:** Gemeinsame Notizen können nur Administratoren ändern. Alle anderen sehen sie mit dem Hinweis „Nur lesen“ – kein „Neu“, keine Bearbeitungs-Buttons, kein Abhaken, keine Buttons bei fälligen Erinnerungen und kein Import. Exportieren und die Netzansicht funktionieren weiterhin.
- **Ältere Home-Assistant-Versionen:** Fehlt der gemeinsame Speicher, zeigt die Card einen Hinweis und empfiehlt „Pro Benutzer“. Es wird nichts gespeichert und nichts geht verloren.

### Hinweise
- **Geänderter Standard:** Der gemeinsame Speicher ist jetzt der Standard. Eine Card ohne `storage`-Angabe startet mit den (leeren) gemeinsamen Notizen statt mit deinen persönlichen. Deine persönlichen Notizen werden nicht gelöscht – Administratoren wird angeboten, sie zu übernehmen, oder du setzt `storage: user` und arbeitest wie bisher damit weiter.

## v1.0.6

### Hinzugefügt
- Erste öffentliche Version der **Easy Notes Card** über HACS.
- Notizen mit Markdown-Editor (Formatierungsleiste, Live-Vorschau, Tastenkürzel), Farben, Kategorien, Suche und Verschieben per Drag & Drop.
- Kachel- und Listenansicht bei breiten Cards.
- Netzansicht: Kategorien und Notizen als verbundenes Netz, mit Verschieben, Zoomen und Einpassen.
- Erinnerungen pro Notiz mit „Später erinnern“ und optionaler Seitenleisten-Benachrichtigung.
- Markdown-Export (einzelne Datei, ZIP, Zwischenablage) und -Import (Dateien, ZIP, Ordner).
- Visueller Card-Editor, Deutsch und Englisch.
- Die Notizen liegen im Home-Assistant-User-Speicher, pro Benutzerkonto und geräteübergreifend.
