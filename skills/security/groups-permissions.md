---
name: groups-permissions
description: Creating security groups and applying field-level security.
versions: [17, 18, 19]
---

# Security Groups & Field Security

## Quick Reference
Security groups define roles (e.g., User, Manager). You can use groups to hide menus, views, and specific fields.

## Pattern

### 1. Defining Groups (XML)
Defined in `security/security.xml`.
```xml
<odoo>
    <!-- Define a Category for the Module -->
    <record id="module_category_my_module" model="ir.module.category">
        <field name="name">My Custom App</field>
        <field name="description">Helps you manage custom processes.</field>
        <field name="sequence">10</field>
    </record>

    <!-- Define the User Group -->
    <record id="group_my_user" model="res.groups">
        <field name="name">User</field>
        <field name="category_id" ref="module_category_my_module"/>
        <field name="implied_ids" eval="[(4, ref('base.group_user'))]"/>
    </record>

    <!-- Define the Manager Group -->
    <record id="group_my_manager" model="res.groups">
        <field name="name">Manager</field>
        <field name="category_id" ref="module_category_my_module"/>
        <field name="implied_ids" eval="[(4, ref('my_module.group_my_user'))]"/>
        <field name="users" eval="[(4, ref('base.user_root')), (4, ref('base.user_admin'))]"/>
    </record>
</odoo>
```

### 2. Field-Level Security (Python)
Restrict read/write access to a field to a specific group.
```python
from odoo import models, fields

class MyModel(models.Model):
    _inherit = 'my.model'

    # Only managers can see/edit this field
    secret_code = fields.Char(string='Secret Code', groups='my_module.group_my_manager')
```

### 3. View-Level Security (XML)
Hide elements in the UI based on groups.
```xml
<!-- Hide a button from non-managers -->
<button name="action_approve" string="Approve" type="object" groups="my_module.group_my_manager"/>

<!-- Hide a menu item -->
<menuitem id="menu_configuration" name="Configuration" parent="menu_root" groups="my_module.group_my_manager"/>
```

## Best Practices ✅
- Use `implied_ids` so that when a user becomes a Manager, they automatically get User rights too.
- Add `base.user_root` (OdooBot) and `base.user_admin` (Administrator) to the highest-level group by default so they aren't locked out.
