---
name: dynamic-visibility
description: Setting fields invisible, readonly, or required dynamically.
versions: [17, 18, 19]
---

# Dynamic Visibility (Odoo 17+)

## Quick Reference
Odoo 17 completely removed the `attrs` attribute. Visibility, readonly, and required states are now controlled using direct Python expressions in the XML attributes.

## Pattern

### Odoo 17, 18, 19 Syntax
Use `invisible`, `readonly`, and `required` attributes directly with Python domain-like expressions.

```xml
<!-- Hide field if state is 'draft' -->
<field name="date_order" invisible="state == 'draft'"/>

<!-- Hide field if boolean is False -->
<field name="partner_id" invisible="not is_company"/>

<!-- Readonly if state is 'done' or 'cancel' -->
<field name="amount_total" readonly="state in ('done', 'cancel')"/>

<!-- Required if a specific type is selected -->
<field name="vat" required="company_type == 'company'"/>

<!-- Multiple conditions (AND/OR) -->
<field name="note" invisible="state == 'draft' or amount_total &lt; 1000"/>
```

## Complex Conditions
If the condition is too complex to write in XML, or if it depends on fields not present in the view, you should use a **Computed Boolean Field** in Python and use that in the view.

```python
# python
is_special_user = fields.Boolean(compute='_compute_is_special_user')

@api.depends('user_id')
def _compute_is_special_user(self):
    for record in self:
        record.is_special_user = self.env.user.has_group('my_module.group_special')
```
```xml
<!-- xml -->
<field name="special_code" invisible="not is_special_user"/>
```

## Anti-Patterns ❌
- **DO NOT USE `attrs`**. E.g., `attrs="{'invisible': [('state', '=', 'draft')]}"` will crash Odoo 17+.
- **DO NOT** try to use `<` or `>` directly in XML. Use `&lt;` (less than) and `&gt;` (greater than) to avoid invalid XML.

## List View Specifics
To hide an entire column in a list view regardless of the row data, use `column_invisible`:
```xml
<field name="company_id" column_invisible="True"/>
<!-- Or with a context/parent condition -->
<field name="company_id" column_invisible="parent.type == 'out_invoice'"/>
```
