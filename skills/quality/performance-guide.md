---
name: performance-guide
description: Preventing N+1 queries, optimizing search, and bulk operations.
versions: [17, 18, 19]
---

# Performance Guide

## Quick Reference
Poor performance in Odoo is almost always caused by executing database queries inside Python `for` loops (the N+1 Query Problem).

## 1. Avoid N+1 Queries ❌

An N+1 problem occurs when you fetch a list of N records and then perform a database query for *each* record individually.

**❌ BAD (N+1 Queries):**
```python
def action_print_names(self):
    # This loop triggers a query to fetch the partner name FOR EVERY order.
    # If there are 1000 orders, this executes 1001 database queries.
    for order in self:
        print(order.partner_id.name)
```

**✅ GOOD (Prefetching / Mapped):**
```python
def action_print_names(self):
    # mapped() pre-fetches the partner data for all orders in a single query.
    # Total queries: 2
    partner_names = self.mapped('partner_id.name')
    for name in partner_names:
        print(name)
```

## 2. Bulk Creation and Updates ✅

Never use `.create()` or `.write()` inside a loop.

**❌ BAD (Slow Insert):**
```python
for item in data_list:
    self.env['my.model'].create({'name': item['name']})
```

**✅ GOOD (Bulk Insert):**
```python
# Create takes a list of dictionaries in Odoo 14+.
# This executes ONE single INSERT query.
vals_list = [{'name': item['name']} for item in data_list]
self.env['my.model'].create(vals_list)
```

## 3. Limit the Context

When updating records in a cron or batch script, Odoo might trigger recomputations or track changes in the chatter, which slows down the process immensely.

```python
# Disable tracking and context propagation for massive speed boosts
env_fast = self.env['my.model'].with_context(
    tracking_disable=True, 
    mail_notrack=True, 
    mail_create_nolog=True
)
env_fast.create(vals_list)
```

## 4. Search vs Search_Read

If you only need specific fields to export to an API or CSV, do not use `search()` followed by a loop. Use `search_read()`.

**❌ BAD:**
```python
records = self.env['res.partner'].search([])
data = [{'id': r.id, 'name': r.name} for r in records] # Triggers ORM instantiation for every record
```

**✅ GOOD:**
```python
# search_read directly returns a list of dictionaries from the DB query.
# It bypasses Python ORM instantiation completely. Extremely fast.
data = self.env['res.partner'].search_read([], ['id', 'name'])
```

## 5. SQL For Read-Only Reports

For extremely complex reports aggregating millions of rows, bypass the ORM and write raw SQL.
*(Always use `odoo.tools.SQL` in v18+ to prevent SQL injection)*
