---
name: orm-methods
description: Basic CRUD operations, search, and domains.
versions: [17, 18, 19]
---

# ORM Methods & CRUD

## Quick Reference
Interact with the database using Odoo's Object-Relational Mapping (ORM) methods.

## Pattern

### 1. Search and Domain Filters
```python
# Search returns a recordset
domain = [
    ('state', 'in', ['draft', 'sale']),
    ('amount_total', '>', 1000),
    '|', # OR operator for the next two conditions
        ('partner_id.country_id.code', '=', 'US'),
        ('partner_id.is_company', '=', True),
]
orders = self.env['sale.order'].search(domain, limit=10, order='date_order desc')

# Count records
order_count = self.env['sale.order'].search_count([('state', '=', 'sale')])
```

### 2. Create, Write, Unlink (CRUD)
```python
# CREATE
new_order = self.env['sale.order'].create({
    'partner_id': partner.id,
    'note': 'Created via code',
})

# WRITE (Update)
new_order.write({'state': 'done'})
# Or assign directly (triggers write automatically)
new_order.note = 'Updated via code'

# UNLINK (Delete)
new_order.unlink()
```

### 3. X2Many Commands (Create/Write related records)
Used when writing to `One2many` or `Many2many` fields.
```python
from odoo import Command

order.write({
    'order_line': [
        Command.create({'product_id': 1, 'product_uom_qty': 5}),       # (0, 0, vals)
        Command.update(line_id, {'product_uom_qty': 10}),              # (1, id, vals)
        Command.delete(line_id),                                       # (2, id)
        Command.unlink(line_id),                                       # (3, id) - M2M mostly
        Command.link(existing_line_id),                                # (4, id) - M2M mostly
        Command.clear(),                                               # (5,)
        Command.set([id1, id2, id3]),                                  # (6, 0, ids)
    ]
})
```

## Best Practices ✅
- Avoid looping over recordsets to search or write. Use batch operations.
- `search()` returns a recordset. Do not assume it returns a single record unless you use `.ensure_one()`.
