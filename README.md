# CORENIX — Enterprise Technology & Computer Retail Platform

CORENIX is a full-stack, production-ready computer and technology e-commerce ecosystem built from scratch. It unifies **E-commerce**, **Multi-Branch Inventory Management**, **Purchasing / Procurement**, **POS Counter Sales**, **Central Warehouse Logistics**, **RMA & Service Hub Management**, **Interactive PC Builder**, **Advanced Search**, **Programmatic SEO CMS**, **Business Reporting**, and **ERP Integration** into **ONE centralized system**.

---

## 🚀 Key Highlights & Architecture

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Next.js Server Actions, REST API routes, modular service architecture
- **Database**: MySQL (`corenix_db` via XAMPP) with 51 normalized tables, foreign keys, full-text indexes, and audit logs
- **Search**: Multi-faceted search engine with live autocomplete, typo-tolerance, and zero-results search analytics tracking
- **Design System**: Sleek cyber/tech dark mode (`#0B0F19`), electric cyan/teal accents, rounded cards, glassmorphism panels, and product-focused layout
- **Multi-Location Accounting**:
  - `WH-MAIN`: Central Main Warehouse (Tejgaon Industrial Area)
  - `SHOP-1`: Flagship Showroom (Uttara Sector 3)
  - `SHOP-2`: South Branch (Dhanmondi Road 27)
  - `RMA-HUB`: Dedicated Diagnosis & Service Center (Agargaon IT Plaza)

---

## 🌐 Public Storefront Routes

| Route | Description |
|---|---|
| `/` | Dynamic Homepage with hero banners, featured categories, spotlight deals, brand directory & branch showcase |
| `/products` | Full Technology Catalogue with category and brand faceted filtering |
| `/product/[slug]` | Product Detail page with multi-location stock breakdown, rich specs, warranty info, and schema markup |
| `/category/[slug]` | Category page with category-specific filters, H1, SEO text, and sorting |
| `/brand/[slug]` | Official Brand Hub with brand introduction, official warranty badge, and brand products |
| `/pc-builder` | Interactive Custom PC Builder with real-time socket & RAM compatibility validation, wattage calculator, and share link |
| `/search?q=...` | Search results page with instant facets, query tracking, and zero-result analytics |
| `/cart` | Interactive Shopping Cart with live quantity adjustments and promo discount coupon (`CORENIX500`) |
| `/checkout` | Multi-step Checkout supporting Shop 1 / Shop 2 Free Pickup, Courier delivery, bKash, Nagad, Card, and 0% EMI |
| `/rma` | Customer RMA status tracking by serial number or ticket ID, with online RMA request submission |
| `/stores` | Physical branch locator with hotlines, operating hours, and showroom services |
| `/[slug]` | Programmatic SEO commercial landing pages (e.g. `/rtx-5060`, `/gaming-laptop`, `/1tb-ssd`) and CMS static pages |
| `/sitemap.xml` | Dynamic XML Sitemap automatically generated from published products, categories, brands, and SEO pages |
| `/robots.txt` | Dynamic robots.txt protecting private admin/account paths and directing search crawlers to sitemap |

---

## 🛠️ Admin & ERP Management Routes

| Route | Description |
|---|---|
| `/admin` | Executive Analytics Dashboard with Today's Sales, Gross Profit, Inventory Value, Low Stock Alerts, and Branch Breakdown |
| `/admin/products` | Complete Product Catalogue table with cost prices, margins, stock status, and product duplication |
| `/admin/products/create` | **18-Step Multi-Tab Product Manager** with category-based specification templates, location inventory, and Google SEO preview |
| `/admin/categories` | Dynamic Category Tree with hierarchy, parent categories, URL slugs, and SEO metadata |
| `/admin/brands` | Brand Partner Manager with origin country, website links, and featured status |
| `/admin/inventory` | Multi-Branch Inventory Matrix tracking units across WH-MAIN, SHOP-1, SHOP-2, and RMA-HUB |
| `/admin/pos` | High-speed Retail POS Terminal for Shop 1 & Shop 2 with instant barcode lookup and printable invoices |
| `/admin/rma` | RMA & Warranty Hub Ticket Management with technician assignments and multi-tier RMA cost calculator |
| `/admin/reports` | Business Reports with Net Profit calculation waterfall (`Revenue - COGS - Expenses - RMA Costs = Net Profit`) |
| `/admin/seo` | SEO Landing Page Builder and Search Analytics (Top searches & zero-result demand tracking) |
| `/admin/erp` | Modular ERP Integration Connector with manual sync triggers and audit logs |
| `/admin/activity-log` | Immutable System Audit Trail capturing user, role, module, action, record ID, and payload diff |

---

## 🗄️ Database Architecture (MySQL)

The MySQL database `corenix_db` includes 51 normalized tables:
- **RBAC & Users**: `roles`, `permissions`, `role_permissions`, `users`
- **Branches & Locations**: `branches` (`shop`, `warehouse`, `rma_center`)
- **Catalogue**: `categories`, `brands`, `products`, `product_images`, `product_specifications`, `product_descriptions`, `product_seo`, `attributes`, `attribute_groups`, `category_attributes`
- **Inventory & Logistics**: `inventory`, `inventory_transactions`, `stock_transfers`, `stock_transfer_items`
- **Customers & Orders**: `customers`, `customer_addresses`, `orders`, `order_items`, `payments`
- **Procurement**: `suppliers`, `purchase_orders`, `purchase_order_items`, `supplier_payments`
- **RMA & Service Hub**: `rma_cases`, `technicians`, `service_vendors`, `rma_status_history`
- **PC Builder**: `compatibility_rules`, `pc_builds`
- **Finance & CMS**: `expenses`, `expense_categories`, `cms_pages`, `seo_landing_pages`, `banners`, `faqs`, `coupons`
- **Security & ERP**: `audit_logs`, `search_analytics`, `erp_sync_logs`, `business_settings`

---

## 💻 Running the Platform Locally

### 1. Database Initialization
MySQL is running via XAMPP on `127.0.0.1:3306`.
```bash
# Import schema
mysql -u root corenix_db < scripts/schema.sql

# Seed initial dynamic data
node scripts/seed-db.js
```

### 2. Start the Production Server
```bash
npm run build
npm run start
```
The application will be live at [http://localhost:3000](http://localhost:3000).

### 3. Start Development Server
```bash
npm run dev
```
.
---

## 🔐 Default Credentials
- **Super Administrator**: `admin@corenix.com` / `admin123`
- **Shop 1 Manager**: `shop1@corenix.com` / `admin123`
- **Operator**: `operator@corenix.com` / `operator123`
- **Demo Customer**: `customer@gmail.com` / `customer123`
