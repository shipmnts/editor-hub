# Template Fields for editor-hub — Design

**Date:** 2026-07-02
**Status:** Approved approach (A), thin-vertical-slice build order

## Problem

Shipping documents (MBL, HBL, etc.) are hardcoded HTML files. Any template change
requires a developer to edit HTML. We want a PandaDoc-lite: non-developers visually
author document templates with fillable fields, then users fill them to produce
final documents.

## Decision

Extend `editor-hub` (Quill v2) with custom **field blots** and an **author/fill mode**,
modeled on the existing `MentionBlot` (`modules/quill-mention/src/blots/mention.js`).

Considered and rejected for v1: rebuilding on TipTap/ProseMirror (better for future
conditional sections / repeating rows, but higher upfront cost; roadmap for those
features is uncertain). Known accepted risk: if conditions/repeating rows become real
requirements, Quill's flat Delta model will fight them and may force a rewrite.

## Scope (v1)

Field types: **single-line text, multi-line text, date, number**.
Outputs: **template HTML, rendered HTML (values substituted), values JSON, PDF (via print/HTML render)**.
Explicitly out of scope: dropdowns, conditional sections, repeating rows, signatures,
free drawing / vertical lines.

Build order: **thin vertical slice first** — single-line text field end-to-end
(author mode → fill mode → all outputs), then the remaining field types.

## Architecture

### Field blots (`modules/template-fields/`)

One Quill **embed blot** per field type, registered in `RichTextEditorWrapper.jsx`
alongside the existing mention/emoji/table registrations. Each blot:

- Renders a wrapper `<span class="template-field">` containing a native
  `<input>` / `<textarea>` (type per field).
- Stores metadata on `dataset`: `fieldId`, `fieldType`, `label`, `required`, `value`.
- `static value(node)` returns the dataset (same pattern as `MentionBlot`), so the
  data round-trips through Delta and HTML.
- Syncs user typing back to `dataset.value` on `input` events (fill mode).

### Modes

New `mode` prop on `RichTextEditorWrapper`: `"author" | "fill"` (default: existing
behavior unchanged when prop absent).

- **Author mode:** Quill fully editable. Field inputs are `disabled` and display
  their label as placeholder — chips the author positions, not fills. A field is
  inserted via a new imperative method / toolbar handler with `{ type, label, required }`.
- **Fill mode:** `quill.disable()` locks all text. Field inputs are enabled — native
  form controls remain focusable/typeable inside a disabled Quill root. Typing
  updates `dataset.value`.

### Outputs (exposed via ref, like the existing `focus()`)

- `insertField({ type, label, required })` — author mode: insert a field blot at cursor.
- `getTemplate()` — `quill.root.innerHTML` with field values blanked (the reusable template).
- `getValues()` — `{ [fieldId]: value }` collected from field blots.
- `getRenderedHTML()` — template HTML with each field span replaced by its plain value
  (clean output, no inputs) for display/email/PDF.
- PDF: consumer renders `getRenderedHTML()` via browser print or html2pdf — not part
  of the library itself in v1.

### Persistence

Templates and filled documents are HTML strings, consistent with editor-hub's existing
`value`/`onChange` contract. Field metadata travels as `data-*` attributes and survives
the `clipboard.convert({ html })` load path (blot must declare its `data-*` attributes
so Quill's matchers rebuild it — same mechanism mentions use).

## Error handling

- Unknown/legacy field types in loaded HTML: render as inert chip, never crash.
- `required` fields empty at `getValues()`/`getRenderedHTML()`: returned in a
  `missingRequired: string[]` alongside values; library does not block, consumer decides.
- Number/date inputs use native input types; no custom validation in v1.

## Testing

- Unit (ava, existing setup): blot create/value round-trip, `getValues()` collection,
  `getRenderedHTML()` substitution, template HTML load → blot reconstruction.
- Manual: webpack-dev-server demo page with an author/fill toggle exercising the slice.
