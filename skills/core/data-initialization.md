---
name: data-initialization
description: Loading initial data (XML/CSV) and handling noupdate="1".
versions: [17, 18, 19]
---

# Data Initialization

## Quick Reference
When installing a module, you often need to insert default records into the database (e.g., Categories, Stages, System Parameters). This is done via XML or CSV data files.

## Pattern: XML Data File (`data/data.xml`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- 
        noupdate="1" means these records are only created when the module is 
        installed for the FIRST time. If the module is upgraded later, these 
        records will NOT be overwritten. This allows users to change the name 
        in the UI without losing their changes on upgrade.
    -->
    <data noupdate="1">
        
        <!-- Creating a default category -->
        <record id="default_my_model_category" model="my.model.category">
            <field name="name">General</field>
            <field name="code">GEN</field>
        </record>

        <!-- Creating a system parameter -->
        <record id="config_parameter_my_api_key" model="ir.config_parameter">
            <field name="key">my_module.api_key</field>
            <field name="value">change_me_in_production</field>
        </record>

        <!-- Triggering a function automatically on install -->
        <function model="my.model" name="_initialize_default_data"/>

    </data>

    <!-- 
        noupdate="0" (Default): These records will be recreated/updated every 
        time the module is upgraded. Used for core structural data that users 
        should not change, like paper formats or cron job definitions.
    -->
    <data noupdate="0">
        
        <record id="paperformat_my_report" model="report.paperformat">
            <field name="name">My Custom Format</field>
            <field name="default" eval="True"/>
            <field name="format">A4</field>
            <field name="orientation">Portrait</field>
            <field name="margin_top">20</field>
            <field name="margin_bottom">20</field>
        </record>

    </data>
</odoo>
```

## Referencing Existing Records
If you need to link a Many2one field to an existing record in another module, use the `ref` attribute:
```xml
<field name="company_id" ref="base.main_company"/>
<field name="user_id" ref="base.user_admin"/>
```

## Best Practices ✅
- Put all your XML data files inside a `data/` folder (e.g., `data/my_model_data.xml`).
- Add the data file to the `data` array in `__manifest__.py`.
- **CRITICAL**: Use `noupdate="1"` for sequences (`ir.sequence`) and default configuration data. If you don't, any changes the user makes in the UI will be wiped out the next time they upgrade the module.
