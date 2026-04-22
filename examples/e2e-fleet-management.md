---
name: e2e-fleet-management
description: End-to-end walkthrough for building a custom Fleet Management add-on.
---

# End-to-End Walkthrough: Fleet Maintenance Module

## Scenario
The client wants to manage their internal vehicle fleet maintenance. They need a custom module where drivers can log maintenance requests, mechanics can approve them and log the costs, and managers can view reports.

## Thought Process & Architecture

1.  **Core Model (`fleet.maintenance`):** We need a new standalone model. It will need a workflow state (Draft -> Approved -> Done -> Cancelled).
2.  **Dependencies:** We will depend on `mail` (for chatter) and `fleet` (to link to existing Odoo vehicles).
3.  **Inheritance:** We will inherit the existing `fleet.vehicle` model to add a "Smart Button" showing how many maintenance logs exist for that vehicle.
4.  **Security:** 
    *   Drivers (Base Users) can only create and read their own requests.
    *   Mechanics (Custom Group) can approve and read all requests.

## Implementation Steps

### Step 1: `__manifest__.py` Setup
*   `depends`: `['base', 'mail', 'fleet']`
*   `data`: Load security files first, then views, then menus.

### Step 2: Security Setup (`security/security.xml` & `ir.model.access.csv`)
*   Create a group `<record id="group_fleet_mechanic" model="res.groups">`.
*   In CSV: Give base users `read, create` rights. Give mechanics `read, write, create, unlink` rights.
*   Record Rule: Create a rule `[('create_uid', '=', user.id)]` applied to base users so they only see their own records.

### Step 3: Create the Core Model
*   Fields: `name` (sequence), `vehicle_id` (Many2one to `fleet.vehicle`), `description`, `cost` (Float), `state` (Selection), `mechanic_id` (Many2one to `res.users`).
*   Action methods: `action_approve()` which enforces that the `cost` must be `> 0`.

### Step 4: Create Views
*   **Form View:** Include `header` with statusbar and buttons. Use `invisible="state != 'draft'"` to hide/show buttons. Put `cost` in a group and make it `readonly="state == 'done'"`.
*   **List View:** Show `name`, `vehicle_id`, `cost`, and `state` (using `widget="badge"`).
*   **Search View:** Add predefined filters like `<filter name="draft" string="Draft" domain="[('state','=','draft')]"/>` and Group By Vehicle.

### Step 5: Inherit Existing Models
*   Extend `fleet.vehicle` via `_inherit = 'fleet.vehicle'`.
*   Add a computed field `maintenance_count` to count linked records.
*   Create an XML View inheritance (`inherit_id`) targeting `fleet.vehicle.form`. Use `<xpath expr="//div[@name='button_box']" position="inside">` to add the smart button.

### Step 6: Polish
*   Add chatter to the bottom of the maintenance form (`mail.thread`, `mail.activity.mixin`).
*   Ensure `name` uses `ir.sequence` in the `create()` override.

## AI Execution Strategy
When executing a request like this, create the folders `models/`, `views/`, `security/`, and `data/` in a single pass. Ensure module architecture strictly follows `skills/core/module-structure.md`.
