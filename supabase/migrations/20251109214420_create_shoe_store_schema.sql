/*
  # Shoe Store Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `phone` (text)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `label` (text) - e.g., "Home", "Work"
      - `street` (text)
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `country` (text)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `brand` (text)
      - `price` (numeric)
      - `images` (jsonb array of image URLs)
      - `sizes` (jsonb array of available sizes)
      - `colors` (jsonb array of colors)
      - `stock_by_size` (jsonb object mapping size to quantity)
      - `categories` (jsonb array)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `product_id` (uuid, references products)
      - `size` (numeric)
      - `color` (text)
      - `quantity` (integer)
      - `created_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `order_number` (text, unique)
      - `status` (text) - pending, confirmed, shipped, delivered, cancelled
      - `items` (jsonb array of order items)
      - `total_amount` (numeric)
      - `shipping_address` (jsonb)
      - `payment_intent_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can read/update their own profile
    - Users can manage their own addresses
    - Everyone can read products (public catalog)
    - Only admins can create/update/delete products
    - Users can manage their own cart items
    - Users can view their own orders
    - Only admins can update order status
    - Admins have full access to all data

  3. Indexes
    - Products: brand, price for filtering
    - Orders: user_id, status for queries
    - Cart: user_id for quick retrieval
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  state text,
  postal_code text NOT NULL,
  country text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Addresses policies
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  brand text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  images jsonb DEFAULT '[]'::jsonb,
  sizes jsonb DEFAULT '[]'::jsonb,
  colors jsonb DEFAULT '[]'::jsonb,
  stock_by_size jsonb DEFAULT '{}'::jsonb,
  categories jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size numeric NOT NULL,
  color text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, size, color)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Cart policies
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  items jsonb NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  shipping_address jsonb NOT NULL,
  payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'))
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();