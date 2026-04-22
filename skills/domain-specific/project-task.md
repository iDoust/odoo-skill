---
name: project-task
description: Working with project.project and project.task.
versions: [17, 18, 19]
---

# Project Management

## Quick Reference
The Project app manages `project.project` (the container) and `project.task` (the work items).

## 1. Creating a Project and Task

```python
def create_project_and_task(self, name, customer):
    # 1. Create the project
    project = self.env['project.project'].create({
        'name': f"Implementation: {name}",
        'partner_id': customer.id,
        'allow_timesheets': True,
    })
    
    # 2. Create tasks within the project
    task = self.env['project.task'].create({
        'name': 'Initial Setup',
        'project_id': project.id,
        'partner_id': customer.id,
        'user_ids': [(4, self.env.uid)], # Assign to current user
        'date_deadline': fields.Date.add(fields.Date.context_today(self), days=7)
    })
    
    return project, task
```

## 2. Logging Timesheets
Timesheets are stored in `account.analytic.line`.

```python
def log_timesheet(self, task, hours, description):
    if not task.project_id:
        raise UserError("Task must belong to a project to log timesheets.")
        
    timesheet = self.env['account.analytic.line'].create({
        'name': description,
        'project_id': task.project_id.id,
        'task_id': task.id,
        'unit_amount': hours, # Time spent in hours
        'employee_id': self.env['hr.employee'].search([('user_id', '=', self.env.uid)], limit=1).id
    })
    return timesheet
```

## Best Practices ✅
- A task can have multiple assignees (v15+), which is why the field is `user_ids` (Many2many) and not `user_id`.
- Always check if the `hr_timesheet` module is installed before attempting to create `account.analytic.line` records directly from a task.
