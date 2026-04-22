---
name: mail-chatter
description: Adding mail.thread, followers, chatter, and activity scheduling.
versions: [17, 18, 19]
---

# Mail Thread & Chatter

## Quick Reference
Adding the chatter enables comments, followers, email integration, and activity scheduling on a record.

## Pattern

### 1. Python Model Setup
Must inherit `mail.thread` and `mail.activity.mixin` and depend on the `mail` module in `__manifest__.py`.

```python
from odoo import models, fields

class ChatterExample(models.Model):
    _name = 'chatter.example'
    _description = 'Chatter Example'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    # Use tracking=True to automatically log changes in the chatter
    name = fields.Char(string='Name', required=True, tracking=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('done', 'Done')
    ], string='Status', default='draft', tracking=True)
    user_id = fields.Many2one('res.users', string='Responsible', tracking=True)

    def action_done(self):
        self.write({'state': 'done'})
        # Post a custom message to the chatter
        self.message_post(body="The record has been marked as done.")
```

### 2. Scheduling Activities via Code
```python
    def assign_to_user(self, new_user_id):
        self.user_id = new_user_id
        # Schedule a To-Do activity for the new user
        self.activity_schedule(
            'mail.mail_activity_data_todo',
            summary='Review assigned record',
            user_id=new_user_id.id
        )
```

### 3. XML Form View
Add the `oe_chatter` div at the very bottom of the `<form>`, completely outside the `<sheet>`.
```xml
<form string="Chatter Example">
    <sheet>
        <!-- form fields -->
    </sheet>
    
    <!-- Chatter widget -->
    <div class="oe_chatter">
        <field name="message_follower_ids" widget="mail_followers"/>
        <field name="activity_ids" widget="mail_activity"/>
        <field name="message_ids" widget="mail_thread"/>
    </div>
</form>
```

## Best Practices ✅
- Set `tracking=True` on key fields (State, Assigned User, Amount) to maintain an audit trail. Do not set it on fields that update frequently (e.g., computed totals) to avoid spamming the chatter.
- Use `message_post(body="...")` to leave notes when significant automated actions occur.
