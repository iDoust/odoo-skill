---
name: config-settings
description: Creating module configuration settings (res.config.settings).
versions: [17, 18, 19]
---

# Configuration Settings

## Quick Reference
Module settings allow users to configure parameters or toggle features via the "Settings > Configuration" menu. These settings inherit from `res.config.settings`.

## Pattern: Global vs Company Settings

Global settings are stored using `ir.config_parameter`, while company-specific settings are stored on `res.company`.

```python
from odoo import api, fields, models

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    # 1. Global Setting (stored as string in ir.config_parameter)
    my_module_api_key = fields.Char(
        string='API Key',
        config_parameter='my_module.api_key',
    )
    
    my_module_enable_feature = fields.Boolean(
        string='Enable Feature X',
        config_parameter='my_module.enable_feature',
    )

    # 2. Company-Specific Setting (stored on res.company)
    # Must use `related` to a field you added to `res.company`
    my_default_warehouse_id = fields.Many2one(
        'stock.warehouse',
        string='Default Warehouse',
        related='company_id.my_default_warehouse_id',
        readonly=False,
    )

    # 3. Feature Toggle (Enables a security group when checked)
    group_use_advanced_routing = fields.Boolean(
        string='Use Advanced Routing',
        implied_group='my_module.group_advanced_routing',
    )
    
    # 4. Module Toggle (Installs another module when checked)
    # Field name MUST start with `module_`
    module_my_optional_feature = fields.Boolean(
        string='Enable Optional Feature',
    )
```

## Pattern: Extending `res.company`
If you used a company-specific setting, you must extend `res.company`.

```python
class ResCompany(models.Model):
    _inherit = 'res.company'

    my_default_warehouse_id = fields.Many2one(
        'stock.warehouse',
        string='Default Warehouse',
    )
```

## Pattern: Settings View (XML)

```xml
<record id="res_config_settings_view_form" model="ir.ui.view">
    <field name="name">res.config.settings.view.form.inherit.my_module</field>
    <field name="model">res.config.settings</field>
    <field name="inherit_id" ref="base.res_config_settings_view_form"/>
    <field name="arch" type="xml">
        <xpath expr="//form" position="inside">
            <!-- app attribute links this to a specific app in settings menu -->
            <app data-string="My Module" string="My Module" name="my_module" data-key="my_module" groups="base.group_system">
                <block title="General Settings">
                    <setting string="API Configuration" help="Configure external API settings">
                        <field name="my_module_api_key"/>
                    </setting>
                    <setting string="Enable Advanced Routing" help="Enable advanced features for power users">
                        <field name="group_use_advanced_routing"/>
                    </setting>
                </block>
            </app>
        </xpath>
    </field>
</record>
```

## Reading Settings in Code

To read a global config parameter inside a method:
```python
def do_something(self):
    # Retrieve parameter (always returns a string or False/default)
    api_key = self.env['ir.config_parameter'].sudo().get_param('my_module.api_key', default='')
    
    # For booleans
    is_enabled = self.env['ir.config_parameter'].sudo().get_param('my_module.enable_feature') == 'True'
```

To read a company setting:
```python
def do_something(self):
    default_warehouse = self.env.company.my_default_warehouse_id
```
