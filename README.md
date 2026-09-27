# 🏛️ Azam Market Online — B2B Wholesale Fabric Marketplace

> **Asia's Largest Textile Bazaar, Digitized.**  
> Official B2B Directory, Digital Stall Catalogues, and Wholesale Fabric Clearing Platform for Azam Cloth Market, Walled City, Lahore, Pakistan.

---

## 📖 Overview

**Azam Cloth Market** (established over a century ago near Delhi Gate and Kashmiri Gate in Lahore) is the central nerve center for fabric trading across Pakistan, Central Asia, and the overseas diaspora. 

**Azam Market Online** digitizes over 1,000 wholesale stalls, providing:
- **Wholesale Stall Directory**: Search and filter by fabric type (Lawn, Cotton, Chiffon, Khaddar, Silk, Boski, Bridal, Jacquard), market section, and verified tier.
- **High-Definition Digital Fabric Catalogues**: View and download wholesale catalogues with minimum order quantities (MOQ), piece rates, and thaan lengths.
- **Vendor Stall Portfolios**: Individual custom digital storefronts with verified stall numbers, landmark directions, WhatsApp ordering, and direct bank details.
- **Payment Clearing & Settlement Rails**: Regulated gateway integration for JazzCash, PayFast (1Link Interbank), Keenu NetConnect, and Stripe.
- **ERP Integration Bridge**: 2-way API synchronization for textile mills, inventory updates, and wholesale buyer lead exports.
- **AArgard CEO Memoir & Platform Services**: Foundational vision by CEO Aargard, verified changelog updates, swatch digitization desk, and freight cargo assistance.
- **Vendor Assistance Hub**: Dedicated support channel for stall owners to request photography sessions, bilty transport, and catalog uploads.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ or 20+
- npm (or pnpm / bun)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will launch at: `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - **React 19** with TypeScript
  - **Vite 6** (Modern, lightning-fast bundler)
  - **Tailwind CSS v4** (Utility-first styling with custom palette: `#0F5C3A` Emerald, `#C9952A` Gold, `#1B2A4A` Royal Indigo)
  - **Lucide Icons** (Sharp, consistent icon set)
  - **Recharts** (Vendor analytics, lead traffic, and order tracking)
- **Backend**:
  - **Node.js & Express** embedded in `server.ts`
  - In-memory mock database store with initial datasets for stalls, categories, tiers, payment transactions, and AArgard services
  - RESTful APIs for vendors, catalogues, inquiries, ERP bridge, and platform configuration
  - Native streaming project export via `archiver`

---

## 📦 Key Directory Structure

```
├── README.md                      # Project setup & documentation
├── HANDOVER.md                    # Structured AI handover & architectural brief
├── package.json                   # Dependencies and npm scripts
├── server.ts                      # Express API server & Vite middleware
├── index.html                     # HTML5 entry point with OpenGraph tags
├── vite.config.ts                 # Vite & Tailwind configuration
├── metadata.json                  # AI Studio application metadata
└── src/
    ├── main.tsx                   # React root entry
    ├── App.tsx                    # Main controller, router, and view switcher
    ├── index.css                  # Global Tailwind styles
    ├── types.ts                   # Universal TypeScript interfaces
    ├── lib/
    │   └── sampleData.ts          # Default seed data for Lahore stalls & fabrics
    └── components/
        ├── admin/                 # Aargard Admin & Master Control
        │   ├── AdminOverview.tsx
        │   ├── AdminSidebar.tsx
        │   ├── MasterShopControlCenter.tsx
        │   ├── AargardControlCenter.tsx
        │   ├── PaymentGatewayManager.tsx
        │   ├── ErpIntegrationManager.tsx
        │   └── ...
        ├── vendor/                # Stall Owner Dashboard
        │   ├── VendorOverview.tsx
        │   ├── VendorSidebar.tsx
        │   ├── VendorUpdateLog.tsx
        │   ├── ProductManager.tsx
        │   ├── CatalogueManager.tsx
        │   ├── ShopCustomizer.tsx
        │   └── ...
        ├── public/                # Marketplace Buyer Facing Views
        │   ├── Navbar.tsx
        │   ├── VendorHero.tsx
        │   ├── CategoryGrid.tsx
        │   ├── FilterBar.tsx
        │   ├── VendorCard.tsx
        │   ├── VendorShop.tsx
        │   ├── CatalogueViewerModal.tsx
        │   ├── CeoMemoirModal.tsx
        │   └── Footer.tsx
        └── common/                # Shared Modals & Utilities
            ├── ProjectDownloadModal.tsx
            ├── PaymentCheckoutModal.tsx
            └── ImageUploader.tsx
```

---

## 🌐 API Endpoints Reference

### Public & Directory
- `GET /api/vendors` — List all active fabric stall listings
- `GET /api/categories` — Fabric categories (Lawn, Cotton, Silk, Khaddar, etc.)
- `GET /api/markets` — Sub-markets in Azam Cloth Market (Kashmiri Bazaar, Chitta Bazaar, etc.)
- `POST /api/inquiries` — Log WhatsApp/call inquiry events

### Project Export & Download
- `GET /api/project/download` — Stream complete project source code as `.zip`
- `GET /api/project/stats` — Inspect project file count, size, and export manifest

### AArgard CEO Memoir & Platform Services
- `GET /api/aargard/ceo-profile` — Fetch CEO memoir, vision pillars, and quote
- `PUT /api/aargard/ceo-profile` — Update CEO profile (Admin only)
- `GET /api/aargard/updates` — Platform changelog and policy updates
- `POST /api/aargard/updates` — Publish a new platform update
- `GET /api/aargard/services` — List of Aargard digitization & logistics services
- `POST /api/aargard/assistance-requests` — Submit vendor assistance ticket
- `GET /api/aargard/assistance-requests` — List assistance tickets

### ERP Integration Rails
- `GET /api/v1/erp/status` — Health check & bridge statistics
- `POST /api/v1/erp/products/sync` — Ingest catalog prices & MOQs from mill ERPs
- `GET /api/v1/erp/leads` — Fetch buyer leads for CRM processing

---

## 📄 License & Credits
© 2026 Azam Cloth Market Traders Association & AArgard Technology.  
All Rights Reserved.
