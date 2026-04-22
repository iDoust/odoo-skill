#!/usr/bin/env node
/**
 * Odoo MCP Server
 * 
 * This MCP (Model Context Protocol) server bridges AI agents with a live Odoo instance.
 * It exposes Odoo's XML-RPC API as MCP Tools, allowing AI agents to:
 * - Search and read records from any Odoo model
 * - Create, update, and delete records
 * - Execute server actions and methods
 * - Introspect model fields and structure
 *
 * SETUP:
 * 1. cd mcp && npm install
 * 2. Copy .env.example to .env and fill in your Odoo credentials
 * 3. Add this server to your AI's MCP config (see README.md)
 *
 * For Claude Desktop: Add to ~/Library/Application Support/Claude/claude_desktop_config.json
 * For Cursor: Add to .cursor/mcp.json in your project root
 */

'use strict';

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

// Load .env file if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) process.env[match[1].trim()] = match[2].trim();
    }
}

const ODOO_URL = process.env.ODOO_URL || 'http://localhost:8069';
const ODOO_DB = process.env.ODOO_DB || 'odoo';
const ODOO_USERNAME = process.env.ODOO_USERNAME || 'admin';
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || 'admin';

let odooUid = null; // Will be set after authentication

// ─────────────────────────────────────────────────────────────────────────────
// XML-RPC HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function xmlRpcCall(url, method, params) {
    return new Promise((resolve, reject) => {
        // Build XML-RPC request body
        const xmlBody = `<?xml version='1.0'?>
<methodCall>
    <methodName>${method}</methodName>
    <params>
        ${params.map(p => `<param><value>${toXmlValue(p)}</value></param>`).join('\n        ')}
    </params>
</methodCall>`;

        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'Content-Length': Buffer.byteLength(xmlBody),
            },
        };

        const lib = parsedUrl.protocol === 'https:' ? https : http;
        const req = lib.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                // Simple XML-RPC response parser
                try {
                    const result = parseXmlRpcResponse(data);
                    resolve(result);
                } catch (e) {
                    reject(new Error(`XML-RPC parse error: ${e.message}`));
                }
            });
        });

        req.on('error', reject);
        req.write(xmlBody);
        req.end();
    });
}

function toXmlValue(value) {
    if (value === null || value === undefined) return '<nil/>';
    if (typeof value === 'boolean') return `<boolean>${value ? '1' : '0'}</boolean>`;
    if (typeof value === 'number') {
        if (Number.isInteger(value)) return `<int>${value}</int>`;
        return `<double>${value}</double>`;
    }
    if (typeof value === 'string') return `<string>${value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</string>`;
    if (Array.isArray(value)) {
        return `<array><data>${value.map(v => `<value>${toXmlValue(v)}</value>`).join('')}</data></array>`;
    }
    if (typeof value === 'object') {
        const members = Object.entries(value).map(([k, v]) =>
            `<member><name>${k}</name><value>${toXmlValue(v)}</value></member>`
        ).join('');
        return `<struct>${members}</struct>`;
    }
    return `<string>${String(value)}</string>`;
}

function parseXmlRpcResponse(xml) {
    // Extract the value from an XML-RPC response
    if (xml.includes('<fault>')) {
        const faultString = xml.match(/<name>faultString<\/name>\s*<value><string>(.*?)<\/string>/s)?.[1] || 'Unknown fault';
        throw new Error(`Odoo XML-RPC Fault: ${faultString}`);
    }

    // Very simple extraction — for production use a proper XML parser
    const valueMatch = xml.match(/<methodResponse>\s*<params>\s*<param>\s*<value>([\s\S]*?)<\/value>\s*<\/param>/);
    if (!valueMatch) throw new Error('Could not parse XML-RPC response');
    return parseXmlValue(valueMatch[1].trim());
}

function parseXmlValue(xml) {
    if (xml.startsWith('<int>') || xml.startsWith('<i4>')) return parseInt(xml.replace(/<\/?i?n?t?4?>/g, ''));
    if (xml.startsWith('<double>')) return parseFloat(xml.replace(/<\/?double>/g, ''));
    if (xml.startsWith('<boolean>')) return xml.includes('>1<') || xml.includes('>true<');
    if (xml.startsWith('<string>')) return xml.replace(/<\/?string>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    if (xml.startsWith('<nil/>')) return null;
    if (xml.startsWith('<array>')) {
        const items = [];
        const dataMatch = xml.match(/<data>([\s\S]*?)<\/data>/);
        if (dataMatch) {
            const valueMatches = dataMatch[1].matchAll(/<value>([\s\S]*?)<\/value>/g);
            for (const m of valueMatches) items.push(parseXmlValue(m[1].trim()));
        }
        return items;
    }
    if (xml.startsWith('<struct>')) {
        const obj = {};
        const memberMatches = xml.matchAll(/<member>\s*<name>(.*?)<\/name>\s*<value>([\s\S]*?)<\/value>\s*<\/member>/g);
        for (const m of memberMatches) obj[m[1]] = parseXmlValue(m[2].trim());
        return obj;
    }
    // Plain string without tags
    return xml.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

// ─────────────────────────────────────────────────────────────────────────────
// ODOO API WRAPPERS
// ─────────────────────────────────────────────────────────────────────────────

async function authenticate() {
    if (odooUid) return odooUid;
    const uid = await xmlRpcCall(
        `${ODOO_URL}/xmlrpc/2/common`,
        'authenticate',
        [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {}]
    );
    if (!uid) throw new Error(`Odoo authentication failed for user "${ODOO_USERNAME}" on db "${ODOO_DB}"`);
    odooUid = uid;
    return uid;
}

async function odooExecute(model, method, args = [], kwargs = {}) {
    const uid = await authenticate();
    return xmlRpcCall(
        `${ODOO_URL}/xmlrpc/2/object`,
        'execute_kw',
        [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs]
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MCP TOOLS DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

const TOOLS = [
    {
        name: 'odoo_search_read',
        description: 'Search Odoo records and read their fields. Returns a list of matching records.',
        inputSchema: {
            type: 'object',
            properties: {
                model: { type: 'string', description: "Odoo model name (e.g., 'res.partner', 'sale.order')" },
                domain: { type: 'array', description: "Odoo domain filter (e.g., [['state','=','sale']]). Use [] for all records.", default: [] },
                fields: { type: 'array', items: { type: 'string' }, description: "List of field names to return. Use ['name'] for minimal data." },
                limit: { type: 'number', description: 'Maximum number of records to return', default: 10 },
                offset: { type: 'number', description: 'Number of records to skip (for pagination)', default: 0 },
                order: { type: 'string', description: "Field name to sort by (e.g., 'name asc', 'date desc')" },
            },
            required: ['model', 'domain', 'fields'],
        },
    },
    {
        name: 'odoo_get_fields',
        description: "Get the field definitions of an Odoo model. Use this to understand what fields a model has before querying.",
        inputSchema: {
            type: 'object',
            properties: {
                model: { type: 'string', description: "Odoo model name (e.g., 'sale.order')" },
                attributes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: "Field attributes to return (e.g., ['string', 'type', 'required', 'help'])",
                    default: ['string', 'type', 'required', 'help'],
                },
            },
            required: ['model'],
        },
    },
    {
        name: 'odoo_create',
        description: 'Create a new record in Odoo. Returns the ID of the created record.',
        inputSchema: {
            type: 'object',
            properties: {
                model: { type: 'string', description: "Odoo model name (e.g., 'res.partner')" },
                values: { type: 'object', description: "Field values for the new record (e.g., { name: 'John Doe', email: 'john@example.com' })" },
            },
            required: ['model', 'values'],
        },
    },
    {
        name: 'odoo_write',
        description: 'Update existing Odoo records by their IDs.',
        inputSchema: {
            type: 'object',
            properties: {
                model: { type: 'string', description: "Odoo model name" },
                ids: { type: 'array', items: { type: 'number' }, description: "List of record IDs to update" },
                values: { type: 'object', description: "Field values to update" },
            },
            required: ['model', 'ids', 'values'],
        },
    },
    {
        name: 'odoo_call_method',
        description: 'Call any public method on an Odoo model. Use for triggering actions like confirming orders, printing reports, etc.',
        inputSchema: {
            type: 'object',
            properties: {
                model: { type: 'string', description: "Odoo model name" },
                method: { type: 'string', description: "Method name to call (e.g., 'action_confirm', 'action_cancel')" },
                ids: { type: 'array', items: { type: 'number' }, description: "List of record IDs to call the method on" },
                kwargs: { type: 'object', description: "Optional keyword arguments to pass to the method", default: {} },
            },
            required: ['model', 'method', 'ids'],
        },
    },
    {
        name: 'odoo_count',
        description: 'Count the number of records matching a domain in an Odoo model.',
        inputSchema: {
            type: 'object',
            properties: {
                model: { type: 'string', description: "Odoo model name" },
                domain: { type: 'array', description: "Odoo domain filter. Use [] for total count.", default: [] },
            },
            required: ['model', 'domain'],
        },
    },
    {
        name: 'odoo_connection_info',
        description: 'Get information about the connected Odoo instance (URL, database, version).',
        inputSchema: { type: 'object', properties: {} },
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOOL HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

async function handleTool(name, args) {
    switch (name) {
        case 'odoo_search_read': {
            const { model, domain, fields, limit = 10, offset = 0, order } = args;
            const kwargs = { fields, limit, offset };
            if (order) kwargs.order = order;
            const result = await odooExecute(model, 'search_read', [domain], kwargs);
            return JSON.stringify(result, null, 2);
        }

        case 'odoo_get_fields': {
            const { model, attributes = ['string', 'type', 'required', 'help'] } = args;
            const result = await odooExecute(model, 'fields_get', [], { attributes });
            // Return only field names and their properties, sorted
            const summary = Object.fromEntries(
                Object.entries(result)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => [k, v])
            );
            return JSON.stringify(summary, null, 2);
        }

        case 'odoo_create': {
            const { model, values } = args;
            const id = await odooExecute(model, 'create', [values]);
            return JSON.stringify({ success: true, created_id: id });
        }

        case 'odoo_write': {
            const { model, ids, values } = args;
            const result = await odooExecute(model, 'write', [ids, values]);
            return JSON.stringify({ success: result, updated_ids: ids });
        }

        case 'odoo_call_method': {
            const { model, method, ids, kwargs = {} } = args;
            const result = await odooExecute(model, method, [ids], kwargs);
            return JSON.stringify({ success: true, result });
        }

        case 'odoo_count': {
            const { model, domain } = args;
            const count = await odooExecute(model, 'search_count', [domain]);
            return JSON.stringify({ model, domain, count });
        }

        case 'odoo_connection_info': {
            try {
                const uid = await authenticate();
                const version = await xmlRpcCall(`${ODOO_URL}/xmlrpc/2/common`, 'version', []);
                return JSON.stringify({
                    odoo_url: ODOO_URL,
                    database: ODOO_DB,
                    username: ODOO_USERNAME,
                    user_id: uid,
                    server_version: version,
                    status: 'connected',
                });
            } catch (e) {
                return JSON.stringify({
                    odoo_url: ODOO_URL,
                    database: ODOO_DB,
                    username: ODOO_USERNAME,
                    status: 'disconnected',
                    error: e.message,
                });
            }
        }

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MCP SERVER SETUP
// ─────────────────────────────────────────────────────────────────────────────

const server = new Server(
    { name: 'odoo-skill-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const result = await handleTool(name, args || {});
        return { content: [{ type: 'text', text: result }] };
    } catch (error) {
        return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write('Odoo MCP Server running. Waiting for connections...\n');
}

main().catch(err => {
    process.stderr.write(`Fatal error: ${err.message}\n`);
    process.exit(1);
});
