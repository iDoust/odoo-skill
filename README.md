# Odoo Custom Module Development Skill

![Odoo Versions](https://img.shields.io/badge/Odoo-17%20%7C%2018%20%7C%2019-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

A comprehensive, platform-agnostic AI knowledge base and CLI toolkit for **Odoo 17, 18, and 19** custom module development — built to supercharge AI assistants with real Odoo patterns, source code access, and live database integration.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📚 **70+ Pattern Files** | Deep, richly-documented code patterns for every aspect of Odoo development |
| 🔍 **Live Source Code Search** | AI can search real Odoo 17/18/19 source code on your machine to prevent hallucinations |
| 🤖 **4 AI Agent Personas** | Specialized AI modes for Planning, Code Review, Debugging, and Migration |
| 🏗️ **Module Scaffolding CLI** | Generate a complete Odoo module skeleton in one CLI command |
| 🔌 **MCP Server** | Connect AI directly to your live Odoo database (search, create, read records) |
| 🛡️ **Auto-IDE Rules** | Automatically generate AI rules for Cursor, Windsurf, Claude, and Kiro |

---

## 🚀 Quick Install

Install into any Odoo project workspace. This generates AI rules for your IDE and copies the full knowledge base:

```bash
# Install for all AI assistants (recommended)
npx github:iDoust/odoo-skill init

# Install for a specific AI
npx github:iDoust/odoo-skill init --ai cursor
npx github:iDoust/odoo-skill init --ai windsurf
npx github:iDoust/odoo-skill init --ai claude
```

---

## 🏗️ Module Scaffolding

Generate a complete, production-ready Odoo module skeleton:

```bash
npx github:iDoust/odoo-skill create my_custom_module
```

This generates:
```
my_custom_module/
├── __manifest__.py         # Ready to configure
├── __init__.py
├── models/
│   ├── __init__.py
│   └── my_custom_module.py # Full model with state machine & chatter
├── views/
│   ├── my_custom_module_views.xml  # Form, List, Search, Action
│   └── my_custom_module_menus.xml
├── security/
│   ├── my_custom_module_security.xml  # User & Manager groups
│   └── ir.model.access.csv
```

## 🛠️ CLI Tools (`bin/`)

The `odoo-skill` comes with a powerful command-line interface powered by the scripts in the `bin/` directory.

| Command | Purpose |
|---|---|
| `npx github:iDoust/odoo-skill init` | Configures the current workspace for AI agents by generating `.cursorrules`, `.windsurfrules`, or `CLAUDE.md`. |
| `npx github:iDoust/odoo-skill create <module>` | Scaffolds a complete, production-ready module skeleton. |

*Note: You can run these commands directly via `npx` without needing to clone the repository manually.*

---

## 🤖 AI Agent Personas

Load specialized agents for complex tasks:

```
# In your AI chat (Cursor, Windsurf, Claude, etc.):

"Load .odoo-skill/agents/odoo-planner.md and plan a module for managing employee travel requests"

"Load .odoo-skill/agents/odoo-code-reviewer.md and review this module: [paste code]"

"Load .odoo-skill/agents/odoo-debugger.md — I'm getting this error: [paste traceback]"

"Load .odoo-skill/agents/odoo-migrator.md and migrate this module from v17 to v18"
```

| Agent | Purpose |
|---|---|
| `agents/odoo-planner.md` | Turns requirements into architecture blueprints (before coding) |
| `agents/odoo-code-reviewer.md` | Audits security, performance, and version compliance |
| `agents/odoo-debugger.md` | Diagnoses errors from tracebacks with precise fixes |
| `agents/odoo-migrator.md` | Generates diff-based migration plans between Odoo versions |

---

## 🔌 MCP Server (Live Odoo Integration + Source Code Search)

Connect your AI directly to a live Odoo database **and** enable real-time search of the official Odoo source code to prevent AI hallucinations.

### 1. Setup

```bash
cd .odoo-skill/mcp
npm install
cp .env.example .env
# Edit .env with your credentials and source paths
```

### 2. Configure `.env`

```env
# Live Odoo Database
ODOO_URL=http://localhost:8069
ODOO_DB=my_odoo_db
ODOO_USERNAME=admin
ODOO_PASSWORD=admin

# Local Source Code Paths (for AI source search)
ODOO_17_SOURCE_PATH=\\wsl.localhost\Ubuntu-24.04\home\user\odoo17
ODOO_18_SOURCE_PATH=\\wsl.localhost\Ubuntu-24.04\home\user\odoo18
ODOO_19_SOURCE_PATH=\\wsl.localhost\Ubuntu-24.04\home\user\odoo19
```

### 3. Available MCP Tools

| Tool | Description |
|---|---|
| `odoo_search_read` | Search and read records from any Odoo model |
| `odoo_get_fields` | Introspect field definitions of any model |
| `odoo_create` | Create new records |
| `odoo_write` | Update existing records |
| `odoo_call_method` | Execute server actions (e.g. `action_confirm`) |
| `odoo_count` | Count records matching a domain |
| `odoo_connection_info` | Check connection status |
| `odoo_search_source` | 🔍 **Search real Odoo source code by version** |
| `odoo_read_source_file` | 📖 **Read a specific file from Odoo source code** |

### 4. Ask your AI

```
# Database queries
"Show me all overdue invoices"
"What fields does `sale.order` have?"
"Confirm purchase order ID 42"

# Source code search (anti-hallucination)
"Search the Odoo 18 source code for examples of the statusbar widget"
"Read the file addons/account/models/account_move.py in Odoo 19"
"How does Odoo 17 implement stock reservation? Search the source code."
```

Then configure your AI IDE to use the MCP server. See `mcp/README.md` for IDE-specific instructions.

---

## 📚 Knowledge Base Structure

```
.odoo-skill/
├── SKILL.md                         # Master index — AI reads this first to understand the full skill
├── AGENTS.md                        # Foundational Odoo principles, conventions & architecture rules
├── skills/
│   ├── quick-patterns.md            # Cheat sheet for the most frequent everyday patterns
│   │
│   ├── core/                        # Core ORM, model definitions, fields & Python layer
│   │   ├── model-patterns.md        # _name, _description, _order, base model setup
│   │   ├── field-types.md           # All field types: Char, Many2one, Selection, Binary, etc.
│   │   ├── computed-fields.md       # @api.depends, store=True, inverse, search override
│   │   ├── constraints.md           # @api.constrains, _sql_constraints, ValidationError
│   │   ├── inheritance.md           # _inherit, _inherits, extension vs delegation
│   │   ├── orm-methods.md           # search(), create(), write(), unlink(), browse()
│   │   ├── onchange-dynamic.md      # @api.onchange, dynamic domains, warning return values
│   │   ├── attachment-binary.md     # Binary fields, ir.attachment, file upload patterns
│   │   ├── environment-context.md   # env, sudo(), with_context(), with_company()
│   │   ├── config-settings.md       # res.config.settings, ir.config_parameter
│   │   ├── data-initialization.md   # XML/CSV data files, noupdate, demo data
│   │   └── translations-i18n.md     # _() translation, .po files, language support
│   │
│   ├── views/                       # XML views, UI components & frontend behavior
│   │   ├── form-view.md             # Form layout: header, sheet, chatter, statusbar
│   │   ├── list-view.md             # List/tree view, editable rows, optional columns
│   │   ├── kanban-view.md           # Kanban cards, groupby, progress bars
│   │   ├── search-view.md           # Filters, group-by, favorites, default filters
│   │   ├── view-inheritance.md      # XPath, position, inherit_id best practices
│   │   ├── widgets.md               # Field widgets: monetary, statusbar, badge, many2many_tags
│   │   ├── dynamic-visibility.md    # invisible, readonly, required based on field values
│   │   ├── dashboard-kpi.md         # KPI tiles, graph views, pivot tables, dashboard layout
│   │   ├── actions.md               # ir.actions.act_window, server actions, URL actions
│   │   ├── menus.md                 # ir.ui.menu, menu categories, top/app level navigation
│   │   └── xml-views.md             # Comprehensive XML view reference across all types
│   │
│   ├── business/                    # Business logic, workflows & automation
│   │   ├── workflow-states.md       # State machines, statusbar, approval flows
│   │   ├── wizard-patterns.md       # TransientModel wizards, popup dialogs
│   │   ├── report-qweb.md           # QWeb PDF/HTML reports, ir.actions.report
│   │   ├── mail-chatter.md          # Chatter, activities, message tracking, followers
│   │   ├── sequence-numbering.md    # ir.sequence, auto-increment reference fields
│   │   ├── multi-company.md         # company_id, allowed_company_ids, multi-company rules
│   │   ├── cron-automation.md       # Scheduled actions (cron jobs), ir.cron patterns
│   │   ├── data-migration.md        # Migration scripts, pre/post-migrate, upgrade patterns
│   │   ├── error-handling.md        # UserError, ValidationError, exception strategies
│   │   ├── reports.md               # Advanced report patterns, dynamic data, sub-templates
│   │   └── wizards.md               # Complex wizard flows with multi-step and validation
│   │
│   ├── security/                    # Access control, permissions & data security
│   │   ├── access-rights.md         # ir.model.access.csv, CRUD permissions per group
│   │   ├── record-rules.md          # ir.rule, domain_force, multi-company record rules
│   │   └── groups-permissions.md    # res.groups, field-level security, implied groups
│   │
│   ├── integration/                 # External APIs, controllers & data exchange
│   │   ├── controller-api.md        # HTTP routes, JSON endpoints, REST patterns
│   │   ├── controllers.md           # Advanced controller patterns, authentication middleware
│   │   ├── external-api.md          # XML-RPC / JSON-RPC from external systems
│   │   ├── webhook-patterns.md      # Inbound/outbound webhooks, event triggers
│   │   ├── import-export.md         # CSV/Excel import, data export configuration
│   │   └── portal-access.md         # Customer portal routes, portal user access patterns
│   │
│   ├── frontend/                    # JavaScript, OWL components & web assets
│   │   ├── owl-components.md        # OWL 2.x/3.x components, hooks, lifecycle
│   │   ├── assets-bundling.md       # web.assets bundles, SCSS, JS module loading
│   │   └── website-portal.md        # Website controllers, QWeb templates, public routes
│   │
│   ├── quality/                     # Code quality, testing & debugging
│   │   ├── test-patterns.md         # TransactionCase, tagged tests, test setup patterns
│   │   ├── testing.md               # Comprehensive testing guide with mock and tour tests
│   │   ├── performance-guide.md     # N+1 queries, prefetch_fields, index strategies
│   │   ├── performance.md           # Advanced performance profiling and optimization
│   │   ├── logging-debugging.md     # _logger, shell debugging, odoo.conf log levels
│   │   ├── error-handling.md        # Exception hierarchy, user-facing vs system errors
│   │   └── troubleshooting-guide.md # Common Odoo errors, tracebacks, and how to fix them
│   │
│   └── domain-specific/             # Patterns for specific Odoo business modules
│       ├── accounting-patterns.md   # account.move, journal entries, reconciliation
│       ├── sale-crm.md              # sale.order, CRM pipeline, quotation to invoice flow
│       ├── stock-inventory.md       # stock.picking, moves, warehouses, routes, valuation
│       ├── purchase-procurement.md  # purchase.order, vendor bills, procurement rules
│       ├── product-variants.md      # product.template, product.product, attributes, variants
│       ├── hr-employee.md           # hr.employee, contracts, leaves, payroll integration
│       ├── project-task.md          # project.project, tasks, timesheets, stages
│       ├── lot-serial.md            # Lot & serial number tracking, traceability reporting
│       ├── tax-fiscal.md            # Tax computation, fiscal positions, tax groups
│       ├── uom.md                   # Units of measure, UoM categories, conversion factors
│       └── pricelist-pricing.md     # Pricelists, price rules, discount strategies
│
├── agents/                          # Specialized AI agent personas for complex tasks
│   ├── odoo-planner.md              # Turns business requirements into architecture blueprints
│   ├── odoo-code-reviewer.md        # Audits code for security, quality & version compliance
│   ├── odoo-debugger.md             # Diagnoses tracebacks and runtime errors with fixes
│   └── odoo-migrator.md             # Produces migration plans between Odoo versions
│
├── rules/                           # Strict hard rules all AI agents must follow
│   ├── coding-standard.md           # PEP8, Odoo conventions, naming rules
│   ├── security-checklist.md        # SQL injection, sudo abuse, access control checklist
│   ├── version-differences.md       # Breaking changes: v17 → v18 → v19 reference
│   └── odoo-localization-id.md      # 🇮🇩 Indonesian localization context (PPN 12%, e-Faktur)
│
├── templates/                       # Ready-to-copy boilerplate for common scenarios
│   ├── basic-crud.md                # Minimal CRUD module with form, list, security
│   ├── approval-workflow.md         # Multi-stage approval with email notifications
│   ├── custom-report.md             # QWeb PDF report with company header/footer
│   └── api-integration.md           # REST controller with token authentication
│
├── examples/                        # End-to-end walkthroughs of complete modules
│
└── mcp/                             # MCP Server — live Odoo DB + local source code search
    ├── server.js                    # 9 MCP tools (CRUD, search, source search, introspection)
    ├── package.json
    └── .env.example                 # Template: DB credentials + Odoo source paths
```

---

## 📖 Supported Versions

| Odoo Version | Community | Enterprise |
|---|---|---|
| **19.0** | ✅ Fully supported | ✅ Fully supported |
| **18.0** | ✅ Fully supported | ✅ Fully supported |
| **17.0** | ✅ Fully supported | ✅ Fully supported |

---

## 📄 License

MIT License — Free to use, modify, and distribute.
