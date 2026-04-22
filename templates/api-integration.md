---
name: api-integration
description: Boilerplate for exposing Odoo data via a custom REST API.
versions: [17, 18, 19]
---

# Boilerplate: API Integration (Controller)

Use this template when an external system needs to POST data to Odoo or GET data from Odoo in a custom JSON format (bypassing Odoo's standard XML-RPC).

## 1. Controller (`controllers/main.py`)
```python
from odoo import http, _
from odoo.http import request
import json
import logging

_logger = logging.getLogger(__name__)

class ExternalApiController(http.Controller):

    def _validate_api_key(self, api_key):
        """Helper to validate keys stored in System Parameters"""
        valid_key = request.env['ir.config_parameter'].sudo().get_param('my_module.api_key')
        if not valid_key or api_key != valid_key:
            return False
        return True

    @http.route('/api/v1/orders', type='http', auth='public', methods=['GET'], csrf=False)
    def get_orders(self, **kwargs):
        """GET Endpoint: Return list of orders"""
        api_key = request.httprequest.headers.get('Authorization')
        if not self._validate_api_key(api_key):
            return request.make_response(json.dumps({'error': 'Unauthorized'}), status=401)

        try:
            # Use sudo() safely because we validated the API key
            domain = [('state', '=', 'sale')]
            
            # Using search_read for maximum performance instead of search() + loop
            orders = request.env['sale.order'].sudo().search_read(
                domain, 
                ['name', 'date_order', 'amount_total'], 
                limit=100
            )
            
            # Format datetime objects for JSON serialization
            for order in orders:
                if order.get('date_order'):
                    order['date_order'] = order['date_order'].strftime('%Y-%m-%d %H:%M:%S')

            return request.make_response(
                json.dumps({'status': 'success', 'data': orders}),
                headers=[('Content-Type', 'application/json')],
                status=200
            )
        except Exception as e:
            _logger.exception("API Error: get_orders failed.")
            return request.make_response(json.dumps({'error': str(e)}), status=500)


    @http.route('/api/v1/orders', type='http', auth='public', methods=['POST'], csrf=False)
    def create_order(self, **kwargs):
        """POST Endpoint: Create a new order"""
        api_key = request.httprequest.headers.get('Authorization')
        if not self._validate_api_key(api_key):
            return request.make_response(json.dumps({'error': 'Unauthorized'}), status=401)

        try:
            # Parse raw JSON body
            payload = request.httprequest.data
            data = json.loads(payload)
            
            partner_id = data.get('partner_id')
            if not partner_id:
                return request.make_response(json.dumps({'error': 'Missing partner_id'}), status=400)

            # Create record
            new_order = request.env['sale.order'].sudo().create({
                'partner_id': partner_id,
                # Add more fields from data...
            })
            
            return request.make_response(
                json.dumps({'status': 'success', 'order_id': new_order.id}),
                headers=[('Content-Type', 'application/json')],
                status=201
            )
            
        except json.JSONDecodeError:
            return request.make_response(json.dumps({'error': 'Invalid JSON format'}), status=400)
        except Exception as e:
            _logger.exception("API Error: create_order failed.")
            return request.make_response(json.dumps({'error': str(e)}), status=500)
```
