# ReVogue - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Structure](#backend-structure)
4. [Frontend Structure](#frontend-structure)
5. [Database Schema](#database-schema)
6. [Authentication Flow](#authentication-flow)
7. [Key Features](#key-features)
8. [API Endpoints](#api-endpoints)
9. [Component Structure](#component-structure)
10. [Data Flow](#data-flow)
11. [Development Setup](#development-setup)

---

## Project Overview

**ReVogue** is a full-stack e-commerce fashion platform built with:
- **Backend**: NestJS (Node.js framework) with TypeScript
- **Frontend**: Next.js 16 with React and TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS

The platform allows users to:
- Browse and purchase fashion items (Buyers)
- Create and manage product listings (Sellers)
- Manage orders and inventory

---

## Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Next.js       │         │   NestJS API    │         │   PostgreSQL    │
│   Frontend      │◄───────►│   Backend       │◄───────►│   Database      │
│   (Port 3000)   │  HTTP   │   (Port 3001)   │  SQL    │   (Port 5432)   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Technology Stack

**Backend:**
- NestJS - Progressive Node.js framework
- TypeORM - ORM for database operations
- Passport - Authentication middleware
- JWT - Token-based authentication
- Swagger - API documentation
- bcrypt - Password hashing

**Frontend:**
- Next.js 16 - React framework with App Router
- TypeScript - Type safety
- Tailwind CSS - Utility-first CSS framework
- React Hooks - State management
- LocalStorage - Client-side data persistence

---

## Backend Structure

### Directory Structure

```
Backend/revogue-backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts # Auth endpoints
│   │   ├── auth.service.ts    # Auth business logic
│   │   ├── auth.module.ts      # Auth module definition
│   │   ├── guards/             # Route guards (JWT, Roles)
│   │   ├── strategies/          # Passport strategies
│   │   ├── decorators/         # Custom decorators (@Roles)
│   │   └── dto/                # Data Transfer Objects
│   ├── users/                  # User management
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── entities/           # User entity (database model)
│   │   └── dto/                # User DTOs
│   ├── products/               # Product management
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.module.ts
│   │   ├── entities/           # Product entity
│   │   └── dto/                # Product DTOs
│   └── orders/                 # Order management
│       ├── orders.controller.ts
│       ├── orders.service.ts
│       ├── orders.module.ts
│       ├── entities/           # Order & OrderItem entities
│       └── dto/                # Order DTOs
├── migrations/                 # Database migrations
│   ├── 001_initial_schema.sql
│   ├── 002_seed_data.sql
│   └── 003_add_product_images.sql
└── scripts/                    # Utility scripts
    └── update-product-images.js
```

### Module Pattern

NestJS uses a modular architecture. Each feature is organized as a module:

1. **Module** (`*.module.ts`) - Defines dependencies and exports
2. **Controller** (`*.controller.ts`) - Handles HTTP requests/responses
3. **Service** (`*.service.ts`) - Contains business logic
4. **Entity** (`*.entity.ts`) - Database model definition
5. **DTO** (`*.dto.ts`) - Data validation and transformation

### Key Backend Concepts

#### 1. Authentication System

**Flow:**
```
User Login → AuthService.validateUser() → Generate JWT → Return token + user data
```

**Components:**
- `JwtStrategy`: Validates JWT tokens from requests
- `JwtAuthGuard`: Protects routes requiring authentication
- `RolesGuard`: Enforces role-based access control
- `@Roles()` decorator: Specifies required roles for endpoints

**Example:**
```typescript
@Get('seller/my-products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
async getMyProducts(@Request() req) {
  return this.productsService.getSellerProducts(req.user.id);
}
```

#### 2. Database Entities

Entities define the database schema using TypeORM decorators:

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true })
  email: string;
  
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;
  // ...
}
```

#### 3. Data Transfer Objects (DTOs)

DTOs validate incoming data:

```typescript
export class CreateProductDto {
  @IsString()
  name: string;
  
  @IsInt()
  @Min(0)
  price: number;
  
  @IsEnum(ProductCategory)
  category: ProductCategory;
}
```

---

## Frontend Structure

### Directory Structure

```
Frontend/revogue-frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── signup/
│   │   └── page.tsx          # Signup page
│   ├── store/
│   │   ├── page.tsx         # Store/product listing
│   │   └── loading.tsx      # Loading state
│   ├── seller/
│   │   └── dashboard/
│   │       └── page.tsx     # Seller dashboard
│   └── orders/
│       └── page.tsx         # Orders page
├── components/                # Reusable components
│   ├── header.tsx           # Navigation header
│   ├── product-card.tsx     # Product display card
│   ├── product-modal.tsx    # Product detail modal
│   ├── product-filters.tsx  # Category filters
│   ├── add-product-modal.tsx # Add product form
│   ├── cart-sheet.tsx       # Shopping cart
│   └── ui/                  # UI primitives
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
├── hooks/                    # Custom React hooks
│   ├── use-auth.ts          # Authentication hook
│   ├── use-cart.ts          # Shopping cart hook
│   └── use-toast.ts         # Toast notifications
└── lib/                      # Utilities
    └── api.ts               # API helper functions
```

### Next.js App Router

The project uses Next.js 16 App Router:
- **File-based routing**: Each folder in `app/` becomes a route
- **Server Components by default**: Components are server-rendered unless marked with `"use client"`
- **Client Components**: Use `"use client"` for interactive components

### Key Frontend Concepts

#### 1. Client Components

Components that need interactivity are marked with `"use client"`:

```typescript
"use client"

import { useState } from "react"

export function ProductCard({ product }) {
  const [showModal, setShowModal] = useState(false)
  // ...
}
```

#### 2. State Management

- **Local State**: `useState` for component-level state
- **LocalStorage**: For persistent data (cart, auth tokens)
- **URL Search Params**: For filters and routing state

#### 3. Authentication State

Authentication state is managed via:
- `localStorage` for token and user data
- `Header` component listens for storage changes
- Automatic redirects based on user role

---

## Database Schema

### Tables

#### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'buyer',
    is_email_verified BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Roles:**
- `buyer` - Can browse and purchase products
- `seller` - Can create and manage products
- `admin` - Full system access (future)

#### 2. Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,  -- Stored in paisa (cents)
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(100),
    image_url TEXT,
    seller_id UUID NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    sizes TEXT[],
    colors TEXT[],
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Categories:**
- Tops, Bottoms, Outerwear, Dresses, Footwear, Accessories

#### 3. Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    subtotal INTEGER NOT NULL,
    shipping_cost INTEGER NOT NULL,
    tax INTEGER NOT NULL,
    total INTEGER NOT NULL,
    shipping_name VARCHAR(255) NOT NULL,
    shipping_email VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 4. Order Items Table
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### Relationships

```
Users (1) ──→ (N) Products (seller_id)
Users (1) ──→ (N) Orders (user_id)
Orders (1) ──→ (N) OrderItems (order_id)
Products (1) ──→ (N) OrderItems (product_id)
```

---

## Authentication Flow

### Registration Flow

```
1. User fills signup form
2. Frontend sends POST /auth/signup
3. Backend validates data
4. Backend hashes password with bcrypt
5. Backend creates user in database
6. Backend generates JWT token
7. Backend returns token + user data
8. Frontend stores token in localStorage
9. Frontend redirects based on role
```

### Login Flow

```
1. User enters credentials
2. Frontend sends POST /auth/login
3. Backend validates credentials
4. Backend compares password hash
5. Backend generates JWT token
6. Backend returns token + user data
7. Frontend stores in localStorage
8. Frontend updates Header component
9. Frontend redirects to dashboard/store
```

### Protected Route Flow

```
1. User requests protected endpoint
2. Frontend includes JWT in Authorization header
3. JwtAuthGuard validates token
4. JwtStrategy extracts user from token
5. RolesGuard checks user role
6. If authorized, request proceeds
7. If unauthorized, returns 401/403
```

### Token Structure

JWT payload contains:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "seller"
}
```

---

## Key Features

### 1. Product Management (Sellers)

**Seller Dashboard** (`/seller/dashboard`):
- View all products
- Add new products
- Delete products
- View inventory statistics
- Track inventory value

**Add Product Flow:**
```
1. Click "Add Product" button
2. Modal opens with form
3. Fill product details (name, price, category, etc.)
4. Submit form
5. POST /products with JWT token
6. Backend validates and creates product
7. Frontend refreshes product list
```

### 2. Product Browsing (Buyers)

**Store Page** (`/store`):
- Browse all products
- Filter by category
- Search products
- View product details
- Add to cart

**Filtering Logic:**
```
1. User clicks category filter
2. RadioGroup updates URL search params
3. useEffect detects param change
4. fetchProducts() called with new params
5. Backend filters products by category
6. Frontend displays filtered results
```

### 3. Shopping Cart

**Cart Management:**
- Stored in `localStorage` (client-side)
- Add/remove items
- Update quantities
- Calculate totals
- Persist across sessions

**Cart Structure:**
```typescript
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  // ... other product fields
}
```

### 4. Order Management

**Order Creation:**
```
1. User reviews cart
2. User enters shipping information
3. Frontend calculates totals
4. POST /orders with order data
5. Backend creates order and order items
6. Backend updates product stock
7. Frontend clears cart
8. Frontend redirects to orders page
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login user | No |

### Products

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/products` | Get all products (with filters) | No | - |
| GET | `/products/:id` | Get product by ID | No | - |
| GET | `/products/featured` | Get featured products | No | - |
| GET | `/products/seller/my-products` | Get seller's products | Yes | Seller |
| POST | `/products` | Create new product | Yes | Seller |
| PUT | `/products/:id` | Update product | Yes | Seller |
| DELETE | `/products/:id` | Delete product | Yes | Seller |
| POST | `/products/update-images` | Update product images | No | - |

### Orders

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/orders` | Get user's orders | Yes | Buyer |
| POST | `/orders` | Create new order | Yes | Buyer |
| GET | `/orders/:id` | Get order by ID | Yes | Buyer |

### Users

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users/profile` | Get user profile | Yes | - |
| PUT | `/users/profile` | Update user profile | Yes | - |

---

## Component Structure

### Header Component

**Location:** `components/header.tsx`

**Features:**
- Displays user authentication state
- Shows cart count
- User dropdown menu
- Search functionality
- Responsive navigation

**State Management:**
- Listens to localStorage changes
- Updates on route changes
- Syncs with window focus events

### ProductCard Component

**Location:** `components/product-card.tsx`

**Features:**
- Displays product image, name, price
- Shows stock status
- "Add to Cart" button
- Opens product modal on click
- Hover effects

**Props:**
```typescript
interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  in_stock: boolean
  sizes?: string[]
  colors?: string[]
}
```

### ProductFilters Component

**Location:** `components/product-filters.tsx`

**Features:**
- Category filtering
- Radio button selection
- URL-based filter state
- Clear filters button

**How it works:**
1. Reads current filter from URL search params
2. Updates RadioGroup value
3. On change, updates URL
4. Store page detects URL change and refetches products

---

## Data Flow

### Product Listing Flow

```
User visits /store
  ↓
StorePage component mounts
  ↓
useEffect triggers fetchProducts()
  ↓
Reads searchParams from URL
  ↓
Makes GET request to /products?category=...
  ↓
Backend queries database
  ↓
Returns product array
  ↓
Frontend sets products state
  ↓
ProductCard components render
  ↓
User sees product grid
```

### Add to Cart Flow

```
User clicks "Add" on ProductCard
  ↓
addToCart() function called
  ↓
Reads cart from localStorage
  ↓
Adds product to cart array
  ↓
Saves to localStorage
  ↓
Dispatches "cartUpdated" event
  ↓
Header component listens and updates count
  ↓
Toast notification shown
```

### Authentication State Flow

```
User logs in
  ↓
Token + user data stored in localStorage
  ↓
Header component's useEffect runs
  ↓
Reads user from localStorage
  ↓
Updates user state
  ↓
Shows user menu instead of login buttons
  ↓
On route change, Header re-checks localStorage
  ↓
On storage event (other tabs), Header updates
```

---

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
cd Backend/revogue-backend
npm install

# Create .env file
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=revogue
JWT_SECRET=your-secret-key

# Run migrations
psql -U postgres -d revogue -f migrations/001_initial_schema.sql
psql -U postgres -d revogue -f migrations/002_seed_data.sql

# Start server
npm run start:dev
```

### Frontend Setup

```bash
cd Frontend/revogue-frontend
npm install

# Start dev server
npm run dev
```

### Environment Variables

**Backend (.env):**
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=revogue
JWT_SECRET=revogue-secret-key
NODE_ENV=development
```

**Frontend:**
- No .env required for basic setup
- API URL hardcoded to `http://localhost:3001`

---

## Key Design Patterns

### 1. Module Pattern (Backend)
Each feature is self-contained in its own module with clear separation of concerns.

### 2. Component Composition (Frontend)
Reusable UI components that can be composed together.

### 3. Custom Hooks
Encapsulate reusable logic (useAuth, useCart, useToast).

### 4. Guard Pattern (Backend)
Route guards protect endpoints and enforce authorization.

### 5. DTO Pattern (Backend)
Data Transfer Objects validate and transform incoming data.

---

## Security Considerations

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Input Validation**: DTOs validate all inputs
4. **SQL Injection**: TypeORM prevents SQL injection
5. **CORS**: Configured for specific origins
6. **Role-Based Access**: Guards enforce role restrictions

---

## Future Enhancements

1. **Payment Integration**: Stripe/PayPal integration
2. **Email Verification**: Send verification emails
3. **Image Upload**: Direct image upload instead of URLs
4. **Product Reviews**: Rating and review system
5. **Wishlist**: Save favorite products
6. **Admin Dashboard**: Full admin panel
7. **Search**: Advanced search with filters
8. **Pagination**: Paginate product listings
9. **Real-time Updates**: WebSocket for live updates
10. **Analytics**: Track user behavior and sales

---

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify .env credentials
   - Ensure database exists

2. **CORS Errors**
   - Verify frontend URL in backend CORS config
   - Check credentials are enabled

3. **JWT Token Issues**
   - Check token expiration
   - Verify JWT_SECRET matches
   - Clear localStorage and re-login

4. **Image Loading Issues**
   - Check next.config.js has Unsplash domain
   - Verify image URLs are valid
   - Check browser console for errors

---

## Additional Resources

- **API Documentation**: http://localhost:3001/api/docs (Swagger)
- **Next.js Docs**: https://nextjs.org/docs
- **NestJS Docs**: https://docs.nestjs.com
- **TypeORM Docs**: https://typeorm.io

---

*Last Updated: 2024*

