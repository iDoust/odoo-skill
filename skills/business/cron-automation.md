---
name: cron-automation
description: Creating scheduled actions (ir.cron).
versions: [17, 18, 19]
---

# Scheduled Actions (Crons)

## Quick Reference
Use `ir.cron` to run Python methods automatically at scheduled intervals (e.g., daily syncs, automatic invoice generation).

## Pattern

### 1. XML Definition (`data/cron_data.xml`)
```xml
<odoo>
    <data noupdate="1">
        <record id="ir_cron_auto_cancel_drafts" model="ir.cron">
            <field name="name">Auto Cancel Old Drafts</field>
            <!-- The model where the method exists -->
            <field name="model_id" ref="model_my_model"/>
            <!-- The Python method to call -->
            <field name="state">code</field>
            <field name="code">model._cron_cancel_old_drafts()</field>
            <!-- User to execute the cron as (usually base.user_root / System) -->
            <field name="user_id" ref="base.user_root"/>
            <!-- Frequency -->
            <field name="interval_number">1</field>
            <field name="interval_type">days</field>
            <!-- How many times a failed job is retried -->
            <field name="numbercall">-1</field> <!-- -1 means infinite -->
            <field name="active" eval="True"/>
        </record>
    </data>
</odoo>
```

### 2. Python Method Implementation
```python
from odoo import models, fields, api
from datetime import timedelta

class MyModel(models.Model):
    _name = 'my.model'

    state = fields.Selection([('draft', 'Draft'), ('done', 'Done'), ('cancel', 'Cancelled')])
    create_date = fields.Datetime()

    @api.model
    def _cron_cancel_old_drafts(self):
        """Finds draft records older than 30 days and cancels them."""
        # Calculate the threshold date
        threshold_date = fields.Datetime.now() - timedelta(days=30)
        
        # Always use search with limit/batching if dealing with large tables
        old_drafts = self.search([
            ('state', '=', 'draft'),
            ('create_date', '<', threshold_date)
        ])
        
        for record in old_drafts:
            try:
                # Use sub-transactions (savepoints) if failure of one record shouldn't stop the whole cron
                with self.env.cr.savepoint():
                    record.write({'state': 'cancel'})
            except Exception as e:
                # Log the error but let the cron continue
                import logging
                _logger = logging.getLogger(__name__)
                _logger.error(f"Failed to cancel record {record.id}: {str(e)}")
```

## Best Practices ✅
- Always use `@api.model` for the cron method, as it is called on the class level, not on a specific record instance.
- Wrap individual operations in `with self.env.cr.savepoint():` if processing many records. Otherwise, if the 99th record fails, the entire transaction rolls back and the first 98 succeed but aren't saved.
