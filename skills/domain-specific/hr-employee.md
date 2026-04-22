---
name: hr-employee
description: Working with HR models (Employee, Contracts, Leaves).
versions: [17, 18, 19]
---

# Human Resources

## Quick Reference
The HR module connects `res.users` (the login account) to `hr.employee` (the physical person, containing private data).

## 1. Linking User to Employee
When customizing HR, you frequently need to find the Employee record of the currently logged-in user.

```python
def get_current_employee(self):
    # Find the employee linked to self.env.user
    employee = self.env['hr.employee'].search([('user_id', '=', self.env.uid)], limit=1)
    if not employee:
        raise UserError("You do not have a linked Employee profile.")
    return employee
```

## 2. Requesting Time Off (`hr.leave`)
```python
def request_leave(self, employee, leave_type, date_from, date_to):
    leave = self.env['hr.leave'].create({
        'employee_id': employee.id,
        'holiday_status_id': leave_type.id,
        'request_date_from': date_from,
        'request_date_to': date_to,
        'name': 'Vacation via Code',
    })
    
    # Compute the number of days automatically
    leave._compute_number_of_days()
    
    # Submit to manager
    leave.action_confirm()
    return leave
```

## Best Practices ✅
- Be extremely careful with security rules in HR. Fields like `barcode`, `pin`, `wage` (on contracts), and private addresses must be protected by specific HR Manager security groups.
- Never grant standard users access to `hr.employee` records globally; rely on Odoo's standard HR record rules to filter visibility.
