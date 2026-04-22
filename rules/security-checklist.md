# Odoo Security Checklist

Security in Odoo is mandatory, not optional. Odoo follows a "default deny" policy. If access rights are not explicitly granted, users will face an `AccessError`.
All AI agents must ensure the following security checks are implemented in any module they generate or modify.

## 1. Access Rights (`ir.model.access.csv`) ✅

Every new model MUST have corresponding access rights defined in `ir.model.access.csv`.

**Checklist:**
- [ ] Is there an `ir.model.access.csv` file inside the `security/` folder?
- [ ] Is the CSV file declared in the `data` list of `__manifest__.py`?
- [ ] Are permissions assigned to specific security groups rather than `base.group_user` (unless it's globally accessible data)?
- [ ] Does the format strictly follow: `id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink`?

## 2. Record Rules (`ir.rule`) ✅

Record rules filter records based on the user's context (e.g., multi-company, own records).

**Checklist:**
- [ ] If the model has a `company_id` field, is there a multi-company record rule implemented?
- [ ] Example Multi-company rule domain: `['|', ('company_id', '=', False), ('company_id', 'in', company_ids)]`
- [ ] If records should only be visible to their creator/owner, is there a rule using `[('user_id', '=', user.id)]`?
- [ ] Are record rules defined in a `security.xml` file and added to `__manifest__.py`?

## 3. Privilege Escalation (`sudo()`) ⚠️

`sudo()` bypasses all access rights and record rules. It is dangerous and must be used with extreme caution.

**Checklist:**
- [ ] Is `sudo()` absolutely necessary? (e.g., public user creating a support ticket).
- [ ] Is every usage of `sudo()` accompanied by a comment explaining *why* it is needed?
- [ ] Does `sudo()` wrap the smallest possible code block?
- [ ] **NEVER** use `sudo()` to fix an `AccessError` if the correct solution is adjusting the user's security groups.

## 4. SQL Injection Prevention 🛡️

**Checklist:**
- [ ] Are you using the ORM for database queries? (The ORM automatically prevents SQL injection).
- [ ] If raw SQL is mandatory for performance, are you using the `SQL()` builder (v18+) or parameterized queries (`%s`)?
- [ ] **NEVER** use Python string formatting (f-strings, `.format()`, or `%`) to insert variables into SQL queries.

## 5. Field-Level Security 🔒

**Checklist:**
- [ ] Are sensitive fields protected using the `groups=` attribute on the field definition?
  - Example: `salary = fields.Float(groups="hr.group_hr_manager")`
- [ ] Does the UI correctly hide fields that the user does not have access to?

## 6. HTTP Controllers Security 🌐

**Checklist:**
- [ ] Are public endpoints explicitly marked with `auth='public'`?
- [ ] Are authenticated endpoints marked with `auth='user'`?
- [ ] Do endpoints properly validate user input before processing?
- [ ] Do public endpoints use `.sudo()` safely to fetch restricted data without exposing private information?
