---
name: e2e-sales-commission
description: End-to-end walkthrough for building a Sales Commission extension.
---

# End-to-End Walkthrough: Sales Commission

## Scenario
The client wants to automatically calculate sales commissions. Each salesperson has a specific commission percentage. When an invoice is PAID, the system should generate a commission record for the salesperson based on the invoice total.

## Thought Process & Architecture

1.  **Configuration:** We need to add a `commission_percentage` field to the Employee/User. Let's add it to `res.users` via inheritance.
2.  **Core Model (`sales.commission`):** We need a new model to store the computed commissions. Fields: `user_id`, `amount`, `invoice_id`, `date`.
3.  **Trigger Point:** We cannot trigger this when a Sale Order is confirmed, because the client wants it when the *Invoice is Paid*. We must inherit `account.move`.
4.  **Action Automation:** We will override the method in `account.move` that marks an invoice as paid, or use an automated action / cron if the logic is too heavy. Let's override the payment state change.

## Implementation Steps

### Step 1: Extend `res.users`
*   Python: `_inherit = 'res.users'`, add `commission_percentage = fields.Float()`.
*   XML: Use XPath to inject this field into the `res.users` form view, visible only to HR/Admin.

### Step 2: Create `sales.commission` Model
*   Simple CRUD model. `amount` should be readonly.
*   Security: Users can only see their own commissions (Record Rule). Managers can see all.

### Step 3: Inherit `account.move` (The Tricky Part)
*   In Odoo 17+, the payment state is computed dynamically.
*   We need to override a method. Overriding `write()` and checking if `payment_state` changes to `paid` or `in_payment` is a common pattern.
*   *Performance warning:* Do not do heavy operations directly in `write()`.
*   Logic inside `write()`:
```python
res = super().write(vals)
if 'payment_state' in vals:
    for move in self:
        if move.move_type == 'out_invoice' and move.payment_state in ('paid', 'in_payment'):
            # Check if commission already exists to avoid duplicates
            existing = self.env['sales.commission'].search([('invoice_id', '=', move.id)])
            if not existing and move.invoice_user_id.commission_percentage > 0:
                calc_amount = move.amount_untaxed * (move.invoice_user_id.commission_percentage / 100.0)
                self.env['sales.commission'].create({
                    'user_id': move.invoice_user_id.id,
                    'invoice_id': move.id,
                    'amount': calc_amount,
                    'date': fields.Date.context_today(self),
                })
return res
```

### Step 4: Menus and Views
*   Create a menu "My Commissions" under the Sales app.
*   List view showing Date, Invoice Ref, Amount.
*   Add a graph view or pivot view so the salesperson can see their earnings per month.

## AI Execution Strategy
When extending core modules like Accounting (`account`), always check the current state against the `vals` dictionary in `write()`. Ensure you use `amount_untaxed` (not `amount_total`) for commissions to avoid paying commission on taxes. Refer to `skills/domain-specific/accounting-patterns.md` for `account.move` behaviors.
