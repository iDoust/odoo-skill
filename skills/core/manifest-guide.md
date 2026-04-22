---
name: manifest-guide
description: __manifest__.py metadata structure and keys.
versions: [17, 18, 19]
---

# Module Manifest (`__manifest__.py`)

## Quick Reference
Every Odoo module requires a `__manifest__.py` file at its root.

## Pattern

```python
{
    'name': 'My Custom Module',
    'version': '18.0.1.0.0',         # OdooVersion.Major.Minor.Patch
    'summary': 'Brief description',
    'description': """
        Long description of the module.
    """,
    'category': 'Sales/Sales',       # Category for Apps menu
    'author': 'Your Name',
    'website': 'https://example.com',
    'license': 'LGPL-3',             # Standard for community, OPL-1 for Enterprise
    'depends': [
        'base',                      # Always depend on base at minimum
        'sale_management',
        'mail',
    ],
    'data': [
        # SECURITY FIRST
        'security/security.xml',
        'security/ir.model.access.csv',
        # DATA
        'data/sequence_data.xml',
        # VIEWS
        'views/my_model_views.xml',
        'views/menu_views.xml',
    ],
    'demo': [
        'demo/demo_data.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'my_module/static/src/js/**/*',
            'my_module/static/src/xml/**/*',
            'my_module/static/src/scss/**/*',
        ],
    },
    'installable': True,
    'application': False,            # True only if it's a main app (shows in top Apps)
    'auto_install': False,           # True if it should install automatically when dependencies are installed
}
```

## Best Practices ✅
- Data files are loaded sequentially. Ensure `security.xml` (which defines groups) is loaded BEFORE `ir.model.access.csv` (which uses those groups).
- Views must be loaded AFTER the models/records they reference.
- Menus should be loaded AFTER the actions they trigger.
