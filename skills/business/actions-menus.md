---
name: actions-menus
description: Creating Window Actions (act_window) and UI Menus.
versions: [17, 18, 19]
---

# Actions and Menus

## Quick Reference
Menus are the navigation links in the top/left bar. Actions dictate what happens when a menu is clicked (usually opening a view).

## Pattern

### 1. Window Action (`ir.actions.act_window`)
Defines the views to open and default filters.
```xml
<odoo>
    <!-- Define the action BEFORE the menu that uses it -->
    <record id="action_my_model" model="ir.actions.act_window">
        <field name="name">My Models</field>
        <field name="res_model">my.model</field>
        <!-- The order of view modes dictates which view opens first -->
        <field name="view_mode">list,form,kanban</field>
        <!-- Default Context: e.g., Set a default value when creating a new record -->
        <field name="context">{'default_state': 'draft'}</field>
        <!-- Default Domain: Force filter the records shown -->
        <field name="domain">[]</field>
        <!-- Help text shown when the list view is empty -->
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first record!
            </p>
        </field>
    </record>
</odoo>
```

### 2. Menu Items (`ir.ui.menu`)
Defines the hierarchical navigation.
```xml
<odoo>
    <!-- Root Menu (Shows in the App Switcher grid) -->
    <menuitem id="menu_my_module_root" 
              name="My App" 
              sequence="10" 
              web_icon="my_module,static/description/icon.png"/>

    <!-- Category Menu (Top bar) -->
    <menuitem id="menu_my_module_category" 
              name="Operations" 
              parent="menu_my_module_root" 
              sequence="10"/>

    <!-- Action Menu (Dropdown item that triggers the action) -->
    <menuitem id="menu_my_model_action" 
              name="My Models" 
              parent="menu_my_module_category" 
              action="action_my_model" 
              sequence="10"/>
</odoo>
```

### 3. Server Action (`ir.actions.server`)
Used to add actions to the "Action" gear dropdown in the UI (e.g., Mass actions).
```xml
<odoo>
    <record id="action_mark_as_done" model="ir.actions.server">
        <field name="name">Mark as Done</field>
        <field name="model_id" ref="model_my_model"/>
        <!-- binding_model_id tells Odoo to show this in the UI Action menu -->
        <field name="binding_model_id" ref="model_my_model"/>
        <field name="binding_view_types">list,form</field>
        <field name="state">code</field>
        <field name="code">
            # 'records' is a predefined variable containing selected items
            for record in records:
                if record.state == 'draft':
                    record.write({'state': 'done'})
        </field>
    </record>
</odoo>
```

## Best Practices ✅
- Order of XML execution matters: Actions must be defined before the menus that reference them.
- Provide clear HTML `help` content in window actions to improve UX for empty states.
