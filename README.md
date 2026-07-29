# 🌾 Farm Marketplace

A modern e-commerce web application for buying, selling, and subscribing to fresh farm products from local farmers.

## Features

- **Browse Products**: Explore products by category (Vegetables, Fruits, Grains, Dairy, Livestock, Organic, Supplies)
- **Search**: Filter products by name in real-time
- **Category Filters**: Click category pills to filter products
- **Add to Cart**: Add products to cart (logs to console)
- **Subscriptions**: Weekly subscription packages with 15% off
- **Wholesale**: Bulk ordering for B2B buyers with 5% discount on 100kg+

## Project Structure

```
farm-marketplace/
├── src/                          # React frontend
│   ├── App.tsx                   # Main app entry
│   ├── main.tsx                  # React DOM render
│   ├── presentation/             # UI components
│   │   ├── atoms/                # Simple components (Header)
│   │   ├── molecules/            # Combined components (GridViewCategory, GridViewProduct)
│   │   ├── templates/           # Page layouts (homePage)
│   │   └── layouts/             # Layout wrappers
│   ├── application/              # Business logic
│   ├── domain/                   # Data models
│   └── infrastructure/           # API, database
├── server/                       # Express backend
│   ├── server.js                 # Main server
│   ├── schema-and-seed.sql       # Database schema
│   └── seed.js                   # Seed data
├── package.json                  # Dependencies & scripts
└── vite.config.js                # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start both backend and frontend:

**Terminal 1 - Backend:**
```bash
npm run start
```
The backend server runs at http://localhost:5001

**Terminal 2 - Frontend:**
```bash
npm run dev
```
The frontend runs at http://localhost:5173

### Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server (frontend) |
| `npm start` | Start Express backend (port 5001) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Architecture

This project follows **React Best Practices** with a layered architecture:

- **Presentation Layer**: UI components (Atoms, Molecules, Templates, Pages)
- **Application Layer**: Business logic, hooks, services
- **Domain Layer**: Data models and types
- **Infrastructure Layer**: API calls, database

## API Endpoints

- `GET /api/products` - Fetch all products
- `POST /api/cart` - Add item to cart
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Technology Stack

- **Frontend**: React 18, Vite, TypeScript
- **Backend**: Express.js, SQLite
- **Styling**: Tailwind CSS
- **Architecture**: React Best Practices (layered + component tiers)

## License

MIT
