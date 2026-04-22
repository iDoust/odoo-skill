---
name: field-types
description: Field definitions and common parameters.
versions: [17, 18, 19]
---

# Field Types

## Quick Reference
Define fields inside model classes. In Odoo 18+, type hinting is recommended.

## Common Parameters
- `string`: Label in UI.
- `required=True`: Mandatory field.
- `readonly=True`: Cannot be edited in UI.
- `help`: Tooltip text.
- `default`: Default value (can be a lambda).
- `tracking=True`: Log changes in chatter.
- `copy=False`: Do not copy when record is duplicated.

## Pattern

```python
from odoo import models, fields

class FieldExample(models.Model):
    _name = 'field.example'
    _description = 'Field Examples'

    # Basic Fields
    name: str = fields.Char(string='Name', required=True, tracking=True)
    description: str = fields.Text(string='Description')
    html_content: str = fields.Html(string='HTML Content')
    is_active: bool = fields.Boolean(string='Active', default=True)
    
    # Numeric
    sequence: int = fields.Integer(string='Sequence', default=10)
    score: float = fields.Float(string='Score', digits=(6, 2))
    
    # Monetary (Requires currency_id field)
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    amount: float = fields.Monetary(string='Amount', currency_field='currency_id')

    # Dates
    date_start = fields.Date(string='Start Date', default=fields.Date.context_today)
    date_end = fields.Datetime(string='End Time', default=fields.Datetime.now)

    # Selection
    state: str = fields.Selection([
        ('draft', 'Draft'),
        ('done', 'Done')
    ], string='Status', default='draft')

    # Relational
    partner_id = fields.Many2one(
        'res.partner', 
        string='Customer', 
        ondelete='restrict',  # 'set null', 'cascade', 'restrict'
        check_company=True    # Ensure partner matches record's company
    )
    
    line_ids = fields.One2many(
        'field.example.line', 
        'example_id',         # Inverse Many2one field on target model
        string='Lines'
    )
    
    tag_ids = fields.Many2many(
        'res.partner.category', 
        string='Tags'
    )
```

## Version Differences
| Version | Difference |
|---------|-----------|
| **17** | Type hints (`name: str = ...`) are optional. |
| **18** | Type hints strongly recommended by Odoo R&D. |
| **19** | Type hints strictly required for standard types in many core modules. |
