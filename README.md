<!-- Add a screenshot at docs/images/easy-notes-card.png and uncomment:
<img width="100%" height="auto" alt="easy-notes-card" src="https://github.com/jayjojayson/easy-notes-card/blob/main/docs/images/easy-notes-card.png" />
-->

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-blue.svg)](https://github.com/hacs/plugin)
[![HACS validation](https://img.shields.io/github/actions/workflow/status/jayjojayson/easy-notes-card/validate.yml?label=HACS%20Validation)](https://github.com/jayjojayson/easy-notes-card/actions?query=workflow%3Avalidate)
[![GitHub release](https://img.shields.io/github/release/jayjojayson/easy-notes-card?include_prereleases=&sort=semver&color=blue)](https://github.com/jayjojayson/easy-notes-card/releases)
![Downloads](https://img.shields.io/github/downloads/jayjojayson/easy-notes-card/total?label=Downloads&color=blue)
[![README Deutsch](https://img.shields.io/badge/README-DE-orange)](https://github.com/jayjojayson/easy-notes-card/blob/main/docs/README-de.md)
[![Support](https://img.shields.io/badge/%20-Support%20Me-steelblue?style=flat&logo=paypal&logoColor=white)](https://www.paypal.me/quadFlyerFW)
[![Stars](https://img.shields.io/github/stars/jayjojayson/easy-notes-card)](https://github.com/jayjojayson/easy-notes-card/stargazers)


# Easy Notes Card

📝 The Easy Notes Card is a note card for Home Assistant. Write quick notes right on your dashboard — with Markdown, colors, categories, reminders, drag & drop sorting and a graph view that connects your notes through their categories.

Your notes are stored in the Home Assistant **user storage**: per user account on the server, so they are available on every device — no helper entities, no extra integration, no YAML needed.

If you like the Card, I would appreciate a Star rating ⭐ from you. 🤗

### ✨ Features

**Notes**
- **Quick notes**: add a note with one tap and start typing. Tap a note to edit it in place, or open it in the full editor.
- **Markdown editor**: formatting toolbar (headings, bold, italic, strikethrough, code, lists, numbered lists, checklists, quotes, code blocks, links, dividers), live preview and keyboard shortcuts (`Ctrl+B`, `Ctrl+I`, `Ctrl+K`, `Ctrl+S`).
- **Colors**: 8 note colors that follow your Home Assistant theme — pick one per note, or let the card choose randomly.
- **Categories**: give your notes up to 12 categories and filter the list with one tap.
- **Search**: find notes in the whole text instantly.
- **Drag & drop**: move notes into any order — with the mouse, with touch or with the arrow keys.
- **Tile and list layout**: on wide cards you can switch between a tile view and a list view.

**Graph view**
- **Notes as a network**: categories and notes are drawn as a connected graph. Notes that share a category are linked — drag, zoom (mouse wheel, buttons or pinch on touch screens) and fit everything into view.
- **Quick access**: a double-click opens a note or shows all notes of a category.

**Reminders**
- **Reminder per note**: pick a date and time, or use the shortcuts *in 15 min*, *in 1 hour* and *tomorrow 09:00*.
- **Snooze or done**: due reminders pop up on the card — snooze them by the configured time or mark them as done.
- **Optional sidebar notification**: additionally show a due reminder as a Home Assistant notification in the sidebar.
- **Missed reminders** are shown immediately when you open the dashboard again.

**Backup**
- **Export** all notes as one Markdown file, as separate Markdown files in a ZIP, or copy them to the clipboard as Markdown.
- **Import** Markdown files, ZIP archives or whole folders — duplicates are skipped, changed notes are updated.

**Operation**
- **Visual editor**: everything is configurable in the Home Assistant UI — no YAML required.
- **Localization**: English and German (follows your Home Assistant language).
- **Resizable**: width and height come from the Home Assistant layout (Sections view). With automatic height the card grows with the notes, with a fixed height the note list scrolls inside the card.

---

### 🚀 Installation

### HACS (Recommended)

- Add this repository via the link in Home Assistant.

   [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jayjojayson&repository=easy-notes-card&category=plugin)

- The "Easy Notes Card" should now be available in HACS. Click on "INSTALL".
- The resource will be automatically added to your Lovelace configuration.

#### HACS (manual)
1. Ensure HACS is installed.
2. Add this repository as a custom repository in HACS (category: *Dashboard* / *Plugin*).
3. Search for "Easy Notes Card" and install it.
4. Reload resources if prompted.

#### Manual Installation
1. Download `easy-notes-card.js` from the [Releases](../../releases) page.
2. Upload it to the `www/community/easy-notes-card/` folder in Home Assistant.
3. Add the resource in your Dashboard configuration:
   - URL: `/local/community/easy-notes-card/easy-notes-card.js`
   - Type: JavaScript Module

---

### ⚙️ Configuration

You can configure the whole card in the visual editor of Home Assistant — no YAML needed. Add the card to a dashboard (**Add card → Easy Notes**) and use the editor. If you prefer YAML, every editor field has a matching key, listed in the [YAML reference](#yaml-reference).

#### Quick start

The minimal configuration is just the card type:

```yaml
type: custom:easy-notes-card
```

Everything else is optional.

#### Editor options

| Setting | YAML key | What it does |
|---|---|---|
| Title | `title` | Heading of the card. |
| Storage key | `storage_key` | Name under which the notes are stored. **Cards with the same key show the same notes**; a different key gives you a separate set of notes. |
| Default view | `default_view` | Start with the notes view (`notes`) or the graph view (`graph`). |
| Search | `show_search` | Show the search field. |
| Categories | `show_categories` | Show the category bar above the notes. |
| Number of visible notes | `max_notes` | `0` shows all notes; otherwise only this many are shown, the rest is behind a "Show more" button. |
| Note color | `note_color` | Color of new notes: `random`, `yellow`, `orange`, `pink`, `purple`, `blue`, `teal`, `green` or `grey`. |
| Reminders | `reminders` | Enable reminders for each note. |
| Sidebar notification | `sidebar_notification` | Also show a due reminder as Home Assistant notification in the sidebar. |
| Snooze time | `snooze_minutes` | Minutes a snoozed reminder waits before it shows up again. |

#### YAML reference

```yaml
type: custom:easy-notes-card
title: Easy Notes
storage_key: easy_notes_data   # same key = same notes
default_view: notes            # notes | graph
show_search: true
show_categories: true
max_notes: 0                   # 0 = all notes
note_color: random             # random | yellow | orange | pink | purple | blue | teal | green | grey
reminders: true
sidebar_notification: false
snooze_minutes: 10
```

#### Where are my notes stored?

The notes are saved with the Home Assistant WebSocket calls `frontend/get_user_data` and `frontend/set_user_data`. That means:

- The notes live **on the server, per Home Assistant user account** — they follow you from phone to tablet to desktop.
- Every user has their own notes. Two users do not see each other's notes, even with the same `storage_key`.
- The notes are part of your Home Assistant backup (`.storage`).

#### Reminders — good to know

Reminders are checked **in the browser**. They only fire while a dashboard with this card is open (e.g. a wall tablet). When you open the dashboard later, missed reminders are shown immediately.

#### Troubleshooting

- **Card is not found / "Custom element doesn't exist":** check that the resource is added as a *JavaScript Module* and reload the browser cache (`Ctrl+F5`).
- **Notes are missing on another device:** make sure you are logged in with the same Home Assistant user and the cards use the same `storage_key`.
- **"The notes could not be saved":** the connection to Home Assistant was interrupted. The next change tries again.
- **Reminder does not fire:** the dashboard has to be open in a browser (see above).

---

## 🙌 Contributors

Thanks to everyone who helps to improve the card with ideas, bug reports and code. Ideas and feedback are always welcome — open an [issue](https://github.com/jayjojayson/easy-notes-card/issues).

- [**jayjojayson**](https://github.com/jayjojayson) — author

---

📜 [Changelog](docs/changelog_eng.md) · [Changelog (Deutsch)](docs/CHANGELOG.md) · 📄 [MIT License](LICENSE)
