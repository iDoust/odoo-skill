---
name: computed-fields
description: Computed fields using @api.depends, inverse, and search.
versions: [17, 18, 19]
---

# Computed Fields

## Quick Reference
Computed fields are calculated dynamically. By default, they are NOT stored in the database and are readonly.

## Pattern

```python
from odoo import api, fields, models

class ComputeExample(models.Model):
    _name = 'compute.example'
    _description = 'Compute Example'

    price = fields.Float('Price')
    quantity = fields.Float('Quantity')
    
    # Computed Field
    total: float = fields.Float(
        string='Total',
        compute='_compute_total',
        store=True,                   # Save to DB (allows searching/grouping)
        readonly=False,               # Allow manual edit (requires inverse)
        inverse='_inverse_total',     # Method to run when manually edited
        search='_search_total',       # Custom search logic (only if store=False)
    )

    @api.depends('price', 'quantity')
    def _compute_total(self):
        for record in self:
            record.total = record.price * record.quantity

    def _inverse_total(self):
        """Called when total is manually edited."""
        for record in self:
            if record.quantity:
                record.price = record.total / record.quantity
            else:
                record.price = 0.0

    def _search_total(self, operator, value):
        """Called when searching a non-stored computed field."""
        # This is a basic example; real logic requires translating to stored field domains
        self.env.cr.execute("SELECT id FROM compute_example WHERE price * quantity {} %s".format(operator), (value,))
        ids = [row[0] for row in self.env.cr.fetchall()]
        return [('id', 'in', ids)]
```

## Best Practices ✅
- Use `store=True` if you need to group by, sort by, or frequently search by this field.
- If `store=True`, the `@api.depends` must accurately list ALL fields that affect the calculation. If a dependency is missed, the database value won't update when it should.
- Loop through `self` in compute methods. Never assume `self` is a single record.
