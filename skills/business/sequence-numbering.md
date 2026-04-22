---
name: sequence-numbering
description: Generating unique auto-incrementing numbers (ir.sequence).
versions: [17, 18, 19]
---

# Sequence Numbering

## Quick Reference
Use `ir.sequence` to generate unique identifiers like `INV/2023/0001` or `REQ0042`.

## Pattern

### 1. XML Sequence Definition (`data/sequence_data.xml`)
Define the sequence template. Ensure this file is in the `data` list of your `__manifest__.py`.
```xml
<odoo>
    <data noupdate="1">
        <record id="seq_my_model" model="ir.sequence">
            <field name="name">My Model Sequence</field>
            <field name="code">my.model</field>
            <field name="prefix">MYM/%(year)s/</field> <!-- Supports %(year)s, %(month)s, %(day)s -->
            <field name="padding">4</field>              <!-- Generates 0001 -->
            <field name="company_id" eval="False"/>      <!-- Set to False to share sequence across companies -->
        </record>
    </data>
</odoo>
```

### 2. Python Model Implementation
```python
from odoo import models, fields, api, _

class SequenceExample(models.Model):
    _name = 'sequence.example'
    _description = 'Sequence Example'

    # The field that holds the generated sequence
    name = fields.Char(string='Reference', required=True, copy=False, readonly=True, default=lambda self: _('New'))

    # Odoo 17, 18, 19 Create Method
    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            # Check if name is not provided or is still the default 'New'
            if vals.get('name', _('New')) == _('New'):
                # Request the next number from ir.sequence
                vals['name'] = self.env['ir.sequence'].next_by_code('my.model') or _('New')
        return super().create(vals_list)
```

## Best Practices ✅
- Always use `@api.model_create_multi` for the `create` method. It is required for performance and bulk imports.
- Make the `name` field `copy=False` so duplicating a record doesn't copy the unique sequence number.
- Use `noupdate="1"` in the XML so if the user modifies the prefix (e.g., changing `MYM` to `MY_CUSTOM`), updating the module doesn't overwrite their changes.
