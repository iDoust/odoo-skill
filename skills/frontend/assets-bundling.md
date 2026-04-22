---
name: assets-bundling
description: Managing JS/CSS/SCSS assets in __manifest__.py.
versions: [17, 18, 19]
---

# Assets Bundling

## Quick Reference
Odoo uses an asset bundling system to concatenate and minify JavaScript, CSS, and XML templates. You register assets in `__manifest__.py`.

## Pattern

### 1. The `assets` key in `__manifest__.py`

```python
'assets': {
    # Backend assets (Loads when user is logged into the Odoo interface)
    'web.assets_backend': [
        # SCSS/CSS
        'my_module/static/src/scss/backend_styles.scss',
        
        # JavaScript files
        'my_module/static/src/js/my_component.js',
        'my_module/static/src/js/custom_widget.js',
        
        # XML QWeb templates used by OWL/JS
        'my_module/static/src/xml/my_component.xml',
    ],
    
    # Frontend assets (Loads on the public Website/Portal)
    'web.assets_frontend': [
        'my_module/static/src/scss/website_styles.scss',
        'my_module/static/src/js/website_logic.js',
    ],
    
    # Point of Sale assets
    'point_of_sale._assets_pos': [
        'my_module/static/src/js/pos_extension.js',
        'my_module/static/src/xml/pos_templates.xml',
    ],
    
    # Core assets (Rarely used directly, but available)
    'web.assets_core': [],
}
```

### 2. Using SCSS Variables
Odoo provides Bootstrap 5 variables. You can override or use them.
```scss
/* static/src/scss/backend_styles.scss */

.o_my_custom_class {
    background-color: $o-brand-primary; // Use Odoo's primary color
    padding: 10px;
    border-radius: $border-radius;
    
    // Scoped specifically to a view
    .o_list_view & {
        font-weight: bold;
    }
}
```

## Version Differences
- **Odoo < 15:** Assets were defined in XML files using `<template id="assets_backend" inherit_id="web.assets_backend">`. This is **OBSOLETE**.
- **Odoo 15+ (incl. 17, 18, 19):** Assets MUST be defined exclusively in the `__manifest__.py` file under the `assets` key.

## Best Practices ✅
- Use glob patterns (`my_module/static/src/js/**/*.js`) if you have many files and load order doesn't matter.
- If load order *does* matter (e.g., file A extends file B), list them explicitly in the correct order.
- Remove cache/assets in the browser (`?debug=assets`) when testing changes to JS/SCSS.
