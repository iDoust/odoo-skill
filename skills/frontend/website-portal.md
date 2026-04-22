---
name: website-portal
description: Creating public website pages and customer portal extensions.
versions: [17, 18, 19]
---

# Website & Portal

## Quick Reference
Extend the public website or the customer portal ("My Account") using HTTP controllers and QWeb templates.

## Pattern: Adding a Portal Menu & Page

### 1. Python Controller
```python
from odoo import http
from odoo.http import request
from odoo.addons.portal.controllers.portal import CustomerPortal

# Inherit the existing CustomerPortal controller
class MyPortal(CustomerPortal):

    def _prepare_home_portal_values(self, counters):
        values = super()._prepare_home_portal_values(counters)
        # Add a counter for the portal home page
        if 'my_tickets_count' in counters:
            count = request.env['my.ticket'].search_count([('partner_id', '=', request.env.user.partner_id.id)])
            values['my_tickets_count'] = count
        return values

    @http.route(['/my/tickets', '/my/tickets/page/<int:page>'], type='http', auth="user", website=True)
    def portal_my_tickets(self, page=1, **kw):
        partner = request.env.user.partner_id
        domain = [('partner_id', '=', partner.id)]
        
        tickets = request.env['my.ticket'].search(domain)
        
        values = {
            'tickets': tickets,
            'page_name': 'ticket',
        }
        # Render the QWeb template
        return request.render("my_module.portal_my_tickets", values)
```

### 2. QWeb Templates (XML)
These templates are rendered server-side, unlike OWL XML which is rendered client-side.

```xml
<odoo>
    <!-- 1. Add link to the portal home page -->
    <template id="portal_my_home_ticket" name="Show Tickets" inherit_id="portal.portal_my_home" priority="20">
        <xpath expr="//div[hasclass('o_portal_docs')]" position="inside">
            <t t-call="portal.portal_docs_entry">
                <t t-set="title">My Tickets</t>
                <t t-set="url" t-value="'/my/tickets'"/>
                <t t-set="placeholder_count" t-value="'my_tickets_count'"/>
            </t>
        </xpath>
    </template>

    <!-- 2. The page that lists the tickets -->
    <template id="portal_my_tickets" name="My Tickets">
        <t t-call="portal.portal_layout">
            <t t-set="breadcrumbs_searchbar" t-value="True"/>
            
            <t t-call="portal.portal_table">
                <thead>
                    <tr class="active">
                        <th>Ticket #</th>
                        <th>Subject</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <t t-foreach="tickets" t-as="ticket">
                        <tr>
                            <td><span t-field="ticket.name"/></td>
                            <td><span t-field="ticket.subject"/></td>
                            <td><span t-field="ticket.state"/></td>
                        </tr>
                    </t>
                </tbody>
            </t>
        </t>
    </template>
</odoo>
```

## Best Practices ✅
- Use `auth="user"` for portal pages (requires login) and `auth="public"` for public website pages.
- Add `website=True` to the `@http.route` so Odoo applies the website layout, handles multiple websites correctly, and sets up the language environment.
- Use `t-call="portal.portal_layout"` to wrap your portal pages so they look consistent with standard Odoo portal pages.
