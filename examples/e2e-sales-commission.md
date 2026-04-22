---
name: e2e-sales-commission
description: End-to-end case study of building a custom Sales Commission module
versions: [17, 18, 19]
---

# Case Study: Sales Commission Module

## Scenario
A company pays commissions to its salespersons based on paid invoices.
Requirements:
1. Salespersons get a fixed percentage (e.g., 5%) defined on their User/Employee profile.
2. A new `sales.commission` model to record commission lines when an invoice is fully paid.
3. Automatically generate a commission record when an `account.move` changes state to 'paid'.

## 1. Adding Commission Percentage to Users
We inherit `res.users` (which represents the salesperson) to add a commission percentage field.

```python
from odoo import models, fields

class ResUsers(models.Model):
    _inherit = 'res.users'

    commission_percentage = fields.Float(string='Commission Percentage (%)', default=5.0)
```

We also add this to the UI via an XPath in a view inherit:
```xml
<record id="view_users_form_inherit_commission" model="ir.ui.view">
    <field name="name">res.users.form.inherit.commission</field>
    <field name="model">res.users</field>
    <field name="inherit_id" ref="base.view_users_form"/>
    <field name="arch" type="xml">
        <xpath expr="//notebook" position="inside">
            <page string="Commissions">
                <group>
                    <field name="commission_percentage"/>
                </group>
            </page>
        </xpath>
    </field>
</record>
```

## 2. Commission Model
We create the table that will store the actual commission amounts owed.

```python
from odoo import models, fields, api

class SalesCommission(models.Model):
    _name = 'sales.commission'
    _description = 'Sales Commission Record'

    name = fields.Char(string='Description', compute='_compute_name', store=True)
    user_id = fields.Many2one('res.users', string='Salesperson', required=True)
    invoice_id = fields.Many2one('account.move', string='Invoice', required=True)
    amount_base = fields.Monetary(string='Base Amount', currency_field='currency_id')
    commission_amount = fields.Monetary(string='Commission Owed', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', related='invoice_id.currency_id')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('paid', 'Paid')
    ], string='Status', default='draft')

    @api.depends('invoice_id', 'user_id')
    def _compute_name(self):
        for record in self:
            record.name = f"Commission for {record.invoice_id.name} ({record.user_id.name})"
```

## 3. Hooking into the Payment Flow
We need to override a method in `account.move` to detect when a customer invoice is paid. In modern Odoo (v16+), payment state is tracked via `payment_state`.

```python
class AccountMove(models.Model):
    _inherit = 'account.move'

    commission_id = fields.Many2one('sales.commission', string='Commission Record', copy=False)

    def _compute_payment_state(self):
        super()._compute_payment_state()
        for move in self:
            # Check if it's a customer invoice, now fully paid, and doesn't have a commission yet
            if move.move_type == 'out_invoice' and move.payment_state in ('paid', 'in_payment') and not move.commission_id:
                if move.invoice_user_id and move.invoice_user_id.commission_percentage > 0:
                    # Calculate commission based on untaxed amount
                    base_amount = move.amount_untaxed
                    pct = move.invoice_user_id.commission_percentage / 100.0
                    commission_val = base_amount * pct

                    # Create commission record
                    commission = self.env['sales.commission'].create({
                        'user_id': move.invoice_user_id.id,
                        'invoice_id': move.id,
                        'amount_base': base_amount,
                        'commission_amount': commission_val,
                    })
                    move.commission_id = commission.id
```

## Agent Takeaways
1. **Hooking Business Logic:** We didn't use `action_post()` because invoices aren't paid when posted. Overriding `_compute_payment_state` and running after `super()` is the standard way to detect payment completion.
2. **Preventing Duplicates:** We check `not move.commission_id` to ensure we don't generate multiple commissions if the invoice state changes back and forth.
3. **Currency fields:** Notice how `amount_base` and `commission_amount` require a `currency_field`. This is mandatory for `Monetary` fields in Odoo.
