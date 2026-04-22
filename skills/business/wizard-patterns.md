---
name: wizard-patterns
description: Creating TransientModel wizards and popup dialogs.
versions: [17, 18, 19]
---

# Wizard Patterns

## Quick Reference
Wizards are temporary data entry forms displayed as popups. Their data is automatically cleaned up by the database over time. They inherit from `models.TransientModel`.

## Pattern

### 1. Python Wizard Model
```python
from odoo import models, fields, api

class CancelReasonWizard(models.TransientModel):
    _name = 'cancel.reason.wizard'
    _description = 'Cancel Reason Wizard'

    # Get default from context if passed by the calling action
    example_id = fields.Many2one('workflow.example', string='Record', required=True, default=lambda self: self.env.context.get('active_id'))
    reason = fields.Text(string='Reason', required=True)

    def action_confirm_cancel(self):
        self.ensure_one()
        # Post a message on the target record
        self.example_id.message_post(body=f"Cancelled. Reason: {self.reason}")
        # Execute the business logic
        self.example_id.action_cancel()
        
        # Return an action to reload the page or close the wizard
        return {'type': 'ir.actions.act_window_close'}
```

### 2. XML Wizard View
```xml
<odoo>
    <record id="view_cancel_reason_wizard" model="ir.ui.view">
        <field name="name">cancel.reason.wizard.form</field>
        <field name="model">cancel.reason.wizard</field>
        <field name="arch" type="xml">
            <form string="Provide a Reason">
                <sheet>
                    <group>
                        <!-- invisible="1" ensures the value is there but not shown -->
                        <field name="example_id" invisible="1"/>
                        <field name="reason" placeholder="Why are you cancelling this?"/>
                    </group>
                </sheet>
                <footer>
                    <button name="action_confirm_cancel" string="Confirm" type="object" class="btn-primary"/>
                    <button string="Discard" class="btn-secondary" special="cancel"/>
                </footer>
            </form>
        </field>
    </record>
    
    <!-- Action to open the wizard -->
    <record id="action_cancel_reason_wizard" model="ir.actions.act_window">
        <field name="name">Cancel Record</field>
        <field name="res_model">cancel.reason.wizard</field>
        <field name="view_mode">form</field>
        <field name="target">new</field> <!-- target="new" makes it open as a popup -->
    </record>
</odoo>
```

### 3. Triggering the Wizard from the Main Form
```xml
<!-- In the main model's form view -->
<header>
    <!-- Instead of type="object", use type="action" to call the window action -->
    <button name="%(my_module.action_cancel_reason_wizard)d" string="Cancel" type="action" class="btn-secondary"/>
</header>
```

## Best Practices ✅
- Always use `target="new"` in the wizard's window action to ensure it opens in a modal dialog.
- The `special="cancel"` attribute on the discard button closes the wizard without any Python logic.
- Use `self.env.context.get('active_id')` or `active_ids` to know which record(s) the user was viewing when they clicked the button.
