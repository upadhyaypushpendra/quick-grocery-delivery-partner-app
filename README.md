# QuickGrocery - Delivery Partner Frontend

A React PWA for delivery partners to manage order pickups, track deliveries, share real-time location, and manage earnings.

## Features

- 📍 **Real-time Location Tracking** - GPS updates every 30 seconds
- 🎯 **Order Management** - Accept/decline delivery requests via SSE
- 📦 **Delivery Workflow** - 4-step status tracking (pickup → out for delivery → reached → delivered)
- 💰 **Wallet System** - Real-time earnings tracking and balance management
- 🔐 **Authentication** - Secure login/register with JWT tokens
- 📱 **PWA** - Installable app with offline support

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **State Management**: Zustand + TanStack Query
- **Real-time**: Server-Sent Events (SSE) for order requests & status updates
- **Styling**: Tailwind CSS v4
- **API Client**: Axios with automatic token refresh
- **PWA**: vite-plugin-pwa + Workbox

## Project Structure

```
src/
├── components/          # Reusable React components
│   └── layout/         # Layout components (Navbar, AppShell)
├── hooks/              # Custom React hooks for API calls
├── pages/              # Page components for routes
├── stores/             # Zustand state management
├── lib/                # Utilities (apiClient, queryClient)
├── assets/             # Images, icons
├── App.tsx             # Router configuration
└── main.tsx            # Entry point
```

## Installation

```bash
cd dp-frontend
npm install --legacy-peer-deps
npm run dev
```

The app will start at `http://localhost:5173` and proxy API calls to `http://localhost:3000`.

## Environment Variables

Create `.env.local` (copy from `.env.example`):

```bash
VITE_API_URL=/api
VITE_DEBUG=false
VITE_LOCATION_UPDATE_INTERVAL_SECONDS=30
VITE_LOCATION_TIMEOUT_SECONDS=10
VITE_GEOLOCATION_ENABLED=true
```

## Routes

- `/` - Home
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/dashboard` - Active orders dashboard (protected)
- `/delivery/:orderId` - Delivery tracking (protected)
- `/wallet` - Earnings & wallet (protected)
- `/account` - Profile & settings (protected)
- `/history` - Delivery history (protected)

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Stores

- **dpAuthStore** - Authentication state (user, token, wallet balance)
- **locationStore** - Current location, tracking status
- **orderStore** - Current order, queue, history
- **walletStore** - Balance, earnings, transactions

## API Endpoints Used

### Auth
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/refresh`

### Location
- `POST /api/delivery-partners/location`

### Orders
- `GET /api/delivery-partners/order-requests` (SSE)
- `POST /api/delivery-partners/orders/:id/accept`
- `POST /api/delivery-partners/orders/:id/decline`
- `POST /api/delivery-partners/orders/:id/status`

### Wallet
- `GET /api/delivery-partners/wallet`

## Implementation Phases

Phase 1: ✅ Project Setup
Phase 2: Auth System
Phase 3: Location Tracking
Phase 4: Order Request System
Phase 5: Delivery Tracking
Phase 6: Wallet & Earnings
Phase 7: Core Pages & Navigation
Phase 8: Router Configuration

See `.env.example` for detailed environment configuration options.
