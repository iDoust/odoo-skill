---
name: report-qweb
description: Creating PDF reports using QWeb templates.
versions: [17, 18, 19]
---

# QWeb PDF Reports

## Quick Reference
PDF reports are generated using HTML/XML QWeb templates rendered by wkhtmltopdf.

## Pattern

### 1. Report Action (XML)
Defines the report and adds a "Print" button to the UI.
```xml
<odoo>
    <record id="action_report_example" model="ir.actions.report">
        <field name="name">Example Report</field>
        <field name="model">report.example</field>
        <field name="report_type">qweb-pdf</field>
        <field name="report_name">my_module.report_example_template</field>
        <field name="report_file">my_module.report_example_template</field>
        <field name="print_report_name">'Example - %s' % (object.name)</field>
        <field name="binding_model_id" ref="model_report_example"/>
        <field name="binding_type">report</field>
    </record>
</odoo>
```

### 2. QWeb Template (XML)
The actual structure of the PDF.
```xml
<odoo>
    <template id="report_example_template">
        <!-- Allows printing multiple records at once -->
        <t t-call="web.html_container">
            <t t-foreach="docs" t-as="doc">
                <!-- standard_layout provides company header, footer, and basic CSS -->
                <!-- Use web.external_layout for the standard company letterhead -->
                <t t-call="web.external_layout">
                    <div class="page">
                        
                        <h2>
                            Report for <span t-field="doc.name"/>
                        </h2>
                        
                        <div class="row mt32 mb32">
                            <div class="col-6">
                                <strong>Date:</strong>
                                <p t-field="doc.create_date" t-options='{"widget": "date"}'/>
                            </div>
                            <div class="col-6">
                                <strong>Customer:</strong>
                                <p t-field="doc.partner_id"/>
                            </div>
                        </div>

                        <!-- Data Table -->
                        <table class="table table-sm o_main_table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th class="text-end">Quantity</th>
                                    <th class="text-end">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <t t-foreach="doc.line_ids" t-as="line">
                                    <tr>
                                        <td><span t-field="line.name"/></td>
                                        <td class="text-end"><span t-field="line.quantity"/></td>
                                        <td class="text-end"><span t-field="line.price" t-options='{"widget": "monetary", "display_currency": doc.currency_id}'/></td>
                                    </tr>
                                </t>
                            </tbody>
                        </table>
                        
                    </div>
                </t>
            </t>
        </t>
    </template>
</odoo>
```

## Best Practices ✅
- Odoo injects `docs` (the recordset being printed) into the template automatically. Loop through it using `t-foreach="docs" t-as="doc"`.
- Always wrap your content inside a `<div class="page">`. This is required for pagination to work correctly.
- Use `t-field` instead of `t-esc` for formatting (like dates, numbers, and monetary values).
- Use Bootstrap grid classes (`row`, `col-6`, etc.) for layouts.
