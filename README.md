# Odoo Custom Module Development Skill

A comprehensive, platform-agnostic AI knowledge base for **Odoo 17, 18, and 19** custom module development.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📚 **48+ Pattern Files** | Ready-to-use code patterns for every aspect of Odoo development |
| 🤖 **4 AI Agent Personas** | Specialized AI modes for Planning, Code Review, Debugging, and Migration |
| 🏗️ **Module Scaffolding** | Generate a complete Odoo module skeleton in one CLI command |
| 🔌 **MCP Server** | Connect AI directly to your live Odoo database |
| 🛡️ **Security Rules** | Auto-generate IDE rules for Cursor, Windsurf, Claude, and Kiro |

---

## 🚀 Quick Install

Install into any Odoo project workspace (generates AI rules + copies knowledge base):

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
│   └── my_custom_module.py # Full model with state machine, chatter
├── views/
│   ├── my_custom_module_views.xml  # Form, List, Search, Action
│   └── my_custom_module_menus.xml
├── security/
│   ├── my_custom_module_security.xml  # User & Manager groups
│   └── ir.model.access.csv
```

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

## 🔌 MCP Server (Live Odoo Integration)

Connect your AI directly to a live Odoo database using the MCP server:

```bash
cd .odoo-skill/mcp
npm install
cp .env.example .env
# Edit .env with your Odoo credentials
```

Then configure your AI IDE to use the MCP server. See `mcp/README.md` for IDE-specific instructions.

**Once connected, ask your AI:**
- *"Show me all overdue invoices"*
- *"What fields does `sale.order` have?"*
- *"Confirm purchase order ID 42"*

---

## 📚 Knowledge Base Structure

```
.odoo-skill/
├── SKILL.md              # Master index (AI reads this first)
├── AGENTS.md             # Foundational Odoo knowledge
├── agents/               # Specialized AI personas
│   ├── odoo-planner.md
│   ├── odoo-code-reviewer.md
│   ├── odoo-debugger.md
│   └── odoo-migrator.md
├── rules/                # Hard rules for all AI agents
│   ├── coding-standard.md
│   ├── security-checklist.md
│   └── version-differences.md
├── skills/               # Granular pattern reference (48+ files)
│   ├── core/             # ORM, fields, models, inheritance...
│   ├── views/            # Form, List, Kanban, Search, XPath...
│   ├── security/         # Access rights, record rules, groups...
│   ├── business/         # Workflows, wizards, reports, crons...
│   ├── integration/      # Controllers, APIs, webhooks...
│   ├── frontend/         # OWL, assets, website/portal...
│   ├── quality/          # Testing, performance, logging...
│   └── domain-specific/  # Accounting, Sales, Stock, HR...
├── templates/            # Boilerplate for common scenarios
│   ├── basic-crud.md
│   ├── approval-workflow.md
│   ├── custom-report.md
│   └── api-integration.md
├── examples/             # End-to-end case studies
└── mcp/                  # MCP Server for live Odoo access
    ├── server.js
    ├── package.json
    └── .env.example
```

---

## 📖 Supported Versions

| Odoo Version | Status |
|---|---|
| **19.0** | ✅ Fully supported |
| **18.0** | ✅ Fully supported |
| **17.0** | ✅ Fully supported |

---

## 📄 License

MIT License — Free to use, modify, and distribute.
