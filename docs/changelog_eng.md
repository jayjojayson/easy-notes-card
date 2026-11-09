# Changelog

[🇩🇪 Deutsche Version](CHANGELOG.md)

## v1.0.7

### Added
- **Shared notes for all users:** new editor field "Storage location" (`storage` in YAML) with the options *Shared for all users* (`storage: shared`, **default**) and *Per user* (`storage: user`, as in v1.0.6). Shared notes are stored in `.storage/frontend.system_data` and are included in the backup. Needs a recent Home Assistant version.
- **Take over your notes:** if the shared storage is still empty and you are an administrator with personal notes, the card offers *Copy to shared storage* or *Start empty*. A copy is made, the personal notes are kept.
- **Read only for non-administrators:** only administrators can change shared notes. Everyone else sees them with a *Read only* hint — no "New" button, no edit buttons, no checking off tasks, no buttons on due reminders and no import. Export and the graph view still work.
- **Older Home Assistant versions:** without shared storage the card shows a hint and suggests switching to *Per user*. Nothing is saved and nothing is lost.

### Notes
- **Changed default:** the shared storage is now the default. A card without a `storage` setting starts with the (empty) shared notes instead of your personal ones. Your personal notes are not deleted — administrators are offered to copy them over, or set `storage: user` to keep working with them as before.

## v1.0.6

### Added
- First public release of the **Easy Notes Card** via HACS.
- Notes with Markdown editor (formatting toolbar, live preview, keyboard shortcuts), colors, categories, search and drag & drop sorting.
- Tile and list layout on wide cards.
- Graph view: categories and notes as a connected network, with drag, zoom and fit-to-view.
- Reminders per note with snooze and an optional sidebar notification.
- Markdown export (single file, ZIP, clipboard) and import (files, ZIP, folder).
- Visual card editor, English and German localization.
- Notes are stored in the Home Assistant user storage, per user account and across devices.
