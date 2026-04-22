---
name: kanban-view
description: XML structure for kanban views and cards.
versions: [17, 18, 19]
---

# Kanban View Patterns

## Quick Reference
Kanban views display records as cards, often organized into columns by a state or stage field.

## Pattern

```xml
<odoo>
    <record id="my_model_view_kanban" model="ir.ui.view">
        <field name="name">my.model.view.kanban</field>
        <field name="model">my.model</field>
        <field name="arch" type="xml">
            <!-- default_group_by automatically groups cards by this field -->
            <kanban default_group_by="state" class="o_kanban_mobile" sample="1">
                <!-- Fields needed in the template but not explicitly displayed must be declared -->
                <field name="id"/>
                <field name="name"/>
                <field name="state"/>
                <field name="partner_id"/>
                <field name="amount_total"/>
                <field name="currency_id"/>
                
                <!-- Define Kanban Card Template -->
                <templates>
                    <t t-name="kanban-box">
                        <!-- Kanban card container -->
                        <div t-attf-class="oe_kanban_global_click o_kanban_record_has_image_fill">
                            
                            <div class="oe_kanban_details">
                                <!-- Card Header / Title -->
                                <div class="o_kanban_record_top">
                                    <div class="o_kanban_record_headings">
                                        <strong class="o_kanban_record_title">
                                            <field name="name"/>
                                        </strong>
                                    </div>
                                    <!-- Dropdown Menu (optional) -->
                                    <div class="o_dropdown_kanban dropdown">
                                        <a role="button" class="dropdown-toggle o-no-caret btn" data-bs-toggle="dropdown" href="#" aria-label="Dropdown menu" title="Dropdown menu">
                                            <span class="fa fa-ellipsis-v"/>
                                        </a>
                                        <div class="dropdown-menu" role="menu">
                                            <a t-if="widget.editable" role="menuitem" type="edit" class="dropdown-item">Edit</a>
                                            <a t-if="widget.deletable" role="menuitem" type="delete" class="dropdown-item">Delete</a>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Card Body -->
                                <div class="o_kanban_record_body">
                                    <span t-if="record.partner_id.value">
                                        <field name="partner_id"/>
                                    </span>
                                </div>
                                
                                <!-- Card Footer -->
                                <div class="o_kanban_record_bottom">
                                    <div class="oe_kanban_bottom_left">
                                        <field name="amount_total" widget="monetary" options="{'currency_field': 'currency_id'}"/>
                                    </div>
                                    <div class="oe_kanban_bottom_right">
                                        <!-- User Avatar -->
                                        <field name="user_id" widget="many2one_avatar_user"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </t>
                </templates>
            </kanban>
        </field>
    </record>
</odoo>
```

## Best Practices ✅
- Always include `oe_kanban_global_click` on the main `<div>` inside `kanban-box` so the whole card is clickable.
- Structure the card using `o_kanban_record_top`, `o_kanban_record_body`, and `o_kanban_record_bottom` for a clean, standard look.
- Access field values in QWeb (`t-if`) using `record.field_name.value` or `record.field_name.raw_value`.
