---
name: workflow-states
description: Implementing state machines, statusbars, and button actions.
versions: [17, 18, 19]
---

# Workflow States & Button Actions

## Quick Reference
Workflows in Odoo are managed using a `Selection` field (usually named `state`), UI buttons, and Python action methods.

## Pattern

### 1. Python Model
```python
from odoo import models, fields, api, _
from odoo.exceptions import UserError

class WorkflowExample(models.Model):
    _name = 'workflow.example'
    _description = 'Workflow Example'

    state = fields.Selection([
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('cancel', 'Cancelled')
    ], string='Status', default='draft', tracking=True, copy=False)

    def action_submit(self):
        for record in self:
            if record.state != 'draft':
                raise UserError(_("Only draft records can be submitted."))
            record.state = 'submitted'

    def action_approve(self):
        # Example of checking security groups in code
        if not self.env.user.has_group('my_module.group_manager'):
            raise UserError(_("Only managers can approve records."))
        self.write({'state': 'approved'})

    def action_cancel(self):
        self.write({'state': 'cancel'})

    def action_draft(self):
        self.write({'state': 'draft'})
```

### 2. XML View (Header)
```xml
<header>
    <!-- Buttons map directly to the Python methods via name="method_name" -->
    <!-- The invisible attribute controls when the button is shown -->
    <button name="action_submit" string="Submit" type="object" class="oe_highlight" invisible="state != 'draft'"/>
    
    <!-- Use groups attribute to restrict button visibility -->
    <button name="action_approve" string="Approve" type="object" class="oe_highlight" groups="my_module.group_manager" invisible="state != 'submitted'"/>
    
    <button name="action_cancel" string="Cancel" type="object" invisible="state in ('approved', 'cancel')"/>
    <button name="action_draft" string="Set to Draft" type="object" invisible="state != 'cancel'"/>
    
    <!-- The statusbar widget visually represents the state field -->
    <field name="state" widget="statusbar" statusbar_visible="draft,submitted,approved"/>
</header>
```

## Best Practices ✅
- Use `oe_highlight` class for the primary action button (the "next step" in the flow).
- Always validate the current state inside the Python action method using `if record.state != 'expected': raise UserError(...)`. Do not rely solely on the UI `invisible` attribute for security.
- Add `tracking=True` to the `state` field so state changes are logged in the chatter.
- Add `copy=False` so duplicated records start in the default state.
