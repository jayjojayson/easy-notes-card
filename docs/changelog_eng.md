# Changelog

[🇩🇪 Deutsche Version](CHANGELOG.md)

## v1.1.0

### Added
- **Screenshots and images in notes:** take a screenshot and paste it with Ctrl+V straight into a note – no need to save it first. This works in the Markdown editor and when editing a note tile directly. The editor also has an image button in the toolbar (handy on a phone, e.g. a screenshot from the gallery), and image files can be dragged into the text field.
  - Images are stored in the Home Assistant media folder in the subfolder "Easy Notes Pictures" (directly in the media folder on older HA versions that don't create subfolders). The note only contains the link `![Screenshot](/media/local/…)`. This keeps the note storage small.
  - Deleting a note also deletes its images from the media folder. Images still used by another note are kept. Notes with images ask before deleting – without admin rights with a hint that the images stay in the media folder.
  - New export "Export with images (ZIP)": images go into an `images/` folder in the ZIP and the notes link to them (readable in Obsidian & co. too). Importing such a ZIP uploads the images again (administrators only).
  - Only administrators can upload (a Home Assistant rule), all users can view. Click an image to open it in full size.
  - Board cards show the first image of a note as a small preview.
  - Markdown images `![Text](https://…)` from the web are shown as well.
- **Custom colors:** the color tool of a note now has a color field for any custom color next to the fixed colors (pick it with the color picker, no code needed). Also for new notes: in the card editor under "Color of new notes" → "Custom color …" with a color picker, in YAML `note_color: "#ff5722"`.
- **Folder import:** now called "Import folder (.md)" to make clear it means a folder of Markdown files. If it contains an unpacked export with `images/`, the images are uploaded again just like from a ZIP.
- **Board: wrap cards** (`board_wrap`, editor: "Board: wrap cards instead of scrolling sideways"): all cards of a category are shown in several rows instead of one row you scroll sideways – handy on a phone. Drag & drop also works between the rows.
- **Tools in the board view:** every card in the board has a menu button (☰) left of the handle. It opens a menu with the same tools as the note tile: set categories, set reminder, choose color, visibility (when `note_visibility` is on) and delete note. No need to switch to the notes view anymore.
  - Color and reminder show up on the card right away. If the categories change, the card moves to the matching row when you close the menu.
  - Deleting asks once in the menu.
  - Close it by clicking outside, pressing Escape or clicking ☰ again. Keyboard: up/down arrow moves between the entries.
  - Users without admin rights don't get the menu button (read only, as before).

### Changed
- The tool panels (color, reminder, visibility, categories) are now shared code for the note tile and the board menu, so both always behave the same.

## v1.0.9

### Fixed
- **No more overwritten notes with several devices/browsers:** so far a card wrote its complete state to the storage when saving. If the card had been open for a while on another device, in another browser tab or on a wall tablet, a change there could overwrite notes that had been created or changed elsewhere in the meantime. Now the card reads the current state before every save and merges it: new and changed notes from other devices are kept, deletions are applied, and if the same note was changed on two devices, the last save wins. If reading fails, nothing is written.
- **Up to date on dashboards that stay open:** the card now reloads quietly about every minute and when you return to the dashboard view (previously only when switching back to the browser tab).
- **Copying personal notes:** so far the card only offered to copy personal notes when the shared storage was completely empty. If there were already (test) notes in it, no hint appeared and older personal notes seemed to be gone. Now the card offers *Copy missing notes* as soon as personal notes are missing in the shared storage. *Don't show again* is remembered per user. Users without admin rights see a hint that their personal notes are not lost.
- **Export now includes the predefined categories:** Markdown and ZIP export include the board categories and their order (in the ZIP as `_easy-notes-categories.md`), and import restores them. So far empty categories and the row order were missing after a restore.
- **Sidebar notification for users without admin rights:** a dismissed notification came back on every page load or reload, because these users cannot save "notified". The browser now remembers it.
- **Board:** the horizontal scroll position of the rows is kept when the board is redrawn (e.g. after changes or a reload).
- **No redraw while typing:** loading the user list (visibility per note) and dragging/zooming in the graph view no longer interrupt you.
- **Cleanup:** unused code removed, the graph view no longer keeps positions of deleted notes.

### Added
- **Number of notes** (`show_count`, editor: "Show number of notes"): shows the total number of notes as a badge next to the title. While searching or filtering by category it shows "found / all".

### Notes
- Personal notes from v1.0.6 were never deleted. They are still in the personal storage and are offered for copying from v1.0.9 on (or shown with `storage: user`).

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
