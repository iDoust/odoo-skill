---
name: controller-api
description: HTTP Controllers for building REST/JSON APIs.
versions: [17, 18, 19]
---

# HTTP Controllers & APIs

## Quick Reference
Controllers handle raw HTTP/JSON requests, allowing you to build custom REST APIs, webhooks, or website pages.

## Pattern

### 1. JSON Controller (API Endpoint)
```python
from odoo import http
from odoo.http import request
import json

class MyApiController(http.Controller):

    # type='json' means Odoo expects a JSON-RPC payload
    # auth='public' means anyone can call it. Other options: 'user', 'none'
    @http.route('/api/my_module/create', type='json', auth='public', methods=['POST'], csrf=False)
    def create_record(self, **kwargs):
        try:
            # When type='json', the JSON body is automatically parsed into kwargs
            name = kwargs.get('name')
            if not name:
                return {'status': 'error', 'message': 'Name is required'}

            # Use sudo() safely since auth is public
            new_record = request.env['my.model'].sudo().create({'name': name})
            
            return {
                'status': 'success',
                'record_id': new_record.id
            }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
```

### 2. HTTP Controller (Raw HTTP / Webhooks)
```python
    # type='http' gives you raw access to the request and response
    @http.route('/api/my_module/webhook', type='http', auth='public', methods=['POST'], csrf=False)
    def handle_webhook(self, **post):
        # Read raw body
        payload = request.httprequest.data
        data = json.loads(payload)
        
        # Process data...
        request.env['my.model'].sudo().create({'note': data.get('event')})
        
        # Must return a valid HTTP Response object
        return request.make_response(
            json.dumps({'status': 'ok'}),
            headers=[('Content-Type', 'application/json')]
        )
```

## Best Practices ✅
- Use `csrf=False` for API endpoints meant to be called by external systems.
- Use `type='json'` if you want Odoo to handle the JSON-RPC parsing and response formatting. The caller must send data in the `{"params": {...}}` format.
- Use `type='http'` for standard REST APIs where you control the exact JSON structure of the body and response.
