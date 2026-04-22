# Odoo Indonesia Localization Rules (ID)

When developing Odoo modules for Indonesian clients, AI agents MUST follow these specific localization rules to ensure compliance with Indonesian regulations and business practices.

## 1. Core Modules
Always depend on the base Indonesian localization module if dealing with accounting or taxes.
```python
# __manifest__.py
'depends': ['base', 'l10n_id'],
```

## 2. Tax Rates (PPN)
Indonesia recently updated its Value Added Tax (PPN) from 11% to **12%**.
- Do NOT hardcode `11%` or `12%` in python logic.
- Always fetch the tax rate dynamically from `account.tax` where `tax_group_id` or tags correspond to PPN.
- When creating default data or testing, ensure you use the correct PPN 12% standard.

## 3. NPWP and NIK (Tax ID)
Indonesian companies and individuals use NPWP (Nomor Pokok Wajib Pajak) and NIK (Nomor Induk Kependudukan).
- `res.partner` has a standard `vat` field which is used for NPWP.
- The `l10n_id` module adds validation to the `vat` field for Indonesia (15 or 16 digits).
- If storing NIK (16 digits) separately, use a custom `Char` field but ensure it strips out spaces and dashes before saving.

## 4. e-Faktur and Coretax Integration
- Factur Pajak (e-Faktur) requires a 16-digit serial number (Nomor Seri Faktur Pajak / NSFP).
- Odoo's enterprise `l10n_id_efaktur` handles the generation of CSVs for the DJP (Direktorat Jenderal Pajak) application.
- If extending invoice models, ensure custom fields map properly to the required e-Faktur layout.

## 5. Currency (IDR)
The Indonesian Rupiah (`IDR`) does **not** use decimals in everyday transactions.
- Always configure IDR currency in Odoo with `rounding = 1.0` and decimal places to `0`.
- Do not use float fields for IDR money amounts if strict precision isn't required; rely on `Monetary` fields so Odoo's currency rounding handles the display naturally.

## 6. Formatting Conventions
- **Dates**: `DD/MM/YYYY` is the standard format (e.g., `17/08/1945`).
- **Numbers**: Period `.` for thousands separator, Comma `,` for decimal separator (e.g., `Rp 1.000.000,50`).

## 7. Withholding Taxes (PPh)
- PPh 21 (Income Tax), PPh 23 (Services), PPh 4(2) (Final Tax) are common.
- Odoo handles these via negative taxes or specific tax tags. When generating reports, group by these specific tax tags rather than hardcoding names.
