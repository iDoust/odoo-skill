---
name: external-api
description: Connecting to external APIs from Odoo and Odoo External API (XML-RPC).
versions: [17, 18, 19]
---

# External API Integrations

## Quick Reference
Covers how Odoo calls external services (Outbound) and how external services call Odoo out-of-the-box (Inbound).

## Pattern: Outbound (Odoo calling external APIs)

Always use the Python `requests` library.
```python
import requests
from odoo import models, fields, api, _
from odoo.exceptions import UserError

class ExternalIntegration(models.Model):
    _name = 'external.integration'

    def action_sync_data(self):
        api_key = self.env['ir.config_parameter'].sudo().get_param('my_module.api_key')
        if not api_key:
            raise UserError(_("API Key is not configured."))

        url = "https://api.example.com/v1/data"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            # Set a timeout to prevent hanging the Odoo worker
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status() # Raise exception for 4xx/5xx status codes
            data = response.json()
            
            # Process data
            for item in data:
                # Logic here
                pass
                
        except requests.exceptions.RequestException as e:
            raise UserError(_("Failed to connect to the external API: %s") % str(e))
```

## Pattern: Inbound (External systems calling Odoo via XML-RPC)

Odoo has a built-in XML-RPC/JSON-RPC API. External systems don't necessarily need custom controllers if they just want to read/write data.

Example using Python `xmlrpc.client` from outside Odoo:
```python
import xmlrpc.client

url = 'https://my-odoo-instance.com'
db = 'my_database'
username = 'admin@example.com'
password = 'my_api_key_or_password'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

# 1. Search and Read
partner_ids = models.execute_kw(db, uid, password, 'res.partner', 'search', [[['is_company', '=', True]]])
partners = models.execute_kw(db, uid, password, 'res.partner', 'read', [partner_ids], {'fields': ['name', 'country_id']})

# 2. Create
new_id = models.execute_kw(db, uid, password, 'res.partner', 'create', [{'name': 'New Company'}])
```

## Best Practices ✅
- **Outbound**: Always use `timeout=10` (or similar) in `requests` calls. Without a timeout, a hanging external API will block the Odoo worker process indefinitely, eventually crashing the server.
- Store sensitive API keys in `ir.config_parameter` (System Parameters) or use a dedicated configuration model.
