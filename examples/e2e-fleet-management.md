---
name: e2e-fleet-management
description: End-to-end case study of building a custom Fleet Maintenance module
versions: [17, 18, 19]
---

# Case Study: Fleet Maintenance Module

## Scenario
A client needs a way to track maintenance requests for their vehicle fleet. They already use Odoo's standard `fleet` module, but need to add:
1. A new `fleet.maintenance` model.
2. A state machine (Draft -> In Progress -> Done -> Cancelled).
3. A Smart Button on the `fleet.vehicle` form to see maintenance history.
4. An automated cron job to change state to "Overdue" if not done by scheduled date.

## 1. Model Definition
We create `fleet_maintenance.py` to define the core data structure and state machine.

```python
from odoo import models, fields, api, _
from odoo.exceptions import UserError

class FleetMaintenance(models.Model):
    _name = 'fleet.maintenance'
    _description = 'Fleet Maintenance Request'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Reference', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    vehicle_id = fields.Many2one('fleet.vehicle', string='Vehicle', required=True, tracking=True)
    date_scheduled = fields.Date(string='Scheduled Date', required=True, tracking=True)
    mechanic_id = fields.Many2one('res.partner', string='Mechanic')
    notes = fields.Text(string='Notes')
    
    state = fields.Selection([
        ('draft', 'Draft'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('overdue', 'Overdue'),
        ('cancel', 'Cancelled')
    ], string='Status', default='draft', tracking=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('fleet.maintenance') or _('New')
        return super().create(vals_list)

    def action_in_progress(self):
        self.write({'state': 'in_progress'})

    def action_done(self):
        self.write({'state': 'done'})

    def action_cancel(self):
        self.write({'state': 'cancel'})

    # Cron job method
    @api.model
    def _cron_check_overdue(self):
        overdue_records = self.search([
            ('state', 'in', ['draft', 'in_progress']),
            ('date_scheduled', '<', fields.Date.today())
        ])
        overdue_records.write({'state': 'overdue'})
```

## 2. Inheriting the Base Model
We extend `fleet.vehicle` to add a `One2many` inverse relation and a compute method for the smart button.

```python
class FleetVehicle(models.Model):
    _inherit = 'fleet.vehicle'

    maintenance_ids = fields.One2many('fleet.maintenance', 'vehicle_id', string='Maintenance History')
    maintenance_count = fields.Integer(compute='_compute_maintenance_count')

    @api.depends('maintenance_ids')
    def _compute_maintenance_count(self):
        for vehicle in self:
            vehicle.maintenance_count = len(vehicle.maintenance_ids)

    def action_view_maintenance(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Maintenance Records',
            'view_mode': 'list,form',
            'res_model': 'fleet.maintenance',
            'domain': [('vehicle_id', '=', self.id)],
            'context': {'default_vehicle_id': self.id},
        }
```

## 3. UI Views (Smart Button)
We use XPath to inject the smart button into the existing `fleet.vehicle` form view.

```xml
<record id="view_fleet_vehicle_form_inherit_maintenance" model="ir.ui.view">
    <field name="name">fleet.vehicle.form.inherit.maintenance</field>
    <field name="model">fleet.vehicle</field>
    <field name="inherit_id" ref="fleet.fleet_vehicle_view_form"/>
    <field name="arch" type="xml">
        <xpath expr="//div[@name='button_box']" position="inside">
            <button name="action_view_maintenance" type="object" class="oe_stat_button" icon="fa-wrench">
                <field name="maintenance_count" widget="statinfo" string="Maintenance"/>
            </button>
        </xpath>
    </field>
</record>
```

## 4. The Form View for the New Model
```xml
<record id="view_fleet_maintenance_form" model="ir.ui.view">
    <field name="name">fleet.maintenance.form</field>
    <field name="model">fleet.maintenance</field>
    <field name="arch" type="xml">
        <form string="Maintenance Request">
            <header>
                <button name="action_in_progress" string="Start Work" type="object" invisible="state != 'draft'" class="oe_highlight"/>
                <button name="action_done" string="Mark as Done" type="object" invisible="state != 'in_progress'" class="oe_highlight"/>
                <button name="action_cancel" string="Cancel" type="object" invisible="state in ('done', 'cancel')"/>
                <field name="state" widget="statusbar" statusbar_visible="draft,in_progress,done"/>
            </header>
            <sheet>
                <div class="oe_title">
                    <h1><field name="name"/></h1>
                </div>
                <group>
                    <group>
                        <field name="vehicle_id"/>
                        <field name="mechanic_id"/>
                    </group>
                    <group>
                        <field name="date_scheduled"/>
                    </group>
                </group>
                <notebook>
                    <page string="Notes">
                        <field name="notes"/>
                    </page>
                </notebook>
            </sheet>
            <div class="oe_chatter">
                <field name="message_follower_ids"/>
                <field name="activity_ids"/>
                <field name="message_ids"/>
            </div>
        </form>
    </field>
</record>
```

## Agent Takeaways
1. **Module extension**: Never edit `fleet` directly. We created a separate `fleet_maintenance` module and used `_inherit`.
2. **Smart Buttons**: Required a `One2many` relation, a computed count field, and an action returning a dictionary.
3. **Chatter**: Adding chatter requires inheriting `mail.thread` and `mail.activity.mixin` and adding the XML snippet at the bottom of the form.
