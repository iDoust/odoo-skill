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

### ❌ DO NOT Write Global CSS
Never write CSS rules that target global Odoo classes like `.o_form_view` directly. This **will break** the UI for all other modules.
Always scope your CSS under a module-specific wrapper class and add that class to the `<form>` tag:

```scss
// ❌ BAD: Affects every form in the entire system
.o_form_view { font-size: 16px; }

// ✅ GOOD: Scoped only to this module
.my_module_form .o_form_view { font-size: 16px; }
```

SCSS files must be placed in `static/src/scss/<module_name>.scss` and registered in `__manifest__.py` under `web.assets_backend`.

### ❌ DO NOT Over-Engineer Custom Modules
Before adding any new class, method, model, or wizard, ask:
1. Does this feature already exist in Odoo? (`_inherit` it, don't rebuild it)
2. Can this be solved with a **server action** or **scheduled action** instead of Python code?
3. Can this be a button on an existing form rather than a new wizard?
4. Does the client **actually** need this config setting, or is a hardcoded value fine?

Keep it simple. The best Odoo code is the code you didn't write.

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

## 7. `Many2many` / `One2many` Command Tuples
When creating or writing to relational fields (x2many), Odoo uses a tuple syntax. This is a common source of bugs if not used correctly.

```python
# (0, 0, vals)  → Create a new record and link it to this one
# (1, id, vals) → Update an existing linked record with new values
# (2, id, 0)    → Remove the link AND delete the linked record from the database
# (3, id, 0)    → Remove the link (unlink), but do NOT delete the record
# (4, id, 0)    → Link an existing record to this one
# (5, 0, 0)     → Unlink all records (like (3) but for all)
# (6, 0, [ids]) → Replace all existing links with this list of IDs

# Example: Replace all lines with a single existing line ID 42
self.line_ids = [(6, 0, [42])]
```

## 8. Best Practice: `@api.model_create_multi`
In Odoo 17+, you MUST always use `@api.model_create_multi` for the `create` method to support bulk creation and improve performance.

```python
# ✅ GOOD (v17, 18, 19)
@api.model_create_multi
def create(self, vals_list):
    for vals in vals_list:
        if not vals.get('name') or vals.get('name') == _('New'):
            vals['name'] = self.env['ir.sequence'].next_by_code('my.model')
    return super().create(vals_list)

# ❌ BAD: Single create method
@api.model
def create(self, vals):
    pass
```

## 9. Record Names (`_rec_name`, `_compute_display_name`)
In Odoo, the way a record is displayed in a Many2one field is governed by its display name.
- **`_rec_name`**: If the descriptive field is not `name`, set `_rec_name = 'my_custom_field'`.
- **`_compute_display_name` (v17+)**: Replaces the old `name_get()`. Override this to customize how the record is formatted.
- **`_name_search`**: Override this to allow users to search for the record using fields other than the `_rec_name`.

```python
# Customize the display name (e.g., "[REF] Title")
@api.depends('reference', 'title')
def _compute_display_name(self):
    for record in self:
        record.display_name = f"[{record.reference}] {record.title}"

# Allow searching by title even if they typed a reference
@api.model
def _name_search(self, name, domain=None, operator='ilike', limit=None, order=None):
    domain = domain or []
    if name:
        domain = ['|', ('reference', operator, name), ('title', operator, name)] + domain
    return self._search(domain, limit=limit, order=order)
```

## 10. Datetime & Timezone Context (UTC vs Local)
**CRITICAL BUG SOURCE**: All Datetime fields in Odoo are stored in the database in **UTC**. They are automatically converted to the user's timezone only in the web UI.
- `fields.Datetime.now()` returns the current UTC time.
- If you need to perform calculations based on the user's local day/time, you must convert it using the context timezone (`self.env.user.tz`).
- `self.env.cr`: Provides direct access to the database cursor for raw SQL (use sparingly). Never commit manually (`self.env.cr.commit()`) in normal business logic, as Odoo handles transactions automatically.

## 11. Action Items for the Agent
1. Determine the Odoo version of the workspace.
2. Read the user's prompt carefully.
3. Consult `SKILL.md` to map the task to the correct skill files.
4. Read the mapped skill files.
5. Generate the code adhering to these rules and the specific patterns found.
