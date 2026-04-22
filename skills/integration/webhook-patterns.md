---
name: webhook-patterns
description: Implementing inbound and outbound webhooks securely.
versions: [17, 18, 19]
---

# Webhook Patterns

## Quick Reference
Webhooks allow real-time data sync. Outbound webhooks send data from Odoo to another system. Inbound webhooks receive data from another system.

## Pattern: Inbound Webhook (Receiving)

```python
from odoo import http
from odoo.http import request
import json
import hmac
import hashlib

class WebhookController(http.Controller):

    @http.route('/api/webhook/stripe', type='http', auth='public', methods=['POST'], csrf=False)
    def stripe_webhook(self, **post):
        # 1. Get raw payload and signature
        payload = request.httprequest.data
        sig_header = request.httprequest.headers.get('Stripe-Signature')
        secret = request.env['ir.config_parameter'].sudo().get_param('stripe.webhook.secret')

        # 2. Verify Signature (Security)
        # (Simplified example. Real Stripe validation is slightly different)
        computed_sig = hmac.new(secret.encode('utf-8'), payload, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(computed_sig, sig_header):
            return request.make_response("Invalid signature", status=400)

        # 3. Process the payload
        try:
            event = json.loads(payload)
            if event['type'] == 'payment_intent.succeeded':
                payment_id = event['data']['object']['id']
                # Mark invoice as paid, etc...
                
            return request.make_response(json.dumps({'status': 'success'}), headers=[('Content-Type', 'application/json')])
        except Exception as e:
            return request.make_response(str(e), status=500)
```

## Pattern: Outbound Webhook (Sending)

Send the webhook asynchronously to avoid slowing down the user's UI transaction.

```python
from odoo import models, api
import requests

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def action_confirm(self):
        res = super().action_confirm()
        # Trigger webhook asynchronously
        for order in self:
            order.sudo().with_delay()._send_webhook() # Requires queue_job module OCA
            # OR use native Odoo threading/cron if queue_job isn't available
        return res

    def _send_webhook(self):
        """ This method should be called asynchronously """
        url = self.env['ir.config_parameter'].sudo().get_param('webhook.target.url')
        if not url:
            return
            
        payload = {
            'order_id': self.id,
            'amount': self.amount_total,
            'customer': self.partner_id.name
        }
        
        try:
            requests.post(url, json=payload, timeout=5)
        except requests.exceptions.RequestException:
            # Handle failure (retry logic, log error, etc.)
            pass
```

## Best Practices ✅
- **Inbound**: Always verify the cryptographic signature of the webhook if the provider supports it. Never trust unauthenticated public endpoints.
- **Outbound**: Never send webhooks synchronously inside `create()`, `write()`, or action methods. If the external server is slow, Odoo will hang for the user. Use a job queue (like OCA's `queue_job`) or schedule a cron to process outbound events.
