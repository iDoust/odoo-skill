---
name: basic-crud
description: Complete boilerplate for a standard Odoo model with views and security.
versions: [17, 18, 19]
---

# Boilerplate: Basic CRUD Module

Use this template when asked to create a standard, independent model with basic CRUD (Create, Read, Update, Delete) capabilities.

## 1. Model Definition (`models/my_model.py`)
```python
from odoo import models, fields, api, _

class MyModel(models.Model):
    _name = 'my.model'
    _description = 'My Custom Model'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Reference', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    active = fields.Boolean(default=True)
    partner_id = fields.Many2one('res.partner', string='Customer', required=True, tracking=True)
    date = fields.Date(string='Date', default=fields.Date.context_today)
    notes = fields.Text(string='Notes')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('my.model.sequence') or _('New')
        return super().create(vals_list)
```

## 2. Views and Actions (`views/my_model_views.xml`)
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- List View -->
    <record id="view_my_model_list" model="ir.ui.view">
        <field name="name">my.model.list</field>
        <field name="model">my.model</field>
        <field name="arch" type="xml">
            <!-- Use <tree> for Odoo 17, <list> for Odoo 18+ -->
            <list string="My Models" sample="1">
                <field name="name"/>
                <field name="partner_id"/>
                <field name="date"/>
            </list>
        </field>
    </record>

    <!-- Form View -->
    <record id="view_my_model_form" model="ir.ui.view">
        <field name="name">my.model.form</field>
        <field name="model">my.model</field>
        <field name="arch" type="xml">
            <form string="My Model">
                <sheet>
                    <widget name="web_ribbon" title="Archived" bg_color="text-bg-danger" invisible="active"/>
                    <div class="oe_title">
                        <h1>
                            <field name="name" readonly="1"/>
                        </h1>
                    </div>
                    <group>
                        <group>
                            <field name="partner_id"/>
                        </group>
                        <group>
                            <field name="date"/>
                            <field name="active" invisible="1"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Notes" name="notes">
                            <field name="notes" placeholder="Internal notes..."/>
                        </page>
                    </notebook>
                </sheet>
                <!-- Chatter -->
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="activity_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>

    <!-- Window Action -->
    <record id="action_my_model" model="ir.actions.act_window">
        <field name="name">My Models</field>
        <field name="res_model">my.model</field>
        <field name="view_mode">list,form</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create a new record!
            </p>
        </field>
    </record>
</odoo>
```

## 3. Security (`security/ir.model.access.csv`)
```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_my_model_user,my.model.user,model_my_model,base.group_user,1,1,1,0
access_my_model_manager,my.model.manager,model_my_model,base.group_erp_manager,1,1,1,1
```
