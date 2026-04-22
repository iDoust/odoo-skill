---
name: widgets
description: Common UI widgets for fields (badge, monetary, statusbar, etc.).
versions: [17, 18, 19]
---

# View Widgets

## Quick Reference
Widgets change how a field is rendered in the UI (e.g., turning a boolean into a toggle switch).

## Common Widgets

### Form View Widgets
| Widget | Applicable Fields | Description |
|--------|------------------|-------------|
| `statusbar` | Selection, Many2one | Shows state as a progress bar in the `<header>`. |
| `boolean_toggle` | Boolean | Renders as an iOS-style toggle switch. |
| `radio` | Selection, Many2one | Radio buttons instead of a dropdown. |
| `priority` | Selection | Renders as clickable stars (usually 0 to 3). |
| `image` | Binary | Renders image. Options: `{'size': [128, 128]}`. |
| `html` | Html | Rich text editor. |
| `domain` | Char | Visual domain builder (requires a `model` field reference). |
| `many2many_tags` | Many2many | Shows selected items as tags. Option: `{'color_field': 'color'}`. |
| `many2one_avatar` | Many2one (res.partner/users) | Shows user/partner avatar next to the name. |

### List View Widgets
| Widget | Applicable Fields | Description |
|--------|------------------|-------------|
| `badge` | Selection, Many2one | Colored badge. Use `decoration-*` to set colors. |
| `monetary` | Float, Monetary | Formats as currency. Requires `currency_id`. |
| `handle` | Integer (usually `sequence`) | Drag-and-drop row reordering. |
| `progressbar` | Float, Integer | Renders a progress bar (e.g., 0 to 100). |
| `percentage` | Float | Multiplies by 100 and adds `%` symbol. |

## Implementation Examples

```xml
<!-- Statusbar -->
<field name="state" widget="statusbar" statusbar_visible="draft,sent,done"/>

<!-- Boolean Toggle -->
<field name="active" widget="boolean_toggle"/>

<!-- Badge with Colors -->
<field name="state" widget="badge" 
       decoration-info="state == 'draft'" 
       decoration-warning="state == 'pending'" 
       decoration-success="state == 'done'"/>

<!-- Monetary -->
<field name="amount_total" widget="monetary" options="{'currency_field': 'currency_id'}"/>

<!-- Many2many Tags with Color -->
<field name="tag_ids" widget="many2many_tags" options="{'color_field': 'color', 'no_create_edit': True}"/>
```
