---
name: odoo-module-development
description: >
  Comprehensive Odoo module development skill for versions 17, 18, and 19.
  Covers ORM, views, security, OWL, reports, testing, migrations, and
  real-world client customization patterns. Supports Community & Enterprise.
globs: "**/*.{py,xml,csv,js,ts}"
---

# Odoo Custom Module Development Skill

Welcome to the Odoo Development Skill. This serves as the master index for AI agents assisting with Odoo module development for versions 17, 18, and 19.

## ⚠️ CRITICAL WORKFLOW - EXECUTE IN ORDER

### 1. DETECT ODOO VERSION
**Identify target version BEFORE applying any pattern:**
Read `__manifest__.py` in the current directory and extract the version (`X.0.Y.Z`). The first number represents the Odoo version (17, 18, 19).
If the version is provided in the prompt, use that version directly.
If no manifest is found and version is unclear: STOP and ask the user for the version.

### 2. DON'T REINVENT THE WHEEL ⚡
**BEFORE developing ANY new functionality, perform an exhaustive search in this order:**
a) **Odoo Core (Community)**: Check if a similar feature exists in base addons.
b) **Odoo Enterprise**: Check enterprise addons if applicable.
c) **OCA (Odoo Community Association)**: Many common business requirements are already solved by OCA modules.
Only develop from scratch if no similar functionality exists or if the customization is highly specific to the client.

### 3. APPLY STRICT DEVELOPMENT STANDARDS
- **Language**: All code, variables, and docstrings MUST be in **ENGLISH**.
- **Python**: PEP8, SOLID, DRY, KISS. No `# -*- coding: utf-8 -*-` needed for Python 3. Use `super()` without arguments.
- **JavaScript/OWL**: Modern ES6+, correct OWL version (v17-18: 2.x, v19: 3.x).
- **XML/Views**: Follow version-specific visibility rules (`invisible` instead of `attrs`).
- **Security**: Always create `ir.model.access.csv` for new models. Prevent SQL injection. Do not abuse `sudo()`.

### 4. LOAD RELEVANT CONTEXT (PROGRESSIVE LOADING)
Do not guess syntax. Read the appropriate files based on the keywords in the user's request.

---

## 📚 PATTERN DISCOVERY INDEX

When the user asks for specific functionality, search the `skills/` directory based on these keywords. Load the matching file(s) before generating code.

| Intent / Keywords | Pattern File |
|-------------------|--------------|
| **CORE PATTERNS** | |
| module structure, init, layout | `skills/core/module-structure.md` |
| manifest, depends, version, metadata | `skills/core/manifest-guide.md` |
| model, _name, _description, _order | `skills/core/model-patterns.md` |
| fields, char, selection, many2one, types | `skills/core/field-types.md` |
| computed, depends, inverse, store | `skills/core/computed-fields.md` |
| constraint, validation, _sql_constraints | `skills/core/constraints.md` |
| inherit, extend, override, _inherits | `skills/core/inheritance.md` |
| crud, search, domain, create, write | `skills/core/orm-methods.md` |
| env, sudo, context, company, user | `skills/core/environment-context.md` |
| config, settings, res.config.settings, parameter | `skills/core/config-settings.md` |
| data, xml, csv, noupdate, initial | `skills/core/data-initialization.md` |
| translate, i18n, language, string | `skills/core/translations-i18n.md` |
| **VIEWS & UI** | |
| form, header, sheet, chatter | `skills/views/form-view.md` |
| list, tree, columns, editable | `skills/views/list-view.md` |
| kanban, templates, cards | `skills/views/kanban-view.md` |
| search, filter, group by | `skills/views/search-view.md` |
| xpath, position, inherit_id | `skills/views/view-inheritance.md` |
| widgets, statusbar, badge, monetary | `skills/views/widgets.md` |
| invisible, readonly, attrs, visibility | `skills/views/dynamic-visibility.md` |
| **BUSINESS LOGIC** | |
| workflow, state, approval, statusbar | `skills/business/workflow-states.md` |
| wizard, transient, dialog, popup | `skills/business/wizard-patterns.md` |
| report, qweb, pdf, print | `skills/business/report-qweb.md` |
| mail, chatter, activity, message, tracking | `skills/business/mail-chatter.md` |
| sequence, numbering, autonumber | `skills/business/sequence-numbering.md` |
| multi-company, allowed_company_ids | `skills/business/multi-company.md` |
| cron, scheduled action, server action | `skills/business/cron-automation.md` |
| actions, menu, act_window, url | `skills/business/actions-menus.md` |
| **INTEGRATION** | |
| controller, http, route, rest, json | `skills/integration/controller-api.md` |
| xmlrpc, jsonrpc, external api | `skills/integration/external-api.md` |
| webhook, incoming, outbound | `skills/integration/webhook-patterns.md` |
| import, export, csv, excel | `skills/integration/import-export.md` |
| **FRONTEND (OWL & JS)** | |
| owl, component, js, widget, frontend | `skills/frontend/owl-components.md` |
| assets, scss, bundle, web.assets | `skills/frontend/assets-bundling.md` |
| website, portal, public route | `skills/frontend/website-portal.md` |
| **SECURITY** | |
| access rights, ir.model.access.csv | `skills/security/access-rights.md` |
| record rules, ir.rule, domain_force | `skills/security/record-rules.md` |
| security groups, groups_id, field security | `skills/security/groups-permissions.md` |
| **QUALITY & TESTING** | |
| test, unittest, transactioncase | `skills/quality/test-patterns.md` |
| performance, n+1, prefetch, speed | `skills/quality/performance-guide.md` |
| logger, debug, warning, shell | `skills/quality/logging-debugging.md` |
| exception, error, validationerror | `skills/quality/error-handling.md` |
| **DOMAIN SPECIFIC (BUSINESS MODULES)** | |
| accounting, invoice, journal, account.move | `skills/domain-specific/accounting-patterns.md` |
| sale, quotation, order, crm, lead | `skills/domain-specific/sale-crm.md` |
| purchase, procurement, vendor | `skills/domain-specific/purchase-procurement.md` |
| stock, inventory, warehouse, move | `skills/domain-specific/stock-inventory.md` |
| product, variant, template, attribute | `skills/domain-specific/product-variants.md` |
| hr, employee, leave, contract | `skills/domain-specific/hr-employee.md` |
| project, task, timesheet | `skills/domain-specific/project-task.md` |

---

## 🏗️ TEMPLATES & BOILERPLATES
If asked to build standard module structures, copy these templates instead of generating from scratch.
| Scenario | Template File |
|----------|---------------|
| Basic Custom Module (CRUD) | `templates/basic-crud.md` |
| Multi-Stage Approval Flow | `templates/approval-workflow.md` |
| Custom PDF Report | `templates/custom-report.md` |
| Custom REST API Endpoint | `templates/api-integration.md` |

---

## 🗺️ END-TO-END EXAMPLES (WALKTHROUGHS)
If unsure how to architect a complex feature, read these case studies to understand an expert's thought process.
| Case Study | Example File |
|------------|--------------|
| Building a Fleet Maintenance module | `examples/e2e-fleet-management.md` |
| Building a Sales Commission module | `examples/e2e-sales-commission.md` |

---

## ⚡ VERSION-SPECIFIC QUICK REFERENCE

A brief summary of critical breaking changes. Always refer to specific pattern files for details.

| Feature | Odoo 17 | Odoo 18 | Odoo 19 |
|---------|---------|---------|---------|
| **View Visibility** | `invisible="expr"` | `invisible="expr"` | `invisible="expr"` |
| **List View Tag** | `<tree>` | `<list>` | `<list>` |
| **Create Method** | `@api.model_create_multi` | `@api.model_create_multi` | `@api.model_create_multi` |
| **SQL Queries** | `cr.execute()` | `SQL()` builder recommended | `SQL()` builder required |
| **Type Hints** | Optional | Recommended | Required |
| **OWL Version** | 2.x | 2.x | 3.x |
| **Constraints** | `_sql_constraints` | `_sql_constraints` | `models.Constraint()` |
| **Aggregation** | `group_operator=` | `aggregator=` | `aggregator=` |
| **Delete Hook** | Override `unlink()` | `@api.ondelete(at_uninstall=False)` | `@api.ondelete(at_uninstall=False)` |

## 🚀 AGENT INSTRUCTIONS
Before executing any task, ALWAYS read `AGENTS.md` for foundational knowledge and instructions.
