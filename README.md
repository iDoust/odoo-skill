# Odoo Custom Module Development Skill

A comprehensive, platform-agnostic knowledge pack enabling AI coding agents (Gemini, Claude, Cursor, Windsurf, Copilot, etc.) to expertly create and customize Odoo modules for client projects.

Focused on **Odoo 17, 18, and 19**, this skill synthesizes the best patterns, anti-patterns, and coding standards from official Odoo documentation and leading community resources (OCA).

## 🌟 Features

- **Universal Compatibility**: Written entirely in standard Markdown, compatible with any AI assistant that can read workspace files.
- **Progressive Loading**: Structured so AI agents only read the specific patterns they need for a task, avoiding token bloat.
- **Client-Project Oriented**: Focuses on real-world scenarios (approvals, custom reports, API integrations) rather than just isolated patterns.
- **Multi-Version Aware**: Clearly documents breaking changes and syntax differences across Odoo 17, 18, and 19.
- **Enterprise & Community**: Covers patterns applicable to both Odoo editions.

## 📂 Architecture

- `SKILL.md`: The master entry point and pattern index.
- `AGENTS.md`: Foundational Odoo knowledge and strict anti-patterns.
- `rules/`: Coding standards, security checklists, and version differences.
- `skills/`: 40+ on-demand pattern files organized by category (core, views, business, integration, etc.).
- `templates/`: Ready-to-use module scaffolds for common client requests.
- `examples/`: End-to-end walkthroughs of client customizations.

## 🚀 How to Use

Simply place this `odoo-skill` directory into your project workspace or reference it globally in your AI assistant's context.

When asking your AI assistant for help, you can prompt:
> *"Using the guidelines in `odoo-skill/SKILL.md`, please create a custom approval workflow for the sale.order model."*

The AI agent will automatically:
1. Read `SKILL.md` to find the relevant pattern files.
2. Read `AGENTS.md` for foundational rules.
3. Discover and load the workflow and views patterns.
4. Generate highly accurate, version-compliant Odoo code.

## 🤝 Contributing

Contributions to improve patterns, add new version specifics, or expand templates are welcome. Ensure that all code examples follow PEP8 and Odoo Community Association (OCA) standards.
