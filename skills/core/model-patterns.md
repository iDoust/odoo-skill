---
name: model-patterns
description: Creating new models using models.Model and TransientModel.
versions: [17, 18, 19]
---

# Model Patterns

## Quick Reference
Models are Python classes that inherit from `odoo.models.Model` (persistent) or `odoo.models.TransientModel` (temporary, e.g., wizards).

## Pattern

### Standard Persistent Model
```python
from odoo import models, fields, api, _

class MyModel(models.Model):
    _name = 'my.module.model'
    _description = 'My Custom Model'
    _order = 'sequence, id desc'     # Default sort order
    _rec_name = 'display_name'       # Field used for string representation (default is 'name')
    _check_company_auto = True       # Enforce multi-company consistency (v18+)

    # Add mail thread support (requires 'mail' dependency)
    _inherit = ['mail.thread', 'mail.activity.mixin']

    # Fields
    name = fields.Char(string='Name', required=True, tracking=True)
    sequence = fields.Integer(string='Sequence', default=10)
    company_id = fields.Many2one('res.company', string='Company', default=lambda self: self.env.company)
    active = fields.Boolean(default=True)
```

## Version Differences
| Version | Difference |
|---------|-----------|
| **17** | `_check_company_auto` used but less strictly enforced. |
| **18/19** | `_check_company_auto = True` is highly recommended for any model with a `company_id` field. Type hints are recommended/required. |

## Best Practices ✅
- Always define `_description`.
- Use `_inherit = ['mail.thread', 'mail.activity.mixin']` for important business documents to enable chatter and activity tracking.
- If the model is purely temporary (wizards), use `models.TransientModel` instead.
