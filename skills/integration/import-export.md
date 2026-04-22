---
name: import-export
description: Parsing CSV/Excel files and generating exports.
versions: [17, 18, 19]
---

# Import / Export Patterns

## Quick Reference
Often you need a custom wizard to import complex Excel/CSV files or generate custom export files.

## Pattern: Import Excel via Wizard

Requires `xlrd` or `openpyxl` (standard in Odoo environments).

```python
from odoo import models, fields, _
from odoo.exceptions import UserError
import base64
import io

try:
    import openpyxl
except ImportError:
    openpyxl = None

class ImportWizard(models.TransientModel):
    _name = 'import.wizard'
    _description = 'Import Wizard'

    file = fields.Binary(string="File", required=True)
    filename = fields.Char("Filename")

    def action_import(self):
        if not openpyxl:
            raise UserError(_("The openpyxl library is missing."))
            
        # Decode the base64 file
        file_content = base64.b64decode(self.file)
        
        # Read Excel
        wb = openpyxl.load_workbook(filename=io.BytesIO(file_content), data_only=True)
        sheet = wb.active
        
        row_count = 0
        # Skip header row (min_row=2)
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not row[0]: # Skip empty rows
                continue
                
            name = row[0]
            price = row[1]
            
            self.env['product.product'].create({
                'name': name,
                'list_price': price
            })
            row_count += 1
            
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Import Successful'),
                'message': _('Imported %s records.', row_count),
                'sticky': False,
            }
        }
```

## Pattern: Export CSV via Controller

```python
from odoo import http
from odoo.http import request
import io
import csv

class ExportController(http.Controller):

    @http.route('/my_module/export_csv', type='http', auth='user')
    def export_csv(self, **kwargs):
        records = request.env['sale.order'].search([])
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Order Reference', 'Customer', 'Total'])
        
        for rec in records:
            writer.writerow([
                rec.name,
                rec.partner_id.name or '',
                rec.amount_total
            ])
            
        response = request.make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = 'attachment; filename="orders.csv"'
        
        return response
```

## Best Practices ✅
- For heavy imports, don't use `create()` inside the loop. Build a list of dictionaries (`vals_list`) and call `self.env['model'].create(vals_list)` outside the loop for massive performance gains.
