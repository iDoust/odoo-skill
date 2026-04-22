---
name: sale-crm
description: Working with sale.order and crm.lead.
versions: [17, 18, 19]
---

# Sales & CRM

## Quick Reference
The core of the Sales flow involves `crm.lead` (Opportunities) transforming into `sale.order` (Quotations/Sales Orders).

## 1. Creating a Sale Order

```python
def create_sale_order(self, partner, product, qty):
    sale_order = self.env['sale.order'].create({
        'partner_id': partner.id,
        'validity_date': fields.Date.add(fields.Date.context_today(self), days=30),
        'order_line': [
            (0, 0, {
                'product_id': product.id,
                'product_uom_qty': qty,
                # price_unit is computed automatically based on pricelists, 
                # but you can override it:
                # 'price_unit': 150.0, 
            })
        ]
    })
    
    # Confirm the quotation to make it a Sales Order
    sale_order.action_confirm()
    return sale_order
```

## 2. Generating an Invoice from a Sale Order

```python
def invoice_sale_order(self, sale_order):
    if sale_order.state != 'sale':
        raise UserError("Order must be confirmed first.")
        
    # Create the invoice
    invoice = sale_order._create_invoices()
    
    # Post the invoice
    invoice.action_post()
    return invoice
```

## 3. Working with Leads/Opportunities (`crm.lead`)

```python
def create_lead(self, name, partner):
    lead = self.env['crm.lead'].create({
        'name': name,
        'partner_id': partner.id,
        'type': 'opportunity', # 'lead' or 'opportunity'
        'expected_revenue': 5000.0,
    })
    
    # Mark as Won
    lead.action_set_won()
```

## Best Practices ✅
- Do not manually write to the `state` field on `sale.order`. Always use `action_confirm()`, `action_cancel()`, etc. These methods trigger inventory delivery creations and compute totals.
- Let Odoo compute the unit price on the order line automatically using the partner's pricelist, unless you have a specific business requirement to override it.
