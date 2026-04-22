---
name: translations-i18n
description: Making modules multi-language compatible (i18n).
versions: [17, 18, 19]
---

# Translations & i18n

## Quick Reference
Odoo is a multi-language system. Hardcoded English text in Python, XML, or JS will not be translated automatically unless properly wrapped.

## Pattern: Python Translations

In Python files, any string that is shown to the user (e.g., in exceptions, warnings, or computed field strings) must be wrapped in `_()`.

```python
from odoo import models, fields, _
from odoo.exceptions import UserError

class MyModel(models.Model):
    _name = 'my.model'

    # The 'string' attribute on fields is automatically translated by Odoo.
    # You DO NOT need to wrap it in _() here.
    name = fields.Char(string='Name')
    
    # Selection values are also translated automatically.
    state = fields.Selection([
        ('draft', 'Draft'),
        ('done', 'Done')
    ], string='Status')

    def action_confirm(self):
        if not self.name:
            # You MUST wrap error messages in _() so they can be translated
            raise UserError(_("You cannot confirm a record without a name."))
            
        # Using variables in translations
        # Always put the variables OUTSIDE the _() function call using %s
        self.message_post(body=_("Record %s was confirmed successfully.") % self.name)
```

## Pattern: XML/QWeb Translations

In XML files (views, reports), plain text nodes are **automatically** picked up by the translation engine.

```xml
<!-- "Submit" will be automatically translatable -->
<button name="action_submit" string="Submit" type="object"/>

<!-- "Hello World" will be automatically translatable -->
<div>Hello World</div>
```

However, if you are passing a string into a QWeb `t-set` or evaluating a python expression in XML, you might need to wrap it:
```xml
<!-- In Odoo 16+, QWeb expressions with strings often need explicit wrapping if they are used as variables -->
<t t-set="my_message" t-value="'This is a message'"/> <!-- Hard to translate -->
```

## Generating the Translation File (.pot)
To allow translators to work, you must export the translation terms:
1. Turn on Developer Mode.
2. Go to Settings -> Translations -> Export Translation.
3. Select your module and click Export.
4. Download the `your_module.pot` file.
5. Place it in `your_module/i18n/your_module.pot`.

To add a specific language (e.g., French), copy the `.pot` file to `your_module/i18n/fr.po` and fill in the `msgstr` values. Odoo will automatically load the `.po` files when the module is installed/upgraded.

## Best Practices ✅
- Never do string concatenation inside the `_()` function: `_("Hello " + name)`. The translation engine will fail to find it. Do `_("Hello %s") % name`.
- Do not translate `_logger` messages. Log files should remain in English for developers.
