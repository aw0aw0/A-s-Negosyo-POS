
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
Please update the Authentication, Sign-Up, and Store Setup flow in **A's Negosyo POS** with the following exact rules and validations:

1. **Password Eye Icon Behavior:**
   - Show the **Show/Hide Password eye icon** *only* when the user focuses/taps inside the password input box (or while it has text), keeping the field clean until clicked.

2. **Shop Name Limit:**
   - Enforce a strict **maximum of 30 characters/letters** (`maxLength={30}`) on the Shop/Store Name field during setup and in Store Settings, with a live character counter (e.g., `12/30`).

3. **Sign-Up Options & 8-Digit Verification Flow:**
   - Provide 4 clear sign-up options on the Auth screen:
     1. **Continue with Google** (Supabase Google OAuth + fallback email verification flow)
     2. **Continue with Apple ID** (Supabase Apple OAuth)
     3. **Sign Up with Phone Number (`+63`):**
        - Lock the default country code prefix to **`+63`** and allow **only 10 digits** starting with `9` (e.g., `9163498336`).
        - Upon submitting, send an SMS (and display a simulated SMS banner in the preview) with a unique randomized **8-digit verification code**.
        - **Verification Rule:** If the user enters an incorrect 8-digit code, display an error and **reset/restart the registration** from the beginning. Once verified, proceed to Username & Password creation.
     4. **Use Other Email:**
        - Validate that the user enters a **legitimate email format** (blocking disposable/fake formats).
        - Send an email (and show a simulated email preview card in demo mode) with the exact wording:  
          `"Welcome to A's Negosyo POS! This is your 8-digit verification code: [XXXXXXXX]"`
        - **Verification Rule:** Same strict rule—if the 8-digit code is wrong, reset the registration so they must start again. Once verified, proceed to Username & Password creation.

4. **Post-Verification Username & Password Creation (Required for All New Sign-Ups):**
   - **Unique Username Rules:**
     - **Maximum 8 characters** (`maxLength={8}`), **letters and numbers only** (`^[a-zA-Z0-9]+$`)—strictly block all spaces and special characters.
     - Once created, **permanently lock that username** to the user's email/phone account in Supabase (`UNIQUE` constraint on `username` in the database) so no other user can ever claim or change it.
   - **Password & Confirm Password Rules:**
     - Display two input boxes labeled **`Password`** and **`Confirm Password`** (each with the focus-triggered eye icon).
     - Enforce strict password validation:
       - **Maximum 8 characters** (`maxLength={8}`)
       - Must contain **at least 1 UPPERCASE (Caps Lock) letter** (`[A-Z]`)
       - Must contain **at least 1 special character** (e.g., `!@#$%^&*`)
       - Both `Password` and `Confirm Password` must match before activating their **A's Negosyo POS** store.

5. **Database & Demo Support:**
   - Include a working interactive simulation of the 8-digit SMS/Email verification code and unique username check inside the React preview so I can test the full sign-up flow on my phone right now, and include the `UNIQUE` username & phone constraints in our Milestone 3 Supabase SQL schema.
   - Good call—let's switch the SMS and Email verification code to **6 digits** so it matches Supabase Auth's default OTP out of the box!

Please update the verification code to **6 digits** and now proceed to build **Milestone 3** to make **A's Negosyo POS** completely live-ready:

1. **Thermal Receipt Printer Support (58mm & 80mm):**
   - Add dedicated **`@media print` thermal receipt CSS** formatted cleanly for both **58mm** and **80mm** thermal paper rolls (with a paper-width toggle in Store Settings).
   - Add a **1-Tap Direct Bluetooth Thermal Printer (Web Bluetooth API + ESC/POS commands)** button on the receipt modal so Android/Chrome users can pair standard Bluetooth thermal printers (like Goojprt PT-210 / Xprinter) and print directly in 1 tap—make Direct Bluetooth Printing a **Negosyo Lite (₱199/mo)+** perk, while keeping standard browser/system print available for Free Starter users.

2. **Complete Supabase PostgreSQL SQL Schema & Security:**
   - Provide the full, copy-pasteable SQL script for Supabase covering all tables (`stores`, `profiles`, `products`, `orders`, `order_items`, `expenses`, `utang_ledger`, `staff_accounts`, `subscription_payments`, and `platform_settings` for my Super Admin PalawanPay QR Ph image).
   - Include strict **`UNIQUE` constraints on `username` (max 8 alphanumeric chars) and `phone` (`+63` 10-digit format)** so usernames are permanently locked once claimed.
   - Include strict **Row-Level Security (RLS)** policies isolating every seller's data by `owner_id`, plus Super Admin policies so only my admin account can view/approve `subscription_payments` and update `platform_settings`.
   - Include **Supabase Storage** bucket setup & policies for Seller Payment QRs, Subscription Payment Screenshots, and the Super Admin PalawanPay QR Ph image.
   - Include automatic plan expiry logic reverting expired paid accounts back to **Free Starter** once `plan_expires_at` passes.

3. **Live Supabase Wiring & Mobile Vercel Deployment:**
   - Update the React code to connect cleanly to live **Supabase Auth (6-digit Email/Phone OTP + Google/Apple OAuth), Database, and Storage** using environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
   - Give me clear, **phone-friendly step-by-step instructions** to paste the SQL in Supabase, commit the final code to my GitHub repo `aw0aw0/A-s-Negosyo-POS`, and deploy live on **Vercel**.
   - Before we deploy, please do a complete UI/UX visual upgrade on **A's Negosyo POS**:

1. **Remove All Emojis:**
   - Remove every single emoji across the entire app (navigation tabs, product placeholders, alerts, buttons, badges, and modals).
   - Replace all emojis with clean, consistent **`lucide-react` stroke icons** (e.g., `Store`, `ScanLine`, `QrCode`, `Package`, `Receipt`, `Wallet`, `Users`, `ShieldCheck`, `Crown`).

2. **Apply a Professional Fintech/Retail Color Palette (Color Theory):**
   - Replace the dark/generic theme with a clean, high-contrast **Light Fintech Palette** optimized for store lighting and QR scanning:
     - **App Background:** `#F8FAFC` (Slate-50)
     - **Card Surfaces:** `#FFFFFF` with `#E2E8F0` (Slate-200) 1px borders
     - **Primary Brand & Checkout Buttons:** Deep Emerald Teal `#0F766E` (hover `#115E59`)
     - **Pro / Upgrade & Pending Highlights:** Warm Amber `#D97706` (with `#FEF3C7` soft badge background)
     - **Primary Text:** `#0F172A` (Slate-900) and Secondary Text `#475569` (Slate-600)
     - **Semantic Status Colors:** Success/Paid `#15803D`, Warning `#B45309`, Danger/Void `#B91C1C`
   - Keep the seller's custom **Brand Accent Color** setting working so owners can still override the primary `#0F766E` accent with their own shop color if desired.
Before I download the files and deploy **A's Negosyo POS** live, please apply a **complete Security Hardening & UI Polish pass** across all project files (`App.jsx`, `cloud.js`, `schema.sql`, `package.json`, `vite.config.js`, and add a `vercel.json` file):

### PART 1: 14-Point Production Security Hardening
1. **Security Headers (`vercel.json`):** Add a `vercel.json` file with strict HTTP security headers: `Content-Security-Policy` (allowing Supabase, Google/Apple OAuth, and camera/Bluetooth), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` (restricting camera/Bluetooth strictly to self).
2. **Proper Authentication & Password Hashing:** Ensure all auth flows rely strictly on Supabase Auth (which hashes passwords server-side with bcrypt) and clear sensitive session tokens cleanly on logout.
3. **Hide API Keys & Check Env Variables:** Ensure zero hardcoded keys exist anywhere in the codebase, verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist at startup with a safe fallback error screen if missing, and make sure `service_role` keys are never referenced in frontend code.
4. **Secure Database & Limit User Access (`schema.sql`):** Audit all RLS policies so every table restricts `SELECT/INSERT/UPDATE/DELETE` strictly to `auth.uid() = owner_id` (or authorized staff for that store), revoke unnecessary `anon` permissions, and lock down RPC functions with `SECURITY DEFINER` + explicit `auth.uid()` checks.
5. **Protect Admin Routes & Turn Off Debug Mode:** Remove the `Owner / Cashier / Super Admin` demo role switcher from production builds (`import.meta.env.PROD`), disable all `console.log` debug outputs in production, and guard the `/admin` view so it only renders when `profile.role === 'super_admin'` verified from Supabase.
6. **Protect Against XSS & Sanitize Forms:** Sanitize and trim all user inputs (store names, product names, customer "utang" notes, receipt footers, reference numbers) to strip HTML/script tags, and never use `dangerouslySetInnerHTML`.
7. **Add Rate Limiting:** Add client-side cooldown timers/debouncing on OTP requests (60-second resend cooldown), login attempts, and payment proof submissions, plus note Supabase Auth rate-limit settings in the instructions.
8. **Check File Uploads:** Strictly validate all uploaded files (Seller Payment QRs, Subscription Payment Screenshots, Admin PalawanPay QR) on both frontend and Supabase Storage bucket rules: allow **only `image/jpeg`, `image/png`, and `image/webp`**, enforce a **2MB max file size**, and randomize uploaded filenames using UUIDs.
9. **Update Dependencies (`package.json`):** Use up-to-date, stable, vulnerability-free versions of React, Vite, Tailwind CSS, `@supabase/supabase-js`, `lucide-react`, and `html5-qrcode`.

### PART 2: UI/UX Polish (Zero Emojis + Light Fintech Color Palette)
- **Remove All Emojis:** Strip every single emoji from the entire UI and replace them with clean **`lucide-react` stroke icons**.
- **Light Fintech Color Palette:** Update the default theme to a clean, high-contrast light palette: `#F8FAFC` background, `#FFFFFF` cards with `#E2E8F0` borders, `#0F766E` (Emerald Teal) primary buttons, `#D97706` (Warm Amber) Pro/upgrade highlights, and `#0F172A` / `#475569` slate typography (while keeping the seller's custom Brand Accent Color override working).

Output the updated downloadable files (including the new `vercel.json`) so I am ready to upload them straight to GitHub and Vercel.




