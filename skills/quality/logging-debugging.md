---
name: logging-debugging
description: Using the Odoo logger and debug techniques.
versions: [17, 18, 19]
---

# Logging & Debugging

## Quick Reference
Proper logging is crucial for tracking cron jobs, API calls, and errors. Never use `print()` in production code.

## Pattern: The Python Logger

Always define the logger at the top of the file, directly under the imports.

```python
import logging
from odoo import models, fields

# Standard Python logger initialized with the file's namespace
_logger = logging.getLogger(__name__)

class MyModel(models.Model):
    _name = 'my.model'

    def action_sync(self):
        _logger.info("Starting sync process...")
        
        try:
            # Code here
            records = self.search([])
            _logger.debug("Found %s records to process.", len(records))
            
            for rec in records:
                # ...
                pass
                
        except Exception as e:
            # Use _logger.exception to automatically include the traceback
            _logger.exception("Failed to sync records due to an error: %s", str(e))
```

## Logging Levels
- `_logger.debug(...)`: Only shows up if Odoo is run with `--log-level=debug`. Use for verbose data.
- `_logger.info(...)`: Standard informational messages (e.g., cron started/finished).
- `_logger.warning(...)`: Something went wrong, but the system recovered.
- `_logger.error(...)`: A significant error occurred.
- `_logger.exception(...)`: An error occurred, prints the full Python stack trace.

## Interactive Debugging (Odoo Shell)

To interactively debug the database, run the Odoo shell:
```bash
python odoo-bin shell -d my_database -c odoo.conf
```
Inside the shell, `self.env` is available directly as `env`.
```python
>>> partner = env['res.partner'].search([('name', '=', 'Deco Addict')], limit=1)
>>> partner.email
'deco.addict@yourcompany.example.com'
>>> env.cr.commit() # Required if you make changes in the shell!
```

## Best Practices ✅
- **Never** use string formatting (`%s`, `f-strings`, `.format()`) before passing it to the logger. Let the logger handle it.
  - ❌ `_logger.info(f"Processed {count} records")`
  - ✅ `_logger.info("Processed %s records", count)`
- Always log external API requests and responses (at the debug level) to facilitate troubleshooting.
