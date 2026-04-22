---
name: environment-context
description: Using self.env, context, sudo, and company switching.
versions: [17, 18, 19]
---

# Environment & Context

## Quick Reference
`self.env` provides access to the request environment, context, current user, and database cursor.

## Pattern

### 1. Environment Variables
```python
user = self.env.user               # Current user record (res.users)
uid = self.env.uid                 # Current user ID (int)
company = self.env.company         # Current active company (res.company)
companies = self.env.companies     # All active companies for the user (multi-company)
lang = self.env.lang               # Current language code (e.g., 'en_US')
context = self.env.context         # Dictionary of context values
```

### 2. Sudo (Bypass Security)
Use `sudo()` to bypass access rights and record rules. **USE WITH CAUTION.**
```python
# Elevate to superuser
all_records = self.env['my.model'].sudo().search([])

# Sudo as a specific user
user_records = self.env['my.model'].sudo(user.id).search([])
```

### 3. Modifying Context
Context is used to pass arbitrary data, set defaults, or trigger specific behaviors (like language translation).
```python
# Pass a specific context key
new_env = self.with_context(active_test=False) # Include archived records
records = new_env['my.model'].search([])

# Disable tracking during mass creation (saves performance)
self.env['my.model'].with_context(tracking_disable=True).create(vals_list)
```

### 4. Company Switching
```python
# Execute operations in the context of a specific company
company_records = self.with_company(specific_company_id).search([])
```

## Anti-Patterns ❌
- **Never** use `sudo()` to "fix" an `AccessError` if the user is supposed to have access. Fix the security groups instead.
- **Never** use `self.env.cr.execute()` for raw SQL updates that bypass the ORM, unless absolutely required for massive performance optimization (and use `odoo.tools.SQL` in v18+).
