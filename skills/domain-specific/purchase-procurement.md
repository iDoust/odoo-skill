---
name: purchase-procurement
description: Working with purchase.order.
versions: [17, 18, 19]
---

# Purchase & Procurement

## Quick Reference
`purchase.order` is used for RFQs (Requests for Quotation) and Purchase Orders.

## 1. Creating a Purchase Order

```python
def create_po(self, vendor, product, qty, price):
    po = self.env['purchase.order'].create({
        'partner_id': vendor.id,
        'order_line': [
            (0, 0, {
                'product_id': product.id,
                'product_qty': qty,
                'price_unit': price,
                # Product UoM (Unit of Measure) is usually required on PO lines
                'product_uom': product.uom_po_id.id,
            })
        ]
    })
    
    # Confirm the RFQ to turn it into a PO
    po.button_confirm()
    return po
```

## 2. Generate a Vendor Bill

```python
def bill_purchase_order(self, po):
    if po.state not in ['purchase', 'done']:
        raise UserError("Only confirmed POs can be billed.")
        
    action = po.action_create_invoice()
    # Depending on the Odoo version, this might return an action dict or a recordset.
    # Usually, it creates the invoice and you need to fetch it via the linked field.
    bill = po.invoice_ids[-1] if po.invoice_ids else False
    
    if bill:
        bill.invoice_date = fields.Date.context_today(self)
        bill.action_post()
        
    return bill
```

## Best Practices ✅
- Similar to Sales, never write directly to the `state` field. Use `button_confirm()` so that incoming stock receipts (`stock.picking`) are generated automatically.
- Note the difference in field names compared to Sales: it's `product_qty` (not `product_uom_qty`) and `product_uom` (not `product_uom_id`).
