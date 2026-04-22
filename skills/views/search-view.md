---
name: search-view
description: XML structure for search views, filters, and group by.
versions: [17, 18, 19]
---

# Search View Patterns

## Quick Reference
Search views control the search bar, predefined filters, and "Group By" options.

## Pattern

```xml
<odoo>
    <record id="my_model_view_search" model="ir.ui.view">
        <field name="name">my.model.view.search</field>
        <field name="model">my.model</field>
        <field name="arch" type="xml">
            <search string="Search My Model">
                <!-- 1. Searchable Fields (what happens when user types in search bar) -->
                <field name="name" string="Name or Reference" filter_domain="['|', ('name', 'ilike', self), ('ref', 'ilike', self)]"/>
                <field name="partner_id"/>
                <field name="user_id"/>

                <!-- 2. Predefined Filters (appear under "Filters" dropdown) -->
                <separator/> <!-- Separator creates an AND condition between filter groups -->
                <filter string="My Records" name="my_records" domain="[('user_id', '=', uid)]"/>
                <filter string="Draft" name="filter_draft" domain="[('state', '=', 'draft')]"/>
                <filter string="Done" name="filter_done" domain="[('state', '=', 'done')]"/>
                
                <separator/>
                <!-- Date Filters (requires valid date/datetime field) -->
                <filter string="Order Date" name="filter_date" date="date_order"/>
                <filter string="Archived" name="inactive" domain="[('active', '=', False)]"/>

                <!-- 3. Group By options (appear under "Group By" dropdown) -->
                <group expand="0" string="Group By">
                    <filter string="Status" name="group_by_state" context="{'group_by': 'state'}"/>
                    <filter string="Customer" name="group_by_partner" context="{'group_by': 'partner_id'}"/>
                    <filter string="Order Date" name="group_by_date" context="{'group_by': 'date_order'}"/>
                </group>
            </search>
        </field>
    </record>
</odoo>
```

## Best Practices ✅
- Use `filter_domain` to allow searching across multiple fields with a single typed keyword (e.g., searching Name or Reference).
- The `name` attribute of a `<filter>` can be used in window actions to enable the filter by default (`context="{'search_default_my_records': 1}"`).
- Include `<filter string="Archived" name="inactive" domain="[('active', '=', False)]"/>` if your model has an `active` field, so users can find archived records.
