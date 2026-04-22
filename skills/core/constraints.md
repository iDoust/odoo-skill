---
name: constraints
description: SQL and Python constraints for data validation.
versions: [17, 18, 19]
---

# Constraints

## Quick Reference
Constraints ensure data integrity. SQL constraints are enforced by PostgreSQL. Python constraints are enforced by the ORM during create/write.

## Pattern

### 1. SQL Constraints
Defined at the class level.

#### Odoo 17 & 18 Syntax
```python
from odoo import models, fields

class ConstraintExample(models.Model):
    _name = 'constraint.example'
    _description = 'Constraint Example'

    name = fields.Char('Name')
    code = fields.Char('Code')
    quantity = fields.Integer('Quantity')

    _sql_constraints = [
        ('code_unique', 'UNIQUE(code)', 'The code must be unique!'),
        ('quantity_positive', 'CHECK(quantity > 0)', 'Quantity must be strictly positive!'),
    ]
```

#### Odoo 19 Syntax
Odoo 19 introduces the `models.Constraint` class for cleaner definition.
```python
from odoo import models, fields

class ConstraintExample(models.Model):
    _name = 'constraint.example'
    _description = 'Constraint Example'

    _sql_constraints = [
        models.Constraint('code_unique', 'UNIQUE(code)', 'The code must be unique!'),
        models.Constraint('quantity_positive', 'CHECK(quantity > 0)', 'Quantity must be strictly positive!'),
    ]
```

### 2. Python Constraints
Use `@api.constrains` when validation requires complex logic or relationships.
```python
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class ConstraintExample(models.Model):
    # ...

    date_start = fields.Date('Start Date')
    date_end = fields.Date('End Date')

    @api.constrains('date_start', 'date_end')
    def _check_date_range(self):
        for record in self:
            if record.date_start and record.date_end and record.date_start > record.date_end:
                raise ValidationError(_("The Start Date must be earlier than the End Date."))
```

## Anti-Patterns ❌
- Do not use Python constraints for simple uniqueness or simple value checks (e.g., `value > 0`). Use SQL constraints, as they are much faster and foolproof.
