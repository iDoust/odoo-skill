---
name: owl-components
description: Odoo Web Library (OWL) component creation and registration.
versions: [17, 18, 19]
---

# OWL Components

## Quick Reference
OWL (Odoo Web Library) is Odoo's custom frontend framework. Odoo 17/18 use OWL 2.x. Odoo 19 uses OWL 3.x.

## Pattern

### 1. XML Template (`static/src/xml/my_component.xml`)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <!-- t-name is the unique identifier for the template -->
    <t t-name="my_module.MyComponent" owl="1">
        <div class="o_my_component p-3">
            <h1>Hello <t t-esc="state.name"/></h1>
            <button class="btn btn-primary" t-on-click="updateName">
                Update Name
            </button>
        </div>
    </t>
</templates>
```

### 2. JavaScript Component (`static/src/js/my_component.js`)
```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class MyComponent extends Component {
    setup() {
        // useState makes the component reactive
        this.state = useState({
            name: "Odoo Developer"
        });
    }

    updateName() {
        this.state.name = "OWL Master";
    }
}

// Attach the template
MyComponent.template = "my_module.MyComponent";

// Register as an action (can be opened via window action)
registry.category("actions").add("my_module.my_component_action", MyComponent);
```

### 3. Window Action to Open the Component (`views/actions.xml`)
```xml
<record id="action_open_my_component" model="ir.actions.client">
    <field name="name">My Custom Dashboard</field>
    <!-- tag must match the registry category add name -->
    <field name="tag">my_module.my_component_action</field>
</record>
```

## Making RPC Calls (Talking to the Backend)
```javascript
import { useService } from "@web/core/utils/hooks";

export class MyComponent extends Component {
    setup() {
        this.orm = useService("orm");
    }

    async loadData() {
        // Equivalent to env['res.partner'].search_read([], ['name'])
        const partners = await this.orm.searchRead("res.partner", [], ["name"]);
        console.log(partners);
        
        // Calling a specific Python method
        const result = await this.orm.call("res.partner", "my_custom_method", [args]);
    }
}
```

## Best Practices ✅
- Always start JS files with `/** @odoo-module **/`. This tells Odoo to process it through its module system.
- Ensure the XML template has `owl="1"` attribute in Odoo 17 (optional in 18+).
- Do not manipulate the DOM directly (e.g., `document.getElementById()`). Use OWL's `useState` or `useRef`.
