# Changelog

[🇬🇧 English version](changelog_eng.md)

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
