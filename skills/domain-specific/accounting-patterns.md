---
name: accounting-patterns
description: Working with account.move (Invoices/Journal Entries) and payments.
versions: [17, 18, 19]
---

# Accounting / Invoicing (`account.move`)

## Quick Reference
In Odoo, Invoices, Vendor Bills, and Journal Entries are all stored in the **same model**: `account.move`. The lines are stored in `account.move.line`.

## 1. Creating an Invoice (Customer)

```python
def create_customer_invoice(self, partner, product, amount):
    invoice = self.env['account.move'].create({
        'move_type': 'out_invoice',  # 'out_invoice' = Customer Invoice, 'in_invoice' = Vendor Bill
        'partner_id': partner.id,
        'invoice_date': fields.Date.context_today(self),
        'invoice_line_ids': [
            (0, 0, {
                'product_id': product.id,
                'quantity': 1,
                'price_unit': amount,
                # Accounts and taxes are usually pulled automatically from the product/partner
            })
        ]
    })
    # Post the invoice (moves it from draft to posted)
    invoice.action_post()
    return invoice
```

## move_type Reference
- `out_invoice`: Customer Invoice
- `out_refund`: Customer Credit Note
- `in_invoice`: Vendor Bill
- `in_refund`: Vendor Refund
- `entry`: Miscellaneous Journal Entry

## 2. Registering a Payment

```python
def pay_invoice(self, invoice, journal, amount):
    payment = self.env['account.payment.register'].with_context(
        active_model='account.move',
        active_ids=invoice.ids
    ).create({
        'journal_id': journal.id,
        'amount': amount,
        'payment_date': fields.Date.context_today(self),
    })
    payment.action_create_payments()
```

## Best Practices ✅
- Never insert records directly into `account.move.line` without creating the `account.move` header first.
- Always use the context `active_model` and `active_ids` when calling the `account.payment.register` wizard.
- Modifying a `posted` invoice is restricted by strict accounting laws in many countries. Avoid trying to forcefully modify posted moves; create credit notes instead.
