---
name: product-variants
description: Working with product.template, product.product, and attributes.
versions: [17, 18, 19]
---

# Product Variant Patterns

## Quick Reference
In Odoo, products are split into two levels:
1. `product.template`: The "Master" product (e.g., T-Shirt). Contains fields shared across all variants (name, description, category).
2. `product.product`: The specific "Variant" / SKU (e.g., T-Shirt, Red, M). Contains unique fields (barcode, specific price extra, variant SKU).

## Understanding the Relationship

```python
# 1. From Variant to Template
variant = self.env['product.product'].browse(product_id)
template = variant.product_tmpl_id

# 2. From Template to Variants
template = self.env['product.template'].browse(template_id)
variants = template.product_variant_ids  # One2many to product.product
first_variant = template.product_variant_id  # Many2one (useful if it only has 1 variant)
```

## Adding Custom Fields

When adding fields to products, carefully decide if they belong to the Template or the Variant.

### Adding to Template (Shared)
```python
class ProductTemplate(models.Model):
    _inherit = 'product.template'

    custom_brand = fields.Char(string="Brand") # All sizes/colors will share this brand
```

### Adding to Variant (Unique)
```python
class ProductProduct(models.Model):
    _inherit = 'product.product'

    variant_custom_sku = fields.Char(string="Supplier Variant SKU") # Red-M might have a different SKU than Blue-S
```

### Synchronized Fields (Advanced)
Sometimes you need a field on the variant that falls back to the template if not set.

```python
class ProductProduct(models.Model):
    _inherit = 'product.product'

    variant_weight = fields.Float(string='Variant Weight')

    # Override standard weight field to compute from variant or template
    weight = fields.Float(
        string='Weight',
        compute='_compute_weight',
        inverse='_set_weight',
        store=True,
    )

    @api.depends('product_tmpl_id.weight', 'variant_weight')
    def _compute_weight(self):
        for product in self:
            product.weight = product.variant_weight or product.product_tmpl_id.weight

    def _set_weight(self):
        for product in self:
            product.variant_weight = product.weight
```

## Creating Attributes and Variants via Code

```python
# 1. Create Attributes
color_attr = self.env['product.attribute'].create({
    'name': 'Color',
    'display_type': 'color',
    'create_variant': 'always', # always, dynamic, or no_variant
})

# 2. Create Attribute Values
red = self.env['product.attribute.value'].create({'name': 'Red', 'attribute_id': color_attr.id})
blue = self.env['product.attribute.value'].create({'name': 'Blue', 'attribute_id': color_attr.id})

# 3. Create Template & Assign Attributes
template = self.env['product.template'].create({
    'name': 'T-Shirt',
    'attribute_line_ids': [
        Command.create({
            'attribute_id': color_attr.id,
            'value_ids': [Command.set([red.id, blue.id])],
        })
    ],
})

# Odoo will automatically generate 2 product.product variants in the background.
```

## Finding a Specific Variant
```python
def search_by_attribute(self, template_id, attribute_name, value_name):
    """Find variants with specific attribute value."""
    return self.env['product.product'].search([
        ('product_tmpl_id', '=', template_id),
        ('product_template_attribute_value_ids.product_attribute_value_id.name', '=', value_name),
        ('product_template_attribute_value_ids.attribute_id.name', '=', attribute_name),
    ])
```
