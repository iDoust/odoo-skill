---
name: test-patterns
description: Writing automated tests using TransactionCase.
versions: [17, 18, 19]
---

# Automated Testing

## Quick Reference
Odoo uses Python's `unittest` framework. Tests are usually placed in the `tests/` directory and must start with `test_`.

## Pattern: TransactionCase

`TransactionCase` wraps each test in a database transaction and automatically rolls it back after the test completes.

```python
from odoo.tests.common import TransactionCase, tagged
from odoo.exceptions import UserError

# Tags control when tests are run.
# 'post_install' runs tests after the module is installed.
# '-at_install' prevents it from running during the installation process.
@tagged('post_install', '-at_install')
class TestWorkflowExample(TransactionCase):

    @classmethod
    def setUpClass(cls):
        """setUpClass is called once before any test runs."""
        super(TestWorkflowExample, cls).setUpClass()
        
        # Access the environment via cls.env
        cls.partner = cls.env['res.partner'].create({'name': 'Test Partner'})
        
        # Create a record to be used in multiple tests
        cls.record = cls.env['workflow.example'].create({
            'name': 'Test Record',
            'partner_id': cls.partner.id,
            'state': 'draft'
        })

    def test_01_submit_action(self):
        """Test the state transition from draft to submitted."""
        self.assertEqual(self.record.state, 'draft', "Record should start in draft state.")
        self.record.action_submit()
        self.assertEqual(self.record.state, 'submitted', "State should transition to submitted.")

    def test_02_cancel_restrictions(self):
        """Test that an error is raised when cancelling an approved record."""
        self.record.write({'state': 'approved'})
        
        with self.assertRaises(UserError):
            self.record.action_cancel()

    def test_03_form_onchange(self):
        """Test computed fields and onchanges using Form."""
        from odoo.tests import Form
        
        form = Form(self.env['workflow.example'])
        form.name = 'New Form Test'
        form.partner_id = self.partner
        # When partner is set, an onchange might fill out another field.
        # We can assert that the onchange worked.
        
        # Save the form to create the actual record
        new_record = form.save()
        self.assertTrue(new_record.id)
```

## Running Tests
Run tests from the command line:
```bash
python odoo-bin -d my_database -i my_module --test-enable --stop-after-init
```

## Best Practices ✅
- Put all tests in `my_module/tests/__init__.py` and import them.
- Always use `setUpClass` to prepare master data once. Avoid doing heavy data creation inside `test_` methods.
- Use the `Form` object when testing UI behaviors like `@api.onchange` methods, as they don't trigger when calling `create()` or `write()` directly.
