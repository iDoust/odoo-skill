---
name: approval-workflow
description: Boilerplate for a multi-stage approval process.
versions: [17, 18, 19]
---

# Boilerplate: Approval Workflow

Use this template to add a state machine (Draft -> Submitted -> Approved -> Cancelled) to a model.

## 1. Python Logic (`models/approval_model.py`)
```python
from odoo import models, fields, api, _
from odoo.exceptions import UserError

class ApprovalModel(models.Model):
    _name = 'approval.model'
    _description = 'Approval Workflow Model'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(required=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('submitted', 'Waiting Approval'),
        ('approved', 'Approved'),
        ('cancel', 'Cancelled')
    ], string='Status', default='draft', tracking=True, copy=False)
    
    amount = fields.Float(string='Amount', tracking=True)

    def action_submit(self):
        for rec in self:
            if rec.amount <= 0:
                raise UserError(_("Amount must be greater than zero to submit."))
            rec.state = 'submitted'

    def action_approve(self):
        for rec in self:
            # Explicitly enforce security via Python, not just UI visibility
            if not self.env.user.has_group('my_module.group_approver'):
                raise UserError(_("Only authorized approvers can validate this."))
            rec.state = 'approved'

    def action_cancel(self):
        self.write({'state': 'cancel'})

    def action_draft(self):
        self.write({'state': 'draft'})
```

## 2. XML View Additions (`views/approval_views.xml`)
Inject this `<header>` inside the `<form>` view, right above the `<sheet>`.

```xml
<header>
    <!-- Primary workflow flow (Highlight class) -->
    <button name="action_submit" string="Submit" type="object" class="oe_highlight" 
            invisible="state != 'draft'"/>
            
    <button name="action_approve" string="Approve" type="object" class="oe_highlight" 
            groups="my_module.group_approver" 
            invisible="state != 'submitted'"/>
            
    <!-- Secondary actions -->
    <button name="action_cancel" string="Cancel" type="object" 
            invisible="state in ('approved', 'cancel')"/>
            
    <button name="action_draft" string="Set to Draft" type="object" 
            invisible="state != 'cancel'"/>
            
    <!-- Statusbar Widget -->
    <field name="state" widget="statusbar" statusbar_visible="draft,submitted,approved"/>
</header>
```

## 3. Best Practices Add-on: Dynamic Readonly
Make fields readonly after submission by adding the `readonly` attribute to the fields in XML (Odoo 17+).

```xml
<field name="amount" readonly="state != 'draft'"/>
```
