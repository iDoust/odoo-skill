---
name: access-rights
description: ir.model.access.csv configuration.
versions: [17, 18, 19]
---

# Access Rights (`ir.model.access.csv`)

## Quick Reference
Access rights grant CRUD (Create, Read, Update, Delete) permissions on a whole model for specific user groups. They are defined in CSV files inside the `security/` folder.

## Pattern

### 1. File Location
`security/ir.model.access.csv`

### 2. File Format
The CSV must have the exact header: `id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink`.

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_my_model_user,my.model.user,model_my_model,base.group_user,1,0,0,0
access_my_model_manager,my.model.manager,model_my_model,my_module.group_my_manager,1,1,1,1
access_my_model_public,my.model.public,model_my_model,base.group_public,1,0,0,0
```

### 3. Column Explanations
- **id**: A unique XML ID for this access rule.
- **name**: A descriptive name.
- **model_id:id**: The XML ID of the model. Format is `model_` followed by the model name with dots replaced by underscores (e.g., `sale.order` -> `model_sale_order`).
- **group_id:id**: The XML ID of the security group. Leave empty to apply to ALL users (not recommended unless it's public data).
- **perm_...**: `1` to grant, `0` to deny.

## Best Practices ✅
- Odoo denies access by default. If you create a new model and don't add access rights, nobody (except the superuser) can access it.
- Ensure the CSV is declared in the `data` list of `__manifest__.py`, AFTER the `security.xml` file where the groups are defined.
