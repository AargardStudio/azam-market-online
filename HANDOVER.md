# 📋 AI Handover Specification: Azam Market Online

> **Notice for Analyzing AI Agents**:  
> This document is designed for automated ingestion and deep architectural analysis. It provides full structural mapping, data models, state flows, and extension vectors for the **Azam Market Online** application.

---

## 1. Project Overview & Operational Domain

- **App Name**: Azam Market Online
- **Domain**: B2B Wholesale Fabric Marketplace & Merchant Federation
- **Physical Context**: Azam Cloth Market, Walled City, Lahore, Pakistan (16,000+ shops across 40+ sub-bazaars: Kashmiri Bazaar, Chitta Bazaar, Riaz Market, etc.)
- **Primary Users**:
  1. **Wholesale Buyers & Retailers**: Looking for bulk fabric lots, price ranges, MOQs, and downloading PDF catalogues.
  2. **Stall Vendors**: Managing their digital shop profiles, fabric products, PDF catalogues, inquiries, and requesting Aargard assistance.
  3. **AArgard Platform Administrators**: Full oversight across all stalls, subscriptions, categories, markets, payment rails, ERP bridges, and CEO memoir/services.

---

## 2. Technical Stack & Runtime Environment

- **Frontend Framework**: React 19 (functional hooks + modular components)
- **Language**: TypeScript (strict typing with `src/types.ts`)
- **Styling**: Tailwind CSS v4 (in `src/index.css` via `@import "tailwindcss";`)
- **Bundler & Dev Server**: Vite 6 + Express middleware (`server.ts`)
- **Port**: 3000
- **Icons**: Lucide React
- **Data Visualization**: Recharts (for Vendor Analytics & Admin Metrics)
- **Archive Engine**: Archiver (server-side streamable `.zip` exports)

---

## 3. Data Entities & Schemas (`src/types.ts`)

| Entity | Description | Key Attributes |
|---|---|---|
| `Vendor` | Fabric Stall Profile | `id`, `shop_name`, `stall_number`, `market_id`, `category_ids`, `tier_id`, `is_verified`, `products`, `catalogues`, `customization` |
| `Product` | Wholesale Fabric Item | `id`, `name`, `fabric_type`, `unit`, `price_range`, `moq`, `colors_available`, `thaan_length` |
| `Catalogue` | Digital Fabric Lookbook | `id`, `vendor_id`, `title`, `season`, `pages_count`, `file_size_mb`, `download_count`, `preview_images` |
| `GatewayConfig` | Regulated Payment Rail | `id` (JazzCash, PayFast, Keenu, Stripe), `is_enabled`, `supported_methods`, `settlement_currency` |
| `CeoProfile` | AArgard Executive Profile | `ceo_name`, `ceo_title`, `memoir_paragraphs`, `core_quote`, `vision_pillars`, `milestones` |
| `AargardUpdate` | Platform Changelog | `version`, `title`, `category`, `importance`, `details`, `vendor_impact` |
| `AargardService` | Specialized Services | `title`, `tagline`, `category`, `turnaround_time`, `pricing_tier`, `contact_whatsapp` |
| `VendorAssistanceRequest` | Vendor Support Ticket | `vendor_id`, `category`, `subject`, `urgency`, `status` |

---

## 4. Key Application Views & Routes

1. **Public Directory (`currentView === 'directory'`)**:
   - Hero search & metric badges.
   - Fabric Category quick filter pills.
   - Featured wholesale supplier spotlight.
   - Comprehensive filter bar (verified only, tier, catalogue available, sorting).
   - Vendor grid cards with direct WhatsApp link & shop detail modal.
   - Rich Footer with **Download Project (.ZIP)** button & Handover Modal.

2. **Single Vendor Shop (`currentView === 'vendor_shop'`)**:
   - Custom branding banner, stall badge, and contact action bar.
   - Product catalog with volume discount tiers & MOQs.
   - Lookbook download trigger & inquiry logger.
   - Stall landmark directions and bazaar map.

3. **Vendor Dashboard (`currentView === 'vendor_dashboard'`)**:
   - Overview metrics (inquiries, catalogue downloads, profile views).
   - Shop Profile Editor & Customizer (banner, primary colors, tagline).
   - Products Catalog CRUD.
   - PDF Catalogue uploader & manager.
   - Inquiries analytics chart.
   - Subscription tier status & upgrade portal.
   - **Update Log & Vendor Assistance Hub** (Changelog, policy alerts, and assistance ticket form).

4. **Admin Master Dashboard (`currentView === 'admin_dashboard'`)**:
   - Platform Overview & KPI Cards.
   - **Master Shop Control Center** (Universal 8-dimension shop inspector & editor).
   - Pending Stall Approvals queue.
   - Subscription Tiers configuration.
   - Category & Sub-market managers.
   - **Payment Gateways & Ledger Hub** (JazzCash, PayFast 1Link, Keenu, Stripe).
   - **ERP Integration Bridge** (API keys, 2-way sync logs, webhook testing).
   - **AArgard CEO Memoir & Services Manager** (Edit memoir text, update quote, publish platform updates, manage assistance requests).

---

## 5. API Endpoints Map (`server.ts`)

- `GET /api/project/download` — Generates and streams full project `.zip` source archive.
- `GET /api/project/stats` — Returns file manifest and archive statistics.
- `GET /api/vendors` & `POST /api/vendors` — Stalls list and onboarding.
- `PUT /api/vendors/:id` — Update vendor profile, products, or customization.
- `GET /api/aargard/ceo-profile` & `PUT /api/aargard/ceo-profile` — CEO memoir & vision.
- `GET /api/aargard/updates` & `POST /api/aargard/updates` — Platform changelog updates.
- `GET /api/aargard/services` — Commercial digitization and logistics services.
- `GET /api/aargard/assistance-requests` & `POST /api/aargard/assistance-requests` — Vendor support tickets.
- `GET /api/payment-gateways` & `PUT /api/payment-gateways/:id` — Payment gateway configurations.
- `POST /api/payment-transactions` — Mock/live transaction processor.
- `GET /api/v1/erp/status` & `POST /api/v1/erp/products/sync` — B2B ERP bridge.

---

## 6. How to Run Locally

```bash
# 1. Unzip the downloaded project archive
unzip azam-market-online-project.zip -d azam-market
cd azam-market

# 2. Install all dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:3000
```
