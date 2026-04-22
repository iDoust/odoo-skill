# Odoo ERP Development Context for Agents

> This guide is intended for AI coding agents (Claude, Gemini, Cursor, Windsurf, Copilot, etc.) to understand the architecture, conventions, and development patterns in **Odoo** (Versions 17, 18, 19).
> Read this document to understand the foundational knowledge and anti-patterns before writing or modifying any code.

---

## 1. Core Architecture

Odoo is a full-stack ERP platform (Python + JavaScript/OWL) that is modular and multi-database.
- **Backend**: Python (ORM, Business Logic, HTTP Controllers)
- **Frontend**: JavaScript/TypeScript (OWL Framework)
- **Data/UI**: XML (Views, Actions, Menus, Initial Data), CSV (Access Rights)

### Common Module Structure
```
my_module/
├── __manifest__.py              # REQUIRED: Module metadata
├── __init__.py                  # Imports sub-packages (models, controllers)
├── models/
│   ├── __init__.py
│   └── my_model.py              # ORM classes
├── views/
│   └── my_model_views.xml       # UI Definitions (Form, List, Search)
├── security/
│   ├── ir.model.access.csv      # Access rights per model
│   └── security.xml             # Security groups and Record rules
├── data/
│   └── data.xml                 # Master data, Sequences, Crons
├── controllers/
│   ├── __init__.py
│   └── main.py                  # HTTP Endpoints
└── static/
    └── src/                     # Frontend Assets (JS, XML, SCSS)
```

## 2. Progressive Loading Protocol

DO NOT try to guess Odoo syntax if you are unsure. Odoo changes significantly between versions.
When you receive a task, use the **Pattern Discovery Index in `SKILL.md`** to find the specific markdown files related to your task.
Use your file reading tools to load those specific pattern files to get the exact copy-paste ready code and version-specific differences.

## 3. Source Referencing Rules

When implementing complex or non-obvious Odoo-specific behavior, **ALWAYS** document the Odoo source code location in a comment.
- `addons/mail/` — messaging, activities
- `odoo/models.py` — base ORM behavior
- `odoo/fields.py` — field types

```python
# ✅ GOOD
# Odoo returns many2one fields as [id, display_name] tuples in read().
# @see https://github.com/odoo/odoo/blob/17.0/odoo/fields.py
```

## 4. Fundamental Rules & Anti-Patterns ❌

### ❌ DO NOT Use Raw SQL directly (Unless absolutely necessary)
```python
# ❌ BAD: SQL Injection risk and bypasses ORM security
self.env.cr.execute(f"SELECT * FROM sale_order WHERE state = '{state}'")

# ✅ GOOD: Use ORM
self.env['sale.order'].search([('state', '=', state)])

# ✅ GOOD: If SQL is mandatory (v18+), use the SQL builder
from odoo.tools import SQL
self.env.cr.execute(SQL("SELECT * FROM sale_order WHERE state = %s", state))
```

### ❌ DO NOT Introduce N+1 Query Problems
```python
# ❌ BAD: Querying inside a loop
for order in orders:
    print(order.partner_id.name) # Triggers a DB query for each order

# ✅ GOOD: Use mapped() to leverage prefetching
names = orders.mapped('partner_id.name')
```

### ❌ DO NOT Hardcode Database IDs
```python
# ❌ BAD: Database IDs vary between environments
partner = self.env['res.partner'].browse(1)

# ✅ GOOD: Use XML IDs (External IDs) or search()
partner = self.env.ref('base.res_partner_1')
```

### ❌ DO NOT Abuse `sudo()`
```python
# ❌ BAD: Using sudo() without documenting why
records = self.env['my.model'].sudo().search([])

# ✅ GOOD: Document why privilege escalation is needed
# sudo() required here because public users need to read published products
records = self.env['product.template'].sudo().search([('is_published', '=', True)])
```

### ❌ DO NOT Put Business Logic in `onchange`
`@api.onchange` methods are ONLY triggered in the UI. They do NOT run when records are created or updated via code, RPC, or external API.
- For data consistency, use **Computed Fields** (`@api.depends`) or override `create()` / `write()`.

### ❌ DO NOT Forget Access Rights
Odoo denies access by default. Every new model MUST have an entry in `ir.model.access.csv`. Without it, users (even admins in some contexts) will get an `AccessError`.

## 5. Quick Context: self.env

`self.env` provides access to the execution environment:
- `self.env.user`: Current user record (`res.users`)
- `self.env.company`: Current active company (`res.company`)
- `self.env.context`: Dictionary containing context (e.g., timezone, default values)
- `self.env.ref('module.xml_id')`: Retrieve a record by its External ID

You can modify the environment for subsequent calls:
- `self.sudo()`: Returns a new recordset with admin privileges (bypassing access rights).
- `self.with_context(key='value')`: Returns a new recordset with updated context.
- `self.with_company(company_id)`: Returns a new recordset bound to a specific company.

## 6. Odoo Exceptions

Use appropriate exceptions from `odoo.exceptions`:
- `UserError`: Business logic violations. Displayed nicely to the user.
- `ValidationError`: Data validation failures (usually raised in `@api.constrains`).
- `AccessError`: Permission denied.

```python
from odoo.exceptions import UserError, ValidationError
from odoo import _

# Always wrap messages in _() for translations!
raise UserError(_('You cannot confirm a canceled order.'))
```

## 7. Action Items for the Agent
1. Determine the Odoo version of the workspace.
2. Read the user's prompt carefully.
3. Consult `SKILL.md` to map the task to the correct skill files.
4. Read the mapped skill files.
5. Generate the code adhering to these rules and the specific patterns found.
