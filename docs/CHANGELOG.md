# Changelog

[🇬🇧 English version](changelog_eng.md)

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
