# Project Page Shared Modules

Use these files for all project description pages under `projects/*`:

- `project_page.css`: shared layout and UI styles (nav, sections, cards, responsive).
- `project_page.js`: shared preference handling (`theme`, `fx`, `lang`), footer year, and theme-aware asset swapping.
- `project_code_block.js`: reusable C++ code block renderer with Prism syntax highlighting.

## Minimal HTML include order

```html
<link rel="stylesheet" href="../../css/tokens.css">
<link rel="stylesheet" href="../../css/base.css">
<link rel="stylesheet" href="../../css/layout.css">
<link rel="stylesheet" href="../../css/prism.css">
<link rel="stylesheet" href="../_shared/project_page.css">
<link rel="stylesheet" href="./your_page.css">
```

```html
<script src="../../js/prism.js"></script>
<script src="../_shared/project_code_block.js"></script>
<script src="../_shared/project_page.js"></script>
<script src="./your_page.js"></script>
```

## Page script pattern

```js
window.ProjectPageCore.init();
window.ProjectCodeBlock.renderCppFile(...);
```

Keep only page-specific content and overrides in each page folder (`your_page.css`, `your_page.js`).
