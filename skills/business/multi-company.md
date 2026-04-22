---
name: multi-company
description: Creating multi-company aware models and rules.
versions: [17, 18, 19]
---

# Multi-Company Patterns

## Quick Reference
If Odoo is running in a multi-company environment, records must be restricted so users only see data for their allowed companies.

## Pattern

### 1. Model Definition
Include a `company_id` field and enable automatic checks.
```python
from odoo import models, fields

class MultiCompanyExample(models.Model):
    _name = 'multicompany.example'
    _description = 'Multi Company Example'

    # Odoo 18+ strict company checking
    _check_company_auto = True

    # Default to the current active environment company
    company_id = fields.Many2one(
        'res.company', 
        string='Company', 
        required=True, 
        default=lambda self: self.env.company
    )

    # Relational field must match the company. check_company=True enforces this.
    partner_id = fields.Many2one(
        'res.partner', 
        string='Customer', 
        check_company=True
    )
```

### 2. Record Rule (XML)
This rule is MANDATORY. Without it, users from Company A will see records from Company B.
```xml
<odoo>
    <data noupdate="1">
        <record id="multicompany_example_rule" model="ir.rule">
            <field name="name">Multi Company Example Rule</field>
            <field name="model_id" ref="model_multicompany_example"/>
            <!-- 
                Domain explanation:
                1. company_id is False (Shared record across all companies)
                OR
                2. company_id is in the user's currently selected companies (self.env.companies)
            -->
            <field name="domain_force">['|', ('company_id', '=', False), ('company_id', 'in', company_ids)]</field>
        </record>
    </data>
</odoo>
```

### 3. XML View Specifics
Only show the company field if the user is in a multi-company environment.
```xml
<field name="company_id" groups="base.group_multi_company" options="{'no_create': True}"/>
```

## Best Practices ✅
- When querying records programmatically in cron jobs or API endpoints, ensure you account for company boundaries.
- `_check_company_auto = True` helps prevent data corruption where a Company A record is linked to a Company B partner.
