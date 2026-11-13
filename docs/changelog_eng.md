# Changelog

[🇩🇪 Deutsche Version](CHANGELOG.md)

## v1.0.8

### Added
- **Board view:** new third switch at the top of the card (between notes and graph view), also on small screens. Every category is a row with its notes as compact cards — great for sorting ideas and tasks into e.g. "In progress", "Priority A", "Priority B" …
  - **Drag & drop:** drag left/right within a row to change the order, drag into another row to change the category. With a mouse the whole card is draggable, on touch devices use the handle. Keyboard: focus the handle, left/right arrow = order, up/down = category.
  - Dragging to **"No category"** removes the note's categories.
  - **+** in a row creates a note in that category and opens the editor. If it stays empty, it is removed again when you close the editor.
  - Rows can be sorted **up/down** with the arrows, empty categories can be removed with the trash icon.
  - Tap a card to open the editor. Cards show the reminder, checklist progress (e.g. 1/2) and further categories.
  - `default_view: board` starts the card in the board view.
- **Define categories in advance:** in the board via "Create a new category", even without a note. Categories and their order are stored together with the notes.
- **Category picker on the note:** next to the input field there is a dropdown with all existing categories.
- **Categories in the Markdown editor:** the editor popup has a category bar at the bottom — remove categories, type new ones (with autocomplete) or pick them from the list. Changes apply with "Save", "Cancel" asks before discarding changed categories. Backspace in the empty field removes the last category.
- **Autocomplete:** while typing a category, an existing name is completed (Enter or Tab accepts). Upper/lower case follows the existing category, so no duplicates are created.
- **Visibility per note** (`note_visibility`, only with `storage: shared`): administrators choose on each note which users can see it. Administrators always see all notes.

### Notes
- Older card versions do not know the predefined categories. If an older version saves, empty predefined categories are lost — notes and their categories are kept.

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
