---
name: module-structure
description: Standard layout and initialization pattern for an Odoo custom module
versions: [17, 18, 19]
---

# Module Structure and Initialization

## Quick Reference
Every Odoo module requires a specific directory layout and initialization files to be recognized by the framework.

## Standard Layout
A typical business module should follow this structure:

```
my_module/
├── __init__.py                  # Imports controllers and models
├── __manifest__.py              # Module metadata and dependencies
├── controllers/                 # HTTP/JSON routes
│   ├── __init__.py
│   └── main.py
├── models/                      # Business logic and database schemas
│   ├── __init__.py
│   ├── my_model.py
│   └── inherited_model.py
├── security/                    # Access control
│   ├── ir.model.access.csv      # CRUD rules per model per group
│   └── security_groups.xml      # Category and groups definitions
├── data/                        # Initial data, sequences, cron jobs
│   ├── sequences.xml
│   └── cron_jobs.xml
├── views/                       # UI definitions
│   ├── my_model_views.xml
│   ├── inherited_views.xml
│   └── menu_views.xml
├── report/                      # QWeb PDF/HTML reports
│   ├── my_model_report.xml
│   └── report_templates.xml
├── static/                      # Frontend assets
│   ├── description/             # Module icon.png
│   └── src/                     # JS, XML (OWL), SCSS
│       ├── js/
│       ├── xml/
│       └── scss/
└── wizard/                      # TransientModels (popups)
    ├── __init__.py
    ├── my_wizard.py
    └── my_wizard_views.xml
```

## Initialization Files

### 1. Root `__init__.py`
Must import the directories containing Python code.

```python
# my_module/__init__.py
from . import controllers
from . import models
from . import wizard
```

### 2. Sub-directory `__init__.py`
Must import the specific python files in that directory. Order matters if there are cross-dependencies, though Odoo usually resolves model dependencies automatically.

```python
# my_module/models/__init__.py
from . import my_model
from . import inherited_model
```

## Best Practices
- **Do not** put Python code in the root directory except `__init__.py` and `__manifest__.py`.
- **Do not** import `tests/` in the root `__init__.py`. The testing framework will discover them automatically if the files start with `test_`.
- Always put your module icon at `static/description/icon.png`.
