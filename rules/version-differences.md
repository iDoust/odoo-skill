# Odoo Version Differences (17, 18, 19)

Odoo introduces breaking changes with every major release. This guide outlines the critical syntax and architectural differences between Odoo 17, 18, and 19.

## 1. Quick Comparison Matrix

| Feature | Odoo 17 | Odoo 18 | Odoo 19 |
|---------|---------|---------|---------|
| **View Visibility** | `invisible="expr"` | `invisible="expr"` | `invisible="expr"` |
| **List View Tag** | `<tree>` | `<list>` | `<list>` |
| **Create Method** | `@api.model_create_multi` mandatory | Same | Same |
| **SQL Queries** | `cr.execute()` | `SQL()` builder recommended | `SQL()` builder required |
| **Type Hints** | Optional | Recommended | Required |
| **OWL Version** | 2.x | 2.x | 3.x |
| **Constraints** | `_sql_constraints` | `_sql_constraints` | `models.Constraint()` |
| **Aggregation** | `group_operator=` | `aggregator=` | `aggregator=` |
| **Delete Hook** | Override `unlink()` | `@api.ondelete(at_uninstall=False)` | `@api.ondelete(at_uninstall=False)` |

---

## 2. Detailed Breakdown

### A. View Syntax (XML)
- **Odoo <16 (Legacy):** Used `attrs="{'invisible': [('state', '=', 'draft')]}"`
- **Odoo 17+:** The `attrs` attribute is completely REMOVED. Use direct Python expressions.
  ```xml
  <!-- Odoo 17, 18, 19 -->
  <field name="date_order" invisible="state == 'draft'" readonly="state == 'done'"/>
  ```

- **List vs Tree Tag:**
  - Odoo 17: Mostly used `<tree>`.
  - Odoo 18+: Officially uses `<list>` instead of `<tree>`. While `<tree>` often still works, `<list>` is the standard.

### B. Python Syntax and Annotations
- **Odoo 17:** Standard Python. Type hints are completely optional.
- **Odoo 18:** Type hints for fields are heavily recommended by Odoo R&D for better IDE support.
  ```python
  total_amount: float = fields.Float(string="Total")
  ```
- **Odoo 19:** Type hints become strict requirements in many core classes.

### C. Create Method Decorators
- **Odoo 17+:** `@api.model_create_multi` is mandatory when overriding `create()`. It expects a list of dictionaries (`vals_list`).
  ```python
  @api.model_create_multi
  def create(self, vals_list):
      for vals in vals_list:
          if vals.get('name', _('New')) == _('New'):
              vals['name'] = self.env['ir.sequence'].next_by_code('my.model') or _('New')
      return super().create(vals_list)
  ```

### D. Delete Hook (`unlink`)
- **Odoo 17:** Often implemented by overriding `unlink()`.
- **Odoo 18+:** Use the `@api.ondelete(at_uninstall=False)` decorator instead of overriding `unlink()`.
  ```python
  @api.ondelete(at_uninstall=False)
  def _unlink_except_done(self):
      for record in self:
          if record.state == 'done':
              raise UserError(_('You cannot delete a done record.'))
  ```

### E. Raw SQL Builder
- **Odoo 17:** `self.env.cr.execute("SELECT id FROM res_partner WHERE name = %s", [name])`
- **Odoo 18:** `odoo.tools.SQL` class introduced to prevent SQL injection effectively.
- **Odoo 19:** `SQL()` builder is strictly required. No raw string execution.
  ```python
  from odoo.tools import SQL
  query = SQL("SELECT id FROM res_partner WHERE name = %s", name)
  self.env.cr.execute(query)
  ```

### F. SQL Constraints
- **Odoo 17 & 18:** Use the `_sql_constraints` list of tuples.
- **Odoo 19:** Introduces the `models.Constraint()` class for cleaner definitions.

### G. Multi-Company Checks
- **Odoo 17:** Manual company checks.
- **Odoo 18+:** Use `_check_company_auto = True` at the model level and `check_company=True` on relational fields to automatically enforce company boundaries.
