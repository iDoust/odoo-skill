---
name: custom-report
description: Boilerplate for a basic QWeb PDF Report.
versions: [17, 18, 19]
---

# Boilerplate: Custom QWeb Report

Use this template to quickly generate a PDF document from a model.

## 1. Action & Template (`report/my_model_report.xml`)
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    
    <!-- 1. The Action that adds the "Print" button -->
    <record id="action_report_my_model" model="ir.actions.report">
        <field name="name">My Custom Report</field>
        <field name="model">my.model</field>
        <field name="report_type">qweb-pdf</field>
        <field name="report_name">my_module.report_my_model_template</field>
        <field name="report_file">my_module.report_my_model_template</field>
        <field name="print_report_name">'Report - %s' % (object.name)</field>
        <field name="binding_model_id" ref="my_module.model_my_model"/>
        <field name="binding_type">report</field>
    </record>

    <!-- 2. The Document Structure -->
    <template id="report_my_model_template">
        <!-- html_container handles the basic PDF wrapping -->
        <t t-call="web.html_container">
            <!-- Iterate over selected records -->
            <t t-foreach="docs" t-as="doc">
                <!-- external_layout adds the company header/footer -->
                <t t-call="web.external_layout">
                    
                    <!-- REQUIRED: The 'page' class ensures proper pagination -->
                    <div class="page">
                        <h2>
                            Report: <span t-field="doc.name"/>
                        </h2>
                        
                        <!-- Top Information block -->
                        <div class="row mt32 mb32">
                            <div class="col-6">
                                <strong>Date:</strong>
                                <p t-field="doc.date" t-options='{"widget": "date"}'/>
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
                                    <th>Product</th>
                                    <th class="text-end">Quantity</th>
                                    <th class="text-end">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <t t-foreach="doc.line_ids" t-as="line">
                                    <tr>
                                        <td><span t-field="line.product_id.name"/></td>
                                        <td class="text-end"><span t-field="line.quantity"/></td>
                                        <td class="text-end">
                                            <span t-field="line.price_unit" t-options='{"widget": "monetary", "display_currency": doc.currency_id}'/>
                                        </td>
                                    </tr>
                                </t>
                            </tbody>
                        </table>
                        
                        <!-- Totals Section -->
                        <div class="row justify-content-end">
                            <div class="col-4">
                                <table class="table table-sm">
                                    <tr class="border-black o_total">
                                        <td><strong>Total</strong></td>
                                        <td class="text-end">
                                            <span t-field="doc.amount_total" t-options='{"widget": "monetary", "display_currency": doc.currency_id}'/>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        
                    </div>
                </t>
            </t>
        </t>
    </template>
    
</odoo>
```

Remember to add `'report/my_model_report.xml'` to the `data` list in `__manifest__.py`.
