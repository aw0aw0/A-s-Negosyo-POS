# A's Negosyo POS

**A's Negosyo POS** is a mobile-first Point of Sale (POS), inventory management, and order-tracking web application built for Philippine micro, small, and medium enterprises (MSMEs)—including sari-sari stores, cafes, milk tea shops, retail boutiques, and Shopee, Lazada, and TikTok sellers.

**Live Application:** [https://vercel.app](https://vercel.app)

---

## Key Features

### Mobile POS & Checkout
* **Camera Barcode & QR Scanner:** Scan product barcodes or QR codes directly using a smartphone camera without requiring dedicated hardware scanners.
* **Cash & E-Wallet Checkout:** Process cash transactions with automatic change calculation, or display your store's own **GCash, Maya, PalawanPay, or QR Ph** code directly to customers at checkout.
* **58mm & 80mm Thermal Receipt Support:** Generate digital receipts or print directly to standard Bluetooth thermal receipt printers.

### Inventory & Order Management
* **Real-Time Stock Tracking:** Automatic inventory deduction on every completed transaction with low-stock indicators.
* **Order History & Reference Logging:** Record daily transactions, payment methods, and customer e-wallet reference numbers in one centralized ledger.
* **Store & Receipt Customization:** Configure receipts with your store name, branch address, contact number, TIN/VAT note, custom footer message, and brand accent color.

### Business Growth & Operations
* **Customer Credit ("Utang") Ledger:** Track customer balances, partial payments, and due dates digitally.
* **Expense & Petty Cash Tracker:** Log operational expenses alongside sales to monitor true net profit.
* **Staff & Cashier Accounts:** Create role-restricted cashier logins so staff can process POS sales without accessing sensitive store settings or financial reports.
* **Installable Progressive Web App (PWA):** Install directly onto Android or iOS home screens for a full-screen application experience.

---

## Data Privacy, Ownership & Security

Merchant privacy and financial security are core principles of **A's Negosyo POS**. The platform is engineered with strict tenant isolation so your business records remain exclusively under your control:

1. **No Access to E-Wallet Accounts, Credentials, or Funds:**
   * A's Negosyo POS **never** requests, collects, or stores your GCash, Maya, PalawanPay, or bank login credentials, MPINs, one-time passwords (OTPs), or account balances.
   * When you upload a static payment QR image in **Settings**, it is linked strictly to your isolated store profile solely for display to your customers during checkout. All customer payments transfer **100% directly** to your personal or merchant e-wallet account. A's Negosyo POS never holds, processes, or deducts commissions from your sales.

2. **Strict Row-Level Data Isolation (RLS):**
   * All store records—including products, sales orders, customer credit ledgers, expenses, and store QR images—are protected by database-level **Row Level Security (RLS)**. Other users and store accounts cannot view, query, or modify your data.

3. **Full Merchant Control & Zero Data Resale:**
   * You retain complete ownership of your business records and may update, replace, or delete your uploaded store QR image, store profile, and product catalog at any time from your **Settings** and **Inventory** tabs.
   * Merchant and customer data are **never** sold, rented, or shared with third-party advertisers or data brokers.

---

## Technical Architecture

* **Frontend:** React, Vite, Tailwind CSS, Progressive Web App (PWA)
* **Backend & Database:** Supabase (PostgreSQL with Row Level Security and Authentication)
* **Hosting & Delivery:** Vercel (HTTPS / TLS Encrypted)

---

## Getting Started

1. Open **[https://vercel.app](https://vercel.app)** on a mobile or desktop browser.
2. Sign in with **Google** or **Email** to create your store workspace (the Free Starter plan includes up to 30 products, unlimited POS checkouts, and thermal receipt printing).
3. *(Optional)* Select **Add to Home Screen** or **Install App** in your browser menu to run **A's Negosyo POS** as a standalone mobile app.
4. Add your catalog in **Inventory**, configure your receipt and store details in **Settings**, and begin recording sales.

---

*Built for Filipino entrepreneurs to simplify daily store operations and inventory management.*
