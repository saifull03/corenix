# CORENIX — Enterprise Technology & Computer Retail Platform

CORENIX is an enterprise-grade, full-stack computer and technology retail ecosystem built with Next.js 15, React 19, TypeScript, Tailwind CSS, and MySQL/MariaDB. It unifies **E-Commerce**, **Multi-Branch Inventory**, **Procurement & POs**, **High-Speed POS Counter Sales**, **RMA & Service Hub Management**, **Interactive PC Builder**, **Enterprise RBAC**, **Super Admin Audit Trail**, and **Programmatic SEO** into **ONE centralized platform**.

---

## 🚀 Key Highlights & Architecture

- **Frontend Framework**: Next.js 15 (App Router), React 19, TypeScript, Vanilla & Tailwind CSS, Lucide Icons
- **Backend Architecture**: Next.js Server Components, Server Actions, Route Handlers, modular service layer
- **Database**: MySQL / MariaDB (`corenix_db` via XAMPP) with 51 normalized tables, foreign keys, and audit log indexing
- **Security & Access Control (RBAC)**:
  - Role-based permissions matrix supporting custom roles
  - **Super Admin Governance**: Strict restriction on user creation, role definitions, and system activity logs
  - Immutable audit trail capturing operator identity, timestamp, module, record ID, IP origin, and before/after JSON diffs
- **Multi-Location Accounting**:
  - `WH-MAIN`: Central Main Warehouse (Tejgaon Industrial Area)
  - `SHOP-1`: Flagship Showroom (Uttara Sector 3)
  - `SHOP-2`: South Branch (Dhanmondi Road 27)
  - `RMA-HUB`: Dedicated Diagnosis & Service Center (Agargaon IT Plaza)

---

## 🌐 Public Storefront Routes

| Route | Description |
|---|---|
| `/` | Dynamic Homepage featuring hero banners, featured categories, trending hardware, hot deals, and official brands showcase |
| `/products` | Technology Catalogue with category, brand, price, and specs faceted filtering |
| `/product/[slug]` | Product Detail page with real-time multi-location stock breakdown, rich specs table, and warranty badges |
| `/category/[slug]` | Category archive with dynamic specification filters, SEO headings, and price sorting |
| `/brand/[slug]` | Official Brand Hub with brand descriptions, authorized warranty info, and brand catalogues |
| `/pc-builder` | Interactive Custom PC Builder with real-time socket & RAM validation, wattage calculator, and 1-click shareable build links |
| `/search?q=...` | Instant search engine with autocomplete, keyword facets, and zero-result analytics tracking |
| `/cart` | Interactive Shopping Cart with live quantity adjustments and promo discount coupon (`CORENIX500`) |
| `/checkout` | Multi-step Checkout supporting Showroom Free Pickup, Express Courier, bKash, Nagad, Cards, and 0% EMI |
| `/rma` | Customer RMA status tracking by serial number or ticket ID with online claim request submission |
| `/stores` | Physical branch directory with hotlines, operating hours, and location services |
| `/[slug]` | Programmatic SEO commercial landing pages (e.g. `/rtx-5060`, `/gaming-laptop`, `/1tb-ssd`) and CMS static pages |
| `/sitemap.xml` | Dynamic XML Sitemap generated from published products, categories, brands, and landing pages |
| `/robots.txt` | Dynamic crawler directives protecting private administrative routes |

---

## 🛠️ Admin & ERP Management Routes

| Route | Description | Access Level |
|---|---|---|
| `/admin` | **Executive Analytics Dashboard**: Sales, Gross Profit (COGS), Asset Valuation, Low Stock Alerts, Branch Comparison, Promotion Controls, and Live Audit Feed | Staff / Admin |
| `/admin/products` | Complete Product Catalogue table with cost prices, margins, quick trending/hot toggles, and duplicate actions | Staff / Admin |
| `/admin/products/create` | **18-Step Multi-Tab Product Manager** with dynamic spec templates, multi-branch stock allocation, and Google SEO preview | Staff / Admin |
| `/admin/categories` | Category Hierarchy Tree with parent/child relationships, slugs, and SEO metadata | Staff / Admin |
| `/admin/brands` | Brand Partner Manager with logo upload, origin country, official website links, and featured status | Staff / Admin |
| `/admin/attributes` | Dynamic hardware attributes and specification groups (Socket, Chipset, VRAM, Form Factor, etc.) | Staff / Admin |
| `/admin/inventory` | Multi-Branch Inventory Matrix tracking real-time units across WH-MAIN, SHOP-1, SHOP-2, and RMA-HUB | Staff / Admin |
| `/admin/branches` | Showroom and Warehouse Location Manager with branch codes, types, and active statuses | Staff / Admin |
| `/admin/orders` | Customer order fulfillment, invoice generation, status pipeline, and payment verification | Staff / Admin |
| `/admin/pos` | High-speed Retail POS Terminal for physical showrooms with barcode scanning and thermal receipt printing | Staff / Admin |
| `/admin/purchases` | Procurement & Vendor Purchase Orders (PO) with receiving workflows and supplier ledgers | Staff / Admin |
| `/admin/purchases/other-house` | Other House & Inter-Shop Borrowing/Lending ledger for external dealer stock acquisition | Staff / Admin |
| `/admin/suppliers` | Authorized technology distributor directory (Global Brand, Smart Tech, UCC, Star Tech) | Staff / Admin |
| `/admin/rma` | RMA Service Hub with technician assignments, diagnostic logs, parts replacement, and RMA cost calculator | Staff / Admin |
| `/admin/expenses` | Showroom operating expenses, utility bills, rent, and staff costs tracking | Staff / Admin |
| `/admin/reports` | Comprehensive Business Analytics with waterfall net profit calculation (`Revenue - COGS - Expenses - RMA = Net Profit`) | Staff / Admin |
| `/admin/seo` | Programmatic SEO Landing Page Builder and real-time Search Demand tracking (Top searches & Zero-result queries) | Staff / Admin |
| `/admin/banners` | Homepage Hero Slides & Promotional Banner Manager | Staff / Admin |
| `/admin/users` | **Staff Management & RBAC Roles**: Personnel directory, custom role creation, branch assignments, and access control | **Super Admin** (Creation & Editing) |
| `/admin/approvals` | Management approval queue for high-value stock adjustments, price overrides, and refunds | Staff / Admin |
| `/admin/erp` | Modular ERP Integration Connector with manual synchronization triggers and API logs | Staff / Admin |
| `/admin/activity-log` | **Enterprise Audit Trail & Change Inspector**: Searchable, filterable ledger of Who changed What, Where, When, with side-by-side JSON Diffs and CSV report export | **Super Admin Only** |

---

## 🔒 Security, RBAC & Audit Governance

1. **Role-Based Access Control (RBAC)**:
   - Built-in roles: `Super Administrator`, `Shop Manager`, `Sales Executive`, `Warehouse Supervisor`, `RMA Technician`, `Accountant`.
   - Dynamic custom role creation with automated slug generation and permission assignments.
   - **Super Admin Exclusivity**:
     - Only Super Administrators can create new staff personnel, define custom roles, and update user statuses.
     - Non-super-admins view the staff directory in read-only mode with permission notices.
2. **Immutable System Audit Trail**:
   - Auto-captures operator identity (`user_id`, `user_name`, `role_name`) on every mutation across all modules.
   - Records before/after JSON diffs, target module, record ID, and client IP origin.
   - Interactive modal inspector with formatted payload comparison and 1-click JSON copy.
   - Dedicated CSV export for external compliance auditing.
   - Strictly restricted to Super Administrators in the sidebar, dashboard widget, and `/admin/activity-log` page.

---

## 🗄️ Database Architecture (MySQL / MariaDB)

The database `corenix_db` includes 51 normalized tables:
- **RBAC & Identity**: `roles`, `permissions`, `role_permissions`, `users`
- **Branches & Locations**: `branches` (`shop`, `warehouse`, `rma_center`)
- **Catalogue & Specs**: `categories`, `brands`, `products`, `product_images`, `product_specifications`, `product_descriptions`, `product_seo`, `attributes`, `attribute_groups`, `category_attributes`
- **Inventory & Logistics**: `inventory`, `inventory_transactions`, `stock_transfers`, `stock_transfer_items`
- **Customers & Orders**: `customers`, `customer_addresses`, `orders`, `order_items`, `payments`
- **Procurement & Vendors**: `suppliers`, `purchase_orders`, `purchase_order_items`, `supplier_payments`, `partner_houses`
- **RMA & Technical Hub**: `rma_cases`, `technicians`, `service_vendors`, `rma_status_history`
- **PC Builder Engine**: `compatibility_rules`, `pc_builds`
- **Finance & CMS**: `expenses`, `expense_categories`, `cms_pages`, `seo_landing_pages`, `banners`, `faqs`, `coupons`
- **Governance & Logs**: `audit_logs`, `search_analytics`, `erp_sync_logs`, `business_settings`

---

## 💻 Running the Platform Locally

### 1. Database Initialization
MySQL runs via XAMPP on `127.0.0.1:3306`.
```bash
# Import schema
mysql -u root corenix_db < scripts/schema.sql

# Seed initial dynamic data
node scripts/seed-db.js
```

### 2. Install Dependencies & Build
```bash
npm install
npm run build
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Administrator** | `admin@corenix.com` | `admin123` | Full Enterprise & Security Access |
| **Shop 1 Manager** | `shop1@corenix.com` | `admin123` | Store Operations, Orders & POS |
| **Operator / Staff** | `operator@corenix.com` | `operator123` | Inventory, Catalogue & RMA |
| **Demo Customer** | `customer@gmail.com` | `customer123` | Public Storefront & Customer Portal |
