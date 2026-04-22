# Contributing to `odoo-skill`

We welcome contributions from the community to make this the most comprehensive AI development skill for Odoo! 

Whether you want to add a new pattern, fix a typo, or improve an existing agent prompt, your help is appreciated.

## 🧠 How to Contribute a Pattern

If you've found a great pattern or solution for an Odoo problem that isn't documented here, follow these steps:

1. **Find the Right Folder**: Decide where your pattern belongs in the `skills/` directory (e.g., `core/`, `views/`, `business/`, `domain-specific/`).
2. **Use the Standard Format**: Create a `.md` file using our standard YAML front-matter format:

   ```markdown
   ---
   name: your-pattern-name
   description: A short 1-sentence description of what this solves
   versions: [17, 18, 19] # Remove versions that are not applicable
   ---

   # Your Pattern Title

   ## Quick Reference
   Brief explanation of the pattern.

   ## Pattern
   ```python
   # Your beautifully formatted python code here
   ```
   ```xml
   <!-- Your XML here -->
   ```

   ## Best Practices
   - What should the developer watch out for?
   - Any anti-patterns to avoid?
   ```

3. **Update the Index**: Add your new file to the Pattern Discovery Index in `SKILL.md`.
4. **Submit a Pull Request**: Submit a PR to the `main` branch.

## 🤖 Contributing to Agents

If you want to improve how the AI behaves (e.g., adding a new persona to `agents/` or improving rules in `AGENTS.md`):

1. **Test Your Prompt**: Before submitting, test your prompt modifications in Cursor, Windsurf, or Claude to ensure the AI behaves as expected.
2. **Keep it Concise**: AI context windows are large, but attention is limited. Be direct and use clear formatting (Markdown headers, bold text, bullet points).
3. **Focus on Anti-Hallucination**: Always encourage the AI to look at real source code or use the MCP server rather than guessing.

## 🔌 Contributing to MCP Server

The MCP server is located in the `mcp/` folder. It uses the Official Model Context Protocol SDK.
If you add new tools (e.g., `odoo_run_tests` or `odoo_scaffold`), make sure to:
1. Update `mcp/server.js`.
2. Update the `Available MCP Tools` section in `README.md`.
3. Test the tool locally using the Claude Desktop App or Cursor.

Thank you for helping us build the ultimate Odoo AI brain! 🚀
