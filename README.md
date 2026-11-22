# A-s-Negosyo-POS# A's Negosyo POS — Project Memory & Status

- **App Name:** A's Negosyo POS (BigSeller-style POS & Omnichannel Inventory SaaS for Philippine Sellers)
- **GitHub Repo:** https://github.com
- **Tech Stack:** React + Vite + Tailwind CSS + Supabase (Auth, PostgreSQL, Storage) + Vercel
- **SaaS Owner Payment Collection:** PalawanPay QR Ph & Maya (`+639692692760` / `R A B`) with Super Admin `/admin` manual approval (30/365 days)
- **Subscription Tiers (Monthly / Annual 2-mos free):**
  - Free Starter: ₱0/mo (Max 30 SKUs, watermarked receipt, basic POS & QR scan/pay)
  - Negosyo Lite: ₱199/mo or ₱1,990/yr (300 SKUs, Utang Ledger, Expenses, Net Profit, No watermark, CSV export, Direct Bluetooth 58mm/80mm printing)
  - Pro Seller: ₱499/mo or ₱4,990/yr (Unlimited SKUs, Bulk Import, 5 Staff accounts, Shift Z-Reading, Anti-Theft Log, Shopee/Lazada/TikTok sync)
  - Multi-Branch: ₱999/mo or ₱9,990/yr (3 Branches, 15 Staff accounts)
  - Add-ons: Extra Branch (+₱250/mo), Extra 5 Staff (+₱150/mo), Done-For-You Upload (₱500 one-time)
- **Auth & Validation Rules:**
  - Sign-up via Google, Apple ID, Phone (`+63` + 10 digits), or Other Email with 6-digit OTP verification (wrong OTP resets registration)
  - Locked unique `username` (max 8 alphanumeric chars, no special chars)
  - Password: max 8 chars, at least 1 uppercase letter, at least 1 special character; focus-only show/hide eye icon
  - Shop Name: max 30 letters
- **Design:** Zero emojis (`lucide-react` icons only), Light Fintech Palette (`#0F766E` Emerald Teal, `#D97706` Amber, `#F8FAFC` background, `#FFFFFF` cards)
- **Current Progress:**
  - [x] Milestone 1 & 2 completed and exported in `A's Negosyo POS.html`
  - [ ] Milestone 3 (Live Supabase SQL + Vite packaging + Thermal Bluetooth print + UI polish) & Vercel deployment
"Continue my project A's Negosyo POS. Read my GitHub repo at https://github.com (check README.md, PROMPT.md, and A's Negosyo POS.html) so we can continue from where we stopped."
