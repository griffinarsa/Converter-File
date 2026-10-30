# Formatku Converter — Design System

**Purpose:** A straightforward file converter. Help people choose files, set output formats, convert, and download results.

**Implementation:** React + TypeScript, semantic CSS tokens, Lucide icons.

## Product flow

The landing page explains supported conversion types and leads directly to file selection. Selecting files takes the user to a dedicated conversion page in the same app. Keep the batch intact when the user returns to the landing page, where a clear action reopens it. The conversion page uses the `#convert` route and replaces the landing content; it is not a dialog, overlay, or bottom sheet. Browser Back and the Beranda control return to the landing page without clearing the batch.

Keep file, folder, quick-conversion, PDF, ZIP, quality, and download actions tied to the files they affect. Do not add testimonials, service claims, or converter formats that the product does not support.

## Visual direction

Use a restrained neumorphic system with one cool gray-blue surface family. Build depth through soft raised and inset shadow pairs. Keep panels and controls on related surfaces, with rounded corners between 12 and 20px. Use a clear deep-blue primary action. Shadows support grouping; labels, borders, and focus rings carry meaning. Avoid faint text, controls distinguished by shadow alone, excessive embossing, and large decorative gradients.

Use Plus Jakarta Sans for the brand and headings, and Inter for interface text. Keep body text at 15–16px, line-height at least 1.5, and controls at least 44px high.

## Color and depth tokens

| Role | Light | Dark | Token |
|---|---|---|---|
| Primary action | `#0754B8` | `#AEC6FF` | `--color-primary` |
| Primary text | `#182334` | `#F1F5F9` | `--color-foreground` |
| Page and raised surface | `#DDE6EF` | `#1B2532` | `--color-background`, `--color-surface` |
| Secondary surface | `#D3DDE8` | `#304154` | `--color-surface-muted` |
| Supporting text | `#475569` | `#C7D0DA` | `--color-muted-foreground` |
| Control border | `#B7C5D4` | `#5B6E83` | `--color-border` |
| Keyboard focus | `#0754B8` | `#C3D3FF` | `--color-ring` |
| Success | `#15803D` | `#4ADE80` | `--color-success` |
| Danger | `#B91C1C` | `#FCA5A5` | `--color-danger` |
| Raised depth | light and dark shadow pair | light and dark shadow pair | `--shadow-neu-raised` |
| Pressed depth | inset light and dark pair | inset light and dark pair | `--shadow-neu-inset` |

Normal text must keep at least 4.5:1 contrast. Add visible borders to controls so their edges stay clear without relying on shadows.

## Components

- **Primary button:** deep blue, strong contrast, raised at rest, inset on press.
- **Upload surface:** inset panel with separate raised file and folder buttons; keep supported types and limits readable.
- **Quick conversions:** raised cards with clear pressed states and accessible selected categories.
- **Quick conversions:** keep the supported preset cards and category filters, with no separate “PILIHAN CEPAT” label. Selecting a card opens the file chooser and preselects its output format.
- **FAQ:** keep the answers and accordion under the “Pertanyaan umum” heading; omit only the separate “FAQ” kicker.
- **Conversion page:** replaces the landing content after file selection. Keep its heading, return-to-home action, batch summary, file list, and primary conversion action visible in a clear order. Preserve the current batch when returning home.
- **File row:** file identity, format selector, status or download, and remove control. On phones, use a two-row grid so actions do not overlap.
- **Batch tools and quality:** show only actions that apply to the selected files. Keep labels visible and controls at least 44px tall.
- **Split PDF results:** show generated page files in a focused results view that replaces the source list until the user returns. Do not append results beside their source files. Offer individual downloads and one ZIP per source.
- **Merge PDF results:** show the merged PDF in the same focused results view pattern, away from the source list, with one direct PDF download and a return action.
- **Feedback:** show errors beside affected files and announce transient updates with a polite live region.

## Responsive behavior

- 320–390px: single-column page panels, two-column conversion cards, compact file rows, no horizontal overflow.
- 391–760px: full-width conversion page with 16px gutters, wrapped tools, safe-area padding.
- 761–960px: reduce gutters and allow grids to collapse.
- 961px and wider: centered content up to 1120px and a conversion page up to 1040px wide.

Respect browser zoom, safe-area insets, keyboard navigation, and reduced motion.

## Accessibility

- Normal text contrast is at least 4.5:1 in both themes.
- Icon-only actions have accessible names. Decorative icons do not duplicate spoken labels.
- Every format selector has a filename-specific accessible label.
- The conversion page is a page region, not a modal dialog. Escape and the return control take the user back to the landing page without clearing the batch.
- Use native buttons and selects, descriptive error text, visible focus, and `aria-live="polite"` for transient feedback.
- Verify layouts at 320, 375, 768, 1024, and 1440 CSS pixels.

## Motion

Use short color and shadow transitions. Honor `prefers-reduced-motion`. Do not shift layout bounds on hover or press.

## Product constraints

Do not add cloud imports, accounts, format counts, certifications, retention promises, or performance claims. Preserve accurate privacy and processing copy.
