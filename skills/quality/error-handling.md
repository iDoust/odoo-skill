---
name: error-handling
description: Odoo exception classes and user messages.
versions: [17, 18, 19]
---

# Error Handling & Exceptions

## Quick Reference
Odoo has specific exception classes designed to show user-friendly popup messages in the web interface.

## 1. UserError
Used to block a user action because they violated a business rule. Shows a simple warning popup.

```python
from odoo.exceptions import UserError
from odoo import _

def action_confirm(self):
    for record in self:
        if not record.line_ids:
            # Always wrap strings in _() to allow them to be translated
            raise UserError(_("You cannot confirm an order without any lines."))
        record.state = 'confirmed'
```

## 2. ValidationError
Used to block the creation or modification of a record due to bad data. Usually raised inside `@api.constrains`.

```python
from odoo.exceptions import ValidationError
from odoo import api, _

@api.constrains('discount')
def _check_discount(self):
    for record in self:
        if record.discount < 0 or record.discount > 100:
            raise ValidationError(_("Discount must be between 0 and 100 percent."))
```

## 3. AccessError
Raised when a user attempts to read/write a record they do not have permissions for. Generally, the ORM handles this automatically, but you can raise it manually.

```python
from odoo.exceptions import AccessError
from odoo import _

def action_manager_approval(self):
    if not self.env.user.has_group('my_module.group_manager'):
        raise AccessError(_("You do not have the required permissions to approve this."))
```

## 4. RedirectWarning
Shows a warning message but also provides a button to redirect the user to a specific menu or action (e.g., to configure a missing setting).

```python
from odoo.exceptions import RedirectWarning
from odoo import _

def action_print(self):
    if not self.company_id.vat:
        action = self.env.ref('base.action_res_company_form')
        raise RedirectWarning(
            _("Your company must have a Tax ID configured before printing."),
            action.id,
            _("Go to Company Settings")
        )
```

## Best Practices ✅
- **Always** import `_` from `odoo` and wrap your exception strings in it: `_("Message")`. This allows the text to be translated into other languages.
- Use standard Python exceptions (`ValueError`, `KeyError`) for internal developer errors, but use Odoo exceptions (`UserError`) for errors the end-user needs to see and understand.
