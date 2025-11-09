# API Documentation

This application uses Supabase as the backend, which provides a PostgreSQL database with auto-generated REST API endpoints. All operations use the Supabase JavaScript client.

## Base Configuration

```typescript
import { supabase } from '@/lib/supabase';
```

All requests automatically include authentication headers when a user is signed in.

## Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Then create profile
await supabase.from('profiles').insert({
  id: data.user.id,
  email: data.user.email,
  full_name: 'John Doe',
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Reset Password
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com'
);
```

### Get Current Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

## Products

### List All Products
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false });
```

### Get Product by ID
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .maybeSingle();
```

### Search Products
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .or('name.ilike.%nike%,brand.ilike.%nike%,description.ilike.%nike%');
```

### Filter Products by Brand
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('brand', 'Nike');
```

### Filter by Price Range
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .gte('price', 50)
  .lte('price', 200);
```

### Filter by Size
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .contains('sizes', [9]);
```

### Filter by Category
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .contains('categories', ['Running']);
```

### Create Product (Admin Only)
```typescript
const { data, error } = await supabase.from('products').insert({
  name: 'Air Max 90',
  description: 'Classic running shoe',
  brand: 'Nike',
  price: 129.99,
  images: ['https://example.com/image.jpg'],
  sizes: [7, 8, 9, 10, 11],
  colors: ['#000000', '#FFFFFF'],
  stock_by_size: {
    '7': 10,
    '8': 15,
    '9': 20,
    '10': 15,
    '11': 10
  },
  categories: ['Running', 'Lifestyle']
});
```

### Update Product (Admin Only)
```typescript
const { error } = await supabase
  .from('products')
  .update({ price: 119.99 })
  .eq('id', productId);
```

### Delete Product (Admin Only)
```typescript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
```

## Cart

### Get User's Cart
```typescript
const { data, error } = await supabase
  .from('cart_items')
  .select(`
    *,
    product:products(name, brand, price, images)
  `)
  .eq('user_id', userId);
```

### Add Item to Cart
```typescript
// Check if item exists first
const { data: existingItem } = await supabase
  .from('cart_items')
  .select('*')
  .eq('user_id', userId)
  .eq('product_id', productId)
  .eq('size', size)
  .eq('color', color)
  .maybeSingle();

if (existingItem) {
  // Update quantity
  await supabase
    .from('cart_items')
    .update({ quantity: existingItem.quantity + 1 })
    .eq('id', existingItem.id);
} else {
  // Insert new item
  await supabase.from('cart_items').insert({
    user_id: userId,
    product_id: productId,
    size: size,
    color: color,
    quantity: 1
  });
}
```

### Update Cart Item Quantity
```typescript
const { error } = await supabase
  .from('cart_items')
  .update({ quantity: newQuantity })
  .eq('id', cartItemId);
```

### Remove Item from Cart
```typescript
const { error } = await supabase
  .from('cart_items')
  .delete()
  .eq('id', cartItemId);
```

### Clear Cart
```typescript
const { error } = await supabase
  .from('cart_items')
  .delete()
  .eq('user_id', userId);
```

## Orders

### Get User's Orders
```typescript
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Get Order by ID
```typescript
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('id', orderId)
  .maybeSingle();
```

### Create Order
```typescript
const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

const { data, error } = await supabase.from('orders').insert({
  user_id: userId,
  order_number: orderNumber,
  status: 'pending',
  items: [
    {
      product_id: 'xxx',
      product_name: 'Air Max 90',
      brand: 'Nike',
      size: 9,
      color: '#000000',
      quantity: 1,
      price: 129.99,
      image: 'https://example.com/image.jpg'
    }
  ],
  total_amount: 129.99,
  shipping_address: {
    street: '123 Main St',
    city: 'New York',
    postal_code: '10001',
    country: 'US'
  }
});
```

### Update Order Status (Admin Only)
```typescript
const { error } = await supabase
  .from('orders')
  .update({ status: 'shipped' })
  .eq('id', orderId);
```

Available statuses: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

### Get All Orders (Admin Only)
```typescript
const { data, error } = await supabase
  .from('orders')
  .select('*, profiles(full_name, email)')
  .order('created_at', { ascending: false });
```

## User Profile

### Get User Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();
```

### Update Profile
```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    full_name: 'John Doe',
    phone: '+1234567890'
  })
  .eq('id', userId);
```

## Addresses

### Get User's Addresses
```typescript
const { data, error } = await supabase
  .from('addresses')
  .select('*')
  .eq('user_id', userId);
```

### Add Address
```typescript
const { data, error } = await supabase.from('addresses').insert({
  user_id: userId,
  label: 'Home',
  street: '123 Main St',
  city: 'New York',
  state: 'NY',
  postal_code: '10001',
  country: 'US',
  is_default: true
});
```

### Update Address
```typescript
const { error } = await supabase
  .from('addresses')
  .update({ is_default: true })
  .eq('id', addressId);
```

### Delete Address
```typescript
const { error } = await supabase
  .from('addresses')
  .delete()
  .eq('id', addressId);
```

## Real-time Subscriptions

### Subscribe to Order Updates
```typescript
const subscription = supabase
  .channel('orders')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Order updated:', payload.new);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Subscribe to Cart Changes
```typescript
const subscription = supabase
  .channel('cart')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'cart_items',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Cart changed:', payload);
    }
  )
  .subscribe();
```

## Error Handling

All Supabase operations return both `data` and `error`:

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*');

if (error) {
  // Handle error
  console.error('Error:', error.message);
  throw error;
}

// Use data
console.log('Products:', data);
```

## Pagination

For large datasets, use pagination:

```typescript
const pageSize = 10;
const page = 0;

const { data, error } = await supabase
  .from('products')
  .select('*')
  .range(page * pageSize, (page + 1) * pageSize - 1);
```

## Counting Records

Get count without fetching data:

```typescript
const { count, error } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true });
```

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:

1. **Profiles**: Users can only read/update their own profile
2. **Products**: Public read access, admin-only write
3. **Cart Items**: Users can only access their own cart
4. **Orders**: Users can only view their own orders, admins can view all
5. **Addresses**: Users can only manage their own addresses

## Admin Checks

Check if user is admin:

```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin')
  .eq('id', userId)
  .maybeSingle();

if (profile?.is_admin) {
  // Admin operations
}
```

## Rate Limiting

Supabase has built-in rate limiting:
- 100 requests per second per user
- Unlimited on paid plans
- Use caching to reduce API calls

## Best Practices

1. **Use React Query for caching**
   - Reduces API calls
   - Automatic background refetching
   - Optimistic updates

2. **Batch operations when possible**
   ```typescript
   // Instead of multiple inserts
   await supabase.from('cart_items').insert([item1, item2, item3]);
   ```

3. **Select only needed columns**
   ```typescript
   // Good
   .select('id, name, price')

   // Avoid if possible
   .select('*')
   ```

4. **Use indexes for filtering**
   - Brand, price, and status columns are indexed
   - Filters on these fields are fast

5. **Handle errors gracefully**
   - Show user-friendly messages
   - Log errors for debugging
   - Implement retry logic for network issues

## Testing API Calls

Use Supabase SQL Editor to test queries directly:

```sql
-- Test product search
SELECT * FROM products
WHERE name ILIKE '%nike%'
  OR brand ILIKE '%nike%';

-- Test order creation
INSERT INTO orders (user_id, order_number, status, items, total_amount, shipping_address)
VALUES (
  'user-id',
  'ORD-TEST',
  'pending',
  '[{"product_id": "xxx", "quantity": 1, "price": 99.99}]'::jsonb,
  99.99,
  '{"street": "123 Main", "city": "NYC", "postal_code": "10001", "country": "US"}'::jsonb
);
```

## Environment Variables

Required environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

Never expose the service role key in client code!
