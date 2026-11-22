
Build a complete, mobile-first multi-tenant SaaS web application named **A's Negosyo POS**, modeled after **BigSeller** for Philippine retail and e-commerce sellers, built with **React, Tailwind CSS, and Supabase** (Auth, PostgreSQL Database, and Storage).

**CRITICAL EXECUTION RULE (3-MILESTONE BUILD):**
Build this project in **3 separate milestones** so the code never cuts off mid-generation. Complete **Milestone 1** first, render the working interactive React Artifact, and **stop and wait for me to say 'Next'** before building Milestone 2.

---

### MILESTONE 1: Core BigSeller POS, QR Scan/Pay & Store Customization (Build This Now)
1. **Branding & Auth UI:** Brand the entire app as **A's Negosyo POS**. Include a Sign Up / Log In screen (structured for Supabase Auth) plus a top **Demo Role Switcher (`Owner` / `Cashier` / `Super Admin`)** so I can test all permissions immediately on my phone.
2. **Role Permissions:** When switched to **Cashier**, automatically hide Net Profit, Cost Prices (COGS), Expense totals, and Store Settings, and disable deleting sales or manually editing stock counts.
3. **BigSeller-Style Mobile Navigation & Modules:**
   - **Dashboard:** Today's gross sales in PHP (₱), order counts (`New`, `To Pack`, `Completed`), low-stock alerts, and True Net Profit (COGS & expense deducted).
   - **POS Terminal & QR/Barcode Scan:** Fast tap-to-add product grid, cart with quantity/discount controls, and a **Scan QR/Barcode** button supporting both phone camera scanning (`html5-qrcode`) and USB/Bluetooth barcode scanners to add items by SKU.
   - **Seller QR Payment Checkout & Branded Receipt:** Support **Cash** (with automatic change calculator) and **QR Ph / GCash / Maya** (displays the seller's own uploaded QR code image and logs the customer's reference number). Generate a shareable/printable digital receipt showing the seller's Store Name, Branch Address, Contact Number, TIN/VAT Note, and Receipt Footer, plus a small **`Powered by A's Negosyo POS`** watermark on the Free plan (automatically removed on paid plans).
   - **Orders & Master Inventory:** BigSeller-style order tabs (`New`, `To Pack`, `Completed`) that automatically deduct stock from Master Inventory upon checkout, plus SKU mapping fields for **Shopee / Lazada / TikTok Shop**.
   - **Store Customization (Settings Tab):** Allows each seller to customize their Store Name, Branch Address, Contact Number, TIN/VAT Note, Receipt Footer, Brand Accent Color, and upload their own **Payment QR Code image** (structured for Supabase Storage).

---

### MILESTONE 2: SaaS Subscription Tiers, PalawanPay QR Ph & Maya Billing + Super Admin (Wait for 'Next')
1. **4-Tier Pricelist & Feature Paywalls (Monthly / Annual Toggle — Annual gives 2 months free):**
   Show a clean **'Upgrade to A's Negosyo POS'** modal whenever a user clicks a locked feature or hits their plan limit:
   - **Free Starter (₱0/mo):** Max **30 Products/SKUs**, unlimited POS checkout & QR scan, basic payment QR display, 1 Owner login (1 branch), basic daily sales total, watermarked receipts (`Powered by A's Negosyo POS`).
   - **Negosyo Lite (₱199/mo or ₱1,990/yr):** Up to **300 Products/SKUs**, **Customer 'Utang' / Credit Ledger** with 1-tap reminder copy, **Expense & Petty Cash Tracker**, **True Net Profit Calculator** (COGS tracking), custom unbranded receipts, and **Excel/CSV Export**.
   - **Pro Seller — Most Popular (₱499/mo or ₱4,990/yr):** Everything in Negosyo Lite, plus **Unlimited Products & Bulk CSV/Excel Import**, **Up to 5 Staff/Cashier Accounts**, **Shift Close & Cash Drawer Audit (Z-Reading)**, **Activity & Void Anti-Theft Log**, **Shopee / Lazada / TikTok Shop Order & SKU Sync**, and Dead Stock Alerts.
   - **Multi-Branch (₱999/mo or ₱9,990/yr):** Everything in Pro Seller, plus **Up to 3 Branches/Warehouses** with stock transfers, **Up to 15 Staff/Cashier Accounts**, and consolidated multi-branch profit reporting.
   - **Optional Add-Ons:** Extra Branch (+₱250/mo), Extra 5 Staff Logins (+₱150/mo), Done-For-You Product Upload (₱500 one-time).
2. **SaaS Subscription Checkout (PalawanPay QR Ph & Maya Collection):**
   When a user selects any paid plan or add-on in the Upgrade Modal, display:
   - **QR Ph / PalawanPay QR Display:** Shows the Super Admin's uploaded **PalawanPay QR Ph** image (scannable via PalawanPay, Maya, GCash, or any QR Ph bank app).
   - **Direct Transfer Details:** Displays **Maya / PalawanPay Number: `+639692692760`** and **Account Name / Initials: `R A B`** with a 1-tap **Copy Number** button.
   - **Payment Submission Form:** Lets the user pick their plan/billing cycle, enter their **Transaction Reference Number**, upload a **Payment Screenshot**, and submit (`status = 'pending'`).
3. **Super Admin Dashboard (`/admin` Tab — Visible Only to Super Admin Role):**
   - Upload or replace my **PalawanPay QR Ph** image anytime without touching code.
   - View all registered stores on **A's Negosyo POS**, their current plan, and `plan_expires_at` date.
   - View all `pending` subscription payments with the user's store name, selected plan, reference number, and screenshot preview.
   - Tap **'Approve & Activate (30 Days / 365 Days)'** to automatically upgrade the store's plan and set `plan_expires_at`, or tap **'Reject'**.
   - Include automatic expiry logic that reverts expired paid plans back to **Free Starter** when `plan_expires_at` passes.

---

### MILESTONE 3: Live Supabase Backend & Vercel Deployment (Wait for 'Next')
- Provide the complete **Supabase PostgreSQL SQL Schema** (all tables, Row-Level Security policies isolated per `owner_id`, Storage bucket setup for seller QRs, payment screenshots, and admin PalawanPay QR, plus auto-expiry SQL/client check).
- Provide step-by-step **mobile-friendly Vercel deployment instructions** to connect my GitHub repo `aw0aw0/A-s-Negosyo-POS` and go live.

**Begin Milestone 1 now and stop once Milestone 1 is complete.**
Great job on Milestone 1! Before moving to Milestone 2, please add one small UX fix to the Auth screen:
- Add a **Show/Hide Password eye icon toggle** inside all password input fields (Log In and Sign Up) so users with poor eyesight can easily view and verify their password.
- Also add a **"Simulate Scan" demo dropdown/button** inside the Scan QR/Barcode modal so I can test scanning SKUs while inside the Claude preview (in addition to the live camera and USB scanner support).

After applying those two small fixes, proceed directly to building **Milestone 2** (the 4-tier pricelist, feature paywalls, PalawanPay QR Ph & Maya `+639692692760` / `R A B` upgrade checkout, and the Super Admin `/admin` approval panel).

