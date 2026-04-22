## Odoo MCP Server Setup

The `mcp/` directory contains an MCP (Model Context Protocol) server that connects your AI agent directly to a **live Odoo database**.

### What it does
Instead of just reading static documentation, your AI can now:
- **Search records**: "Show me all overdue invoices"
- **Read data**: "What fields does `sale.order` have?"
- **Create records**: "Create a new partner named Acme Corp"
- **Call methods**: "Confirm sale order ID 42"
- **Count records**: "How many open purchase orders do we have?"

### Tools Exposed to AI

| Tool | Description |
|---|---|
| `odoo_search_read` | Search and read records from any model |
| `odoo_get_fields` | Introspect all fields of a model |
| `odoo_create` | Create a new record |
| `odoo_write` | Update existing records |
| `odoo_call_method` | Call any public Odoo method |
| `odoo_count` | Count records matching a domain |
| `odoo_connection_info` | Check connection status |

### Installation

```bash
cd mcp
npm install
cp .env.example .env
# Edit .env with your Odoo credentials
```

### Connecting to Your AI

#### Cursor IDE
Create `.cursor/mcp.json` in your project root:
```json
{
  "mcpServers": {
    "odoo": {
      "command": "node",
      "args": [".odoo-skill/mcp/server.js"],
      "env": {
        "ODOO_URL": "http://localhost:8069",
        "ODOO_DB": "your_database",
        "ODOO_USERNAME": "admin",
        "ODOO_PASSWORD": "your_password"
      }
    }
  }
}
```

#### Claude Desktop
Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):
```json
{
  "mcpServers": {
    "odoo": {
      "command": "node",
      "args": ["/absolute/path/to/.odoo-skill/mcp/server.js"],
      "env": {
        "ODOO_URL": "http://localhost:8069",
        "ODOO_DB": "your_database",
        "ODOO_USERNAME": "admin",
        "ODOO_PASSWORD": "your_password"
      }
    }
  }
}
```

### Security Note
> ⚠️ Use a dedicated Odoo user with **read-only access** for the MCP server in production environments. Never expose your `admin` credentials in shared files.
