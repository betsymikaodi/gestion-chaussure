# Project Structure Overview

## Directory Layout

```
shoe-store-app/
│
├── app/                           # Expo Router - File-based routing
│   ├── (auth)/                   # Authentication group
│   │   ├── _layout.tsx           # Auth layout wrapper
│   │   ├── login.tsx             # Login screen
│   │   ├── signup.tsx            # Signup screen
│   │   └── forgot-password.tsx   # Password reset screen
│   │
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Home/Catalog screen (Tab 1)
│   │   ├── cart.tsx              # Shopping cart screen (Tab 2)
│   │   ├── orders.tsx            # Order history screen (Tab 3)
│   │   ├── profile.tsx           # User profile screen (Tab 4)
│   │   └── filters.tsx           # Product filters (modal)
│   │
│   ├── admin/                    # Admin panel screens
│   │   ├── index.tsx             # Admin dashboard
│   │   ├── products.tsx          # Product management
│   │   └── orders.tsx            # Order management
│   │
│   ├── product/                  # Product detail screen
│   │   └── [id].tsx              # Dynamic route for product ID
│   │
│   ├── order/                    # Order detail screen
│   │   └── [id].tsx              # Dynamic route for order ID
│   │
│   ├── checkout.tsx              # Checkout screen
│   ├── index.tsx                 # App entry point (redirect logic)
│   ├── _layout.tsx               # Root layout with providers
│   └── +not-found.tsx            # 404 error screen
│
├── components/                    # Reusable React components
│   ├── ui/                       # Generic UI components
│   │   ├── Button.tsx            # Custom button component
│   │   └── Input.tsx             # Custom input component
│   ├── ProductCard.tsx           # Product display card
│   └── CartItemCard.tsx          # Cart item display card
│
├── contexts/                      # React Context providers
│   └── AuthContext.tsx           # Authentication state management
│
├── hooks/                        # Custom React hooks
│   ├── useProducts.ts            # Product data fetching
│   ├── useCart.ts                # Cart management
│   ├── useOrders.ts              # Orders data fetching
│   └── useFrameworkReady.ts      # Framework initialization hook
│
├── lib/                          # External library configurations
│   ├── supabase.ts               # Supabase client setup
│   ├── stripe.ts                 # Stripe configuration
│   └── queryClient.ts            # React Query configuration
│
├── types/                        # TypeScript type definitions
│   ├── database.types.ts         # Database schema types
│   └── env.d.ts                  # Environment variable types
│
├── __tests__/                    # Unit tests
│   ├── Button.test.tsx           # Button component tests
│   └── ProductCard.test.tsx      # ProductCard component tests
│
├── assets/                       # Static assets
│   └── images/                   # Image files
│       ├── icon.png              # App icon
│       └── favicon.png           # Web favicon
│
├── .env.example                  # Environment variables template
├── .prettierrc                   # Prettier configuration
├── app.json                      # Expo configuration
├── package.json                  # NPM dependencies
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Main documentation
├── DEPLOYMENT.md                 # Deployment guide
├── API.md                        # API documentation
└── PROJECT_STRUCTURE.md          # This file
```

## Key Files Explained

### Root Configuration Files

**`app.json`**
- Expo project configuration
- App name, slug, version
- Platform-specific settings (iOS, Android, Web)
- Plugins and experimental features

**`package.json`**
- Project dependencies
- NPM scripts (dev, build, typecheck)
- Project metadata

**`tsconfig.json`**
- TypeScript compiler options
- Path aliases (@/ for root)
- Include/exclude patterns

**`.env.example`**
- Template for environment variables
- Required API keys and URLs
- Copy to `.env` for local development

### App Directory (Routing)

**`app/_layout.tsx`**
- Root layout component
- Wraps entire app
- Provides React Query, Auth context
- Configures all routes

**`app/index.tsx`**
- App entry point
- Redirects to login or tabs based on auth state
- Shows loading indicator during initialization

**`app/(auth)/_layout.tsx`**
- Authentication flow layout
- Stack navigator for auth screens
- No header shown

**`app/(tabs)/_layout.tsx`**
- Bottom tab navigation configuration
- 4 tabs: Home, Cart, Orders, Profile
- Custom icons and colors

### Components

**`components/ui/Button.tsx`**
- Reusable button component
- Multiple variants (primary, secondary, outline, danger)
- Sizes (small, medium, large)
- Loading and disabled states

**`components/ui/Input.tsx`**
- Reusable text input component
- Label, error message support
- Left and right icon slots
- Consistent styling

**`components/ProductCard.tsx`**
- Displays product information
- Image, brand, name, price
- Color dots preview
- Touchable for navigation

**`components/CartItemCard.tsx`**
- Cart item display
- Quantity controls (+/-)
- Remove button
- Calculates item total

### Contexts

**`contexts/AuthContext.tsx`**
- Global authentication state
- User, session, profile data
- Auth functions (signIn, signUp, signOut, resetPassword)
- Automatic session management
- Profile fetching and caching

### Hooks

**`hooks/useProducts.ts`**
- Fetches products from Supabase
- Filtering (search, brand, price, size, category)
- Single product fetching
- React Query integration

**`hooks/useCart.ts`**
- Fetches user's cart items
- Update quantity, remove items
- Clear cart
- Calculates total
- Optimistic updates

**`hooks/useOrders.ts`**
- Fetches user orders
- Admin: all orders
- Update order status (admin)
- Real-time updates support

**`hooks/useFrameworkReady.ts`**
- Signals framework initialization complete
- Required for Bolt framework integration
- Must not be removed

### Library Configuration

**`lib/supabase.ts`**
- Initializes Supabase client
- AsyncStorage for session persistence
- TypeScript types from database schema
- Auto-refresh tokens

**`lib/stripe.ts`**
- Stripe React Native configuration
- Publishable key setup
- Provider and hooks exports

**`lib/queryClient.ts`**
- React Query configuration
- Cache time: 24 hours
- Stale time: 5 minutes
- AsyncStorage persister for offline support

### Types

**`types/database.types.ts`**
- Generated from Supabase schema
- Table row, insert, update types
- Helper type exports
- OrderItem, ShippingAddress interfaces

**`types/env.d.ts`**
- Environment variable types
- Ensures type safety for process.env
- Documents required variables

### Tests

**`__tests__/Button.test.tsx`**
- Button component unit tests
- Tests variants, sizes, states
- Ensures proper rendering

**`__tests__/ProductCard.test.tsx`**
- ProductCard component unit tests
- Tests with different product data
- Edge cases (no images, many colors)

## Data Flow

### Authentication Flow
```
User Input (Login)
  ↓
AuthContext.signIn()
  ↓
Supabase Auth API
  ↓
Session Stored (AsyncStorage)
  ↓
Profile Fetched
  ↓
Navigate to (tabs)
```

### Product Catalog Flow
```
HomeScreen Mount
  ↓
useProducts() Hook
  ↓
React Query Cache Check
  ↓ (cache miss or stale)
Supabase API Call
  ↓
Filter, Search Applied
  ↓
Data Cached (React Query + AsyncStorage)
  ↓
Render ProductCards
```

### Add to Cart Flow
```
User Selects Size, Color
  ↓
ProductDetailScreen.handleAddToCart()
  ↓
Check Existing Cart Item (Supabase)
  ↓ (exists)
Update Quantity
  ↓ (doesn't exist)
Insert New Cart Item
  ↓
React Query Cache Invalidation
  ↓
Cart Badge Updated
```

### Checkout Flow
```
CartScreen → Checkout Button
  ↓
CheckoutScreen
  ↓
Review Order Summary
  ↓
Place Order Button
  ↓
Create Order Record (Supabase)
  ↓
Clear Cart
  ↓
Navigate to Orders
```

### Admin Flow
```
Admin User Login
  ↓
Profile.is_admin = true
  ↓
Admin Button in Profile
  ↓
Admin Dashboard
  ↓
Manage Products or Orders
  ↓
CRUD Operations (RLS Protected)
```

## Security Model

### Row Level Security (RLS)

**Profiles Table**
- Users can read/update own profile
- Admin status checked for admin operations

**Products Table**
- Public read access (everyone)
- Admin-only write access

**Cart Items Table**
- Users can only access own cart items
- All CRUD operations scoped to user_id

**Orders Table**
- Users can view own orders
- Users can create orders
- Admins can view all orders
- Admins can update order status

**Addresses Table**
- Users can manage own addresses only
- Full CRUD scoped to user_id

### Authentication Security
- JWT tokens with auto-refresh
- Tokens stored in AsyncStorage (secure on device)
- No sensitive data in tokens
- Password requirements enforced
- Email verification available (disabled by default)

## Offline Support

### What Works Offline

**React Query Cache**
- Last fetched products
- User profile
- Cart items
- Order history

**AsyncStorage Persistence**
- React Query cache persisted
- Auth session persisted
- User preferences

### What Requires Online

- Authentication operations
- Creating/updating data
- Real-time features
- Image loading

### Sync Strategy

1. User goes offline
2. Cached data shown from AsyncStorage
3. User comes back online
4. React Query automatically refetches stale data
5. UI updates with fresh data

## Performance Optimizations

### React Query Caching
- 5 minute stale time (data considered fresh)
- 24 hour cache time (data kept in memory)
- Background refetching on window focus
- Automatic retry on failure (2 attempts)

### Image Optimization
- External CDN (Pexels) for product images
- Lazy loading in FlatLists
- Placeholder while loading
- Proper sizing for different screens

### Code Splitting
- Route-based splitting (Expo Router)
- Lazy component loading
- Minimal bundle size

### List Virtualization
- FlatList for long product lists
- Only renders visible items
- Smooth scrolling performance

## State Management Strategy

### Global State (Context)
- Authentication (user, session, profile)
- Shared across entire app

### Server State (React Query)
- Products, cart, orders
- Automatic caching and invalidation
- Optimistic updates

### Local State (useState)
- Form inputs
- UI toggles
- Component-specific state

### URL State (Expo Router)
- Product ID in URL
- Order ID in URL
- Navigation state

## Development Workflow

### Starting Development
```bash
npm install          # Install dependencies
cp .env.example .env # Create environment file
# Add your Supabase credentials to .env
npm run dev          # Start development server
```

### Making Changes

**Adding a New Screen**
1. Create file in `app/` directory
2. File name becomes route path
3. Export default React component
4. Add to `app/_layout.tsx` if needed

**Adding a New Component**
1. Create file in `components/`
2. Export component
3. Import where needed
4. Follow existing patterns

**Adding Database Table**
1. Create migration in Supabase
2. Update `types/database.types.ts`
3. Add RLS policies
4. Create custom hook in `hooks/`

### Testing Changes
```bash
npm run typecheck    # Check TypeScript
npm test            # Run unit tests
npm run build:web   # Test production build
```

## Common Patterns

### Fetching Data
```typescript
// Use existing hooks
const { data, isLoading, error } = useProducts();

// Or create custom React Query hook
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: async () => {
    const { data } = await supabase.from('table').select();
    return data;
  },
});
```

### Updating Data
```typescript
const mutation = useMutation({
  mutationFn: async (newData) => {
    const { error } = await supabase
      .from('table')
      .update(newData)
      .eq('id', id);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['key']);
  },
});
```

### Protected Routes
```typescript
// Check auth in component
const { user } = useAuth();

if (!user) {
  return <SignInPrompt />;
}

// Or redirect
useEffect(() => {
  if (!user) {
    router.replace('/(auth)/login');
  }
}, [user]);
```

### Admin-Only Features
```typescript
const { profile } = useAuth();

if (!profile?.is_admin) {
  return <AccessDenied />;
}
```

## Troubleshooting

### Common Issues

**"Supabase not defined"**
- Check .env file exists
- Verify EXPO_PUBLIC_ prefix on variables
- Restart development server

**"RLS policy violation"**
- Check user is authenticated
- Verify RLS policies in Supabase dashboard
- Ensure user_id matches auth.uid()

**"Module not found"**
- Check import path uses @/ alias
- Verify file exists at path
- Clear cache: `npx expo start -c`

**"Type error in IDE"**
- Run `npm run typecheck`
- Update database types if schema changed
- Check TypeScript version compatibility

## Next Steps

To continue developing this app:

1. **Add Features**: Wishlist, reviews, ratings
2. **Improve UI**: Animations, transitions
3. **Add Tests**: More component and integration tests
4. **Optimize**: Bundle size, image loading
5. **Deploy**: Follow DEPLOYMENT.md guide
6. **Monitor**: Set up error tracking, analytics

## Resources

- **Expo Docs**: https://docs.expo.dev
- **Supabase Docs**: https://supabase.com/docs
- **React Query**: https://tanstack.com/query/latest
- **Stripe Mobile**: https://stripe.com/docs/mobile
