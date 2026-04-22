---
name: record-rules
description: Row-level security using ir.rule.
versions: [17, 18, 19]
---

# Record Rules (`ir.rule`)

## Quick Reference
Record rules provide row-level security. While access rights (`ir.model.access.csv`) grant access to the *table*, record rules restrict which *rows* a user can access based on a domain filter.

## Pattern

### Defined in XML (e.g., `security/security.xml`)
```xml
<odoo>
    <data noupdate="1">
        <!-- Rule: Users can only see their own records -->
        <record id="my_model_rule_personal" model="ir.rule">
            <field name="name">My Model: Personal Records</field>
            <field name="model_id" ref="model_my_model"/>
            <field name="domain_force">[('user_id', '=', user.id)]</field>
            <field name="groups" eval="[(4, ref('base.group_user'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="True"/>
            <field name="perm_create" eval="True"/>
            <field name="perm_unlink" eval="True"/>
        </record>

        <!-- Rule: Managers can see all records -->
        <record id="my_model_rule_manager" model="ir.rule">
            <field name="name">My Model: All Records</field>
            <field name="model_id" ref="model_my_model"/>
            <field name="domain_force">[(1, '=', 1)]</field>
            <field name="groups" eval="[(4, ref('my_module.group_my_manager'))]"/>
        </record>

        <!-- Rule: Multi-company separation -->
        <record id="my_model_comp_rule" model="ir.rule">
            <field name="name">My Model multi-company</field>
            <field name="model_id" ref="model_my_model"/>
            <field name="domain_force">['|', ('company_id', '=', False), ('company_id', 'in', company_ids)]</field>
        </record>
    </data>
</odoo>
```

## Best Practices ✅
- Use `noupdate="1"` for standard rules so they aren't overwritten if the user modifies them via the UI.
- `company_ids` in the multi-company rule refers to the `self.env.companies` context (allowed companies selected by the user).
- If a user belongs to multiple groups that have different rules on the same model, the domains are joined with `OR` (`|`).
