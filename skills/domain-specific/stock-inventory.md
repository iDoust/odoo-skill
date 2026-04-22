---
name: stock-inventory
description: Working with stock.picking, stock.move, and inventory adjustments.
versions: [17, 18, 19]
---

# Stock & Inventory

## Quick Reference
Inventory movements in Odoo are highly complex. They rely on `stock.picking` (The delivery/receipt document) and `stock.move` (The lines representing what moves where).

## 1. Validating a Delivery / Receipt
If you need to automatically validate a picking (e.g., mark a delivery as shipped) via code:

```python
def validate_picking(self, picking):
    if picking.state != 'assigned':
        # assigned means the products are available and reserved.
        picking.action_assign()
    
    # In Odoo, to validate, we must process the quantities
    for move in picking.move_ids:
        move.quantity = move.product_uom_qty # Set done qty = demanded qty (Odoo 17+)
        # Prior to Odoo 17, it was move.quantity_done
        
    # Validate the transfer
    picking.button_validate()
```

## 2. Reading Stock Quantities
To know how much of a product is currently in a specific warehouse/location, query `stock.quant`.

```python
def get_stock_qty(self, product, location):
    # stock.quant holds the exact real-time quantities
    quants = self.env['stock.quant'].search([
        ('product_id', '=', product.id),
        ('location_id', '=', location.id)
    ])
    
    # Sum the quantity
    total_qty = sum(quants.mapped('quantity'))
    available_qty = sum(quants.mapped('available_quantity'))
    
    return total_qty, available_qty
```

## Best Practices ✅
- **NEVER** create `stock.quant` records manually. They are computed automatically based on validated `stock.move` records.
- Creating custom pickings from scratch via code is very complex due to locations, routes, and procurement rules. Whenever possible, let Odoo generate the picking from a Sale or Purchase order, and then manipulate it.
- To do an inventory adjustment via code, create a `stock.quant` with `inventory_quantity` set, and then call `action_apply_inventory()`.
