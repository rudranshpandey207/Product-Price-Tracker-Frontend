# Product Price Tracker — Frontend

React frontend for the Product Price Tracker, built with Vite. Lets users search INE's mock storefront, track products, and view price history and scrape logs over time.

## Live URL
https://product-price-tracker-frontend.vercel.app/

## Tech Stack
- **Framework:** React + Vite
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Hosting:** Vercel

## Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/rudranshpandey207/Product-Price-Tracker-Frontend.git
cd Product-Price-Tracker-Frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
VITE_API_URL=http://localhost:3001

For production, set `VITE_API_URL` to your Render backend URL in Vercel's environment variable settings:

VITE_API_URL=https://product-price-tracker-backend-kaqx.onrender.com


### 4. Run locally
```bash
npm run dev
```

Open http://localhost:5173

## Pages

### Dashboard
- Lists all tracked products with latest price, stock status and last scraped time
- Color coded stock badges — green for in stock, red for out of stock
- Shows min price, max price, total data points and scrape run count per product
- Refresh button to reload latest data

### Search
- Search across all 1,000 products from INE's mock store by name, brand or category
- Category icons for quick visual identification
- One click Track button to start tracking a product
- Tracked state persists across the session

### Product Detail
- Current price displayed prominently
- Stats row showing lowest price, highest price, data points and scrape runs
- Interactive price history line chart with zoomed Y axis (no false ₹0 baseline)
- Full scrape log table showing every attempt with timestamp, status, attempts, duration and error message
- Status badges — SUCCESS (green), RETRIED (amber), FAILED (red)

## Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL — use Render URL in production, localhost:3001 for local dev |

## Notes
- `VITE_` prefix is required — Vite only exposes env variables with this prefix to the browser
- Vite bakes env variables in at build time — after changing `.env` on Vercel, redeploy for changes to take effect
- The frontend has no backend logic — all scraping and database operations happen in the backend repo

