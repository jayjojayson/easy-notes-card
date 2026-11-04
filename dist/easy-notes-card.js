/*
 * Easy Notes – Notiz-Card für Home Assistant
 * Version 1.0.6
 *
 * Schnelle Notizen mit Markdown, Farben, Kategorien, Erinnerungen, Verschieben per Drag & Drop,
 * Editor mit Formatierungsleiste, Netzansicht (Kategorien und Notizen als verbundenes Netz)
 * und Markdown-Export/-Import.
 * Reine Dashboard-Card: Die Notizen liegen im HA-User-Storage
 * (WebSocket "frontend/get_user_data" / "frontend/set_user_data"),
 * pro Benutzerkonto auf dem Server und damit geräteübergreifend.
 *
 * Einbindung: /config/www/easy-notes-card.js
 *   Einstellungen > Dashboards > Ressourcen > URL: /local/easy-notes-card.js (JavaScript-Modul)
 *
 * YAML (alles außer type ist optional):
 *   type: custom:easy-notes-card
 *   title: Easy Notes
 *   storage_key: easy_notes_data   # gleicher Schlüssel = gleiche Notizen
 *   default_view: notes            # notes | graph
 *   show_search: true
 *   max_notes: 0                   # 0 = alle Notizen, sonst Anzahl sichtbarer Notizen
 *   show_categories: true          # Kategorie-Leiste über den Notizen
 *   note_color: random             # random | yellow | orange | pink | purple | blue | teal | green | grey
 *   reminders: true                # Erinnerungen pro Notiz
 *   sidebar_notification: false    # fällige Erinnerung zusätzlich als HA-Benachrichtigung (Seitenleiste)
 *   snooze_minutes: 10
 *
 * Größe: Breite und Höhe legst du im HA-Layout der Card fest (Sections-Ansicht).
 * Mit automatischer Höhe wächst die Card mit den Notizen (oder bis max_notes),
 * mit fester Höhe scrollt die Notizliste innerhalb der Card.
 *
 * Wichtig: Erinnerungen werden im Browser geprüft. Sie lösen nur aus, solange
 * ein Dashboard mit dieser Card geöffnet ist (z. B. Wandtablet). Beim nächsten
 * Öffnen werden verpasste Erinnerungen sofort angezeigt.
 */

const EASY_NOTES_VERSION = "1.0.6";

// MDI-Pfade (@mdi/js)
const mdiPlus = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
const mdiDelete = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z";
const mdiMagnify =
  "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z";
const mdiBellOutline =
  "M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z";
const mdiBell =
  "M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21";
const mdiBellRing =
  "M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21M19.75,3.19L18.33,4.61C20.04,6.3 21,8.6 21,11H23C23,8.07 21.84,5.25 19.75,3.19M1,11H3C3,8.6 3.96,6.3 5.67,4.61L4.25,3.19C2.16,5.25 1,8.07 1,11Z";
const mdiBellSleep =
  "M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M15,9H9V11H12.24L9,13.7V16H15V14H11.76L15,11.3V9Z";
const mdiPalette =
  "M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.11 13.35,18.76 13.11,18.5C12.88,18.23 12.73,17.88 12.73,17.5A1.5,1.5 0 0,1 14.23,16H16A5,5 0 0,0 21,11C21,6.58 16.97,3 12,3Z";
const mdiDragVertical =
  "M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z";
const mdiCheck = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z";
const mdiNoteTextOutline =
  "M15 3H5A2 2 0 0 0 3 5V19A2 2 0 0 0 5 21H19A2 2 0 0 0 21 19V9L15 3M19 19H5V5H14V10H19M17 14H7V12H17M14 17H7V15H14";
const mdiTagOutline =
  "M21.41 11.58L12.41 2.58A2 2 0 0 0 11 2H4A2 2 0 0 0 2 4V11A2 2 0 0 0 2.59 12.42L11.59 21.42A2 2 0 0 0 13 22A2 2 0 0 0 14.41 21.41L21.41 14.41A2 2 0 0 0 22 13A2 2 0 0 0 21.41 11.58M13 20L4 11V4H11L20 13M6.5 5A1.5 1.5 0 1 1 5 6.5A1.5 1.5 0 0 1 6.5 5Z";
const mdiGraphOutline =
  "M19.5 17C19.36 17 19.24 17 19.11 17.04L17.5 13.8C17.95 13.35 18.25 12.71 18.25 12C18.25 10.62 17.13 9.5 15.75 9.5C15.61 9.5 15.5 9.5 15.35 9.54L13.74 6.3C14.21 5.84 14.5 5.21 14.5 4.5C14.5 3.12 13.38 2 12 2S9.5 3.12 9.5 4.5C9.5 5.2 9.79 5.84 10.26 6.29L8.65 9.54C8.5 9.5 8.39 9.5 8.25 9.5C6.87 9.5 5.75 10.62 5.75 12C5.75 12.71 6.04 13.34 6.5 13.79L4.89 17.04C4.76 17 4.64 17 4.5 17C3.12 17 2 18.12 2 19.5C2 20.88 3.12 22 4.5 22S7 20.88 7 19.5C7 18.8 6.71 18.16 6.24 17.71L7.86 14.46C8 14.5 8.12 14.5 8.25 14.5C8.38 14.5 8.5 14.5 8.63 14.46L10.26 17.71C9.79 18.16 9.5 18.8 9.5 19.5C9.5 20.88 10.62 22 12 22S14.5 20.88 14.5 19.5C14.5 18.12 13.38 17 12 17C11.87 17 11.74 17 11.61 17.04L10 13.8C10.45 13.35 10.75 12.71 10.75 12C10.75 11.3 10.46 10.67 10 10.21L11.61 6.96C11.74 7 11.87 7 12 7C12.13 7 12.26 7 12.39 6.96L14 10.21C13.54 10.66 13.25 11.3 13.25 12C13.25 13.38 14.37 14.5 15.75 14.5C15.88 14.5 16 14.5 16.13 14.46L17.76 17.71C17.29 18.16 17 18.8 17 19.5C17 20.88 18.12 22 19.5 22S22 20.88 22 19.5C22 18.12 20.88 17 19.5 17M4.5 20.5C3.95 20.5 3.5 20.05 3.5 19.5S3.95 18.5 4.5 18.5 5.5 18.95 5.5 19.5 5.05 20.5 4.5 20.5M13 19.5C13 20.05 12.55 20.5 12 20.5S11 20.05 11 19.5 11.45 18.5 12 18.5 13 18.95 13 19.5M7.25 12C7.25 11.45 7.7 11 8.25 11S9.25 11.45 9.25 12 8.8 13 8.25 13 7.25 12.55 7.25 12M11 4.5C11 3.95 11.45 3.5 12 3.5S13 3.95 13 4.5 12.55 5.5 12 5.5 11 5.05 11 4.5M14.75 12C14.75 11.45 15.2 11 15.75 11S16.75 11.45 16.75 12 16.3 13 15.75 13 14.75 12.55 14.75 12M19.5 20.5C18.95 20.5 18.5 20.05 18.5 19.5S18.95 18.5 19.5 18.5 20.5 18.95 20.5 19.5 20.05 20.5 19.5 20.5Z";
const mdiNoteMultipleOutline =
  "M3,6V22H21V24H3A2,2 0 0,1 1,22V6H3M16,9H21.5L16,3.5V9M7,2H17L23,8V18A2,2 0 0,1 21,20H7C5.89,20 5,19.1 5,18V4A2,2 0 0,1 7,2M7,4V18H21V11H14V4H7Z";
const mdiBackupRestore =
  "M12,3A9,9 0 0,0 3,12H0L4,16L8,12H5A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19C10.5,19 9.09,18.5 7.94,17.7L6.5,19.14C8.04,20.3 9.94,21 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M14,12A2,2 0 0,0 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12Z";
const mdiFileExportOutline =
  "M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M16 11V18.1L13.9 16L11.1 18.8L8.3 16L11.1 13.2L8.9 11H16Z";
const mdiContentCopy =
  "M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z";
const mdiFileImportOutline =
  "M14 2H6C4.89 2 4 2.9 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2M18 20H6V4H13V9H18V20M15 11.93V19H7.93L10.05 16.88L7.22 14.05L10.05 11.22L12.88 14.05L15 11.93Z";
const mdiClose =
  "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
const mdiMagnifyPlusOutline =
  "M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z";
const mdiMagnifyMinusOutline =
  "M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,6.5 0 0,0 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14M9.5,14C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z";
const mdiFitToScreenOutline =
  "M17 4H20C21.1 4 22 4.9 22 6V8H20V6H17V4M4 8V6H7V4H4C2.9 4 2 4.9 2 6V8H4M20 16V18H17V20H20C21.1 20 22 19.1 22 18V16H20M7 18H4V16H2V18C2 19.1 2.9 20 4 20H7V18M16 10V14H8V10H16M18 8H6V16H18V8Z";

const mdiTextBoxEditOutline =
  "M10 21H5C3.89 21 3 20.11 3 19V5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V10.33C20.7 10.21 20.37 10.14 20.04 10.14C19.67 10.14 19.32 10.22 19 10.37V5H5V19H10.11L10 19.11V21M7 9H17V7H7V9M7 17H12.11L14 15.12V15H7V17M7 13H16.12L17 12.12V11H7V13M21.7 13.58L20.42 12.3C20.21 12.09 19.86 12.09 19.65 12.3L18.65 13.3L20.7 15.35L21.7 14.35C21.91 14.14 21.91 13.79 21.7 13.58M12 22H14.06L20.11 15.93L18.06 13.88L12 19.94V22Z";
const mdiFormatHeader1 =
  "M3,4H5V10H9V4H11V18H9V12H5V18H3V4M14,18V16H16V6.31L13.5,7.75V5.44L16,4H18V16H20V18H14Z";
const mdiFormatHeader2 =
  "M3,4H5V10H9V4H11V18H9V12H5V18H3V4M21,18H15A2,2 0 0,1 13,16C13,15.47 13.2,15 13.54,14.64L18.41,9.41C18.78,9.05 19,8.55 19,8A2,2 0 0,0 17,6A2,2 0 0,0 15,8H13A4,4 0 0,1 17,4A4,4 0 0,1 21,8C21,9.1 20.55,10.1 19.83,10.83L15,16H21V18Z";
const mdiFormatHeader3 =
  "M3,4H5V10H9V4H11V18H9V12H5V18H3V4M15,4H19A2,2 0 0,1 21,6V16A2,2 0 0,1 19,18H15A2,2 0 0,1 13,16V15H15V16H19V12H15V10H19V6H15V7H13V6A2,2 0 0,1 15,4Z";
const mdiFormatText =
  "M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z";
const mdiFormatBold =
  "M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z";
const mdiFormatItalic =
  "M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z";
const mdiFormatStrikethroughVariant =
  "M7.2 9.8C6 7.5 7.7 4.8 10.1 4.3C13.2 3.3 17.7 4.7 17.6 8.5H14.6C14.6 8.2 14.5 7.9 14.5 7.7C14.3 7.1 13.9 6.8 13.3 6.6C12.5 6.3 11.2 6.4 10.5 6.9C9 8.2 10.4 9.5 12 10H7.4C7.3 9.9 7.3 9.8 7.2 9.8M21 13V11H3V13H12.6C12.8 13.1 13 13.1 13.2 13.2C13.8 13.5 14.3 13.7 14.5 14.3C14.6 14.7 14.7 15.2 14.5 15.6C14.3 16.1 13.9 16.3 13.4 16.5C11.6 17 9.4 16.3 9.5 14.1H6.5C6.4 16.7 8.6 18.5 11 18.8C14.8 19.6 19.3 17.2 17.3 12.9L21 13Z";
const mdiFormatListBulleted =
  "M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z";
const mdiFormatListNumbered =
  "M7,13V11H21V13H7M7,19V17H21V19H7M7,7V5H21V7H7M3,8V5H2V4H4V8H3M2,17V16H5V20H2V19H4V18.5H3V17.5H4V17H2M4.25,10A0.75,0.75 0 0,1 5,10.75C5,10.95 4.92,11.14 4.79,11.27L3.12,13H5V14H2V13.08L4,11H2V10H4.25Z";
const mdiFormatListChecks =
  "M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,20L1.5,16.5L2.91,15.09L5,17.17L9.59,12.59L11,14L5,20Z";
const mdiFormatQuoteClose =
  "M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z";
const mdiCodeTags =
  "M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z";
const mdiCodeBraces =
  "M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z";
const mdiLinkVariant =
  "M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z";
const mdiMinus =
  "M19,13H5V11H19V13Z";

const mdiChevronDown = "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z";
const mdiChevronUp = "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z";

const mdiFolderUploadOutline =
  "M20 18H4V8H20M20 6H12L10 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V8A2 2 0 0 0 20 6M16 17H14V13H11L15 9L19 13H16Z";

const mdiViewGridOutline =
  "M3 11H11V3H3M5 5H9V9H5M13 21H21V13H13M15 15H19V19H15M3 21H11V13H3M5 15H9V19H5M13 3V11H21V3M19 9H15V5H19Z";
const mdiViewSplitVertical = "M13,5H21V19H13V5M3,5H11V7H3V5M3,11V9H11V11H3M3,19V17H11V19H3M3,15V13H11V15H3Z";

// Ab dieser Card-Breite (px) gibt es den Umschalter Kacheln / Liste
const EASY_WIDE_MIN = 960;

const mdiFolderZipOutline =
  "M20 6H12L10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6M20 18H16V16H14V18H4V8H14V10H16V8H20V18M16 12V10H18V12H16M14 12H16V14H14V12M18 16H16V14H18V16Z";

const EASY_DEFAULTS = {
  storage_key: "easy_notes_data",
  default_view: "notes",
  show_search: true,
  show_categories: true,
  max_notes: 0,
  note_color: "random",
  reminders: true,
  sidebar_notification: false,
  snooze_minutes: 10,
};

// Theme-Farben von HA, mit Fallback
const EASY_PALETTE = {
  yellow: "var(--yellow-color, #facc15)",
  orange: "var(--orange-color, #fb923c)",
  pink: "var(--pink-color, #f472b6)",
  purple: "var(--purple-color, #a78bfa)",
  blue: "var(--blue-color, #38bdf8)",
  teal: "var(--teal-color, #2dd4bf)",
  green: "var(--green-color, #4ade80)",
  grey: "var(--grey-color, #9ca3af)",
};
const EASY_COLOR_KEYS = Object.keys(EASY_PALETTE);
const EASY_VIEWS = ["notes", "graph"];
const EASY_MAX_IMPORT_BYTES = 2 * 1024 * 1024;
const EASY_MAX_ZIP_BYTES = 50 * 1024 * 1024;

const EASY_I18N = {
  de: {
    title: "Easy Notes",
    add: "Neu",
    search: "Notizen durchsuchen",
    placeholder: "Notiz schreiben",
    del: "Notiz löschen",
    color: "Farbe wählen",
    remind: "Erinnerung festlegen",
    remindRemove: "Erinnerung entfernen",
    in15: "In 15 Min",
    in1h: "In 1 Std",
    tomorrow: "Morgen 09:00",
    due: "Erinnerung fällig",
    snooze: "{n} Min später",
    done: "Erledigt",
    dueBadge: "{n} fällig",
    drag: "Verschieben (ziehen oder Pfeiltasten)",
    edited: "Bearbeitet",
    empty: "Noch keine Notizen. Mit „Neu“ legst du die erste an.",
    noResults: "Keine Treffer für „{q}“.",
    noInCat: "Keine Notizen in „{c}“.",
    emptyNote: "(leere Notiz)",
    notifyTitle: "Easy Notes: Erinnerung",
    notifyError: "Die Benachrichtigung konnte nicht erstellt werden.",
    loadError: "Die Notizen konnten nicht geladen werden. Lade die Seite neu.",
    saveError: "Die Notizen konnten nicht gespeichert werden. Die nächste Änderung versucht es erneut.",
    // Kategorien
    cats: "Kategorien festlegen",
    catAdd: "Kategorie eingeben",
    catAddBtn: "Hinzufügen",
    catRemove: "Kategorie „{c}“ entfernen",
    catAll: "Alle",
    catFilter: "Nach Kategorie filtern",
    catShow: "Notizen in „{c}“ anzeigen",
    // Ansichten
    viewGroup: "Ansicht",
    viewNotes: "Notizansicht",
    viewGraph: "Netzansicht",
    graphHint: "Gib Notizen Kategorien, dann verbinden sie sich im Netz.",
    openNote: "Notiz öffnen",
    showNotes: "Notizen anzeigen",
    layoutGroup: "Darstellung",
    layoutTiles: "Kachelansicht",
    layoutList: "Listenansicht",
    listLabel: "Notizen",
    dblNote: "Doppelklick öffnet die Notiz",
    dblCat: "Doppelklick zeigt die Notizen",
    close: "Schließen",
    zoomIn: "Vergrößern",
    zoomOut: "Verkleinern",
    fit: "Alles einpassen",
    // Sichern
    backup: "Sichern und wiederherstellen",
    exportFile: "Als eine Markdown-Datei exportieren",
    exportZip: "Als einzelne Dateien exportieren (ZIP)",
    exportCopy: "Als Markdown kopieren",
    importFile: "Markdown-Dateien oder ZIP importieren",
    importDir: "Ordner importieren",
    importedFiles: "{f} Dateien gelesen.",
    importFailedFiles: "{x} Dateien konnten nicht gelesen werden.",
    importTooBigFiles: "{x} Dateien waren größer als 2 MB und wurden übersprungen.",
    exported: "{n} exportiert.",
    exportedZip: "{n} als einzelne Markdown-Dateien in einer ZIP-Datei exportiert.",
    copied: "{n} als Markdown in die Zwischenablage kopiert.",
    copyError: "Kopieren ist hier nicht möglich. Nutze den Export als Datei.",
    imported: "Import abgeschlossen: {a} neu, {u} aktualisiert.",
    importedSkipped: "{s} doppelt und übersprungen.",
    importEmpty: "In der Datei wurden keine Notizen gefunden.",
    importError: "Die Datei konnte nicht gelesen werden.",
    importTooBig: "Die Datei ist zu groß (maximal 2 MB).",
    mdExportedAt: "Exportiert am",
    mdHint: "Wiederherstellen: Easy Notes Card > Sichern und wiederherstellen > Markdown-Dateien importieren.",
    mdCategories: "Kategorien",
    mdColor: "Farbe",
    mdReminder: "Erinnerung",
    showMore: "{n} weitere anzeigen",
    showLess: "Weniger anzeigen",
    // Markdown und Editor
    editInline: "Zum Bearbeiten tippen",
    openEditor: "Im Editor öffnen",
    editorTitle: "Notiz bearbeiten",
    write: "Schreiben",
    preview: "Vorschau",
    save: "Speichern",
    cancel: "Abbrechen",
    discardQ: "Ungespeicherte Änderungen verwerfen?",
    discard: "Verwerfen",
    keepEditing: "Weiter bearbeiten",
    previewEmpty: "Noch kein Text.",
    toolbar: "Formatierung",
    saveHint: "Strg+S speichert",
    linkText: "Linktext",
    codePh: "Code",
    textPh: "Text",
    fmt: {
      h1: "Überschrift 1",
      h2: "Überschrift 2",
      h3: "Überschrift 3",
      text: "Normaler Text",
      bold: "Fett (Strg+B)",
      italic: "Kursiv (Strg+I)",
      strike: "Durchgestrichen",
      code: "Code",
      ul: "Aufzählung",
      ol: "Nummerierte Liste",
      task: "Checkliste",
      quote: "Zitat",
      codeblock: "Codeblock",
      link: "Link (Strg+K)",
      hr: "Trennlinie",
    },
    nNotes: ["1 Notiz", "{n} Notizen"],
    nCats: ["1 Kategorie", "{n} Kategorien"],
    colors: { yellow: "Gelb", orange: "Orange", pink: "Pink", purple: "Lila", blue: "Blau", teal: "Türkis", green: "Grün", grey: "Grau" },
  },
  en: {
    title: "Easy Notes",
    add: "New",
    search: "Search notes",
    placeholder: "Write a note",
    del: "Delete note",
    color: "Choose color",
    remind: "Set reminder",
    remindRemove: "Remove reminder",
    in15: "In 15 min",
    in1h: "In 1 hour",
    tomorrow: "Tomorrow 09:00",
    due: "Reminder due",
    snooze: "Snooze {n} min",
    done: "Done",
    dueBadge: "{n} due",
    drag: "Move (drag or arrow keys)",
    edited: "Edited",
    empty: "No notes yet. Select “New” to write your first one.",
    noResults: "No matches for “{q}”.",
    noInCat: "No notes in “{c}”.",
    emptyNote: "(empty note)",
    notifyTitle: "Easy Notes: reminder",
    notifyError: "The notification could not be created.",
    loadError: "The notes could not be loaded. Reload the page.",
    saveError: "The notes could not be saved. The next change will try again.",
    cats: "Set categories",
    catAdd: "Type a category",
    catAddBtn: "Add",
    catRemove: "Remove category “{c}”",
    catAll: "All",
    catFilter: "Filter by category",
    catShow: "Show notes in “{c}”",
    viewGroup: "View",
    viewNotes: "Notes view",
    viewGraph: "Graph view",
    graphHint: "Give notes categories to connect them in the graph.",
    openNote: "Open note",
    showNotes: "Show notes",
    layoutGroup: "Layout",
    layoutTiles: "Tile view",
    layoutList: "List view",
    listLabel: "Notes",
    dblNote: "Double-click opens the note",
    dblCat: "Double-click shows the notes",
    close: "Close",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fit: "Fit to view",
    backup: "Back up and restore",
    exportFile: "Export as one Markdown file",
    exportZip: "Export as separate files (ZIP)",
    exportCopy: "Copy as Markdown",
    importFile: "Import Markdown files or ZIP",
    importDir: "Import folder",
    importedFiles: "Read {f} files.",
    importFailedFiles: "{x} files could not be read.",
    importTooBigFiles: "{x} files were larger than 2 MB and were skipped.",
    exported: "Exported {n}.",
    exportedZip: "Exported {n} as separate Markdown files in a ZIP file.",
    copied: "Copied {n} to the clipboard as Markdown.",
    copyError: "Copying is not possible here. Use the file export instead.",
    imported: "Import finished: {a} new, {u} updated.",
    importedSkipped: "{s} duplicates skipped.",
    importEmpty: "No notes were found in the file.",
    importError: "The file could not be read.",
    importTooBig: "The file is too large (2 MB maximum).",
    mdExportedAt: "Exported on",
    mdHint: "Restore: Easy Notes card > Back up and restore > Import Markdown files.",
    mdCategories: "Categories",
    mdColor: "Color",
    mdReminder: "Reminder",
    showMore: "Show {n} more",
    showLess: "Show less",
    editInline: "Tap to edit",
    openEditor: "Open in editor",
    editorTitle: "Edit note",
    write: "Write",
    preview: "Preview",
    save: "Save",
    cancel: "Cancel",
    discardQ: "Discard unsaved changes?",
    discard: "Discard",
    keepEditing: "Keep editing",
    previewEmpty: "No text yet.",
    toolbar: "Formatting",
    saveHint: "Ctrl+S saves",
    linkText: "Link text",
    codePh: "code",
    textPh: "text",
    fmt: {
      h1: "Heading 1",
      h2: "Heading 2",
      h3: "Heading 3",
      text: "Normal text",
      bold: "Bold (Ctrl+B)",
      italic: "Italic (Ctrl+I)",
      strike: "Strikethrough",
      code: "Code",
      ul: "Bulleted list",
      ol: "Numbered list",
      task: "Checklist",
      quote: "Quote",
      codeblock: "Code block",
      link: "Link (Ctrl+K)",
      hr: "Divider",
    },
    nNotes: ["1 note", "{n} notes"],
    nCats: ["1 category", "{n} categories"],
    colors: { yellow: "Yellow", orange: "Orange", pink: "Pink", purple: "Purple", blue: "Blue", teal: "Teal", green: "Green", grey: "Grey" },
  },
};

function easyUid() {
  try {
    if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID();
  } catch (_) {
    /* ignore */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function easyToLocalInput(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Kategorien säubern: trimmen, Länge begrenzen, ohne Doppelte (Groß/Klein egal)
function easyCleanCats(list) {
  const out = [];
  const seen = new Set();
  for (const raw of Array.isArray(list) ? list : []) {
    const c = String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
    const k = c.toLowerCase();
    if (!c || seen.has(k)) continue;
    seen.add(k);
    out.push(c);
    if (out.length >= 12) break;
  }
  return out;
}

// Markdown-Zeichen für kurze Beschriftungen entfernen
function easyPlain(line) {
  return String(line || "")
    .replace(/^\s{0,3}#{1,6}\s+/, "")
    .replace(/^(\s*>\s?)+/, "")
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|~~|`/g, "")
    .trim();
}

// Lesbare Zeilen ohne Markdown-Zeichen (für Listenzeilen)
function easyPlainLines(text) {
  const out = [];
  let fence = false;
  for (const raw of String(text || "").split("\n")) {
    if (/^\s*(```|~~~)/.test(raw)) {
      fence = !fence;
      continue;
    }
    if (fence || /^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(raw)) continue;
    if (/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(raw) && raw.includes("|")) continue;
    const p = easyPlain(raw).replace(/\|/g, " ").replace(/\s+/g, " ").trim();
    if (p) out.push(p);
  }
  return out;
}

function easyFirstLine(text, max = 28) {
  for (const raw of String(text || "").split("\n")) {
    if (/^\s*(```|~~~)/.test(raw)) continue;
    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(raw)) continue;
    const p = easyPlain(raw);
    if (p) return p.length > max ? `${p.slice(0, max - 1)}…` : p;
  }
  return "";
}

// Einfacher YAML-Frontmatter-Leser für Wiki-Dateien (Obsidian, Wiki.js, Outline …)
function easyYamlScalar(v) {
  let s = String(v ?? "").trim();
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    try {
      return String(JSON.parse(s));
    } catch (_) {
      return s.slice(1, -1);
    }
  }
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'")) s = s.slice(1, -1).replace(/''/g, "'");
  return s;
}

function easyFrontmatter(src) {
  const m = /^---[ \t]*\n([\s\S]*?)\n(?:---|\.\.\.)[ \t]*(?:\n|$)/.exec(src);
  if (!m) return { meta: {}, body: src };
  const lines = m[1].split("\n");
  const KV = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/;
  const ITEM = /^\s*-\s+(.*)$/;
  // Nur echtes Frontmatter auswerten, nicht eine Trennlinie am Dateianfang
  const valid = lines.some((l) => KV.test(l)) && lines.every((l) => !l.trim() || KV.test(l) || ITEM.test(l) || /^\s+\S/.test(l) || l.trim().startsWith("#"));
  if (!valid) return { meta: {}, body: src };
  const meta = {};
  let key = null;
  for (const line of lines) {
    const kv = KV.exec(line);
    if (kv) {
      key = kv[1].toLowerCase();
      const v = kv[2].trim();
      if (!v) meta[key] = [];
      else if (/^\[.*\]$/.test(v)) meta[key] = v.slice(1, -1).split(",").map(easyYamlScalar).filter(Boolean);
      else meta[key] = easyYamlScalar(v);
      continue;
    }
    const item = ITEM.exec(line);
    if (item && key && Array.isArray(meta[key])) meta[key].push(easyYamlScalar(item[1]));
  }
  return { meta, body: src.slice(m[0].length) };
}

// Eine Markdown-Datei wird eine Notiz. Frontmatter liefert Titel, Kategorien und Datum.
function easyNoteFromFile(src, path = "") {
  const { meta, body } = easyFrontmatter(src);
  // Datei aus dem Easy-Notes-ZIP-Export: Text und Eigenschaften genau übernehmen
  if (typeof meta.easy_notes_id === "string" && meta.easy_notes_id) {
    const note = {
      id: meta.easy_notes_id,
      text: body.replace(/\n$/, ""),
      color: typeof meta.color === "string" ? meta.color : undefined,
      categories: Array.isArray(meta.tags) ? meta.tags : [],
      _exact: true,
    };
    if (typeof meta.reminder === "string" && meta.reminder) note.remind_at = meta.reminder;
    if (typeof meta.updated === "string" && meta.updated) note.updated = meta.updated;
    const pos = Number(meta.position);
    if (Number.isFinite(pos)) note._pos = pos;
    return note;
  }
  let text = body.replace(/^\s*\n/, "").replace(/\s+$/, "");
  const title = typeof meta.title === "string" ? meta.title.trim() : "";
  const firstLine = (text.split("\n").find((l) => l.trim()) || "").trim();
  if (title && !/^#{1,6}\s/.test(firstLine)) text = `# ${title}\n\n${text}`.trim();
  // Nur Trennlinien oder Leerzeilen: keine Notiz
  if (!text.replace(/^\s{0,3}([-*_])(\s*\1){2,}\s*$/gm, "").trim()) return null;

  let tags = meta.tags ?? meta.tag ?? meta.categories ?? meta.category ?? meta.kategorien ?? meta.kategorie ?? [];
  if (typeof tags === "string") tags = tags.includes(",") ? tags.split(",") : tags.split(/\s+/);
  const categories = (Array.isArray(tags) ? tags : []).map((t) => easyYamlScalar(t).replace(/^#/, "")).filter(Boolean);
  // Unterordner beim Ordner-Import als Kategorie (Ordner/Unterordner/Datei.md)
  const parts = String(path).split("/").filter(Boolean);
  if (parts.length >= 3) categories.push(parts[parts.length - 2]);

  const note = { text, categories };
  const when = meta.updated ?? meta.modified ?? meta.date ?? meta.created;
  if (typeof when === "string" && !isNaN(new Date(when).getTime())) note.updated = new Date(when).toISOString();
  return note;
}

// ==========================================
// ZIP: schreiben (unkomprimiert) und lesen (unkomprimiert oder Deflate), ohne Bibliothek
// ==========================================
const EASY_CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function easyCrc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = EASY_CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function easyConcat(parts) {
  const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

// files: [{ name, data: Uint8Array, date }] -> Uint8Array (ZIP)
function easyZip(files) {
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = f.data;
    const crc = easyCrc32(data);
    const d = f.date instanceof Date && !isNaN(f.date) && f.date.getFullYear() >= 1980 ? f.date : new Date();
    const time = ((d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2)) & 0xffff;
    const day = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;

    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true); // Dateinamen in UTF-8
    lv.setUint16(8, 0, true); // unkomprimiert
    lv.setUint16(10, time, true);
    lv.setUint16(12, day, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true);
    local.set(name, 30);

    const cen = new Uint8Array(46 + name.length);
    const cv = new DataView(cen.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, time, true);
    cv.setUint16(14, day, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    cen.set(name, 46);

    parts.push(local, data);
    central.push(cen);
    offset += local.length + data.length;
  }
  const cenSize = central.reduce((a, c) => a + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cenSize, true);
  ev.setUint32(16, offset, true);
  return easyConcat([...parts, ...central, end]);
}

// ZIP lesen -> [{ name, method, raw, size, encrypted }]
function easyUnzip(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Keine ZIP-Datei");
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  const out = [];
  for (let k = 0; k < count; k++) {
    if (p + 46 > u8.length || dv.getUint32(p, true) !== 0x02014b50) throw new Error("ZIP-Datei beschädigt");
    const flags = dv.getUint16(p + 8, true);
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const usize = dv.getUint32(p + 24, true);
    const nlen = dv.getUint16(p + 28, true);
    const xlen = dv.getUint16(p + 30, true);
    const clen = dv.getUint16(p + 32, true);
    const lho = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    if (name.endsWith("/")) continue;
    const start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
    out.push({ name, method, raw: u8.subarray(start, start + csize), size: usize, encrypted: !!(flags & 1) });
  }
  return out;
}

async function easyInflateRaw(bytes) {
  if (typeof DecompressionStream === "undefined") throw new Error("Deflate wird von diesem Browser nicht unterstützt");
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  writer.write(bytes).catch(() => {});
  writer.close().catch(() => {});
  const reader = ds.readable.getReader();
  const chunks = [];
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return easyConcat(chunks);
}

// Dateiname aus dem Notiztitel: lesbar, ohne verbotene Zeichen
function easyFileName(title, used) {
  let base = String(title || "")
    .replace(/[\\/:*?"<>|#\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60)
    .replace(/[. ]+$/, "");
  if (!base) base = "notiz";
  let name = `${base}.md`;
  let i = 2;
  while (used.has(name.toLowerCase())) name = `${base}-${i++}.md`;
  used.add(name.toLowerCase());
  return name;
}

// ==========================================
// MARKDOWN (sicher: baut DOM-Knoten, nie innerHTML mit Notiztext)
// ==========================================
const EASY_MD_SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;
const MD_FENCE = /^\s{0,3}(`{3,}|~{3,})\s*([\w+#.-]*)/;
const MD_HEAD = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const MD_HR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const MD_QUOTE = /^\s{0,3}>\s?(.*)$/;
const MD_LIST = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const MD_TSEP = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

function easyLink(url) {
  const a = document.createElement("a");
  a.href = url;
  if (/^https?:/i.test(url)) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  } else if (url.startsWith("/")) {
    // Interne HA-Pfade (z. B. /lovelace/0) ohne Neuladen öffnen
    a.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      history.pushState(null, "", url);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    });
  }
  return a;
}

function easyMdInline(text, parent) {
  // 1 Escape, 2/3 Code, 4/5 Link, 6/7 Fett, 8 Durchgestrichen, 9/10 Kursiv, 11 URL
  const re =
    /\\([\\`*_{}\[\]()#+\-.!~|>])|(`+)([^`]|[^`][\s\S]*?[^`])\2(?!`)|\[([^\]\n]+)\]\(([^)\s]+)\)|(\*\*|__)(?=\S)([\s\S]*?\S)\6|~~(?=\S)([\s\S]*?\S)~~|(\*|_)(?=\S)([\s\S]*?\S)\9|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"\]])/g;
  const push = (t) => {
    if (t) parent.appendChild(document.createTextNode(t));
  };
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index;
    const end = re.lastIndex;
    const marker = m[6] || m[9];
    // Unterstriche mitten im Wort (snake_case, entity_ids) nicht als Formatierung lesen
    if (marker && marker[0] === "_") {
      const before = text[start - 1];
      const after = text[end];
      if ((before && /\w/.test(before)) || (after && /\w/.test(after))) {
        re.lastIndex = start + 1;
        continue;
      }
    }
    push(text.slice(last, start));
    if (m[1] !== undefined) {
      push(m[1]);
    } else if (m[2]) {
      const c = document.createElement("code");
      const v = m[3];
      c.textContent = v.length > 2 && v.startsWith(" ") && v.endsWith(" ") ? v.slice(1, -1) : v;
      parent.appendChild(c);
    } else if (m[4] !== undefined) {
      if (EASY_MD_SAFE_URL.test(m[5])) {
        const a = easyLink(m[5]);
        easyMdInline(m[4], a);
        parent.appendChild(a);
      } else {
        easyMdInline(m[4], parent); // unsichere Adresse (z. B. javascript:) nur als Text
      }
    } else if (m[6]) {
      const b = document.createElement("strong");
      easyMdInline(m[7], b);
      parent.appendChild(b);
    } else if (m[8] !== undefined) {
      const d = document.createElement("del");
      easyMdInline(m[8], d);
      parent.appendChild(d);
    } else if (m[9]) {
      const i = document.createElement("em");
      easyMdInline(m[10], i);
      parent.appendChild(i);
    } else if (m[11]) {
      const a = easyLink(m[11]);
      a.textContent = m[11];
      parent.appendChild(a);
    }
    last = end;
  }
  push(text.slice(last));
}

function easyMdCells(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  const out = [];
  let cur = "";
  for (let k = 0; k < s.length; k++) {
    if (s[k] === "\\" && s[k + 1] === "|") {
      cur += "|";
      k++;
    } else if (s[k] === "|") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += s[k];
    }
  }
  out.push(cur.trim());
  return out;
}

function easyMdIsTable(lines, i) {
  const next = lines[i + 1];
  return lines[i].includes("|") && next !== undefined && next.includes("|") && next.includes("-") && MD_TSEP.test(next);
}

function easyMdStartsBlock(lines, i) {
  const l = lines[i];
  return (
    MD_FENCE.test(l) || MD_HEAD.test(l) || MD_HR.test(l) || MD_QUOTE.test(l) || MD_LIST.test(l) || easyMdIsTable(lines, i)
  );
}

function easyMdTable(lines, i, parent) {
  const head = easyMdCells(lines[i]);
  const aligns = easyMdCells(lines[i + 1]).map((c) => {
    const l = c.startsWith(":");
    const r = c.endsWith(":");
    return l && r ? "center" : r ? "right" : l ? "left" : "";
  });
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  head.forEach((h, k) => {
    const th = document.createElement("th");
    if (aligns[k]) th.style.textAlign = aligns[k];
    easyMdInline(h, th);
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  const tbody = document.createElement("tbody");
  i += 2;
  while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
    const cells = easyMdCells(lines[i]);
    const row = document.createElement("tr");
    head.forEach((_, k) => {
      const td = document.createElement("td");
      if (aligns[k]) td.style.textAlign = aligns[k];
      easyMdInline(cells[k] || "", td);
      row.appendChild(td);
    });
    tbody.appendChild(row);
    i++;
  }
  table.append(thead, tbody);
  wrap.appendChild(table);
  parent.appendChild(wrap);
  return i;
}

function easyMdList(lines, map, i, parent, opts) {
  const items = [];
  while (i < lines.length) {
    const l = lines[i];
    const m = MD_LIST.exec(l);
    if (m && !MD_HR.test(l)) {
      items.push({ indent: m[1].length, marker: m[2], text: m[3], line: map[i], extra: [] });
      i++;
      continue;
    }
    // Eingerückte Fortsetzungszeile gehört zum letzten Punkt
    if (items.length && l.trim() && /^\s{2,}/.test(l) && !MD_FENCE.test(l)) {
      items[items.length - 1].extra.push(l.trim());
      i++;
      continue;
    }
    break;
  }

  const newList = (ordered, marker, container) => {
    const list = document.createElement(ordered ? "ol" : "ul");
    const start = parseInt(marker, 10);
    if (ordered && start !== 1) list.start = start;
    container.appendChild(list);
    return list;
  };
  const stack = [];
  for (const it of items) {
    const ordered = /\d/.test(it.marker);
    while (stack.length && it.indent < stack[stack.length - 1].indent) stack.pop();
    let top = stack[stack.length - 1];
    if (!top || it.indent > top.indent) {
      const container = top && top.lastLi ? top.lastLi : parent;
      top = { indent: it.indent, ordered, container, list: newList(ordered, it.marker, container), lastLi: null };
      stack.push(top);
    } else if (top.ordered !== ordered) {
      top.ordered = ordered;
      top.list = newList(ordered, it.marker, top.container);
    }

    const li = document.createElement("li");
    const tm = /^\[([ xX])\](?:\s+(.*))?$/.exec(it.text);
    let target = li;
    if (tm) {
      const done = tm[1] !== " ";
      li.className = "task" + (done ? " done" : "");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = done;
      if (opts.onToggle) cb.addEventListener("change", () => opts.onToggle(it.line));
      else cb.disabled = true;
      target = document.createElement("span");
      li.append(cb, target);
      easyMdInline(tm[2] || "", target);
    } else {
      easyMdInline(it.text, li);
    }
    for (const x of it.extra) {
      target.appendChild(document.createElement("br"));
      easyMdInline(x, target);
    }
    top.list.appendChild(li);
    top.lastLi = li;
  }
  return i;
}

function easyMdBlocks(lines, map, parent, opts) {
  const n = lines.length;
  let i = 0;
  while (i < n) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    let m;
    if ((m = MD_FENCE.exec(line))) {
      const close = new RegExp(`^\\s{0,3}${m[1][0] === "`" ? "`" : "~"}{${m[1].length},}\\s*$`);
      const buf = [];
      i++;
      while (i < n && !close.test(lines[i])) buf.push(lines[i++]);
      i++;
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      if (m[2]) code.className = `language-${m[2]}`;
      code.textContent = buf.join("\n");
      pre.appendChild(code);
      parent.appendChild(pre);
      continue;
    }
    if ((m = MD_HEAD.exec(line))) {
      const h = document.createElement(`h${m[1].length}`);
      easyMdInline(m[2], h);
      parent.appendChild(h);
      i++;
      continue;
    }
    if (MD_HR.test(line)) {
      parent.appendChild(document.createElement("hr"));
      i++;
      continue;
    }
    if (MD_QUOTE.test(line)) {
      const sub = [];
      const subMap = [];
      while (i < n && (m = MD_QUOTE.exec(lines[i]))) {
        sub.push(m[1]);
        subMap.push(map[i]);
        i++;
      }
      const bq = document.createElement("blockquote");
      easyMdBlocks(sub, subMap, bq, opts);
      parent.appendChild(bq);
      continue;
    }
    if (easyMdIsTable(lines, i)) {
      i = easyMdTable(lines, i, parent);
      continue;
    }
    if (MD_LIST.test(line)) {
      i = easyMdList(lines, map, i, parent, opts);
      continue;
    }
    // Absatz: Zeilenumbrüche bleiben erhalten (wie man es von Notizen erwartet)
    const p = document.createElement("p");
    let first = true;
    while (i < n && lines[i].trim() && (first || !easyMdStartsBlock(lines, i))) {
      if (!first) p.appendChild(document.createElement("br"));
      easyMdInline(lines[i].trim(), p);
      first = false;
      i++;
    }
    parent.appendChild(p);
  }
}

// opts.onToggle(zeile): macht Checklisten-Kästchen anklickbar
function easyMdRender(src, opts = {}) {
  const lines = String(src || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "    ")
    .split("\n");
  const frag = document.createDocumentFragment();
  easyMdBlocks(
    lines,
    lines.map((_, i) => i),
    frag,
    opts
  );
  return frag;
}

const EASY_SVG_NS = "http://www.w3.org/2000/svg";
function easySvg(tag, cls) {
  const el = document.createElementNS(EASY_SVG_NS, tag);
  if (cls) el.setAttribute("class", cls);
  return el;
}

// ==========================================
// 1. VISUELLER CARD-EDITOR
// ==========================================
const EASY_EDITOR_I18N = {
  de: {
    title: "Titel",
    storage_key: "Speicher-Schlüssel (gleicher Schlüssel = gleiche Notizen)",
    default_view: "Startansicht",
    show_search: "Suchfeld anzeigen",
    show_categories: "Kategorie-Leiste anzeigen",
    show_all_notes: "Alle Notizen anzeigen",
    max_notes: "Anzahl sichtbarer Notizen",
    note_color: "Farbe neuer Notizen",
    reminders: "Erinnerungen aktivieren",
    sidebar_notification: "Fällige Erinnerung als Benachrichtigung in der HA-Seitenleiste",
    snooze_minutes: "Später erinnern nach (Minuten)",
    random: "Zufällig",
    notes: "Notizen",
    graph: "Netz",
    helper_sidebar_notification:
      "Die Benachrichtigung sehen alle HA-Benutzer. Sie wird nur erstellt, solange ein Dashboard mit dieser Card geöffnet ist.",
    helper_reminders: "Erinnerungen lösen nur aus, solange ein Dashboard mit dieser Card geöffnet ist.",
    helper_default_view: "Mit dieser Ansicht öffnet die Card. Der Umschalter in der Card wechselt nur vorübergehend.",
    helper_show_categories:
      "„Alle“ und die Kategorien über den Notizen. Ausgeblendet erscheint die Leiste nur, solange nach einer Kategorie gefiltert wird.",
    helper_show_all_notes:
      "Aus: Die Card zeigt nur die ersten Notizen. Die übrigen erreichst du über „weitere anzeigen“, die Suche, die Kategorien und die Netzansicht.",
    helper_max_notes: "Es zählen die ersten Notizen in deiner Reihenfolge. Neue Notizen stehen oben.",
  },
  en: {
    title: "Title",
    storage_key: "Storage key (same key = same notes)",
    default_view: "Start view",
    show_search: "Show search field",
    show_categories: "Show category bar",
    show_all_notes: "Show all notes",
    max_notes: "Number of visible notes",
    note_color: "Color of new notes",
    reminders: "Enable reminders",
    sidebar_notification: "Show due reminders as notification in the HA sidebar",
    snooze_minutes: "Snooze for (minutes)",
    random: "Random",
    notes: "Notes",
    graph: "Graph",
    helper_sidebar_notification:
      "All HA users can see the notification. It is only created while a dashboard with this card is open.",
    helper_reminders: "Reminders only trigger while a dashboard with this card is open.",
    helper_default_view: "The card opens with this view. The switch in the card only changes it temporarily.",
    helper_show_categories: "“All” and the categories above the notes. When hidden, the bar only appears while a category filter is active.",
    helper_show_all_notes:
      "Off: the card only shows the first notes. Reach the others with “show more”, search, categories and the graph view.",
    helper_max_notes: "Counts the first notes in your order. New notes appear at the top.",
  },
};

class EasyNotesCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = null;
    this._hass = null;
    this._form = null;
  }

  setConfig(config) {
    this._config = config;
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  _lang() {
    const l = (this._hass && (this._hass.locale?.language || this._hass.language)) || "en";
    return String(l).toLowerCase().startsWith("de") ? "de" : "en";
  }

  _schema(data) {
    const t = EASY_EDITOR_I18N[this._lang()];
    const colors = EASY_I18N[this._lang()].colors;
    const limitFields = [{ name: "show_all_notes", selector: { boolean: {} } }];
    if (!data.show_all_notes) {
      limitFields.push({
        name: "max_notes",
        selector: { number: { min: 1, max: 200, step: 1, mode: "box" } },
      });
    }
    return [
      { name: "title", selector: { text: {} } },
      { name: "storage_key", selector: { text: {} } },
      {
        name: "default_view",
        selector: {
          select: {
            mode: "dropdown",
            options: EASY_VIEWS.map((v) => ({ value: v, label: t[v] })),
          },
        },
      },
      { name: "show_search", selector: { boolean: {} } },
      { name: "show_categories", selector: { boolean: {} } },
      ...limitFields,
      {
        name: "note_color",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "random", label: t.random },
              ...EASY_COLOR_KEYS.map((k) => ({ value: k, label: colors[k] })),
            ],
          },
        },
      },
      { name: "reminders", selector: { boolean: {} } },
      { name: "sidebar_notification", selector: { boolean: {} } },
      {
        name: "snooze_minutes",
        selector: { number: { min: 1, max: 1440, step: 1, mode: "box", unit_of_measurement: "min" } },
      },
    ];
  }

  _update() {
    if (!this._config || !this._hass) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => this._valueChanged(ev));
      this.appendChild(this._form);
    }
    const t = EASY_EDITOR_I18N[this._lang()];
    const data = { ...EASY_DEFAULTS, ...this._config };
    // Hilfsfeld nur für den Editor, landet nicht in der Konfiguration
    data.show_all_notes = !(data.max_notes > 0);
    if (data.max_notes > 0) this._lastMax = data.max_notes;
    this._form.hass = this._hass;
    this._form.data = data;
    this._form.schema = this._schema(data);
    this._form.computeLabel = (schema) => t[schema.name] || schema.name;
    this._form.computeHelper = (schema) => t[`helper_${schema.name}`] || "";
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    if (!this._config) return;
    if (!ev.detail || !ev.detail.value) return;
    const value = { ...ev.detail.value };
    const showAll = value.show_all_notes;
    delete value.show_all_notes;
    if (showAll === true) {
      value.max_notes = 0;
    } else if (showAll === false && !(value.max_notes > 0)) {
      value.max_notes = this._lastMax || 6;
    }
    if (value.max_notes > 0) this._lastMax = value.max_notes;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this._config, ...value } },
        bubbles: true,
        composed: true,
      })
    );
  }
}

// ==========================================
// 2. NETZANSICHT (Force-Layout in SVG, ohne externe Bibliotheken)
// ==========================================
const GRAPH_ALPHA_MIN = 0.003;
const GRAPH_ALPHA_DECAY = 0.0228;
const GRAPH_VELOCITY_DECAY = 0.6;

class EasyNotesGraph {
  constructor(card, host) {
    this.card = card;
    this.nodes = [];
    this.links = [];
    this.byId = new Map();
    this.pos = new Map(); // gemerkte Positionen über Neuaufbauten hinweg
    this.alpha = 0;
    this.alphaTarget = 0;
    this.view = { x: 0, y: 0, k: 1 };
    this.target = null;
    this.userMoved = false;
    this.selected = null;
    this.hover = null;
    this.query = "";
    this.pointers = new Map();
    this.drag = null;
    this.pan = null;
    this.pinch = null;
    this.raf = null;
    this.frameNo = 0;
    this.alive = true;
    this.w = 0;
    this.h = 0;

    this.wrap = document.createElement("div");
    this.wrap.className = "graph-wrap";

    this.svg = easySvg("svg", "graph-svg");
    this.svg.setAttribute("role", "img");
    this.viewport = easySvg("g", "viewport");
    this.gLinks = easySvg("g", "g-links");
    this.gNodes = easySvg("g", "g-nodes");
    this.viewport.append(this.gLinks, this.gNodes);
    this.svg.appendChild(this.viewport);

    this.stats = document.createElement("div");
    this.stats.className = "graph-stats";

    const tools = document.createElement("div");
    tools.className = "graph-tools";
    const mk = (icon, title, fn) => {
      const b = card._btn({ icon, title, size: "s" });
      b.addEventListener("click", fn);
      tools.appendChild(b);
      return b;
    };
    mk(mdiMagnifyPlusOutline, card._t("zoomIn"), () => this.zoomBy(1.35));
    mk(mdiMagnifyMinusOutline, card._t("zoomOut"), () => this.zoomBy(1 / 1.35));
    mk(mdiFitToScreenOutline, card._t("fit"), () => {
      this.userMoved = false;
      this.fit(true);
    });

    this.preview = document.createElement("div");
    this.preview.className = "graph-preview";

    this.empty = document.createElement("div");
    this.empty.className = "graph-empty";

    this.wrap.append(this.svg, this.stats, tools, this.preview, this.empty);
    host.appendChild(this.wrap);

    this._bindEvents();

    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => {
        this.measure();
        if (!this.userMoved) this.fit(false);
        this.kick();
      });
      this.ro.observe(this.wrap);
    }
  }

  destroy() {
    this.alive = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.ro) this.ro.disconnect();
  }

  pause() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  measure() {
    this.w = this.svg.clientWidth || this.wrap.clientWidth || 0;
    this.h = this.svg.clientHeight || this.wrap.clientHeight || 0;
  }

  // ---------- Daten ----------
  setData(notes) {
    const card = this.card;
    for (const n of this.nodes) this.pos.set(n.id, { x: n.x, y: n.y });

    const prevKey = this.structureKey;
    const nodes = [];
    const links = [];
    const byId = new Map();
    const catNodes = new Map(); // lower -> node

    for (const note of notes) {
      for (const c of note.categories || []) {
        const k = c.toLowerCase();
        if (!catNodes.has(k)) {
          const node = { id: `c:${k}`, type: "cat", cat: c, count: 0, links: [] };
          catNodes.set(k, node);
        }
        catNodes.get(k).count++;
      }
    }
    const cats = [...catNodes.values()].sort((a, b) => a.cat.localeCompare(b.cat));
    cats.forEach((n, i) => {
      n.r = 10 + Math.min(10, Math.sqrt(n.count) * 2.4);
      const p = this.pos.get(n.id);
      if (p) {
        n.x = p.x;
        n.y = p.y;
      } else {
        const a = (i / Math.max(1, cats.length)) * Math.PI * 2;
        const rad = 60 + cats.length * 12;
        n.x = Math.cos(a) * rad;
        n.y = Math.sin(a) * rad;
      }
      n.vx = 0;
      n.vy = 0;
      nodes.push(n);
      byId.set(n.id, n);
    });

    for (const note of notes) {
      const id = `n:${note.id}`;
      const myCats = (note.categories || []).map((c) => catNodes.get(c.toLowerCase())).filter(Boolean);
      const node = { id, type: "note", note, r: myCats.length ? 6 : 5, links: [], deg: myCats.length };
      const p = this.pos.get(id);
      if (p) {
        node.x = p.x;
        node.y = p.y;
      } else if (myCats.length) {
        node.x = myCats[0].x + (Math.random() - 0.5) * 40;
        node.y = myCats[0].y + (Math.random() - 0.5) * 40;
      } else {
        const a = Math.random() * Math.PI * 2;
        node.x = Math.cos(a) * (120 + Math.random() * 60);
        node.y = Math.sin(a) * (120 + Math.random() * 60);
      }
      node.vx = 0;
      node.vy = 0;
      nodes.push(node);
      byId.set(id, node);
      for (const c of myCats) {
        const link = { s: node, t: c };
        links.push(link);
        node.links.push(link);
        c.links.push(link);
      }
    }

    this.nodes = nodes;
    this.links = links;
    this.byId = byId;
    this.structureKey = nodes.map((n) => n.id).join("|") + "#" + links.map((l) => l.s.id + ">" + l.t.id).join("|");

    if (this.selected && !byId.has(this.selected)) this.selected = null;
    if (this.hover && !byId.has(this.hover)) this.hover = null;

    this._buildDom();
    this._updateStats(notes.length, cats.length);
    this._renderPreview();
    this.applyQuery(this.query);

    if (prevKey !== this.structureKey) {
      this.alpha = prevKey === undefined ? 1 : Math.max(this.alpha, 0.6);
    }
    this.measure();
    if (!this.userMoved) this.fit(false, true);
    this.draw();
    this.kick();
  }

  _buildDom() {
    const card = this.card;
    this.gLinks.replaceChildren();
    this.gNodes.replaceChildren();
    for (const l of this.links) {
      l.el = easySvg("line", "g-link");
      this.gLinks.appendChild(l.el);
    }
    for (const n of this.nodes) {
      const g = easySvg("g", `g-node g-${n.type}`);
      g.dataset.id = n.id;
      const hit = easySvg("circle", "hit");
      hit.setAttribute("r", n.r + 9);
      g.appendChild(hit);
      if (n.type === "cat") {
        const halo = easySvg("circle", "halo");
        halo.setAttribute("r", n.r + 7);
        g.appendChild(halo);
      } else {
        const ring = easySvg("circle", "due-ring");
        ring.setAttribute("r", n.r + 4);
        g.appendChild(ring);
      }
      const core = easySvg("circle", "core");
      core.setAttribute("r", n.r);
      if (n.type === "note") core.style.fill = card._colorValue(n.note.color);
      g.appendChild(core);

      if (n.type === "cat") {
        const cnt = easySvg("text", "g-count");
        cnt.setAttribute("text-anchor", "middle");
        cnt.setAttribute("dominant-baseline", "central");
        cnt.setAttribute("font-size", Math.round(n.r * 0.95));
        cnt.textContent = n.count;
        g.appendChild(cnt);
      }
      const label = easySvg("text", "g-label");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "hanging");
      label.setAttribute("y", n.r + 5);
      label.textContent =
        n.type === "cat" ? n.cat : easyFirstLine(n.note.text) || card._t("emptyNote");
      g.appendChild(label);

      const title = easySvg("title");
      title.textContent =
        n.type === "cat"
          ? `${n.cat} (${card._count(n.count, "nNotes")})\n${card._t("dblCat")}`
          : `${easyFirstLine(n.note.text, 80) || card._t("emptyNote")}\n${card._t("dblNote")}`;
      g.appendChild(title);

      n.el = g;
      this.gNodes.appendChild(g);
    }
    this.refreshStates();
    this._applyHighlight();
  }

  _updateStats(nNotes, nCats) {
    const card = this.card;
    this.empty.textContent = nNotes ? "" : card._t("empty");
    this.empty.style.display = nNotes ? "none" : "flex";
    if (!nNotes) {
      this.stats.textContent = "";
      return;
    }
    this.stats.textContent = nCats
      ? `${card._count(nCats, "nCats")}, ${card._count(nNotes, "nNotes")}`
      : card._t("graphHint");
  }

  refreshStates() {
    for (const n of this.nodes) {
      if (n.type !== "note") continue;
      n.el.classList.toggle("due", this.card._isDue(n.note));
    }
  }

  applyQuery(q) {
    this.query = q || "";
    const s = this.query.trim().toLowerCase();
    this.svg.classList.toggle("searching", !!s);
    for (const n of this.nodes) {
      let match = true;
      if (s) {
        match =
          n.type === "cat"
            ? n.cat.toLowerCase().includes(s)
            : n.note.text.toLowerCase().includes(s) ||
              (n.note.categories || []).some((c) => c.toLowerCase().includes(s));
      }
      n.el.classList.toggle("dim", !match);
    }
  }

  // ---------- Simulation ----------
  kick() {
    if (!this.alive || this.raf) return;
    if (typeof requestAnimationFrame !== "function") return;
    this.raf = requestAnimationFrame(() => this._frame());
  }

  _frame() {
    this.raf = null;
    if (!this.alive) return;
    const dragging = !!(this.drag && this.drag.moved);
    const simActive = this.alpha >= GRAPH_ALPHA_MIN || dragging;
    if (simActive) {
      const steps = this.nodes.length > 250 ? 1 : 2;
      for (let i = 0; i < steps; i++) this.tick();
      if (!this.userMoved && this.frameNo++ % 3 === 0) this.fit(false);
    }
    if (this.target) {
      const t = this.target;
      const v = this.view;
      v.x += (t.x - v.x) * 0.2;
      v.y += (t.y - v.y) * 0.2;
      v.k += (t.k - v.k) * 0.2;
      if (Math.abs(t.x - v.x) < 0.5 && Math.abs(t.y - v.y) < 0.5 && Math.abs(t.k - v.k) < 0.002) {
        this.view = { ...t };
        this.target = null;
      }
    }
    this.draw();
    if (simActive || this.target) this.kick();
  }

  tick() {
    const nodes = this.nodes;
    const n = nodes.length;
    this.alpha += (this.alphaTarget - this.alpha) * GRAPH_ALPHA_DECAY;
    const alpha = this.alpha;

    // Abstoßung + Kollision (O(n²), für Notiz-Mengen problemlos)
    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      const sa = a.type === "cat" ? -320 : -70;
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];
        const sb = b.type === "cat" ? -320 : -70;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1e-6) {
          dx = (Math.random() - 0.5) * 1e-2;
          dy = (Math.random() - 0.5) * 1e-2;
          d2 = dx * dx + dy * dy;
        }
        if (d2 < 160000) {
          const d2c = Math.max(d2, 36);
          a.vx += (dx * sb * alpha) / d2c;
          a.vy += (dy * sb * alpha) / d2c;
          b.vx -= (dx * sa * alpha) / d2c;
          b.vy -= (dy * sa * alpha) / d2c;
        }
        const minD = a.r + b.r + 6;
        if (d2 < minD * minD) {
          const d = Math.sqrt(d2);
          const push = ((minD - d) / d) * 0.35;
          a.vx -= dx * push;
          a.vy -= dy * push;
          b.vx += dx * push;
          b.vy += dy * push;
        }
      }
    }

    // Federn zwischen Notiz und Kategorie
    for (const l of this.links) {
      const s = l.s;
      const t = l.t;
      const dist = 30 + t.r * 1.3;
      let dx = t.x + t.vx - s.x - s.vx;
      let dy = t.y + t.vy - s.y - s.vy;
      const len = Math.sqrt(dx * dx + dy * dy) || 1e-3;
      const strength = 0.7 / Math.max(1, s.deg);
      const f = ((len - dist) / len) * alpha * strength;
      dx *= f;
      dy *= f;
      // Notizen bewegen sich stärker als Kategorie-Knoten
      s.vx += dx * 0.85;
      s.vy += dy * 0.85;
      t.vx -= dx * 0.15;
      t.vy -= dy * 0.15;
    }

    // Leichter Zug zur Mitte
    for (const nd of nodes) {
      const g = nd.type === "cat" ? 0.03 : nd.links.length ? 0.012 : 0.07;
      nd.vx -= nd.x * g * alpha;
      nd.vy -= nd.y * g * alpha;
    }

    for (const nd of nodes) {
      if (nd.fx != null) {
        nd.x = nd.fx;
        nd.y = nd.fy;
        nd.vx = 0;
        nd.vy = 0;
        continue;
      }
      nd.vx *= GRAPH_VELOCITY_DECAY;
      nd.vy *= GRAPH_VELOCITY_DECAY;
      nd.x += nd.vx;
      nd.y += nd.vy;
    }
  }

  draw() {
    const v = this.view;
    this.viewport.setAttribute("transform", `translate(${v.x.toFixed(2)},${v.y.toFixed(2)}) scale(${v.k.toFixed(4)})`);
    // Schrift bleibt beim Herauszoomen lesbar
    this.svg.style.setProperty("--inv", Math.min(2.2, Math.max(0.85, 1 / v.k)).toFixed(3));
    this.svg.classList.toggle("labels", v.k >= 1.1 || this.nodes.length <= 24);
    for (const l of this.links) {
      l.el.setAttribute("x1", l.s.x.toFixed(1));
      l.el.setAttribute("y1", l.s.y.toFixed(1));
      l.el.setAttribute("x2", l.t.x.toFixed(1));
      l.el.setAttribute("y2", l.t.y.toFixed(1));
    }
    for (const n of this.nodes) {
      n.el.setAttribute("transform", `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`);
    }
  }

  // ---------- Kamera ----------
  fit(animate, immediate = false) {
    if (!this.nodes.length) return;
    this.measure();
    if (!this.w || !this.h) return;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const n of this.nodes) {
      const pad = n.type === "cat" ? n.r + 30 : n.r + 14;
      x0 = Math.min(x0, n.x - pad);
      y0 = Math.min(y0, n.y - pad);
      x1 = Math.max(x1, n.x + pad);
      y1 = Math.max(y1, n.y + pad);
    }
    const bw = Math.max(x1 - x0, 60);
    const bh = Math.max(y1 - y0, 60);
    const k = Math.max(0.25, Math.min(1.6, Math.min((this.w - 24) / bw, (this.h - 24) / bh)));
    const t = { x: this.w / 2 - ((x0 + x1) / 2) * k, y: this.h / 2 - ((y0 + y1) / 2) * k, k };
    if (immediate) {
      this.view = t;
      this.target = null;
    } else {
      this.target = t;
      if (animate) this.kick();
    }
  }

  zoomBy(f, cx, cy) {
    this.measure();
    const v = this.target || this.view;
    const px = cx ?? this.w / 2;
    const py = cy ?? this.h / 2;
    const k = Math.max(0.2, Math.min(4, v.k * f));
    this.target = { x: px - ((px - v.x) * k) / v.k, y: py - ((py - v.y) * k) / v.k, k };
    this.userMoved = true;
    this.kick();
  }

  _local(e) {
    const r = this.svg.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  _toWorld(p) {
    return { x: (p.x - this.view.x) / this.view.k, y: (p.y - this.view.y) / this.view.k };
  }

  // ---------- Bedienung ----------
  _bindEvents() {
    const svg = this.svg;

    svg.addEventListener("pointerdown", (e) => {
      if (e.button !== undefined && e.button > 0) return;
      const nodeEl = e.target && e.target.closest ? e.target.closest(".g-node") : null;
      try {
        svg.setPointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
      this.pointers.set(e.pointerId, this._local(e));
      this.target = null;

      if (this.pointers.size === 2) {
        // Zwei Finger: Zoomen statt Ziehen
        if (this.drag) {
          this.drag.node.fx = null;
          this.drag.node.fy = null;
          this.drag = null;
          this.alphaTarget = 0;
        }
        const [p1, p2] = [...this.pointers.values()];
        this.pinch = {
          d: Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1,
          c: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
          v: { ...this.view },
        };
        this.pan = null;
        return;
      }

      const p = this._local(e);
      if (nodeEl) {
        const node = this.byId.get(nodeEl.dataset.id);
        if (!node) return;
        this.drag = { node, start: p, moved: false };
      } else {
        this.pan = { start: p, v: { ...this.view }, moved: false };
      }
    });

    svg.addEventListener("pointermove", (e) => {
      if (!this.pointers.has(e.pointerId)) return;
      const p = this._local(e);
      this.pointers.set(e.pointerId, p);

      if (this.pinch && this.pointers.size >= 2) {
        const [p1, p2] = [...this.pointers.values()];
        const d = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
        const c = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        const s = this.pinch.v;
        const k = Math.max(0.2, Math.min(4, (s.k * d) / this.pinch.d));
        const wx = (this.pinch.c.x - s.x) / s.k;
        const wy = (this.pinch.c.y - s.y) / s.k;
        this.view = { x: c.x - wx * k, y: c.y - wy * k, k };
        this.userMoved = true;
        this.draw();
        return;
      }

      if (this.drag) {
        const dx = p.x - this.drag.start.x;
        const dy = p.y - this.drag.start.y;
        if (!this.drag.moved && dx * dx + dy * dy > 16) {
          this.drag.moved = true;
          this.alphaTarget = 0.25;
          if (this.alpha < 0.25) this.alpha = 0.25;
          this.drag.node.el.classList.add("grabbing");
        }
        if (this.drag.moved) {
          const w = this._toWorld(p);
          this.drag.node.fx = w.x;
          this.drag.node.fy = w.y;
          this.userMoved = true;
          this.kick();
        }
        return;
      }

      if (this.pan) {
        const dx = p.x - this.pan.start.x;
        const dy = p.y - this.pan.start.y;
        if (!this.pan.moved && dx * dx + dy * dy > 16) this.pan.moved = true;
        if (this.pan.moved) {
          this.view = { x: this.pan.v.x + dx, y: this.pan.v.y + dy, k: this.pan.v.k };
          this.userMoved = true;
          this.draw();
        }
      }
    });

    const end = (e) => {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.delete(e.pointerId);
      try {
        svg.releasePointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
      if (this.pinch) {
        if (this.pointers.size < 2) this.pinch = null;
        return;
      }
      if (this.drag) {
        const { node, moved } = this.drag;
        node.fx = null;
        node.fy = null;
        node.el.classList.remove("grabbing");
        this.drag = null;
        this.alphaTarget = 0;
        if (!moved && e.type === "pointerup") {
          const now = Date.now();
          const last = this.lastTap;
          if (last && last.id === node.id && now - last.time < 450) {
            this.lastTap = null;
            this.activate(node);
            return;
          }
          this.lastTap = { id: node.id, time: now };
          this.select(node.id);
        }
        this.kick();
        return;
      }
      if (this.pan) {
        const moved = this.pan.moved;
        this.pan = null;
        if (!moved && e.type === "pointerup") this.select(null);
      }
    };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);

    svg.addEventListener("pointerover", (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const el = e.target && e.target.closest ? e.target.closest(".g-node") : null;
      const id = el ? el.dataset.id : null;
      if (id !== this.hover) {
        this.hover = id;
        this._applyHighlight();
      }
    });
    svg.addEventListener("pointerleave", () => {
      if (this.hover) {
        this.hover = null;
        this._applyHighlight();
      }
    });

    svg.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const p = this._local(e);
        const f = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018));
        const v = this.view;
        const k = Math.max(0.2, Math.min(4, v.k * f));
        this.view = { x: p.x - ((p.x - v.x) * k) / v.k, y: p.y - ((p.y - v.y) * k) / v.k, k };
        this.target = null;
        this.userMoved = true;
        this.draw();
      },
      { passive: false }
    );

    this.wrap.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.selected) {
        e.stopPropagation();
        this.select(null);
      }
    });
  }

  // Doppelklick: Notiz öffnen bzw. Notizen der Kategorie zeigen
  activate(node) {
    if (node.type === "note") this.card._openNote(node.note.id);
    else this.card._openCategory(node.cat);
  }

  select(id) {
    this.selected = id;
    this._applyHighlight();
    this._renderPreview();
  }

  _applyHighlight() {
    const focus = this.hover || this.selected;
    const node = focus ? this.byId.get(focus) : null;
    this.svg.classList.toggle("focus", !!node);
    const hl = new Set();
    if (node) {
      hl.add(node);
      for (const l of node.links) {
        hl.add(l.s);
        hl.add(l.t);
      }
    }
    for (const n of this.nodes) {
      n.el.classList.toggle("hl", hl.has(n));
      n.el.classList.toggle("selected", n.id === this.selected);
    }
    for (const l of this.links) {
      l.el.classList.toggle("hl", !!node && (l.s === node || l.t === node));
    }
  }

  _renderPreview() {
    const card = this.card;
    const p = this.preview;
    p.replaceChildren();
    const node = this.selected ? this.byId.get(this.selected) : null;
    p.classList.toggle("open", !!node);
    if (!node) return;

    const head = document.createElement("div");
    head.className = "pv-head";
    const body = document.createElement("div");
    body.className = "pv-body";
    const actions = document.createElement("div");
    actions.className = "pv-actions";

    const close = card._btn({ icon: mdiClose, title: card._t("close"), size: "s" });
    close.addEventListener("click", () => this.select(null));

    if (node.type === "note") {
      const note = node.note;
      p.style.setProperty("--c", card._colorValue(note.color));
      const tags = document.createElement("div");
      tags.className = "pv-tags";
      for (const c of note.categories || []) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "cat-chip";
        b.textContent = `# ${c}`;
        b.title = card._t("catShow").replace("{c}", c);
        b.addEventListener("click", () => card._openCategory(c));
        tags.appendChild(b);
      }
      if (note.remind_at && card._remindersOn()) {
        const r = document.createElement("span");
        r.className = "chip show" + (card._isDue(note) ? " overdue" : "");
        r.append(card._icon(mdiBell));
        const s = document.createElement("span");
        s.textContent = card._fmtReminder(note.remind_at);
        r.appendChild(s);
        tags.appendChild(r);
      }
      head.append(tags, close);
      if (note.text.trim()) {
        body.classList.add("md");
        body.appendChild(easyMdRender(note.text));
      } else {
        body.textContent = card._t("emptyNote");
      }
      const open = card._btn({ label: card._t("openNote"), appearance: "filled", variant: "brand", size: "s" });
      open.addEventListener("click", () => card._openNote(note.id));
      actions.appendChild(open);
    } else {
      p.style.setProperty("--c", "var(--primary-color)");
      const h = document.createElement("div");
      h.className = "pv-title";
      h.textContent = node.cat;
      head.append(h, close);
      const list = node.links
        .map((l) => easyFirstLine(l.s.note.text, 40) || card._t("emptyNote"))
        .slice(0, 6);
      body.textContent = `${card._count(node.count, "nNotes")}: ${list.join(", ")}${node.count > 6 ? ", …" : ""}`;
      const show = card._btn({ label: card._t("showNotes"), appearance: "filled", variant: "brand", size: "s" });
      show.addEventListener("click", () => card._openCategory(node.cat));
      actions.appendChild(show);
    }
    p.append(head, body, actions);
  }
}

// ==========================================
// 3. HAUPTKARTE
// ==========================================
class EasyNotesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = { ...EASY_DEFAULTS };
    this._configured = false;
    this._storageKey = EASY_DEFAULTS.storage_key;
    this._notes = [];
    this._query = "";
    this._catFilter = null;
    this._view = "notes";
    this._loaded = false;
    this._loading = false;
    this._dirty = false;
    this._saveTimer = null;
    this._saveChain = Promise.resolve();
    this._noteEls = new Map();
    this._dragging = false;
    this._tickTimer = null;
    this._notifying = new Set();
    this._notifyFailed = new Set();
    this._scheme = null;
    this._graph = null;
    this._msgTimer = null;

    this._onVisibility = () => {
      if (document.visibilityState === "hidden") {
        this._flush();
      } else {
        this._load({ silent: true });
        this._tick();
      }
    };
    this._onPageHide = () => this._flush();
    this._onOutside = (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      if (!path.includes(this._elMenuWrap)) this._toggleMenu(false);
    };

    this._buildSkeleton();

    // Spaltenzahl folgt der Breite der Card
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver(() => {
        if (this._checkWide()) return; // hat neu gezeichnet
        if (this._view === "notes") {
          this._layout();
          this._updateListFade();
        }
      });
    }
  }

  connectedCallback() {
    document.addEventListener("visibilitychange", this._onVisibility);
    window.addEventListener("pagehide", this._onPageHide);
    if (this._ro) {
      this._ro.observe(this._elList);
      this._ro.observe(this);
    }
    clearInterval(this._tickTimer);
    this._tickTimer = setInterval(() => this._tick(), 10000);
    if (this._graph && this._view === "graph") this._graph.kick();
  }

  disconnectedCallback() {
    document.removeEventListener("visibilitychange", this._onVisibility);
    window.removeEventListener("pagehide", this._onPageHide);
    clearInterval(this._tickTimer);
    this._tickTimer = null;
    if (this._ro) this._ro.disconnect();
    this._toggleMenu(false);
    if (this._graph) this._graph.pause();
    this._flush();
  }

  // ---------- HA-Schnittstelle ----------
  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Ungültige Konfiguration");
    }
    if (
      config.storage_key !== undefined &&
      (typeof config.storage_key !== "string" || !config.storage_key.trim())
    ) {
      throw new Error("storage_key muss ein nicht-leerer Text sein");
    }
    if (
      config.max_notes !== undefined &&
      (typeof config.max_notes !== "number" || !Number.isInteger(config.max_notes) || config.max_notes < 0)
    ) {
      throw new Error("max_notes muss eine ganze Zahl >= 0 sein (0 = alle Notizen)");
    }
    if (config.default_view !== undefined && !EASY_VIEWS.includes(config.default_view)) {
      throw new Error(`default_view muss ${EASY_VIEWS.join(" oder ")} sein`);
    }
    if (
      config.note_color !== undefined &&
      config.note_color !== "random" &&
      !EASY_COLOR_KEYS.includes(config.note_color)
    ) {
      throw new Error(`note_color muss random oder eines von ${EASY_COLOR_KEYS.join(", ")} sein`);
    }
    for (const k of ["show_search", "show_categories", "reminders", "sidebar_notification"]) {
      if (config[k] !== undefined && typeof config[k] !== "boolean") {
        throw new Error(`${k} muss true oder false sein`);
      }
    }
    if (
      config.snooze_minutes !== undefined &&
      (typeof config.snooze_minutes !== "number" || config.snooze_minutes < 1)
    ) {
      throw new Error("snooze_minutes muss eine Zahl >= 1 sein");
    }

    const oldKey = this._storageKey;
    const oldDefault = this._config.default_view;
    const first = !this._configured;
    this._config = { ...EASY_DEFAULTS, ...config };
    this._configured = true;
    const newKey = this._config.storage_key.trim();

    // Startansicht kommt immer aus default_view. Der Umschalter in der Card wechselt
    // nur bis zum nächsten Laden; eine Änderung im Editor gilt sofort.
    if (first || newKey !== oldKey || oldDefault !== this._config.default_view) {
      this._view = this._config.default_view;
    }
    if (first || newKey !== oldKey) this._layoutMode = this._readLayout(newKey);

    this._applyConfig();

    if (newKey !== oldKey) {
      const flushing = this._flush(); // speichert noch unter dem alten Schlüssel
      this._storageKey = newKey;
      this._loaded = false;
      this._notes = [];
      this._catFilter = null;
      this._render();
      if (this._hass) flushing.then(() => this._load());
    } else {
      this._render();
    }
  }

  set hass(hass) {
    const first = !this._hass;
    const langChanged = this._hass && this._hass.language !== hass.language;
    this._hass = hass;

    const scheme = hass.themes && hass.themes.darkMode ? "dark" : "light";
    if (scheme !== this._scheme) {
      this._scheme = scheme;
      this.style.colorScheme = scheme; // passt den Datums-Picker an Hell/Dunkel an
    }

    if (first) {
      this._applyConfig();
      this._load();
    } else if (langChanged) {
      this._applyConfig();
      this._render();
    }
  }

  getCardSize() {
    return 6;
  }

  // Höhe "auto": die Card ist so hoch wie ihr Inhalt. Wer im HA-Layout eine
  // feste Höhe einstellt, bekommt eine scrollende Notizliste ohne sichtbaren Balken.
  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: 3 };
  }

  static getConfigElement() {
    return document.createElement("easy-notes-card-editor");
  }

  static getStubConfig() {
    return { ...EASY_DEFAULTS };
  }

  // ---------- Helfer ----------
  _lang() {
    const l = (this._hass && (this._hass.locale?.language || this._hass.language)) || "en";
    return String(l).toLowerCase().startsWith("de") ? "de" : "en";
  }

  _t(key) {
    return EASY_I18N[this._lang()][key];
  }

  _count(n, key) {
    const [one, many] = this._t(key);
    return n === 1 ? one : many.replace("{n}", n);
  }

  _locale() {
    return (this._hass && (this._hass.locale?.language || this._hass.language)) || undefined;
  }

  _remindersOn() {
    return this._config.reminders !== false;
  }

  _isFiltering() {
    return !!this._query.trim() || !!this._catFilter;
  }

  _fmtEdited(note) {
    if (note.updated) {
      try {
        return new Date(note.updated).toLocaleString(this._locale(), {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (_) {
        /* fall through */
      }
    }
    return note.time || "";
  }

  _fmtReminder(iso) {
    const d = new Date(iso);
    const loc = this._locale();
    const time = d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
    const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((startOf(d) - startOf(new Date())) / 86400000);
    if (diff >= -1 && diff <= 1) {
      try {
        const w = new Intl.RelativeTimeFormat(loc, { numeric: "auto" }).format(diff, "day");
        return `${w.charAt(0).toUpperCase()}${w.slice(1)}, ${time}`;
      } catch (_) {
        /* fall through */
      }
    }
    return d.toLocaleString(loc, {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  _colorValue(color) {
    return EASY_PALETTE[color] || color || EASY_PALETTE.blue;
  }

  _isDue(n) {
    return this._remindersOn() && !!n.remind_at && new Date(n.remind_at).getTime() <= Date.now();
  }

  _normalize(n) {
    const out = {
      id: n && n.id !== undefined && n.id !== null && n.id !== "" ? n.id : easyUid(),
      text: String((n && n.text) ?? ""),
      color: (n && n.color) || "blue",
      categories: easyCleanCats(
        n && Array.isArray(n.categories) ? n.categories : n && typeof n.category === "string" ? [n.category] : []
      ),
      updated: n && n.updated ? n.updated : undefined,
      time: n && n.time ? n.time : undefined,
    };
    if (n && n.remind_at && !isNaN(new Date(n.remind_at).getTime())) out.remind_at = n.remind_at;
    if (n && n.notified && out.remind_at) out.notified = true;
    return out;
  }

  // Alle Kategorien mit Anzahl, alphabetisch
  _allCategories() {
    const map = new Map();
    for (const n of this._notes) {
      for (const c of n.categories || []) {
        const k = c.toLowerCase();
        if (!map.has(k)) map.set(k, { name: c, count: 0 });
        map.get(k).count++;
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, this._locale()));
  }

  _matches(n) {
    const q = this._query.trim().toLowerCase();
    if (q && !n.text.toLowerCase().includes(q) && !(n.categories || []).some((c) => c.toLowerCase().includes(q))) {
      return false;
    }
    if (this._catFilter) {
      const f = this._catFilter.toLowerCase();
      if (!(n.categories || []).some((c) => c.toLowerCase() === f)) return false;
    }
    return true;
  }

  _icon(path) {
    const i = document.createElement("ha-svg-icon");
    i.path = path;
    return i;
  }

  // ha-button immer mit explizitem appearance/variant/size (siehe HA-Frontend-Richtlinien)
  _btn({ icon, label, title, appearance = "plain", variant = "neutral", size = "s", cls = "" }) {
    const b = document.createElement("ha-button");
    b.setAttribute("appearance", appearance);
    b.setAttribute("variant", variant);
    b.setAttribute("size", size);
    if (cls) b.className = cls;
    if (title) {
      b.title = title;
      b.setAttribute("aria-label", title);
    }
    if (icon) b.appendChild(this._icon(icon));
    if (label) {
      const s = document.createElement("span");
      s.textContent = label;
      b.appendChild(s);
    }
    return b;
  }

  _autosize(ta) {
    ta.style.height = "auto";
    const h = ta.scrollHeight;
    ta.style.height = h > 0 ? `${Math.min(h + 2, 260)}px` : "";
  }

  // ---------- Aufbau ----------
  _buildSkeleton() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; height: 100%; }
        ha-card {
          height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .content {
          flex: 1 1 auto;
          min-height: 0;
          height: 100%;
          box-sizing: border-box;
          padding: var(--ha-space-4, 16px);
          display: flex;
          flex-direction: column;
          gap: var(--ha-space-3, 12px);
        }
        /* Nur Notizliste und Netz geben bei fester Höhe nach */
        .content > :not(.notes-list):not(.graph-host) { flex-shrink: 0; }
        .header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--ha-space-2, 8px);
        }
        .controls {
          display: flex;
          align-items: center;
          gap: var(--ha-space-2, 8px);
          margin-inline-start: auto;
        }
        .title {
          flex: 1 1 120px;
          min-width: 0;
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--primary-text-color);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .badge {
          display: none;
          align-items: center;
          gap: 4px;
          padding: 4px 9px 4px 7px;
          border: 1px solid var(--warning-color, #ffa600);
          border-radius: 999px;
          background: var(--secondary-background-color);
          background: color-mix(in srgb, var(--warning-color, #ffa600) 22%, var(--card-background-color));
          color: var(--primary-text-color);
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .badge ha-svg-icon { --mdc-icon-size: 16px; }
        #add-btn ha-svg-icon { --mdc-icon-size: 18px; margin-inline-end: 4px; }

        /* Ansicht umschalten */
        .seg {
          display: inline-flex;
          padding: 3px;
          gap: 2px;
          border-radius: 999px;
          background: var(--secondary-background-color);
          flex-shrink: 0;
        }
        .seg-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 30px;
          padding: 0;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: var(--secondary-text-color);
          cursor: pointer;
          transition: background-color 0.15s, color 0.15s;
        }
        .seg-btn ha-svg-icon { --mdc-icon-size: 19px; }
        .seg-btn:hover { color: var(--primary-text-color); }
        .seg-btn[aria-pressed="true"] {
          background: var(--card-background-color);
          color: var(--primary-color);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        }
        .seg-btn:focus-visible, .menu-item:focus-visible, .fchip:focus-visible, .cat-chip:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }

        /* Menü Sichern/Wiederherstellen */
        .menu-wrap { position: relative; flex-shrink: 0; }
        .menu {
          position: absolute;
          top: calc(100% + 6px);
          inset-inline-end: 0;
          z-index: 10;
          display: none;
          flex-direction: column;
          min-width: 240px;
          padding: 6px;
          border-radius: 14px;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          box-shadow: var(--ha-box-shadow-l, 0 12px 28px rgba(0, 0, 0, 0.35));
        }
        .menu.open { display: flex; }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: var(--primary-text-color);
          font: inherit;
          font-size: 14px;
          text-align: start;
          white-space: nowrap;
          cursor: pointer;
        }
        .menu-item:hover { background: var(--secondary-background-color); }
        .menu-item ha-svg-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }

        .search-box { position: relative; }
        .search-icon {
          position: absolute;
          inset-inline-start: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--secondary-text-color);
          pointer-events: none;
          --mdc-icon-size: 20px;
        }
        .search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 9px 12px;
          padding-inline-start: 40px;
          background: var(--secondary-background-color);
          border: 1px solid transparent;
          border-radius: 12px;
          color: var(--primary-text-color);
          font: inherit;
          font-size: 14px;
          outline: none;
        }
        .search-input:focus { border-color: var(--primary-color); }
        ha-alert { display: block; }

        /* Kategorie-Filter */
        .catbar {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          margin: -2px 0;
          padding: 2px 0;
        }
        .catbar::-webkit-scrollbar { display: none; }
        .catbar[hidden] { display: none; }
        .catbar.overflow {
          -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 32px), transparent);
          mask-image: linear-gradient(to right, #000 calc(100% - 32px), transparent);
        }
        .catbar.overflow.end { -webkit-mask-image: none; mask-image: none; }
        .fchip {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid var(--divider-color);
          background: transparent;
          color: var(--primary-text-color);
          font: inherit;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
        }
        .fchip .cnt { color: var(--secondary-text-color); font-size: 12px; }
        .fchip.active {
          border-color: var(--primary-color);
          color: var(--primary-color);
          font-weight: 600;
        }
        .fchip.active .cnt { color: inherit; opacity: 0.75; }

        /* Spalten-Layout: jede Spalte stapelt unabhängig */
        .notes-list {
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          align-items: flex-start;
          gap: var(--ha-space-3, 12px);
          overflow-y: auto;
          padding: 6px;
          margin: -6px;
        }
        /* Kein sichtbarer Scrollbalken in der Card; ein weicher Rand zeigt, dass es weitergeht */
        .notes-list, .note-md, .note-textarea, .pv-body, .md pre, .md .table-wrap {
          scrollbar-width: none;
        }
        .notes-list::-webkit-scrollbar, .note-md::-webkit-scrollbar, .note-textarea::-webkit-scrollbar,
        .pv-body::-webkit-scrollbar, .md pre::-webkit-scrollbar, .md .table-wrap::-webkit-scrollbar {
          display: none;
        }
        .notes-list.fade-bottom {
          -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 32px), transparent);
          mask-image: linear-gradient(to bottom, #000 calc(100% - 32px), transparent);
        }
        .notes-list.fade-top {
          -webkit-mask-image: linear-gradient(to top, #000 calc(100% - 32px), transparent);
          mask-image: linear-gradient(to top, #000 calc(100% - 32px), transparent);
        }
        .notes-list.fade-top.fade-bottom {
          -webkit-mask-image: linear-gradient(to bottom, transparent, #000 32px, #000 calc(100% - 32px), transparent);
          mask-image: linear-gradient(to bottom, transparent, #000 32px, #000 calc(100% - 32px), transparent);
        }
        .col {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--ha-space-3, 12px);
        }

        .note {
          --c: var(--blue-color, #38bdf8);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 8px 10px 10px;
          border-radius: 16px;
          background: var(--secondary-background-color);
          background: color-mix(in srgb, var(--c) 14%, var(--card-background-color));
          border: 1px solid var(--divider-color);
          border: 1px solid color-mix(in srgb, var(--c) 36%, transparent);
        }
        .note::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 4px;
          background: var(--c);
        }
        .note.dragging {
          z-index: 5;
          cursor: grabbing;
          opacity: 0.96;
          box-shadow: var(--ha-box-shadow-l, 0 12px 28px rgba(0, 0, 0, 0.3));
        }
        .note.flash { animation: flash 1.4s ease-out 1; }
        @keyframes flash {
          0% { box-shadow: 0 0 0 0 var(--c); }
          30% { box-shadow: 0 0 0 4px var(--c); }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        .note.due { animation: due-pulse 2.4s ease-in-out infinite; }
        @keyframes due-pulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--warning-color, #ffa600) 55%, transparent); }
          50% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--warning-color, #ffa600) 0%, transparent); }
        }

        .note-top { display: flex; align-items: center; gap: 0; margin-top: 4px; }
        .spacer { flex: 1; }
        .handle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 32px;
          padding: 0;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--secondary-text-color);
          cursor: grab;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
        .handle:hover, .handle:focus-visible { background: rgba(127, 127, 127, 0.18); outline: none; }
        .handle ha-svg-icon { --mdc-icon-size: 20px; }
        .filtering .handle { display: none; }
        .act ha-svg-icon { --mdc-icon-size: 19px; }
        .del-icon {
          color: color-mix(in srgb, var(--error-color, #db4437) 50%, var(--secondary-text-color));
          transition: color 0.15s;
        }
        .del-btn:hover .del-icon, .del-btn:focus-visible .del-icon { color: var(--error-color, #db4437); }

        .due-bar {
          display: none;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          padding: 4px 6px 4px 10px;
          border-radius: 12px;
          background: color-mix(in srgb, var(--warning-color, #ffa600) 24%, transparent);
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .note.due .due-bar { display: flex; }
        .due-bar .grow { flex: 1; min-width: 110px; display: flex; align-items: center; gap: 6px; }
        .due-bar .grow ha-svg-icon { --mdc-icon-size: 18px; }

        .note-textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 52px;
          max-height: 260px;
          padding: 2px 2px;
          background: transparent;
          border: none;
          outline: none;
          color: var(--primary-text-color);
          font: inherit;
          font-size: 15px;
          line-height: 1.45;
          resize: none;
          overflow-y: auto;
        }
        .note-textarea::placeholder { color: var(--secondary-text-color); }
        .note-body { min-height: 44px; }
        .note-md {
          min-height: 40px;
          max-height: 380px;
          overflow-y: auto;
          padding: 2px;
          border-radius: 8px;
          cursor: text;
          outline: none;
        }
        .note-md:focus-visible { box-shadow: 0 0 0 2px var(--primary-color); }
        .md-placeholder { color: var(--secondary-text-color); font-size: 15px; }
        .editor-btn { margin: -6px -6px -6px -2px; }

        /* Markdown */
        .md {
          font-size: 15px;
          line-height: 1.5;
          color: var(--primary-text-color);
          overflow-wrap: anywhere;
        }
        .md > :first-child { margin-top: 0; }
        .md > :last-child { margin-bottom: 0; }
        .md p { margin: 0 0 8px; }
        .md h1, .md h2, .md h3, .md h4, .md h5, .md h6 { margin: 6px 0 6px; line-height: 1.25; }
        .md h1 { font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }
        .md h2 { font-size: 17px; font-weight: 650; }
        .md h3 { font-size: 15.5px; font-weight: 650; }
        .md h4, .md h5, .md h6 { font-size: 14px; font-weight: 650; color: var(--secondary-text-color); }
        .md ul, .md ol { margin: 0 0 8px; padding-inline-start: 22px; }
        .md li { margin: 2px 0; }
        .md li > ul, .md li > ol { margin: 2px 0 0; }
        .md li.task {
          list-style: none;
          margin-inline-start: -22px;
          display: grid;
          grid-template-columns: auto 1fr;
          column-gap: 8px;
          align-items: start;
        }
        .md li.task > ul, .md li.task > ol { grid-column: 2; }
        .md li.task input {
          width: 16px;
          height: 16px;
          margin: 3px 0 0;
          accent-color: var(--c, var(--primary-color));
          cursor: pointer;
        }
        .md li.task.done > span { text-decoration: line-through; color: var(--secondary-text-color); }
        .md code {
          font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
          font-size: 0.87em;
          padding: 1px 5px;
          border-radius: 6px;
          background: color-mix(in srgb, var(--primary-text-color) 11%, transparent);
        }
        .md pre {
          margin: 0 0 8px;
          padding: 10px 12px;
          border-radius: 10px;
          background: color-mix(in srgb, #000 30%, transparent);
          overflow-x: auto;
        }
        .md pre code { padding: 0; background: none; font-size: 13px; line-height: 1.5; white-space: pre; }
        .md blockquote {
          margin: 0 0 8px;
          padding: 2px 0 2px 12px;
          border-inline-start: 3px solid var(--c, var(--primary-color));
          color: var(--secondary-text-color);
        }
        .md hr { border: none; border-top: 1px solid var(--divider-color); margin: 10px 0; }
        .md a { color: var(--primary-color); text-decoration: underline; text-underline-offset: 2px; }
        .md .table-wrap { overflow-x: auto; margin: 0 0 8px; }
        .md table { border-collapse: collapse; font-size: 13px; width: 100%; }
        .md th, .md td { border: 1px solid var(--divider-color); padding: 4px 8px; text-align: start; vertical-align: top; }
        .md th { font-weight: 600; background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); }

        .panel {
          position: relative;
          display: none;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
          padding: 8px;
          border-radius: 12px;
          background: color-mix(in srgb, var(--card-background-color) 65%, transparent);
          border: 1px solid var(--divider-color);
        }
        .panel.open { display: flex; }
        /* Kleiner Pfeil zum gedrückten Button */
        .panel::before {
          content: "";
          position: absolute;
          top: -6px;
          left: calc(var(--arrow-x, 50%) - 5px);
          width: 10px;
          height: 10px;
          background: var(--card-background-color);
          background: color-mix(in srgb, var(--c) 14%, var(--card-background-color));
          border-top: 1px solid var(--divider-color);
          border-left: 1px solid var(--divider-color);
          transform: rotate(45deg);
          clip-path: polygon(0 0, 100% 0, 0 100%);
        }
        .act.on ha-svg-icon, .act.on .del-icon { color: var(--primary-color); }
        .swatches, .chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .swatch {
          width: 28px;
          height: 28px;
          padding: 0;
          border-radius: 50%;
          border: 2px solid transparent;
          box-shadow: inset 0 0 0 2px var(--card-background-color);
          cursor: pointer;
        }
        .swatch.sel { border-color: var(--primary-text-color); }
        .swatch:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
        .dt, .cat-input {
          width: 100%;
          box-sizing: border-box;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid var(--divider-color);
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font: inherit;
          font-size: 14px;
          outline: none;
        }
        .dt:focus, .cat-input:focus { border-color: var(--primary-color); }
        .chips { gap: 6px; }
        .cat-row { display: flex; gap: 6px; align-items: center; }
        .cat-row .cat-input { flex: 1; min-width: 0; }

        .cats { display: flex; flex-wrap: wrap; gap: 6px; }
        .cats:empty { display: none; }
        .cat-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          max-width: 100%;
          padding: 2px 9px;
          border: none;
          border-radius: 999px;
          background: color-mix(in srgb, var(--c, var(--primary-color)) 24%, transparent);
          color: var(--primary-text-color);
          font: inherit;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cat-chip.removable { padding-inline-end: 4px; }
        .cat-chip .x { --mdc-icon-size: 14px; opacity: 0.7; }
        .cat-chip.suggest {
          background: transparent;
          border: 1px dashed var(--divider-color);
          color: var(--secondary-text-color);
        }

        .note-foot {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          min-height: 20px;
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        .foot-spacer { flex: 1; }
        .chip {
          display: none;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--c) 24%, transparent);
          color: var(--primary-text-color);
          font-size: 12px;
          font-weight: 500;
        }
        .chip.show { display: inline-flex; }
        .chip.overdue { background: color-mix(in srgb, var(--warning-color, #ffa600) 38%, transparent); }
        .chip ha-svg-icon { --mdc-icon-size: 14px; }

        .more { display: flex; justify-content: center; margin-top: -4px; }
        .more[hidden] { display: none; }
        .more ha-svg-icon { --mdc-icon-size: 18px; }
        .empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 28px 12px;
          text-align: center;
          color: var(--secondary-text-color);
          font-size: 14px;
        }
        .empty ha-svg-icon { --mdc-icon-size: 40px; opacity: 0.6; }

        /* Listenansicht (nur breite Cards) */
        .seg[hidden] { display: none; }
        .notes-list.list-mode { display: block; }
        .list-mode .handle { display: none; }
        .lv {
          display: grid;
          grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
          gap: 16px;
          align-items: start;
        }
        .lv-rows {
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-height: min(78vh, 960px);
          overflow-y: auto;
          scrollbar-width: none;
          padding: 2px;
        }
        .lv-rows::-webkit-scrollbar { display: none; }
        .lv-row {
          display: grid;
          grid-template-columns: 4px minmax(0, 1fr) auto;
          column-gap: 10px;
          width: 100%;
          padding: 9px 10px 9px 0;
          border: none;
          border-radius: 12px;
          background: transparent;
          color: var(--primary-text-color);
          font: inherit;
          text-align: start;
          cursor: pointer;
        }
        .lv-row:hover { background: var(--secondary-background-color); }
        .lv-row[aria-current="true"] { background: color-mix(in srgb, var(--c) 16%, var(--card-background-color)); }
        .lv-row:focus-visible { outline: 2px solid var(--primary-color); outline-offset: -2px; }
        .lv-bar { grid-row: 1 / span 3; border-radius: 4px; background: var(--c); }
        .lv-title {
          font-size: 14.5px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lv-date {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 12px;
          color: var(--secondary-text-color);
          white-space: nowrap;
        }
        .lv-date ha-svg-icon { --mdc-icon-size: 13px; }
        .lv-row.due .lv-date { color: var(--warning-color, #ffa600); font-weight: 600; }
        .lv-snip, .lv-meta {
          grid-column: 2 / span 2;
          font-size: 13px;
          color: var(--secondary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lv-snip:empty { display: none; }
        .lv-meta { font-size: 12px; margin-top: 2px; }
        .lv-meta:empty { display: none; }
        .lv-detail { min-width: 0; }
        .lv-detail .note-md { max-height: none; }
        .lv-detail .md { font-size: 15.5px; }

        /* Netzansicht */
        .graph-host { display: none; }
        .graph-host.show {
          display: block;
          position: relative;
          flex: 1 1 auto;
          min-height: var(--easy-graph-h, 380px);
        }
        .graph-wrap {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 42%,
              color-mix(in srgb, var(--primary-color) 10%, var(--secondary-background-color)) 0%,
              var(--secondary-background-color) 72%);
          border: 1px solid var(--divider-color);
        }
        .graph-wrap::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(color-mix(in srgb, var(--primary-text-color) 9%, transparent) 1px, transparent 1.2px);
          background-size: 22px 22px;
        }
        .graph-svg {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          cursor: grab;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
        .graph-svg:active { cursor: grabbing; }
        .g-link {
          stroke: var(--secondary-text-color);
          stroke-opacity: 0.3;
          stroke-width: 1.2;
          vector-effect: non-scaling-stroke;
          transition: stroke-opacity 0.15s;
        }
        .g-node { cursor: pointer; transition: opacity 0.15s; }
        .g-node .hit { fill: transparent; }
        .g-node .core { stroke: var(--secondary-background-color); stroke-width: 1.5; }
        .g-cat .core { fill: var(--primary-color); stroke-width: 2.5; }
        .g-cat .halo { fill: var(--primary-color); opacity: 0.16; }
        .g-note .due-ring { fill: none; stroke: transparent; stroke-width: 2; }
        .g-note.due .due-ring { stroke: var(--warning-color, #ffa600); animation: ring 1.8s ease-in-out infinite; }
        @keyframes ring { 0%, 100% { stroke-opacity: 0.95; } 50% { stroke-opacity: 0.2; } }
        .g-label {
          fill: var(--primary-text-color);
          font-size: calc(11px * var(--inv, 1));
          paint-order: stroke;
          stroke: var(--secondary-background-color);
          stroke-width: calc(3px * var(--inv, 1));
          stroke-linejoin: round;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .g-cat .g-label { opacity: 1; font-size: calc(12.5px * var(--inv, 1)); font-weight: 600; }
        .g-count {
          fill: var(--text-primary-color, #fff);
          font-weight: 700;
          pointer-events: none;
        }
        .graph-svg.labels .g-note .g-label { opacity: 0.8; }
        .graph-svg.focus .g-node { opacity: 0.2; }
        .graph-svg.focus .g-link { stroke-opacity: 0.07; }
        .graph-svg.focus .g-node.hl { opacity: 1; }
        .graph-svg.focus .g-node.hl .g-label { opacity: 1; }
        .graph-svg.focus .g-link.hl { stroke: var(--primary-color); stroke-opacity: 0.85; stroke-width: 1.8; }
        .graph-svg.searching .g-node.dim { opacity: 0.14; }
        .g-node.selected .core { stroke: var(--primary-text-color); stroke-width: 2.5; }
        .g-node.grabbing { cursor: grabbing; }

        .graph-stats {
          position: absolute;
          top: 12px;
          inset-inline-start: 14px;
          inset-inline-end: 140px;
          font-size: 12px;
          color: var(--secondary-text-color);
          pointer-events: none;
        }
        .graph-tools {
          position: absolute;
          top: 6px;
          inset-inline-end: 6px;
          display: flex;
          gap: 0;
          border-radius: 999px;
          background: color-mix(in srgb, var(--card-background-color) 80%, transparent);
        }
        .graph-tools ha-svg-icon { --mdc-icon-size: 19px; }
        .graph-empty {
          position: absolute;
          inset: 0;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          color: var(--secondary-text-color);
          font-size: 14px;
          pointer-events: none;
        }
        .graph-preview {
          --c: var(--primary-color);
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 10px;
          max-width: 440px;
          margin-inline: auto;
          display: none;
          flex-direction: column;
          gap: 8px;
          padding: 10px 10px 10px 14px;
          border-radius: 14px;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-top: 4px solid var(--c);
          box-shadow: var(--ha-box-shadow-l, 0 12px 28px rgba(0, 0, 0, 0.35));
        }
        .graph-preview.open { display: flex; }
        .pv-head { display: flex; align-items: center; gap: 8px; }
        .pv-head > :first-child { flex: 1; min-width: 0; }
        .pv-tags { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .pv-title { font-size: 16px; font-weight: 600; color: var(--primary-text-color); }
        .pv-body {
          font-size: 14px;
          line-height: 1.45;
          color: var(--primary-text-color);
          overflow-wrap: anywhere;
          max-height: 9.5em;
          overflow-y: auto;
        }
        .pv-body.md { font-size: 14px; }
        .pv-actions { display: flex; justify-content: flex-end; }

        /* Editor */
        dialog.editor {
          --c: var(--primary-color);
          box-sizing: border-box;
          width: min(940px, calc(100vw - 24px));
          max-width: none;
          max-height: calc(100vh - 32px);
          max-height: calc(100dvh - 32px);
          padding: 0;
          border: none;
          border-radius: 20px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
          overflow: hidden;
        }
        dialog.editor:not([open]) { display: none; }
        dialog.editor::backdrop { background: rgba(0, 0, 0, 0.55); }
        .ed {
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 32px);
          max-height: calc(100dvh - 32px);
          border-top: 5px solid var(--c);
        }
        .ed-head { display: flex; align-items: center; gap: 10px; padding: 12px 10px 4px 20px; }
        .ed-title { flex: 1; min-width: 0; margin: 0; font-size: 18px; font-weight: 600; }
        .ed-tabs {
          display: inline-flex;
          padding: 3px;
          gap: 2px;
          border-radius: 999px;
          background: var(--secondary-background-color);
        }
        .ed-tab {
          padding: 5px 12px;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: var(--secondary-text-color);
          font: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
        .ed-tab[aria-selected="true"] {
          background: var(--card-background-color);
          color: var(--primary-text-color);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        }
        .ed-tab:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
        .ed-tools {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          padding: 2px 12px 8px;
          border-bottom: 1px solid var(--divider-color);
        }
        .ed-tools ha-svg-icon { --mdc-icon-size: 20px; }
        .ed-sep { width: 1px; height: 20px; margin: 0 6px; background: var(--divider-color); }
        .ed-panes { display: grid; grid-template-columns: 1fr; min-height: 0; flex: 1; }
        .ed-ta, .ed-preview {
          box-sizing: border-box;
          width: 100%;
          height: min(54vh, 500px);
          min-height: 200px;
          padding: 16px 20px;
        }
        .ed-ta {
          border: none;
          outline: none;
          resize: none;
          background: transparent;
          color: var(--primary-text-color);
          font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
          font-size: 14px;
          line-height: 1.6;
          tab-size: 2;
        }
        .ed-preview { overflow-y: auto; }
        .ed-preview.md-placeholder { font-size: 14px; }
        .ed[data-mode="write"] .ed-preview { display: none; }
        .ed[data-mode="preview"] .ed-ta, .ed[data-mode="preview"] .ed-tools { display: none; }
        @media (min-width: 900px) {
          /* Am PC: großes Popup, Text und Vorschau füllen die Höhe */
          dialog.editor {
            width: min(1480px, calc(100vw - 48px));
            height: min(1040px, calc(100vh - 48px));
            height: min(1040px, calc(100dvh - 48px));
          }
          .ed { height: 100%; max-height: none; }
          .ed-panes { flex: 1 1 auto; min-height: 0; }
          .ed-ta, .ed-preview { height: 100%; min-height: 0; }
          .ed-ta { font-size: 14.5px; }
          .ed-tabs { display: none; }
          .ed-panes { grid-template-columns: 1fr 1fr; }
          .ed[data-mode] .ed-ta, .ed[data-mode] .ed-preview { display: block; }
          .ed[data-mode] .ed-tools { display: flex; }
          .ed-preview {
            border-inline-start: 1px solid var(--divider-color);
            background: color-mix(in srgb, var(--secondary-background-color) 45%, transparent);
          }
        }
        @media (max-width: 600px) {
          dialog.editor {
            width: 100vw;
            margin: auto 0 0;
            border-radius: 18px 18px 0 0;
          }
          .ed-head { padding-inline-start: 16px; gap: 6px; }
          .ed-title { font-size: 16px; }
          .ed-tab { padding: 5px 10px; }
        }
        .ed-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ed-confirm {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 10px 16px 10px 20px;
          background: color-mix(in srgb, var(--warning-color, #ffa600) 18%, transparent);
          font-size: 14px;
          font-weight: 500;
        }
        .ed-confirm[hidden] { display: none; }
        .ed-confirm-text { flex: 1; min-width: 160px; }
        .ed-foot {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px 12px 20px;
          border-top: 1px solid var(--divider-color);
        }
        .ed-hint { flex: 1; font-size: 12px; color: var(--secondary-text-color); }

        @media (prefers-reduced-motion: reduce) {
          .note.due, .note.flash, .g-note.due .due-ring { animation: none; }
        }
      </style>
      <ha-card>
        <div class="content">
          <div class="header">
            <h2 class="title" id="title"></h2>
            <div class="controls">
            <div class="seg" id="seg-layout" role="group" hidden>
              <button type="button" class="seg-btn" data-layout="tiles"><ha-svg-icon id="seg-tiles"></ha-svg-icon></button>
              <button type="button" class="seg-btn" data-layout="list"><ha-svg-icon id="seg-list"></ha-svg-icon></button>
            </div>
            <button class="badge" id="badge" type="button"><ha-svg-icon id="badge-icon"></ha-svg-icon><span id="badge-text"></span></button>
            <div class="seg" id="seg" role="group">
              <button type="button" class="seg-btn" data-view="notes"><ha-svg-icon id="seg-notes"></ha-svg-icon></button>
              <button type="button" class="seg-btn" data-view="graph"><ha-svg-icon id="seg-graph"></ha-svg-icon></button>
            </div>
            <div class="menu-wrap" id="menu-wrap">
              <ha-button appearance="plain" variant="neutral" size="m" id="backup-btn" aria-haspopup="menu">
                <ha-svg-icon id="backup-icon"></ha-svg-icon>
              </ha-button>
              <div class="menu" id="menu" role="menu">
                <button type="button" class="menu-item" role="menuitem" data-act="export"><ha-svg-icon id="mi-export"></ha-svg-icon><span id="ml-export"></span></button>
                <button type="button" class="menu-item" role="menuitem" data-act="export-zip"><ha-svg-icon id="mi-export-zip"></ha-svg-icon><span id="ml-export-zip"></span></button>
                <button type="button" class="menu-item" role="menuitem" data-act="copy"><ha-svg-icon id="mi-copy"></ha-svg-icon><span id="ml-copy"></span></button>
                <button type="button" class="menu-item" role="menuitem" data-act="import"><ha-svg-icon id="mi-import"></ha-svg-icon><span id="ml-import"></span></button>
                <button type="button" class="menu-item" role="menuitem" data-act="import-dir"><ha-svg-icon id="mi-import-dir"></ha-svg-icon><span id="ml-import-dir"></span></button>
              </div>
              <input type="file" id="file" accept=".md,.markdown,.txt,.zip,text/markdown,text/plain,application/zip" multiple hidden />
              <input type="file" id="dir" webkitdirectory directory multiple hidden />
            </div>
            <ha-button appearance="filled" variant="brand" size="m" id="add-btn">
              <ha-svg-icon id="add-icon"></ha-svg-icon><span id="add-label"></span>
            </ha-button>
            </div>
          </div>
          <ha-alert alert-type="error" id="alert" style="display:none"></ha-alert>
          <ha-alert alert-type="success" id="msg" style="display:none"></ha-alert>
          <div class="search-box" id="search-box">
            <ha-svg-icon class="search-icon" id="search-icon"></ha-svg-icon>
            <input type="search" class="search-input" id="search" />
          </div>
          <div class="catbar" id="catbar" role="group"></div>
          <div class="notes-list" id="list"></div>
          <div class="more" id="more" hidden></div>
          <div class="graph-host" id="graph-host"></div>
        </div>
      </ha-card>
    `;
    const $ = (id) => this.shadowRoot.getElementById(id);
    this._elTitle = $("title");
    this._elAddLabel = $("add-label");
    this._elAlert = $("alert");
    this._elMsg = $("msg");
    this._elSearchBox = $("search-box");
    this._elSearch = $("search");
    this._elList = $("list");
    this._elCatbar = $("catbar");
    this._elMore = $("more");
    this._elGraphHost = $("graph-host");
    this._elBadge = $("badge");
    this._elBadgeText = $("badge-text");
    this._elSeg = $("seg");
    this._elSegLayout = $("seg-layout");
    this._elMenuWrap = $("menu-wrap");
    this._elMenu = $("menu");
    this._elBackup = $("backup-btn");
    this._elFile = $("file");
    this._elDir = $("dir");

    // Icon-Pfade als Property setzen (innerHTML kann keine Property-Bindings)
    $("add-icon").path = mdiPlus;
    $("search-icon").path = mdiMagnify;
    $("badge-icon").path = mdiBellRing;
    $("seg-notes").path = mdiNoteMultipleOutline;
    $("seg-graph").path = mdiGraphOutline;
    $("seg-tiles").path = mdiViewGridOutline;
    $("seg-list").path = mdiViewSplitVertical;
    $("backup-icon").path = mdiBackupRestore;
    $("mi-export").path = mdiFileExportOutline;
    $("mi-export-zip").path = mdiFolderZipOutline;
    $("mi-copy").path = mdiContentCopy;
    $("mi-import").path = mdiFileImportOutline;
    $("mi-import-dir").path = mdiFolderUploadOutline;

    $("add-btn").addEventListener("click", () => this._addNote());
    this._elList.addEventListener("scroll", () => this._updateListFade(), { passive: true });
    this._elSearch.addEventListener("input", () => {
      this._query = this._elSearch.value;
      if (this._view === "graph" && this._graph) this._graph.applyQuery(this._query);
      else this._render();
    });
    // Verhindert, dass HA-Shortcuts beim Tippen im Shadow DOM auslösen
    this._elSearch.addEventListener("keydown", (e) => e.stopPropagation());

    this._elBadge.addEventListener("click", () => {
      this._query = "";
      this._elSearch.value = "";
      this._catFilter = null;
      this._revealIndex(this._notes.findIndex((n) => this._isDue(n)));
      const dueNote = this._notes.find((n) => this._isDue(n));
      if (dueNote) this._listSel = String(dueNote.id);
      this._setView("notes");
      const first = this._elList.querySelector(".note.due");
      if (first && first.scrollIntoView) first.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    for (const b of this._elSeg.querySelectorAll(".seg-btn")) {
      b.addEventListener("click", () => this._setView(b.dataset.view));
    }
    for (const b of this._elSegLayout.querySelectorAll(".seg-btn")) {
      b.addEventListener("click", () => this._setLayout(b.dataset.layout));
    }

    // Fokus nur bei Tastatur ins Menü setzen (Klick per Tastatur hat detail 0)
    this._elBackup.addEventListener("click", (e) => this._toggleMenu(undefined, e.detail === 0));
    this._elMenu.addEventListener("click", (e) => {
      const item = e.target && e.target.closest ? e.target.closest(".menu-item") : null;
      if (!item) return;
      this._toggleMenu(false);
      const act = item.dataset.act;
      if (act === "export") this._exportFile();
      else if (act === "export-zip") this._exportZip();
      else if (act === "copy") this._exportClipboard();
      else if (act === "import") this._elFile.click();
      else if (act === "import-dir") this._elDir.click();
    });
    this._elMenuWrap.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this._elMenu.classList.contains("open")) {
        e.stopPropagation();
        this._toggleMenu(false);
        this._elBackup.focus();
      }
    });
    for (const input of [this._elFile, this._elDir]) {
      input.addEventListener("change", () => {
        const files = [...(input.files || [])];
        input.value = "";
        if (files.length) this._importFiles(files);
      });
    }
  }

  _applyConfig() {
    const c = this._config;
    this._elTitle.textContent = c.title !== undefined ? c.title : this._t("title");
    this._elTitle.style.display = this._elTitle.textContent ? "" : "none";
    this._elAddLabel.textContent = this._t("add");
    this._elSearch.placeholder = this._t("search");
    this._elSearch.setAttribute("aria-label", this._t("search"));
    this._elSearchBox.style.display = c.show_search === false ? "none" : "";
    this._elSeg.setAttribute("aria-label", this._t("viewGroup"));
    this._elCatbar.setAttribute("aria-label", this._t("catFilter"));
    for (const b of this._elSeg.querySelectorAll(".seg-btn")) {
      const label = this._t(b.dataset.view === "graph" ? "viewGraph" : "viewNotes");
      b.title = label;
      b.setAttribute("aria-label", label);
    }
    this._elSegLayout.setAttribute("aria-label", this._t("layoutGroup"));
    for (const b of this._elSegLayout.querySelectorAll(".seg-btn")) {
      const label = this._t(b.dataset.layout === "list" ? "layoutList" : "layoutTiles");
      b.title = label;
      b.setAttribute("aria-label", label);
    }
    this._elBackup.title = this._t("backup");
    this._elBackup.setAttribute("aria-label", this._t("backup"));
    this.shadowRoot.getElementById("ml-export").textContent = this._t("exportFile");
    this.shadowRoot.getElementById("ml-export-zip").textContent = this._t("exportZip");
    this.shadowRoot.getElementById("ml-copy").textContent = this._t("exportCopy");
    this.shadowRoot.getElementById("ml-import").textContent = this._t("importFile");
    this.shadowRoot.getElementById("ml-import-dir").textContent = this._t("importDir");
    if (c.show_search === false && this._query) {
      this._query = "";
      this._elSearch.value = "";
    }
  }

  _setError(msg) {
    if (msg) {
      this._elAlert.textContent = msg;
      this._elAlert.style.display = "block";
    } else {
      this._elAlert.style.display = "none";
    }
  }

  _setMessage(msg) {
    clearTimeout(this._msgTimer);
    if (!msg) {
      this._elMsg.style.display = "none";
      return;
    }
    this._elMsg.textContent = msg;
    this._elMsg.style.display = "block";
    this._msgTimer = setTimeout(() => (this._elMsg.style.display = "none"), 6000);
  }

  _toggleMenu(force, focusFirst = false) {
    const open = force !== undefined ? force : !this._elMenu.classList.contains("open");
    this._elMenu.classList.toggle("open", open);
    this._elBackup.setAttribute("aria-expanded", String(open));
    window.removeEventListener("pointerdown", this._onOutside, true);
    if (open) {
      window.addEventListener("pointerdown", this._onOutside, true);
      const first = this._elMenu.querySelector(".menu-item");
      if (first && focusFirst) first.focus();
    }
  }

  _updateBadge() {
    const n = this._remindersOn() ? this._notes.filter((x) => this._isDue(x)).length : 0;
    if (n > 0) {
      const label = this._t("dueBadge").replace("{n}", n);
      this._elBadgeText.textContent = n;
      this._elBadge.title = label;
      this._elBadge.setAttribute("aria-label", label);
      this._elBadge.style.display = "inline-flex";
    } else {
      this._elBadge.style.display = "none";
    }
  }

  // ---------- Ansichten ----------
  _setView(view) {
    if (!EASY_VIEWS.includes(view)) return;
    if (view === "graph" && this._view === "notes") {
      const h = this._elList.getBoundingClientRect().height;
      if (h > 0) this.style.setProperty("--easy-graph-h", `${Math.round(Math.min(700, Math.max(280, h)))}px`);
    }
    this._view = view;
    this._render();
  }

  // Kacheln oder Liste (Liste nur bei breiter Card). Die Wahl merkt sich jeder Browser.
  _layoutKey(key = this._storageKey) {
    return `easy-notes:layout:${key}`;
  }

  _readLayout(key) {
    try {
      return window.localStorage.getItem(this._layoutKey(key)) === "list" ? "list" : "tiles";
    } catch (_) {
      return "tiles";
    }
  }

  _setLayout(mode) {
    this._layoutMode = mode === "list" ? "list" : "tiles";
    try {
      window.localStorage.setItem(this._layoutKey(), this._layoutMode);
    } catch (_) {
      /* Speicher nicht verfügbar: gilt bis zum Neuladen */
    }
    this._render();
  }

  // true, wenn sich "breit" geändert und neu gezeichnet wurde
  _checkWide() {
    const w = this.clientWidth || (this.getBoundingClientRect ? this.getBoundingClientRect().width : 0);
    if (!w) return false;
    const wide = w >= EASY_WIDE_MIN;
    if (wide === !!this._wide) return false;
    this._wide = wide;
    this._render();
    return true;
  }

  _isListMode() {
    return this._view === "notes" && !!this._wide && this._layoutMode === "list";
  }

  _render() {
    const graph = this._view === "graph";
    for (const b of this._elSeg.querySelectorAll(".seg-btn")) {
      b.setAttribute("aria-pressed", String(b.dataset.view === this._view));
    }
    this._elSegLayout.hidden = graph || !this._wide;
    for (const b of this._elSegLayout.querySelectorAll(".seg-btn")) {
      b.setAttribute("aria-pressed", String(b.dataset.layout === this._layoutMode));
    }
    this._elList.style.display = graph ? "none" : "";
    this._elCatbar.style.display = graph ? "none" : "";
    if (graph) this._elMore.hidden = true;
    this._elGraphHost.classList.toggle("show", graph);
    if (graph) {
      this._noteEls.clear();
      this._elList.replaceChildren();
      if (!this._graph) this._graph = new EasyNotesGraph(this, this._elGraphHost);
      if (this._loaded) this._graph.setData(this._notes);
      this._graph.applyQuery(this._query);
      this._updateBadge();
    } else {
      if (this._graph) this._graph.pause();
      this._renderNotes();
    }
  }

  _renderCatbar() {
    const bar = this._elCatbar;
    bar.replaceChildren();
    const cats = this._allCategories();
    if (this._catFilter && !cats.some((c) => c.name.toLowerCase() === this._catFilter.toLowerCase())) {
      this._catFilter = null;
    }
    // Ausgeblendet: nur sichtbar, solange ein Filter aktiv ist (zum Zurücksetzen über "Alle")
    const show = this._config.show_categories !== false || !!this._catFilter;
    bar.hidden = !show;
    if (!this._loaded || !cats.length || !show) return;
    const mk = (label, count, value) => {
      const b = document.createElement("button");
      b.type = "button";
      const active = value === null ? !this._catFilter : this._catFilter && this._catFilter.toLowerCase() === value.toLowerCase();
      b.className = "fchip" + (active ? " active" : "");
      b.setAttribute("aria-pressed", String(!!active));
      const l = document.createElement("span");
      l.textContent = label;
      const c = document.createElement("span");
      c.className = "cnt";
      c.textContent = count;
      b.append(l, c);
      b.addEventListener("click", () => {
        this._catFilter = value;
        this._render();
      });
      bar.appendChild(b);
    };
    mk(this._t("catAll"), this._notes.length, null);
    for (const c of cats) mk(c.name, c.count, c.name);
    const fade = () => {
      bar.classList.toggle("overflow", bar.scrollWidth > bar.clientWidth + 1);
      bar.classList.toggle("end", bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 2);
    };
    if (!bar._fadeBound) {
      bar.addEventListener("scroll", fade, { passive: true });
      bar._fadeBound = true;
    }
    requestAnimationFrame(fade);
  }

  _renderNotes() {
    const list = this._elList;
    list.replaceChildren();
    this._noteEls.clear();
    this._visibleEls = [];
    this._cols = 0;
    this._rowEls = null;
    this._renderCatbar();
    list.classList.toggle("filtering", this._isFiltering());
    list.classList.toggle("list-mode", this._isListMode());
    this._updateMore(0);
    if (!this._loaded) {
      this._updateBadge();
      return;
    }

    let items = this._notes.filter((n) => this._matches(n));
    // Begrenzung gilt für die normale Ansicht. Suche und Kategorie-Filter zeigen alle Treffer.
    const max = this._config.max_notes;
    if (max > 0 && !this._isFiltering() && !this._expanded && items.length > max) {
      const hidden = items.length - max;
      items = items.slice(0, max);
      this._updateMore(hidden);
    } else if (max > 0 && !this._isFiltering() && this._expanded && items.length > max) {
      this._updateMore(-1);
    }
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.appendChild(this._icon(mdiNoteTextOutline));
      const msg = document.createElement("span");
      if (!this._notes.length) msg.textContent = this._t("empty");
      else if (this._query.trim()) msg.textContent = this._t("noResults").replace("{q}", this._query.trim());
      else msg.textContent = this._t("noInCat").replace("{c}", this._catFilter);
      empty.appendChild(msg);
      list.appendChild(empty);
      this._updateBadge();
      return;
    }
    if (this._isListMode()) {
      this._renderListMode(items);
      this._tick();
      this._updateListFade();
      return;
    }
    this._visibleEls = items.map((note) => this._noteEl(note));
    this._layout(true);
    this._tick();
    this._updateListFade();
  }

  // Listenansicht: links kompakte Zeilen, rechts die ausgewählte Notiz mit allen Funktionen
  _renderListMode(items) {
    const list = this._elList;
    if (!items.some((n) => String(n.id) === this._listSel)) this._listSel = String(items[0].id);
    const wrap = document.createElement("div");
    wrap.className = "lv";
    const rows = document.createElement("div");
    rows.className = "lv-rows";
    rows.setAttribute("role", "list");
    rows.setAttribute("aria-label", this._t("listLabel"));
    const detail = document.createElement("div");
    detail.className = "lv-detail";
    this._rowEls = new Map();

    const showDetail = () => {
      this._noteEls.clear();
      const note = this._notes.find((n) => String(n.id) === this._listSel);
      detail.replaceChildren(note ? this._noteEl(note) : "");
      for (const [id, row] of this._rowEls) row.setAttribute("aria-current", String(id === this._listSel));
    };
    const select = (id, focus = false) => {
      if (id === this._listSel && detail.firstChild) return;
      this._flush();
      this._listSel = id;
      showDetail();
      const row = this._rowEls.get(id);
      if (row) {
        if (focus) row.focus();
        if (row.scrollIntoView) row.scrollIntoView({ block: "nearest" });
      }
    };

    for (const note of items) {
      const id = String(note.id);
      const row = document.createElement("button");
      row.type = "button";
      row.className = "lv-row";
      row.setAttribute("role", "listitem");
      row.dataset.id = id;
      this._fillRow(row, note);
      row.addEventListener("click", () => select(id));
      row.addEventListener("keydown", (e) => {
        e.stopPropagation();
        const ids = [...this._rowEls.keys()];
        const i = ids.indexOf(id);
        let next = null;
        if (e.key === "ArrowDown") next = ids[i + 1];
        else if (e.key === "ArrowUp") next = ids[i - 1];
        else if (e.key === "Home") next = ids[0];
        else if (e.key === "End") next = ids[ids.length - 1];
        else if (e.key === "Enter" || e.key === "F2") {
          e.preventDefault();
          const rec = this._noteEls.get(id);
          if (rec && rec.edit) rec.edit();
          return;
        }
        if (next !== null && next !== undefined) {
          e.preventDefault();
          select(next, true);
        }
      });
      this._rowEls.set(id, row);
      rows.appendChild(row);
    }
    wrap.append(rows, detail);
    list.appendChild(wrap);
    showDetail();
  }

  _fillRow(row, note) {
    const lines = easyPlainLines(note.text);
    row.style.setProperty("--c", this._colorValue(note.color));
    row.classList.toggle("due", this._isDue(note));
    const bar = document.createElement("span");
    bar.className = "lv-bar";
    const title = document.createElement("span");
    title.className = "lv-title";
    title.textContent = lines[0] || this._t("emptyNote");
    const date = document.createElement("span");
    date.className = "lv-date";
    if (note.remind_at && this._remindersOn()) date.appendChild(this._icon(mdiBell));
    date.appendChild(document.createTextNode(this._fmtEdited(note)));
    const snip = document.createElement("span");
    snip.className = "lv-snip";
    snip.textContent = lines.slice(1, 3).join(" ").slice(0, 160);
    const meta = document.createElement("span");
    meta.className = "lv-meta";
    meta.textContent = (note.categories || []).map((c) => `# ${c}`).join("  ");
    row.replaceChildren(bar, title, date, snip, meta);
  }

  // Zeile in der Listenansicht aktualisieren, wenn sich die Notiz ändert
  _syncRow(note) {
    if (!this._rowEls) return;
    const row = this._rowEls.get(String(note.id));
    if (row) this._fillRow(row, note);
  }

  _updateListFade() {
    const l = this._elList;
    const can = l.scrollHeight > l.clientHeight + 1;
    l.classList.toggle("fade-top", can && l.scrollTop > 2);
    l.classList.toggle("fade-bottom", can && l.scrollTop + l.clientHeight < l.scrollHeight - 2);
  }

  // Notiz i landet in Spalte (i % Spaltenzahl). So bleibt jede Notiz in ihrer Spalte,
  // auch wenn eine Nachbarnotiz höher wird (Erinnerung, längerer Text).
  _layout(force = false) {
    const list = this._elList;
    const els = this._visibleEls || [];
    if (!els.length) return;
    const w = list.clientWidth;
    let cols = this._cols || 1;
    if (w > 0) {
      const cs = getComputedStyle(list);
      const gap = parseFloat(cs.columnGap) || 12;
      const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const minW = parseFloat(getComputedStyle(this).getPropertyValue("--easy-notes-min-width")) || 220;
      cols = Math.max(1, Math.floor((w - pad + gap) / (minW + gap)));
    }
    if (!force && cols === this._cols) return;
    this._cols = cols;

    for (const c of [...list.children]) if (!c.classList.contains("col")) c.remove();
    const colEls = [...list.children];
    while (colEls.length < cols) {
      const c = document.createElement("div");
      c.className = "col";
      list.appendChild(c);
      colEls.push(c);
    }
    while (colEls.length > cols) colEls.pop().remove();

    colEls.forEach((col, j) => {
      const want = els.filter((_, i) => i % cols === j);
      const have = [...col.children];
      if (want.length === have.length && want.every((e, k) => e === have[k])) return;
      col.replaceChildren(...want);
    });
  }

  _moveNote(note, to) {
    const from = this._notes.indexOf(note);
    if (from < 0 || to < 0 || to >= this._notes.length || from === to) return false;
    // Nicht in den versteckten Bereich schieben
    if (this._visibleEls && to >= this._visibleEls.length) return false;
    this._notes.splice(from, 1);
    this._notes.splice(to, 0, note);
    this._visibleEls = this._notes.map((n) => this._noteEls.get(String(n.id))).filter(Boolean).map((r) => r.el);
    this._layout(true);
    this._scheduleSave();
    return true;
  }

  // Knopf unter der Liste: n > 0 = so viele versteckt, -1 = aufgeklappt, 0 = ausblenden
  _updateMore(n) {
    const more = this._elMore;
    if (!n) {
      more.hidden = true;
      more.replaceChildren();
      return;
    }
    const expanded = n < 0;
    const btn = this._btn({
      icon: expanded ? mdiChevronUp : mdiChevronDown,
      label: expanded ? this._t("showLess") : this._t("showMore").replace("{n}", n),
      size: "s",
    });
    btn.setAttribute("aria-expanded", String(expanded));
    btn.addEventListener("click", () => {
      this._expanded = !expanded;
      this._render();
    });
    more.replaceChildren(btn);
    more.hidden = false;
  }

  // Versteckte Notiz sichtbar machen (Erinnerung, Öffnen aus dem Netz)
  _revealIndex(i) {
    const max = this._config.max_notes;
    if (max > 0 && i >= max) this._expanded = true;
  }

  _openNote(id) {
    this._query = "";
    this._elSearch.value = "";
    this._catFilter = null;
    this._revealIndex(this._notes.findIndex((n) => String(n.id) === String(id)));
    this._listSel = String(id);
    this._setView("notes");
    const rec = this._noteEls.get(String(id));
    if (!rec) return;
    if (rec.el.scrollIntoView) rec.el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    rec.el.classList.remove("flash");
    void rec.el.offsetWidth;
    rec.el.classList.add("flash");
    const view = rec.el.querySelector(".note-md");
    if (view) view.focus({ preventScroll: true });
  }

  _openCategory(name) {
    this._query = "";
    this._elSearch.value = "";
    this._catFilter = name;
    this._setView("notes");
  }

  _noteEl(note) {
    const id = String(note.id);
    const el = document.createElement("div");
    el.className = "note";
    el.dataset.id = id;
    let panelType = null;
    const remindOn = this._remindersOn();

    // --- Kopfzeile ---
    const top = document.createElement("div");
    top.className = "note-top";

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "handle";
    handle.title = this._t("drag");
    handle.setAttribute("aria-label", this._t("drag"));
    handle.appendChild(this._icon(mdiDragVertical));

    const spacer = document.createElement("span");
    spacer.className = "spacer";

    const tagBtn = this._btn({ icon: mdiTagOutline, title: this._t("cats"), cls: "act" });
    const bellBtn = remindOn ? this._btn({ icon: mdiBellOutline, title: this._t("remind"), cls: "act" }) : null;
    const palBtn = this._btn({ icon: mdiPalette, title: this._t("color"), cls: "act" });
    const delBtn = this._btn({ icon: mdiDelete, title: this._t("del"), cls: "act del-btn" });
    delBtn.querySelector("ha-svg-icon").classList.add("del-icon");
    top.append(handle, spacer, tagBtn);
    if (bellBtn) top.append(bellBtn);
    top.append(palBtn, delBtn);

    // --- Fälligkeits-Hinweis ---
    const dueBar = document.createElement("div");
    dueBar.className = "due-bar";
    const dueText = document.createElement("span");
    dueText.className = "grow";
    const dueLabel = document.createElement("span");
    dueText.append(this._icon(mdiBellRing), dueLabel);
    const snoozeMin = this._config.snooze_minutes;
    const snoozeBtn = this._btn({
      icon: mdiBellSleep,
      label: this._t("snooze").replace("{n}", snoozeMin),
    });
    const doneBtn = this._btn({ icon: mdiCheck, label: this._t("done"), variant: "success" });
    dueBar.append(dueText, snoozeBtn, doneBtn);

    // --- Text: Markdown-Ansicht, Tippen schaltet in die Bearbeitung ---
    const body = document.createElement("div");
    body.className = "note-body";
    const view = document.createElement("div");
    view.className = "md note-md";
    view.tabIndex = 0;
    view.title = this._t("editInline");
    let ta = null;

    // --- Panel (Farbe / Erinnerung / Kategorien) ---
    const panel = document.createElement("div");
    panel.className = "panel";

    // --- Kategorien ---
    const cats = document.createElement("div");
    cats.className = "cats";

    // --- Fußzeile ---
    const foot = document.createElement("div");
    foot.className = "note-foot";
    const edited = document.createElement("span");
    const footSpacer = document.createElement("span");
    footSpacer.className = "foot-spacer";
    const chip = document.createElement("span");
    chip.className = "chip";
    const chipText = document.createElement("span");
    chip.append(this._icon(mdiBell), chipText);
    const editorBtn = this._btn({ icon: mdiTextBoxEditOutline, title: this._t("openEditor"), cls: "act editor-btn" });
    foot.append(edited, footSpacer, chip, editorBtn);

    el.append(top, panel, dueBar, body, cats, foot);

    const rec = { el, due: false, refresh: null, edit: null, renderView: null };
    this._noteEls.set(id, rec);

    const renderView = () => {
      view.replaceChildren();
      if (note.text.trim()) {
        view.classList.remove("md-placeholder");
        view.appendChild(easyMdRender(note.text, { onToggle: (line) => toggleTask(line) }));
      } else {
        view.classList.add("md-placeholder");
        view.textContent = this._t("placeholder");
      }
      if (body.firstChild !== view) body.replaceChildren(view);
      this._syncRow(note);
    };

    // Checklisten-Kästchen in der Ansicht abhaken
    const toggleTask = (line) => {
      const lines = note.text.split("\n");
      if (line < 0 || line >= lines.length) return;
      const next = lines[line].replace(
        /^((?:\s*>\s?)*\s*(?:[-*+]|\d+[.)])\s+)\[( |x|X)\]/,
        (m, p, c) => `${p}[${c === " " ? "x" : " "}]`
      );
      if (next === lines[line]) return;
      lines[line] = next;
      note.text = lines.join("\n");
      note.updated = new Date().toISOString();
      edited.textContent = `${this._t("edited")} ${this._fmtEdited(note)}`;
      renderView();
      this._scheduleSave();
    };

    const exitEdit = () => {
      if (!ta) return;
      ta = null;
      renderView();
      this._flush();
    };

    const enterEdit = () => {
      if (ta) {
        ta.focus();
        return;
      }
      ta = document.createElement("textarea");
      ta.className = "note-textarea";
      ta.rows = 2;
      ta.placeholder = this._t("placeholder");
      ta.setAttribute("aria-label", this._t("placeholder"));
      ta.value = note.text; // .value statt innerHTML: kein Escaping-Problem
      ta.addEventListener("input", () => {
        note.text = ta.value;
        note.updated = new Date().toISOString();
        edited.textContent = `${this._t("edited")} ${this._fmtEdited(note)}`;
        this._autosize(ta);
        this._scheduleSave();
        this._syncRow(note);
      });
      ta.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          e.preventDefault();
          ta.blur();
        }
      });
      ta.addEventListener("blur", exitEdit);
      body.replaceChildren(ta);
      this._autosize(ta);
      ta.focus();
      try {
        ta.setSelectionRange(ta.value.length, ta.value.length);
      } catch (_) {
        /* ignore */
      }
    };
    rec.edit = enterEdit;
    rec.renderView = renderView;

    view.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.closest && t.closest("a, input")) return; // Links und Kästchen bedienen, nicht bearbeiten
      const sel = window.getSelection ? window.getSelection() : null;
      if (sel && !sel.isCollapsed && String(sel).trim()) return; // Text markieren ist kein Bearbeiten
      enterEdit();
    });
    view.addEventListener("keydown", (e) => {
      if (e.target !== view) return;
      if (e.key === "Enter" || e.key === "F2") {
        e.preventDefault();
        e.stopPropagation();
        enterEdit();
      }
    });
    renderView();

    const renderCats = () => {
      cats.replaceChildren();
      for (const c of note.categories || []) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "cat-chip";
        b.textContent = `# ${c}`;
        b.title = this._t("catShow").replace("{c}", c);
        b.addEventListener("click", () => this._openCategory(c));
        cats.appendChild(b);
      }
    };

    // --- Zustand zeichnen ---
    const refresh = () => {
      el.style.setProperty("--c", this._colorValue(note.color));
      const has = remindOn && !!note.remind_at;
      const due = this._isDue(note);
      rec.due = due;
      el.classList.toggle("due", due);
      if (bellBtn) {
        const ic = bellBtn.querySelector("ha-svg-icon");
        if (ic) ic.path = has ? mdiBell : mdiBellOutline;
      }
      chip.classList.toggle("show", has);
      chip.classList.toggle("overdue", due);
      chipText.textContent = has ? this._fmtReminder(note.remind_at) : "";
      dueLabel.textContent = this._t("due");
      const e = this._fmtEdited(note);
      edited.textContent = e ? `${this._t("edited")} ${e}` : "";
      renderCats();
      this._updateBadge();
      this._syncRow(note);
    };
    rec.refresh = refresh;

    const addCats = (raw) => {
      const parts = String(raw || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!parts.length) return false;
      const next = easyCleanCats([...(note.categories || []), ...parts]);
      if (next.length === (note.categories || []).length) return false;
      note.categories = next;
      this._scheduleSave();
      refresh();
      this._renderCatbar();
      return true;
    };

    // --- Panel zeichnen ---
    const panelBtns = { cats: tagBtn, color: palBtn, reminder: bellBtn };
    const renderPanel = () => {
      panel.replaceChildren();
      panel.classList.toggle("open", !!panelType);
      cats.style.display = panelType === "cats" ? "none" : "";
      for (const [type, b] of Object.entries(panelBtns)) {
        if (!b) continue;
        b.classList.toggle("on", panelType === type);
        b.setAttribute("aria-expanded", String(panelType === type));
      }
      if (panelType === "color") {
        const wrap = document.createElement("div");
        wrap.className = "swatches";
        const names = this._t("colors");
        for (const key of EASY_COLOR_KEYS) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "swatch" + (note.color === key ? " sel" : "");
          b.style.background = this._colorValue(key);
          b.title = names[key];
          b.setAttribute("aria-label", names[key]);
          b.addEventListener("click", () => {
            note.color = key;
            refresh();
            renderPanel();
            this._scheduleSave();
          });
          wrap.appendChild(b);
        }
        panel.appendChild(wrap);
      } else if (panelType === "reminder") {
        const input = document.createElement("input");
        input.type = "datetime-local";
        input.className = "dt";
        input.min = easyToLocalInput(new Date());
        input.setAttribute("aria-label", this._t("remind"));
        if (note.remind_at) input.value = easyToLocalInput(new Date(note.remind_at));
        input.addEventListener("change", () => {
          const d = new Date(input.value);
          if (input.value && !isNaN(d.getTime())) {
            panelType = null;
            renderPanel();
            setReminder(d);
          }
        });
        input.addEventListener("keydown", (e) => e.stopPropagation());
        panel.appendChild(input);

        const chips = document.createElement("div");
        chips.className = "chips";
        const presets = [
          ["in15", () => new Date(Date.now() + 15 * 60000)],
          ["in1h", () => new Date(Date.now() + 60 * 60000)],
          [
            "tomorrow",
            () => {
              const d = new Date();
              d.setDate(d.getDate() + 1);
              d.setHours(9, 0, 0, 0);
              return d;
            },
          ],
        ];
        for (const [key, make] of presets) {
          const b = this._btn({ label: this._t(key), appearance: "outlined", size: "xs" });
          b.addEventListener("click", () => {
            panelType = null;
            renderPanel();
            setReminder(make());
          });
          chips.appendChild(b);
        }
        if (note.remind_at) {
          const rm = this._btn({ label: this._t("remindRemove"), variant: "danger", size: "xs" });
          rm.addEventListener("click", () => {
            panelType = null;
            renderPanel();
            clearReminder();
          });
          chips.appendChild(rm);
        }
        panel.appendChild(chips);
      } else if (panelType === "cats") {
        // Zugewiesene Kategorien (entfernbar)
        if ((note.categories || []).length) {
          const current = document.createElement("div");
          current.className = "chips";
          for (const c of note.categories) {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "cat-chip removable";
            const label = this._t("catRemove").replace("{c}", c);
            b.title = label;
            b.setAttribute("aria-label", label);
            const s = document.createElement("span");
            s.textContent = `# ${c}`;
            const x = this._icon(mdiClose);
            x.classList.add("x");
            b.append(s, x);
            b.addEventListener("click", () => {
              note.categories = note.categories.filter((v) => v !== c);
              this._scheduleSave();
              refresh();
              this._renderCatbar();
              renderPanel();
              const inp = panel.querySelector(".cat-input");
              if (inp) inp.focus();
            });
            current.appendChild(b);
          }
          panel.appendChild(current);
        }

        // Eingabe
        const row = document.createElement("div");
        row.className = "cat-row";
        const input = document.createElement("input");
        input.type = "text";
        input.className = "cat-input";
        input.placeholder = this._t("catAdd");
        input.setAttribute("aria-label", this._t("catAdd"));
        input.maxLength = 120;
        const addBtn = this._btn({ label: this._t("catAddBtn"), appearance: "outlined", size: "s" });
        const commit = () => {
          if (addCats(input.value)) {
            renderPanel();
            const inp = panel.querySelector(".cat-input");
            if (inp) inp.focus();
          } else {
            input.value = "";
          }
        };
        input.addEventListener("keydown", (e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        });
        addBtn.addEventListener("click", commit);
        row.append(input, addBtn);
        panel.appendChild(row);

        // Vorschläge aus vorhandenen Kategorien
        const have = new Set((note.categories || []).map((c) => c.toLowerCase()));
        const sugg = this._allCategories()
          .filter((c) => !have.has(c.name.toLowerCase()))
          .slice(0, 10);
        if (sugg.length) {
          const wrap = document.createElement("div");
          wrap.className = "chips";
          for (const c of sugg) {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "cat-chip suggest";
            b.textContent = `+ ${c.name}`;
            b.addEventListener("click", () => {
              addCats(c.name);
              renderPanel();
            });
            wrap.appendChild(b);
          }
          panel.appendChild(wrap);
        }
      }
    };

    const togglePanel = (type) => {
      panelType = panelType === type ? null : type;
      renderPanel();
      const btn = panelBtns[type];
      if (panelType && btn) {
        const x = btn.offsetLeft + btn.offsetWidth / 2 - panel.offsetLeft;
        if (x > 0) panel.style.setProperty("--arrow-x", `${Math.round(x)}px`);
      }
      if (panelType === "cats") {
        const inp = panel.querySelector(".cat-input");
        if (inp) inp.focus();
      }
    };

    const setReminder = (d) => {
      this._dismissSidebar(note);
      note.remind_at = d.toISOString();
      delete note.notified;
      this._notifyFailed.delete(id);
      this._scheduleSave();
      refresh();
      this._tick();
    };
    const clearReminder = () => {
      this._dismissSidebar(note);
      delete note.remind_at;
      delete note.notified;
      this._notifyFailed.delete(id);
      this._scheduleSave();
      refresh();
    };

    // --- Ereignisse ---
    editorBtn.addEventListener("click", () => this._openEditor(note));

    tagBtn.addEventListener("click", () => togglePanel("cats"));
    palBtn.addEventListener("click", () => togglePanel("color"));
    if (bellBtn) bellBtn.addEventListener("click", () => togglePanel("reminder"));
    snoozeBtn.addEventListener("click", () => setReminder(new Date(Date.now() + snoozeMin * 60000)));
    doneBtn.addEventListener("click", () => clearReminder());

    delBtn.addEventListener("click", () => {
      this._dismissSidebar(note);
      this._notes = this._notes.filter((n) => n !== note);
      this._render();
      this._scheduleSave();
    });

    handle.addEventListener("pointerdown", (e) => this._startDrag(e, el, note));
    handle.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (this._isFiltering()) return;
      const back = e.key === "ArrowUp" || e.key === "ArrowLeft";
      const fwd = e.key === "ArrowDown" || e.key === "ArrowRight";
      if (!back && !fwd) return;
      e.preventDefault();
      const idx = this._notes.indexOf(note);
      if (!this._moveNote(note, back ? idx - 1 : idx + 1)) return;
      handle.focus();
      if (el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    });

    refresh();
    return el;
  }

  // ---------- Verschieben (Maus und Touch) ----------
  _startDrag(e, el, note) {
    if (this._isFiltering()) return;
    if (e.button !== undefined && e.button > 0) return;
    e.preventDefault();
    const list = this._elList;
    const handle = e.currentTarget;
    this._dragging = true;
    try {
      handle.setPointerCapture(e.pointerId);
    } catch (_) {
      /* nicht überall verfügbar */
    }
    const r0 = el.getBoundingClientRect();
    const grab = { x: e.clientX - r0.left, y: e.clientY - r0.top };
    el.classList.add("dragging");

    // Setzt die Karte unter den Zeiger und liefert ihren Platz im Layout
    const place = (ev) => {
      el.style.transform = "none";
      const base = el.getBoundingClientRect();
      const dx = ev.clientX - grab.x - base.left;
      const dy = ev.clientY - grab.y - base.top;
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
      return base;
    };

    const onMove = (ev) => {
      const base = place(ev);
      const px = ev.clientX;
      const py = ev.clientY;
      const inside = (r) => px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
      if (!inside(base)) {
        const target = (this._visibleEls || []).find((c) => c !== el && inside(c.getBoundingClientRect()));
        const tNote = target && this._notes.find((n) => String(n.id) === target.dataset.id);
        if (tNote && this._moveNote(note, this._notes.indexOf(tNote))) place(ev);
      }
      if (list.scrollHeight > list.clientHeight) {
        const lr = list.getBoundingClientRect();
        if (py < lr.top + 40) list.scrollTop -= 12;
        else if (py > lr.bottom - 40) list.scrollTop += 12;
      }
    };

    const end = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      try {
        handle.releasePointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
      el.classList.remove("dragging");
      el.style.transform = "";
      this._dragging = false;
      this._tick();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  // ---------- Aktionen ----------
  _addNote() {
    if (!this._loaded) return; // nicht über ungeladene Daten schreiben
    const key =
      this._config.note_color === "random"
        ? EASY_COLOR_KEYS[Math.floor(Math.random() * EASY_COLOR_KEYS.length)]
        : this._config.note_color;
    // Bei aktivem Kategorie-Filter landet die neue Notiz direkt in dieser Kategorie
    const categories = this._catFilter ? easyCleanCats([this._catFilter]) : [];
    const newId = easyUid();
    this._listSel = String(newId);
    this._notes.unshift({
      id: newId,
      text: "",
      color: key,
      categories,
      updated: new Date().toISOString(),
    });
    this._query = "";
    this._elSearch.value = "";
    if (this._view !== "notes") this._setView("notes");
    else this._render();
    this._scheduleSave();
    const rec = this._noteEls.get(String(this._notes[0].id));
    if (rec && rec.edit) rec.edit();
  }

  // ---------- Editor-Popup ----------
  _ensureEditor() {
    if (this._ed) return this._ed;
    const t = (k) => this._t(k);
    const fmt = this._t("fmt");
    const dlg = document.createElement("dialog");
    dlg.className = "editor";
    dlg.setAttribute("aria-labelledby", "ed-title");
    // Nur feste Struktur, Texte kommen per textContent dazu
    dlg.innerHTML = `
      <div class="ed" data-mode="write">
        <div class="ed-head">
          <h3 class="ed-title" id="ed-title"></h3>
          <div class="ed-tabs" role="tablist">
            <button type="button" class="ed-tab" role="tab" data-mode="write"></button>
            <button type="button" class="ed-tab" role="tab" data-mode="preview"></button>
          </div>
          <span class="ed-close-slot"></span>
        </div>
        <div class="ed-tools" role="toolbar"></div>
        <div class="ed-panes">
          <textarea class="ed-ta" spellcheck="true"></textarea>
          <div class="ed-preview md"></div>
        </div>
        <div class="ed-confirm" hidden><span class="ed-confirm-text"></span></div>
        <div class="ed-foot"><span class="ed-hint"></span></div>
      </div>`;
    const $ = (sel) => dlg.querySelector(sel);
    const ed = {
      dlg,
      root: $(".ed"),
      ta: $(".ed-ta"),
      preview: $(".ed-preview"),
      confirm: $(".ed-confirm"),
      note: null,
      orig: "",
      raf: null,
    };
    this._ed = ed;

    $(".ed-title").textContent = t("editorTitle");
    $(".ed-hint").textContent = t("saveHint");
    ed.ta.setAttribute("aria-label", t("editorTitle"));
    ed.ta.placeholder = t("placeholder");
    $(".ed-tools").setAttribute("aria-label", t("toolbar"));

    const close = this._btn({ icon: mdiClose, title: t("close"), size: "m" });
    close.addEventListener("click", () => this._requestCloseEditor());
    $(".ed-close-slot").replaceWith(close);

    for (const tab of dlg.querySelectorAll(".ed-tab")) {
      tab.textContent = t(tab.dataset.mode === "write" ? "write" : "preview");
      tab.addEventListener("click", () => this._edMode(tab.dataset.mode));
    }

    // Formatierungsleiste
    const icons = {
      h1: mdiFormatHeader1,
      h2: mdiFormatHeader2,
      h3: mdiFormatHeader3,
      text: mdiFormatText,
      bold: mdiFormatBold,
      italic: mdiFormatItalic,
      strike: mdiFormatStrikethroughVariant,
      code: mdiCodeTags,
      ul: mdiFormatListBulleted,
      ol: mdiFormatListNumbered,
      task: mdiFormatListChecks,
      quote: mdiFormatQuoteClose,
      codeblock: mdiCodeBraces,
      link: mdiLinkVariant,
      hr: mdiMinus,
    };
    const groups = [
      ["h1", "h2", "h3", "text"],
      ["bold", "italic", "strike", "code"],
      ["ul", "ol", "task", "quote"],
      ["codeblock", "link", "hr"],
    ];
    const tools = $(".ed-tools");
    groups.forEach((g, gi) => {
      if (gi) {
        const sep = document.createElement("span");
        sep.className = "ed-sep";
        tools.appendChild(sep);
      }
      for (const k of g) {
        const b = this._btn({ icon: icons[k], title: fmt[k], size: "s" });
        b.dataset.fmt = k;
        // Auswahl im Textfeld behalten
        b.addEventListener("mousedown", (e) => e.preventDefault());
        b.addEventListener("click", () => this._edFormat(k));
        tools.appendChild(b);
      }
    });

    // Fußzeile
    const foot = $(".ed-foot");
    const cancel = this._btn({ label: t("cancel"), size: "m" });
    cancel.addEventListener("click", () => this._requestCloseEditor());
    const save = this._btn({ label: t("save"), appearance: "filled", variant: "brand", size: "m" });
    save.classList.add("ed-save");
    save.addEventListener("click", () => this._saveEditor());
    foot.append(cancel, save);

    // Rückfrage bei ungespeicherten Änderungen
    $(".ed-confirm-text").textContent = t("discardQ");
    const keep = this._btn({ label: t("keepEditing"), size: "s" });
    keep.addEventListener("click", () => {
      ed.confirm.hidden = true;
      ed.ta.focus();
    });
    const discard = this._btn({ label: t("discard"), appearance: "filled", variant: "danger", size: "s" });
    discard.addEventListener("click", () => this._closeEditor());
    ed.confirm.append(keep, discard);

    ed.ta.addEventListener("input", () => this._edPreviewSoon());
    dlg.addEventListener("keydown", (e) => {
      e.stopPropagation(); // keine HA-Tastenkürzel auslösen
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (e.key === "Escape") {
        e.preventDefault();
        this._requestCloseEditor();
      } else if (mod && (k === "s" || e.key === "Enter")) {
        e.preventDefault();
        this._saveEditor();
      } else if (mod && k === "b" && e.target === ed.ta) {
        e.preventDefault();
        this._edFormat("bold");
      } else if (mod && k === "i" && e.target === ed.ta) {
        e.preventDefault();
        this._edFormat("italic");
      } else if (mod && k === "k" && e.target === ed.ta) {
        e.preventDefault();
        this._edFormat("link");
      } else if (e.key === "Enter" && !mod && !e.shiftKey && !e.altKey && e.target === ed.ta) {
        this._edEnter(e);
      }
    });
    dlg.addEventListener("cancel", (e) => {
      e.preventDefault();
      this._requestCloseEditor();
    });
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) this._requestCloseEditor(); // Klick auf den Hintergrund
    });

    this.shadowRoot.appendChild(dlg);
    return ed;
  }

  _openEditor(note) {
    const ed = this._ensureEditor();
    ed.note = note;
    ed.orig = note.text;
    ed.ta.value = note.text;
    ed.confirm.hidden = true;
    ed.dlg.style.setProperty("--c", this._colorValue(note.color));
    this._edMode("write");
    this._edRenderPreview();
    if (typeof ed.dlg.showModal === "function") {
      if (!ed.dlg.open) ed.dlg.showModal();
    } else {
      ed.dlg.setAttribute("open", "");
    }
    ed.ta.scrollTop = 0;
    ed.ta.focus();
    try {
      ed.ta.setSelectionRange(ed.ta.value.length, ed.ta.value.length);
    } catch (_) {
      /* ignore */
    }
  }

  _edMode(mode) {
    const ed = this._ed;
    ed.root.dataset.mode = mode;
    for (const tab of ed.dlg.querySelectorAll(".ed-tab")) {
      tab.setAttribute("aria-selected", String(tab.dataset.mode === mode));
    }
    if (mode === "preview") this._edRenderPreview();
    else ed.ta.focus();
  }

  _edPreviewSoon() {
    const ed = this._ed;
    if (ed.raf) return;
    const run = () => {
      ed.raf = null;
      this._edRenderPreview();
    };
    ed.raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame(run) : setTimeout(run, 16);
  }

  _edRenderPreview() {
    const ed = this._ed;
    ed.preview.replaceChildren();
    if (ed.ta.value.trim()) {
      ed.preview.classList.remove("md-placeholder");
      ed.preview.appendChild(easyMdRender(ed.ta.value));
    } else {
      ed.preview.classList.add("md-placeholder");
      ed.preview.textContent = this._t("previewEmpty");
    }
  }

  _requestCloseEditor() {
    const ed = this._ed;
    if (!ed || !ed.note) return;
    if (ed.ta.value !== ed.orig) {
      ed.confirm.hidden = false;
      const keep = ed.confirm.querySelector("ha-button");
      if (keep && keep.focus) keep.focus();
      return;
    }
    this._closeEditor();
  }

  _closeEditor() {
    const ed = this._ed;
    if (!ed) return;
    const note = ed.note;
    ed.note = null;
    ed.confirm.hidden = true;
    if (typeof ed.dlg.close === "function" && ed.dlg.open) ed.dlg.close();
    else ed.dlg.removeAttribute("open");
    // Fokus zurück zum Editor-Button der Notiz
    const rec = note && this._noteEls.get(String(note.id));
    const btn = rec && rec.el.querySelector(".editor-btn");
    if (btn && btn.focus) btn.focus();
  }

  _saveEditor() {
    const ed = this._ed;
    if (!ed || !ed.note) return;
    const text = ed.ta.value;
    let note = this._notes.find((n) => String(n.id) === String(ed.note.id));
    if (!note) {
      // Notiz wurde inzwischen gelöscht: Inhalt nicht verlieren
      note = ed.note;
      this._notes.unshift(note);
    }
    if (note.text !== text) {
      note.text = text;
      note.updated = new Date().toISOString();
    }
    this._closeEditor();
    const rec = this._view === "notes" && this._noteEls.get(String(note.id));
    if (rec) {
      rec.renderView();
      rec.refresh();
    } else {
      this._render();
    }
    this._scheduleSave();
    this._flush();
  }

  // Ersetzt einen Bereich so, dass Strg+Z im Browser funktioniert (mit Rückfall)
  _edReplace(start, end, text, selStart, selEnd) {
    const ta = this._ed.ta;
    const expected = ta.value.slice(0, start) + text + ta.value.slice(end);
    ta.focus();
    ta.setSelectionRange(start, end);
    let ok = false;
    try {
      ok = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
    } catch (_) {
      ok = false;
    }
    if (!ok || ta.value !== expected) ta.value = expected;
    ta.setSelectionRange(selStart, selEnd);
    this._edPreviewSoon();
  }

  _edFormat(kind) {
    const ta = this._ed.ta;
    const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
    switch (kind) {
      case "bold":
        return this._edWrap("**", "**", this._t("textPh"));
      case "italic":
        return this._edWrap("*", "*", this._t("textPh"));
      case "strike":
        return this._edWrap("~~", "~~", this._t("textPh"));
      case "code":
        return sel.includes("\n") ? this._edCodeBlock() : this._edWrap("`", "`", this._t("codePh"));
      case "codeblock":
        return this._edCodeBlock();
      case "link":
        return this._edLink();
      case "hr":
        return this._edHr();
      default:
        return this._edLines(kind);
    }
  }

  _edWrap(before, after, ph) {
    const ta = this._ed.ta;
    const v = ta.value;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = v.slice(s, e);
    // Bereits formatiert? Dann Formatierung entfernen
    if (sel.length >= before.length + after.length && sel.startsWith(before) && sel.endsWith(after)) {
      const inner = sel.slice(before.length, sel.length - after.length);
      return this._edReplace(s, e, inner, s, s + inner.length);
    }
    if (v.slice(s - before.length, s) === before && v.slice(e, e + after.length) === after) {
      return this._edReplace(s - before.length, e + after.length, sel, s - before.length, e - before.length);
    }
    const inner = sel || ph;
    this._edReplace(s, e, before + inner + after, s + before.length, s + before.length + inner.length);
  }

  _edLines(kind) {
    const ta = this._ed.ta;
    const v = ta.value;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const ls = v.lastIndexOf("\n", s - 1) + 1;
    let le = v.indexOf("\n", e > s && v[e - 1] === "\n" ? e - 1 : e);
    if (le < 0) le = v.length;
    const lines = v.slice(ls, le).split("\n");
    const PREFIX = /^(\s*)(#{1,6}\s+|>\s?|(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?)/;
    const checks = {
      h1: /^\s*#\s+/,
      h2: /^\s*##\s+/,
      h3: /^\s*###\s+/,
      ul: /^\s*[-*+]\s+(?!\[[ xX]\])/,
      ol: /^\s*\d+[.)]\s+/,
      task: /^\s*[-*+]\s+\[[ xX]\]\s+/,
      quote: /^\s*>\s?/,
    };
    const prefixes = { h1: "# ", h2: "## ", h3: "### ", ul: "- ", task: "- [ ] ", quote: "> " };
    const filled = lines.filter((l) => l.trim());
    // Haben schon alle Zeilen dieses Format? Dann wieder entfernen (Umschalter)
    const all = kind !== "text" && filled.length > 0 && filled.every((l) => checks[kind].test(l));
    let num = 0;
    const out = lines.map((l) => {
      if (!l.trim() && lines.length > 1) return l;
      const base = l.replace(PREFIX, "$1");
      if (kind === "text" || all) return base;
      const indent = /^h\d$/.test(kind) ? "" : base.match(/^\s*/)[0];
      const content = base.slice(base.match(/^\s*/)[0].length);
      const prefix = kind === "ol" ? `${++num}. ` : prefixes[kind];
      return indent + prefix + content;
    });
    const text = out.join("\n");
    if (lines.length === 1) {
      const pos = ls + text.length;
      this._edReplace(ls, le, text, pos, pos);
    } else {
      this._edReplace(ls, le, text, ls, ls + text.length);
    }
  }

  _edCodeBlock() {
    const ta = this._ed.ta;
    const v = ta.value;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = v.slice(s, e);
    const before = s > 0 && v[s - 1] !== "\n" ? "\n" : "";
    const after = e < v.length && v[e] !== "\n" ? "\n" : "";
    const inner = sel || this._t("codePh");
    const fence = "```";
    const text = `${before}${fence}\n${inner}\n${fence}${after}`;
    const innerStart = s + before.length + fence.length + 1;
    this._edReplace(s, e, text, innerStart, innerStart + inner.length);
  }

  _edLink() {
    const ta = this._ed.ta;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = ta.value.slice(s, e);
    if (/^(https?:\/\/|\/)\S*$/.test(sel)) {
      const label = this._t("linkText");
      return this._edReplace(s, e, `[${label}](${sel})`, s + 1, s + 1 + label.length);
    }
    const label = sel || this._t("linkText");
    const url = "https://";
    const text = `[${label}](${url})`;
    if (sel) {
      const us = s + label.length + 3;
      this._edReplace(s, e, text, us, us + url.length);
    } else {
      this._edReplace(s, e, text, s + 1, s + 1 + label.length);
    }
  }

  _edHr() {
    const ta = this._ed.ta;
    const v = ta.value;
    const s = ta.selectionEnd;
    let pre = "";
    if (s > 0 && v[s - 1] !== "\n") pre = "\n\n";
    else if (s > 1 && v[s - 2] !== "\n") pre = "\n";
    const text = `${pre}---\n`;
    this._edReplace(s, s, text, s + text.length, s + text.length);
  }

  // Enter in einer Liste setzt die Liste fort, Enter in einem leeren Punkt beendet sie
  _edEnter(e) {
    const ta = this._ed.ta;
    if (ta.selectionStart !== ta.selectionEnd) return;
    const v = ta.value;
    const pos = ta.selectionStart;
    const ls = v.lastIndexOf("\n", pos - 1) + 1;
    const line = v.slice(ls, pos);
    const m = /^(\s*)(>\s?)?(?:([-*+])|(\d+)([.)]))\s+(\[[ xX]\]\s+)?(.*)$/.exec(line);
    if (!m) return;
    e.preventDefault();
    const [, ind, q = "", bullet, num, delim, task, rest] = m;
    if (!rest.trim()) {
      this._edReplace(ls, pos, "", ls, ls);
      return;
    }
    const marker = bullet ? `${bullet} ` : `${Number(num) + 1}${delim} `;
    const ins = `\n${ind}${q}${marker}${task ? "[ ] " : ""}`;
    this._edReplace(pos, pos, ins, pos + ins.length, pos + ins.length);
  }

  // ---------- Markdown-Export / -Import ----------
  _toMarkdown() {
    const t = (k) => this._t(k);
    const loc = this._locale();
    const colors = this._t("colors");
    const out = [];
    out.push(`# ${this._elTitle.textContent || t("title")}`, "");
    const stamp = new Date().toLocaleString(loc, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    out.push(`> ${t("mdExportedAt")} ${stamp} (${this._count(this._notes.length, "nNotes")}).`);
    out.push(`> ${t("mdHint")}`, "");
    for (const n of this._notes) {
      out.push("---", "");
      const meta = [];
      if ((n.categories || []).length) meta.push(`${t("mdCategories")}: ${n.categories.join(", ")}`);
      meta.push(`${t("mdColor")}: ${colors[n.color] || n.color}`);
      if (n.remind_at) {
        meta.push(
          `${t("mdReminder")}: ${new Date(n.remind_at).toLocaleString(loc, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`
        );
      }
      out.push(`*${meta.join(" | ")}*`, "");
      const lines = n.text.replace(/\r\n?/g, "\n").split("\n");
      const data = { id: n.id, color: n.color, categories: n.categories || [], lines: lines.length };
      if (n.remind_at) data.remind_at = n.remind_at;
      if (n.updated) data.updated = n.updated;
      if (n.time) data.time = n.time;
      // "--" ist in HTML-Kommentaren nicht erlaubt, daher maskieren
      const json = JSON.stringify(data).replace(/--/g, "-\\u002d");
      out.push(`<!-- easy-note:start ${json} -->`, ...lines, "<!-- easy-note:end -->", "");
    }
    return out.join("\n");
  }

  _parseMarkdown(text, path = "") {
    const src = String(text || "").replace(/^﻿/, "").replace(/\r\n?/g, "\n");
    const lines = src.split("\n");
    const START = /^<!-- easy-note:start (\{.*\}) -->\s*$/;
    const END = /^<!-- easy-note:end -->\s*$/;
    const notes = [];
    let structured = false;
    for (let i = 0; i < lines.length; i++) {
      const m = START.exec(lines[i]);
      if (!m) continue;
      structured = true;
      let meta;
      try {
        meta = JSON.parse(m[1]);
      } catch (_) {
        continue;
      }
      let endIdx = -1;
      const count = Number(meta.lines);
      if (Number.isInteger(count) && count >= 0 && END.test(lines[i + 1 + count] || "")) {
        endIdx = i + 1 + count;
      } else {
        // Datei wurde von Hand bearbeitet: nächstes Ende-Zeichen suchen
        for (let j = i + 1; j < lines.length; j++) {
          if (START.test(lines[j])) break;
          if (END.test(lines[j])) {
            endIdx = j;
            break;
          }
        }
      }
      if (endIdx < 0) continue;
      const { lines: _l, ...rest } = meta;
      notes.push({ ...rest, text: lines.slice(i + 1, endIdx).join("\n") });
      i = endIdx;
    }
    if (structured) return { notes, structured };

    // Normale Markdown-Datei (z. B. Wiki-Seite): die ganze Datei wird eine Notiz
    const note = easyNoteFromFile(src, path);
    if (note && note._exact) {
      delete note._exact;
      return { notes: [note], structured: true };
    }
    return { notes: note ? [note] : [], structured: false };
  }

  _importParsed(parsed) {
    let added = 0;
    let updated = 0;
    let skipped = 0;
    const byId = new Map(this._notes.map((n) => [String(n.id), n]));
    const texts = new Set(this._notes.map((n) => n.text.trim()));
    for (const raw of parsed.notes) {
      const src = parsed.structured ? raw : { text: raw.text, categories: raw.categories, updated: raw.updated };
      const n = this._normalize(src);
      if (!EASY_COLOR_KEYS.includes(n.color) && !String(n.color).startsWith("var(")) n.color = "blue";
      const existing = parsed.structured ? byId.get(String(n.id)) : null;
      if (existing) {
        this._notes[this._notes.indexOf(existing)] = n;
        byId.set(String(n.id), n);
        updated++;
      } else if (!parsed.structured && texts.has(n.text.trim())) {
        skipped++;
      } else {
        if (!parsed.structured) {
          n.color =
            this._config.note_color === "random"
              ? EASY_COLOR_KEYS[this._notes.length % EASY_COLOR_KEYS.length]
              : this._config.note_color;
          if (!n.updated) n.updated = new Date().toISOString();
        }
        this._notes.push(n);
        byId.set(String(n.id), n);
        texts.add(n.text.trim());
        added++;
      }
    }
    return { added, updated, skipped };
  }

  async _importFile(file) {
    return this._importFiles([file]);
  }

  // Liest eine oder mehrere Dateien (auch aus einem Ordner) und importiert sie in einem Rutsch
  async _importFiles(list) {
    if (!this._loaded) {
      this._setError(this._t("loadError"));
      return null;
    }
    const pathOf = (f) => f.webkitRelativePath || f.name || "";
    // ZIP-Dateien direkt auspacken
    const expanded = [];
    let zipCount = 0;
    let zipFailed = 0;
    for (const f of [...(list || [])]) {
      if (/\.zip$/i.test(f.name || "") || /zip/.test(f.type || "")) {
        zipCount++;
        try {
          expanded.push(...(await this._zipEntries(f)));
        } catch (e) {
          console.warn("Easy Notes: ZIP konnte nicht gelesen werden", f.name, e);
          zipFailed++;
        }
      } else {
        expanded.push(f);
      }
    }
    const files = expanded
      .filter((f) => !f.name || /\.(md|markdown|txt)$/i.test(f.name) || /^text\//.test(f.type || ""))
      .sort((a, b) => pathOf(a).localeCompare(pathOf(b), undefined, { numeric: true }));
    if (!files.length) {
      this._setError(this._t(zipFailed ? "importError" : "importEmpty"));
      return null;
    }
    const single = files.length === 1 && !zipCount;
    const total = { added: 0, updated: 0, skipped: 0 };
    let read = 0;
    let found = 0;
    let tooBig = 0;
    let failed = zipFailed;
    const batches = [];
    for (const f of files) {
      if (f.size > EASY_MAX_IMPORT_BYTES) {
        tooBig++;
        continue;
      }
      let text;
      try {
        text = typeof f.text === "function" ? await f.text() : await new Response(f).text();
      } catch (e) {
        console.warn("Easy Notes: Import fehlgeschlagen", pathOf(f), e);
        failed++;
        continue;
      }
      read++;
      const parsed = this._parseMarkdown(text, pathOf(f));
      if (!parsed.notes.length) continue;
      found += parsed.notes.length;
      batches.push({ parsed, pos: parsed.notes[0]._pos });
    }
    // Reihenfolge aus dem ZIP-Export (position) wiederherstellen, sonst nach Dateipfad
    batches.sort((a, b) => (a.pos ?? Infinity) - (b.pos ?? Infinity));
    for (const { parsed } of batches) {
      const r = this._importParsed(parsed);
      total.added += r.added;
      total.updated += r.updated;
      total.skipped += r.skipped;
    }

    // Eine einzelne Datei: klare Einzelmeldung wie bisher
    if (single && tooBig) {
      this._setError(this._t("importTooBig"));
      return null;
    }
    if (single && failed) {
      this._setError(this._t("importError"));
      return null;
    }
    const problems = [];
    if (failed) problems.push(this._t("importFailedFiles").replace("{x}", failed));
    if (tooBig) problems.push(this._t("importTooBigFiles").replace("{x}", tooBig));
    if (!found) {
      this._setError([this._t("importEmpty"), ...problems].join(" "));
      return null;
    }
    this._finishImport(total, read, problems);
    return total;
  }

  // Markdown-Einträge einer ZIP als dateiähnliche Objekte
  async _zipEntries(file) {
    if (file.size > EASY_MAX_ZIP_BYTES) throw new Error("ZIP zu groß");
    const buf = typeof file.arrayBuffer === "function" ? await file.arrayBuffer() : await new Response(file).arrayBuffer();
    const dec = new TextDecoder();
    return easyUnzip(buf)
      .filter((e) => /\.(md|markdown|txt)$/i.test(e.name) && !/(^|\/)__MACOSX\//.test(e.name) && !/(^|\/)\._/.test(e.name))
      .map((e) => ({
        name: e.name.split("/").pop(),
        webkitRelativePath: e.name,
        size: e.size,
        type: "text/markdown",
        text: async () => {
          if (e.encrypted) throw new Error("Verschlüsselte ZIP-Einträge werden nicht unterstützt");
          if (e.method === 0) return dec.decode(e.raw);
          if (e.method === 8) return dec.decode(await easyInflateRaw(e.raw));
          throw new Error(`ZIP-Kompression ${e.method} wird nicht unterstützt`);
        },
      }));
  }

  _importText(text) {
    const parsed = this._parseMarkdown(text);
    if (!parsed.notes.length) {
      this._setError(this._t("importEmpty"));
      return null;
    }
    const res = this._importParsed(parsed);
    this._finishImport(res, 1, []);
    return res;
  }

  _finishImport(res, files, problems) {
    this._setError(problems.length ? problems.join(" ") : null);
    let msg = this._t("imported").replace("{a}", res.added).replace("{u}", res.updated);
    if (files > 1) msg = `${this._t("importedFiles").replace("{f}", files)} ${msg}`;
    if (res.skipped) msg += ` ${this._t("importedSkipped").replace("{s}", res.skipped)}`;
    this._setMessage(msg);
    this._render();
    this._scheduleSave();
    this._flush();
  }

  _dateStamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  _download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  _exportFile() {
    const md = this._toMarkdown();
    try {
      this._download(new Blob([md], { type: "text/markdown;charset=utf-8" }), `easy-notes-${this._dateStamp()}.md`);
      this._setMessage(this._t("exported").replace("{n}", this._count(this._notes.length, "nNotes")));
    } catch (e) {
      console.warn("Easy Notes: Export fehlgeschlagen", e);
      this._exportClipboard();
    }
    return md;
  }

  // Jede Notiz als eigene .md-Datei mit Kopfbereich (lesbar in Obsidian & Co., verlustfrei importierbar)
  _noteFileContent(n, position) {
    const q = (v) => JSON.stringify(String(v));
    const fm = ["---", `easy_notes_id: ${q(n.id)}`];
    const title = easyFirstLine(n.text, 120);
    if (title) fm.push(`title: ${q(title)}`);
    fm.push(`tags: [${(n.categories || []).map(q).join(", ")}]`);
    fm.push(`color: ${q(n.color || "blue")}`);
    if (n.remind_at) fm.push(`reminder: ${q(n.remind_at)}`);
    if (n.updated) fm.push(`updated: ${q(n.updated)}`);
    if (position) fm.push(`position: ${position}`);
    fm.push("---");
    return `${fm.join("\n")}\n${n.text}\n`;
  }

  _buildZip() {
    const enc = new TextEncoder();
    const folder = `easy-notes-${this._dateStamp()}`;
    const used = new Set();
    const files = this._notes.map((n, i) => ({
      name: `${folder}/${easyFileName(easyFirstLine(n.text, 60), used)}`,
      data: enc.encode(this._noteFileContent(n, i + 1)),
      date: n.updated ? new Date(n.updated) : new Date(),
    }));
    return { bytes: easyZip(files), name: `${folder}.zip`, count: files.length };
  }

  _exportZip() {
    try {
      const zip = this._buildZip();
      this._download(new Blob([zip.bytes], { type: "application/zip" }), zip.name);
      this._setMessage(this._t("exportedZip").replace("{n}", this._count(zip.count, "nNotes")));
      return zip;
    } catch (e) {
      console.warn("Easy Notes: ZIP-Export fehlgeschlagen", e);
      this._setError(this._t("importError"));
      return null;
    }
  }

  async _exportClipboard() {
    const md = this._toMarkdown();
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(md);
        ok = true;
      }
    } catch (_) {
      ok = false;
    }
    if (!ok) {
      // Fallback für HA über http:// im Heimnetz (kein Secure Context)
      try {
        const ta = document.createElement("textarea");
        ta.value = md;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        this.shadowRoot.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch (_) {
        ok = false;
      }
    }
    if (ok) {
      this._setMessage(this._t("copied").replace("{n}", this._count(this._notes.length, "nNotes")));
    } else {
      this._setError(this._t("copyError"));
    }
    return ok;
  }

  // ---------- Erinnerungen ----------
  _tick() {
    if (!this._loaded || this._dragging) return;
    if (!this._remindersOn()) {
      this._updateBadge();
      return;
    }
    for (const n of this._notes) {
      if (!n.remind_at) continue;
      const due = this._isDue(n);
      const rec = this._noteEls.get(String(n.id));
      if (rec && rec.due !== due) rec.refresh();
      const row = this._rowEls && this._rowEls.get(String(n.id));
      if (row && row.classList.contains("due") !== due) this._fillRow(row, n);
      if (due && this._config.sidebar_notification && !n.notified) this._notify(n);
    }
    if (this._graph && this._view === "graph") this._graph.refreshStates();
    this._updateBadge();
  }

  _notify(n) {
    const id = String(n.id);
    if (!this._hass || this._notifying.has(id) || this._notifyFailed.has(id)) return;
    this._notifying.add(id);
    const message = (n.text || "").trim().slice(0, 500) || this._t("emptyNote");
    Promise.resolve(
      this._hass.callService("persistent_notification", "create", {
        title: this._t("notifyTitle"),
        message,
        notification_id: `easy_note_${id}`,
      })
    )
      .then(() => {
        n.notified = true;
        this._scheduleSave();
      })
      .catch((e) => {
        console.warn("Easy Notes: Benachrichtigung fehlgeschlagen", e);
        this._notifyFailed.add(id);
        this._setError(this._t("notifyError"));
      })
      .finally(() => this._notifying.delete(id));
  }

  _dismissSidebar(n) {
    if (!n.notified || !this._hass) return;
    Promise.resolve(
      this._hass.callService("persistent_notification", "dismiss", {
        notification_id: `easy_note_${n.id}`,
      })
    ).catch(() => {});
  }

  // ---------- Laden / Speichern ----------
  async _load({ silent = false } = {}) {
    if (!this._hass || this._loading) return;
    if (silent && (!this._loaded || this._dirty || this._saveTimer || this._dragging)) return;
    if (silent && (this.shadowRoot.activeElement || (this._ed && this._ed.note))) return; // nicht während getippt wird

    this._loading = true;
    const key = this._storageKey;
    let stale = false;
    try {
      const res = await this._hass.callWS({ type: "frontend/get_user_data", key });
      if (key !== this._storageKey) {
        stale = true;
      } else if (silent && (this._dirty || this._saveTimer || this._dragging || this.shadowRoot.activeElement)) {
        // Während des Abrufs wurde bearbeitet: Ergebnis verwerfen
      } else {
        const v = res && res.value;
        const notes = v && Array.isArray(v.notes) ? v.notes.map((n) => this._normalize(n)) : [];
        const changed = !this._loaded || JSON.stringify(notes) !== JSON.stringify(this._notes);
        this._loaded = true;
        this._setError(null);
        if (changed) {
          this._notes = notes;
          this._render();
        }
      }
    } catch (e) {
      console.warn("Easy Notes: Laden fehlgeschlagen", e);
      if (!silent) this._setError(this._t("loadError"));
    } finally {
      this._loading = false;
    }
    if (stale) this._load();
  }

  _scheduleSave() {
    if (!this._loaded) return;
    this._dirty = true;
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this._flush(), 600);
  }

  _flush() {
    clearTimeout(this._saveTimer);
    this._saveTimer = null;
    if (!this._dirty || !this._hass || !this._loaded) return this._saveChain;
    this._dirty = false;

    const key = this._storageKey;
    const hass = this._hass;
    const value = { notes: this._notes.map((n) => ({ ...n })) };
    // Speichervorgänge nacheinander ausführen, damit sie nicht überholen
    this._saveChain = this._saveChain
      .then(() => hass.callWS({ type: "frontend/set_user_data", key, value }))
      .then(() => this._setError(null))
      .catch((e) => {
        console.error("Easy Notes: Speichern fehlgeschlagen", e);
        this._dirty = true; // nächste Änderung versucht es erneut
        this._setError(this._t("saveError"));
      });
    return this._saveChain;
  }
}

if (!customElements.get("easy-notes-card-editor")) {
  customElements.define("easy-notes-card-editor", EasyNotesCardEditor);
}
if (!customElements.get("easy-notes-card")) {
  customElements.define("easy-notes-card", EasyNotesCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "easy-notes-card")) {
  window.customCards.push({
    type: "easy-notes-card",
    name: "Easy Notes",
    preview: true,
    description: "Notizen mit Markdown, Kategorien, Farben, Erinnerungen, Netzansicht und Markdown-Export.",
  });
}

console.info(
  `%c EASY-NOTES-CARD %c v${EASY_NOTES_VERSION} `,
  "color:#1a1300;background:#f2b33d;font-weight:700;border-radius:4px 0 0 4px;padding:2px 4px",
  "color:#f2b33d;background:#2a2f38;font-weight:700;border-radius:0 4px 4px 0;padding:2px 4px"
);
