---
name: inheritance
description: Extending models using _inherit and _inherits.
versions: [17, 18, 19]
---

# Inheritance Patterns

## Quick Reference
Odoo provides three types of inheritance: Classical (Extend), Prototype (Copy), and Delegation.

## Pattern

### 1. Classical Inheritance (Extend an existing model)
Adds fields or overrides methods of an existing model. The data is saved in the same database table.
```python
from odoo import models, fields

class ResPartner(models.Model):
    _inherit = 'res.partner'

    # New fields added to the existing res_partner table
    loyalty_points = fields.Integer(string='Loyalty Points')

    # Override an existing method
    def write(self, vals):
        if 'loyalty_points' in vals and vals['loyalty_points'] < 0:
            vals['loyalty_points'] = 0
        return super().write(vals)
```

### 2. Prototype Inheritance (Copy a model)
Creates a completely new model and table, copying the fields and methods of the inherited model.
```python
class SpecialPartner(models.Model):
    _name = 'special.partner'
    _inherit = 'res.partner'     # Copies everything from res.partner
    _description = 'Special Partner'
    
    # special_partner gets its own table and all fields of res.partner + new ones
    special_code = fields.Char('Special Code')
```

### 3. Delegation Inheritance (`_inherits`)
The model embeds another model. It exposes the fields of the inherited model, but data is saved in two separate tables linked by a Many2one field.
```python
class ResUsers(models.Model):
    _name = 'res.users'
    _inherits = {'res.partner': 'partner_id'}
    _description = 'Users'

    # Users have all fields of res.partner available transparently
    # But partner data is stored in res_partner, and user data in res_users
    partner_id = fields.Many2one('res.partner', required=True, ondelete='cascade')
    login = fields.Char('Login')
```

## Best Practices ✅
- Use Classical Inheritance (`_inherit` without `_name`) 95% of the time to add features to standard modules like Sales, Invoicing, etc.
- When overriding a method, always `return super().method(args)`.
