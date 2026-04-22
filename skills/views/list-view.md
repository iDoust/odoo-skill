---
name: list-view
description: XML structure for list (tree) views.
versions: [17, 18, 19]
---

# List View Patterns

## Quick Reference
List views (previously known as tree views) display multiple records in a tabular format.

## Pattern

```xml
<odoo>
    <record id="my_model_view_list" model="ir.ui.view">
        <field name="name">my.model.view.list</field>
        <field name="model">my.model</field>
        <field name="arch" type="xml">
            <!-- 
                Use <list> for Odoo 18+. Use <tree> for Odoo 17.
                Attributes:
                - multi_edit="1": Allow mass editing
                - sample="1": Show dummy data when empty
                - decoration-*: Apply styles based on conditions
            -->
            <list string="My Model" multi_edit="1" sample="1" 
                  decoration-info="state == 'draft'" 
                  decoration-success="state == 'done'" 
                  decoration-muted="state == 'cancel'">
                
                <!-- Fields -->
                <field name="name"/>
                <field name="partner_id"/>
                <field name="date_order" widget="date"/>
                
                <!-- Optional/Hidden by default fields -->
                <field name="company_id" groups="base.group_multi_company" optional="show"/>
                <field name="user_id" widget="many2one_avatar_user" optional="hide"/>
                
                <!-- Monetary/Numeric -->
                <field name="currency_id" column_invisible="True"/>
                <field name="amount_total" sum="Total Amount" widget="monetary"/>
                
                <!-- Status Badge -->
                <field name="state" widget="badge" 
                       decoration-info="state == 'draft'" 
                       decoration-success="state == 'done'"/>
            </list>
        </field>
    </record>
</odoo>
```

## Version Differences
| Version | Difference |
|---------|-----------|
| **17** | Uses `<tree>` tag. E.g., `<tree string="My Model" ...>` |
| **18/19**| Uses `<list>` tag. Odoo officially renamed `tree` to `list`. |
| **17+** | Uses `column_invisible="True"` instead of `invisible="1"` for hiding a column entirely. Use `invisible="condition"` to hide specific cells. |

## Best Practices ✅
- Use `optional="show"` or `optional="hide"` to allow users to toggle columns.
- Use `widget="badge"` with `decoration-*` for status fields to make them visually distinct.
- Add `sum="Label"` to numeric fields to show a total at the bottom of the column.
