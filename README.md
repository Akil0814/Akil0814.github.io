# Akil0814.github.io

Quick Link to page：https://akil0814.github.io/

## Project Page Reuse

Shared modules for project description pages are under:

- `projects/_shared/project_page.css`
- `projects/_shared/project_page.js`
- `projects/_shared/project_code_block.js`
- `projects/_shared/README.md`

Each project page should keep only page-specific content and overrides.

## Shared Project Card Descriptions

The homepage and project archive share descriptions from
`i18n/{en,zh,ja}/project_cards.json`, using the homepage's current wording.
Edit these files when updating project descriptions. Page dictionaries retain
their own headings, card titles, badges, and other page-specific text.

Both pages load the shared dictionaries with `data-i18n-shared="project_cards"`.
Project selection, ordering, links, and layout remain in each page's HTML.

After changing English descriptions, sync the static HTML fallbacks so they also
work without JavaScript:

```sh
node scripts/sync_project_card_fallbacks.mjs
node scripts/sync_project_card_fallbacks.mjs --check
```
