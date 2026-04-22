---
name: view-inheritance
description: Using XPath to extend and modify existing views.
versions: [17, 18, 19]
---

# View Inheritance Patterns

## Quick Reference
Modify existing views without changing the original code using `inherit_id` and XPath.

## Pattern

```xml
<odoo>
    <record id="my_model_view_form_inherit" model="ir.ui.view">
        <field name="name">my.model.view.form.inherit</field>
        <field name="model">my.model</field>
        <field name="inherit_id" ref="base_module.my_model_view_form"/>
        <field name="arch" type="xml">
            
            <!-- 1. Add a field AFTER an existing field -->
            <xpath expr="//field[@name='partner_id']" position="after">
                <field name="custom_field_id"/>
            </xpath>

            <!-- 2. Add a field BEFORE an existing field -->
            <xpath expr="//field[@name='date_order']" position="before">
                <field name="priority"/>
            </xpath>

            <!-- 3. REPLACE an existing field -->
            <xpath expr="//field[@name='amount_total']" position="replace">
                <field name="amount_total" widget="monetary" decoration-bf="1"/>
            </xpath>

            <!-- 4. Modify attributes of an existing field (ATTRIBUTES) -->
            <xpath expr="//field[@name='state']" position="attributes">
                <!-- Odoo 17+ invisible syntax -->
                <attribute name="invisible">partner_id == False</attribute>
                <attribute name="readonly">1</attribute>
            </xpath>

            <!-- 5. Add a new page to a notebook -->
            <xpath expr="//notebook" position="inside">
                <page string="Custom Page" name="custom_page">
                    <group>
                        <field name="custom_notes"/>
                    </group>
                </page>
            </xpath>

            <!-- 6. Target specific element structure if names aren't unique -->
            <xpath expr="//group[@name='sale_info']/field[@name='user_id']" position="after">
                <field name="custom_manager_id"/>
            </xpath>

        </field>
    </record>
</odoo>
```

## Best Practices ✅
- Avoid using `position="replace"` unless absolutely necessary. It can break other modules that inherit the same view. Prefer `position="attributes"` to hide elements (`<attribute name="invisible">1</attribute>`).
- If you just need to add a field after another field, you can use the shorthand: `<field name="partner_id" position="after">...</field>` instead of `<xpath>`.
