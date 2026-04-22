---
name: module-structure
description: Standard directory and file structure for Odoo modules.
versions: [17, 18, 19]
---

# Odoo Module Structure

## Quick Reference
Standard Odoo modules follow a strict directory structure.

```text
my_module/
├── __manifest__.py              # REQUIRED: Module metadata
├── __init__.py                  # Imports sub-packages
├── models/
│   ├── __init__.py
│   └── my_model.py              # ORM classes
├── views/
│   ├── my_model_views.xml       # Form/List/Search views
│   └── menu_views.xml           # Menus and Window Actions
├── security/
│   ├── ir.model.access.csv      # Access rights
│   └── security.xml             # Security groups & record rules
├── data/
│   └── sequence_data.xml        # Master data, crons
├── controllers/
│   ├── __init__.py
│   └── main.py                  # HTTP Endpoints
└── static/
    └── src/
        ├── js/                  # JavaScript/OWL
        ├── xml/                 # QWeb Templates for JS
        └── scss/                # Styles
```

## `__init__.py` Patterns

### Root `__init__.py`
```python
from . import models
from . import controllers
from . import wizard
```

### Sub-directory `__init__.py` (e.g., `models/__init__.py`)
```python
from . import my_model
from . import res_partner        # Inherited models
```

## Best Practices ✅
- Keep one model per Python file.
- Name the Python file exactly like the model, replacing dots with underscores (e.g., `sale.order` -> `sale_order.py`).
- Name the XML view file like the model + `_views.xml` (e.g., `sale_order_views.xml`).
