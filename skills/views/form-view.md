---
name: form-view
description: XML structure for form views (header, sheet, notebook, chatter).
versions: [17, 18, 19]
---

# Form View Patterns

## Quick Reference
Form views are used to display and edit a single record.

## Pattern

```xml
<odoo>
    <record id="my_model_view_form" model="ir.ui.view">
        <field name="name">my.model.view.form</field>
        <field name="model">my.model</field>
        <field name="arch" type="xml">
            <form string="My Model">
                <!-- Header: Statusbar & Buttons -->
                <header>
                    <button name="action_confirm" string="Confirm" type="object" class="oe_highlight" invisible="state != 'draft'"/>
                    <button name="action_cancel" string="Cancel" type="object" invisible="state not in ('draft', 'confirmed')"/>
                    <field name="state" widget="statusbar" statusbar_visible="draft,confirmed,done"/>
                </header>
                
                <!-- Sheet: Main Form Body -->
                <sheet>
                    <!-- Smart Buttons (Stat Buttons) -->
                    <div class="oe_button_box" name="button_box">
                        <button name="action_view_related" type="object" class="oe_stat_button" icon="fa-list">
                            <div class="o_stat_info">
                                <field name="related_count" class="o_stat_value"/>
                                <span class="o_stat_text">Related</span>
                            </div>
                        </button>
                    </div>

                    <!-- Title & Badge -->
                    <widget name="web_ribbon" title="Archived" bg_color="text-bg-danger" invisible="active"/>
                    <div class="oe_title">
                        <h1>
                            <field name="name" readonly="1"/>
                        </h1>
                    </div>

                    <!-- Main Fields -->
                    <group>
                        <group>
                            <field name="partner_id"/>
                            <field name="date_order"/>
                        </group>
                        <group>
                            <field name="company_id" groups="base.group_multi_company"/>
                            <field name="active" invisible="1"/>
                        </group>
                    </group>

                    <!-- Notebook (Tabs) -->
                    <notebook>
                        <page string="Lines" name="lines">
                            <field name="line_ids">
                                <list editable="bottom">
                                    <field name="product_id"/>
                                    <field name="quantity"/>
                                </list>
                            </field>
                        </page>
                        <page string="Other Info" name="other_info">
                            <group>
                                <field name="description"/>
                            </group>
                        </page>
                    </notebook>
                </sheet>
                
                <!-- Chatter (Requires mail.thread & mail.activity.mixin) -->
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="activity_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>
</odoo>
```

## Version Differences
- **Odoo 17+:** Uses `invisible="state != 'draft'"` instead of the legacy `attrs="{'invisible': ...}"`.
- **Odoo 17+:** Bootstrap 5 classes (e.g., `text-bg-danger` instead of `bg-danger`).

## Best Practices ✅
- Group fields logically inside `<group><group>...</group><group>...</group></group>` to create a 2-column layout.
- Always add `<field name="active" invisible="1"/>` if the model supports archiving, so the ribbon works correctly.
