# Quick Grocery Delivery Partner App

A modern React-based frontend application for delivery partners to manage orders, track deliveries, and monitor their earnings in real-time. Built with TypeScript, Vite, and Tailwind CSS for a fast, scalable, and responsive user experience.

## Features

- **Order Management**: View and accept delivery orders with detailed information
- **Real-time Delivery Tracking**: Track active deliveries with live location updates
- **Wallet System**: Monitor earnings and transaction history
- **Order History**: Access comprehensive delivery history and performance metrics
- **Authentication**: Secure login and registration for delivery partners
- **Location Tracking**: Automatic location tracking during active deliveries
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **PWA Support**: Progressive Web App capabilities for offline functionality

## Tech Stack

### Frontend Framework & Build Tools

- **React 19** - UI library
- **TypeScript** - Static type checking
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS transformations

### State Management & Data Fetching

- **Zustand** - Lightweight state management
- **TanStack React Query (v5)** - Server state management and caching
- **Axios** - HTTP client

### Forms & Validation

- **React Hook Form** - Performant form management
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Integration layer for form validation

### Routing & Navigation

- **React Router DOM v6** - Client-side routing

### UI & UX

- **React Hot Toast** - Toast notifications

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-aware linting
- **PWA Plugin** - Progressive Web App support
- **Workbox** - Service worker utilities

## Project Structure

```
src/
├── components/           # Reusable React components
│   ├── layout/          # Layout components (AppShell, Header)
│   ├── ActiveDelivery.tsx
│   ├── DeliveryPartnerRuntime.tsx
│   ├── OrderRequestCard.tsx
│   ├── OrderRequestListener.tsx
│   └── ProfileHeader.tsx
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── HomePage.tsx
│   ├── AccountPage.tsx
│   └── DeliveryHistoryPage.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useLocationTracking.ts
│   ├── useOrderRequests.ts
│   ├── useOrders.ts
│   ├── useOrderStatus.ts
│   ├── useOrderTracking.ts
│   └── useWallet.ts
├── stores/              # Zustand stores (state management)
│   ├── authStore.ts
│   ├── locationStore.ts
│   ├── orderStore.ts
│   ├── uiStore.ts
│   └── walletStore.ts
├── lib/                 # Utilities & libraries
│   ├── apiClient.ts     # API configuration
│   ├── parsers.ts       # Data parsing utilities
│   └── queryClient.ts   # React Query configuration
├── constants/           # Application constants
│   └── orderStatus.ts
├── assets/              # Static assets
├── App.tsx              # Root component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd quick-grocery-delivery-partner-app
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables
   Create a `.env` file in the root directory with necessary API endpoints:

```
VITE_API_BASE_URL=<your-api-endpoint>
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Key Components

### Authentication

- Secure login and registration for delivery partners
- Protected routes using `ProtectedRoute` component
- Token-based authentication with `useAuth` hook

### Order Management

- Real-time order request listening with `OrderRequestListener`
- Order cards displaying delivery details
- Order status tracking and updates

### Location Tracking

- Background location tracking during deliveries
- Real-time location updates to the server
- Efficient battery usage with `useLocationTracking` hook

### Wallet & Earnings

- View current balance and transaction history
- Track earnings from completed deliveries
- Real-time wallet updates

## API Integration

The application uses Axios for HTTP requests with a centralized API client configuration in [lib/apiClient.ts](lib/apiClient.ts).

Key endpoints include:

- Authentication endpoints (login, register)
- Order management endpoints
- Location tracking endpoints
- Wallet and earnings endpoints

## Performance Optimizations

- Code splitting with Vite
- Image optimization
- Lazy loading of routes
- Efficient state management with Zustand
- Server state caching with React Query
- PWA support for offline capabilities

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the existing code style
3. Run linting: `npm run lint`
4. Commit with clear messages
5. Submit a pull request

## License

This project is proprietary and confidential.

## Support

For issues or questions, please contact the development team or open an issue in the project repository.
