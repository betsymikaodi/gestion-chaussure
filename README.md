# Shoe Store Mobile App

A complete, production-ready mobile application for managing and selling shoes, built with React Native, Expo, TypeScript, and Supabase.

## Features

### User Features
- **Authentication**: Email/password signup, login, and password recovery
- **Product Catalog**: Browse shoes with search and filter capabilities
- **Product Details**: View detailed information with image carousel
- **Shopping Cart**: Add items, modify quantities, and manage cart
- **Checkout**: Place orders with shipping address
- **Order History**: Track order status and view past purchases
- **User Profile**: Manage account information and addresses

### Admin Features
- **Dashboard**: Overview of sales, orders, and product statistics
- **Product Management**: Full CRUD operations for products
- **Order Management**: View all orders and update statuses
- **Admin Access Control**: Role-based permissions

### Technical Features
- **Offline Support**: Automatic caching with React Query and AsyncStorage
- **Type Safety**: Full TypeScript implementation
- **Form Validation**: Using Formik and Yup
- **Secure Authentication**: Supabase Auth with JWT
- **Database**: PostgreSQL with Row Level Security
- **Payment Ready**: Stripe integration structure

## Tech Stack

- **Frontend**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Query (TanStack Query)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Forms**: Formik + Yup
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native
- **Storage**: AsyncStorage
- **Payments**: Stripe React Native (structure ready)

## Project Structure

```
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/              # Main tab navigation
│   │   ├── index.tsx        # Product catalog
│   │   ├── cart.tsx         # Shopping cart
│   │   ├── orders.tsx       # Order history
│   │   └── profile.tsx      # User profile
│   ├── admin/               # Admin screens
│   │   ├── index.tsx        # Admin dashboard
│   │   ├── products.tsx     # Product management
│   │   └── orders.tsx       # Order management
│   ├── product/[id].tsx     # Product detail
│   ├── order/[id].tsx       # Order detail
│   ├── checkout.tsx         # Checkout screen
│   └── _layout.tsx          # Root layout
├── components/              # Reusable components
│   ├── ui/                  # UI components
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── ProductCard.tsx
│   └── CartItemCard.tsx
├── contexts/                # React contexts
│   └── AuthContext.tsx
├── hooks/                   # Custom hooks
│   ├── useProducts.ts
│   ├── useCart.ts
│   ├── useOrders.ts
│   └── useFrameworkReady.ts
├── lib/                     # Configuration
│   ├── supabase.ts
│   ├── stripe.ts
│   └── queryClient.ts
├── types/                   # TypeScript types
│   ├── database.types.ts
│   └── env.d.ts
└── __tests__/              # Unit tests
    ├── Button.test.tsx
    └── ProductCard.test.tsx
```

## Database Schema

### Tables
- **profiles**: User profiles with admin flag
- **products**: Shoe products with images, sizes, colors, and stock
- **addresses**: User shipping addresses
- **cart_items**: Shopping cart items
- **orders**: Order records with items and status

### Security
- Row Level Security (RLS) enabled on all tables
- Authenticated users can only access their own data
- Admins have elevated permissions for management
- Public read access for products only

## Installation

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- Supabase account
- Stripe account (for payments)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd shoe-store-app
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Step 3: Database Setup

The database schema has already been applied. To add sample data:

1. Navigate to your Supabase project
2. Go to SQL Editor
3. The sample data includes 10 products with various brands

### Step 4: Create Admin User

After signing up, set admin privileges manually in Supabase:

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

### Step 5: Run the App

```bash
# Start development server
npm run dev

# For web
Press 'w' in terminal

# For iOS (Mac only)
Press 'i' in terminal

# For Android
Press 'a' in terminal
```

## API Endpoints (Supabase)

All API calls use Supabase client methods:

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

### Cart
- `GET /cart_items` - Get user's cart
- `POST /cart_items` - Add to cart
- `PUT /cart_items/:id` - Update quantity
- `DELETE /cart_items/:id` - Remove from cart

### Orders
- `GET /orders` - Get user's orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order status (admin)

### Auth
- `POST /auth/signup` - Create account
- `POST /auth/signin` - Sign in
- `POST /auth/signout` - Sign out
- `POST /auth/reset-password` - Reset password

## Usage Examples

### Adding a Product (Admin)

```typescript
const { error } = await supabase.from('products').insert({
  name: 'Air Max 90',
  brand: 'Nike',
  price: 129.99,
  description: 'Classic Air Max design',
  images: ['https://example.com/image.jpg'],
  sizes: [7, 8, 9, 10, 11],
  colors: ['#000000', '#FFFFFF'],
  stock_by_size: { '7': 10, '8': 15, '9': 20, '10': 15, '11': 10 },
  categories: ['Running', 'Lifestyle']
});
```

### Searching Products

```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .or('name.ilike.%nike%,brand.ilike.%nike%')
  .gte('price', 50)
  .lte('price', 200);
```

### Creating an Order

```typescript
const { error } = await supabase.from('orders').insert({
  user_id: user.id,
  order_number: 'ORD-12345',
  status: 'pending',
  items: orderItems,
  total_amount: 299.98,
  shipping_address: {
    street: '123 Main St',
    city: 'New York',
    postal_code: '10001',
    country: 'US'
  }
});
```

## Testing

Basic unit tests are included for key components:

```bash
# Run tests (requires @testing-library/react-native setup)
npm test
```

Tests cover:
- Button component variants and states
- ProductCard rendering and edge cases

## Stripe Integration

The app includes Stripe payment structure. To enable payments:

1. Install Stripe dependencies (already included)
2. Set up Stripe account and get publishable key
3. Implement payment intent creation on backend
4. Use `useStripe()` hook in checkout flow

Example payment flow:

```typescript
import { useStripe } from '@stripe/stripe-react-native';

const { initPaymentSheet, presentPaymentSheet } = useStripe();

// Initialize payment sheet with client secret from backend
await initPaymentSheet({
  paymentIntentClientSecret: clientSecret,
  merchantDisplayName: 'Shoe Store'
});

// Present payment UI
const { error } = await presentPaymentSheet();
```

## Offline Support

The app automatically caches data using React Query and AsyncStorage:

- Products are cached for 5 minutes
- Cart data persists across app restarts
- Orders history available offline
- Automatic data synchronization when online

## Building for Production

### iOS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android
```

### Web

```bash
# Build web version
npm run build:web
```

## Deployment

### Expo Application Services (EAS)

1. Create Expo account
2. Configure `eas.json`
3. Run `eas build` for builds
4. Use `eas submit` for store submissions

### Environment Variables in EAS

Set secrets in EAS:

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value <value>
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <value>
eas secret:create --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value <value>
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Row Level Security** - All tables have RLS enabled
3. **JWT Authentication** - Secure token-based auth
4. **Input Validation** - Formik + Yup on all forms
5. **HTTPS Only** - All API calls use secure connections

## Troubleshooting

### Common Issues

**Problem**: Can't connect to Supabase
- Verify environment variables in `.env`
- Check Supabase project is active
- Confirm anon key is correct

**Problem**: Products not loading
- Ensure sample data is inserted
- Check RLS policies allow public read on products
- Verify network connection

**Problem**: Admin features not accessible
- Confirm user has `is_admin = true` in profiles table
- Check you're logged in with admin account

**Problem**: Stripe not working
- Verify Stripe publishable key in `.env`
- Check Stripe account is active
- Implement backend payment intent creation

## Performance Optimization

- React Query caching reduces API calls
- Image optimization with Pexels CDN
- Lazy loading for large lists
- AsyncStorage persistence for offline use
- Optimistic updates for better UX

## Future Enhancements

- Push notifications with Firebase Cloud Messaging
- Product reviews and ratings
- Wishlist functionality
- Multiple payment methods
- Advanced filters (size, color, price range)
- Order tracking with shipping updates
- Social login (Google, Apple)
- Product recommendations
- Inventory alerts for admins

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review Supabase and Expo docs

## Acknowledgments

- Expo team for amazing framework
- Supabase for backend infrastructure
- React Native community
- Pexels for product images
