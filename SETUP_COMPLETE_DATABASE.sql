-- ========================================
-- CONFIGURATION COMPLÈTE DE LA BASE DE DONNÉES
-- ========================================

-- 1. Créer la table products (si elle n'existe pas)
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

-- 2. Activer RLS sur products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- 4. Créer les policies pour products
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

-- 5. Créer les autres tables nécessaires
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

-- 6. Activer RLS sur toutes les tables
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 7. Créer les policies pour addresses
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;

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

-- 8. Créer les policies pour cart_items
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

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

-- 9. Créer les policies pour orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

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

-- 10. Créer les indexes
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- 11. Créer la fonction pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Créer les triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 13. INSÉRER LES PRODUITS
-- Supprimer les produits existants (optionnel)
DELETE FROM products;

-- Nike
INSERT INTO products (name, description, brand, price, images, sizes, colors, stock_by_size, categories) VALUES
(
  'Nike Air Max 270',
  'Confort exceptionnel avec un amorti Air visible. Parfait pour un usage quotidien.',
  'Nike',
  149.99,
  '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Noir", "Blanc", "Rouge"]'::jsonb,
  '{"38": 5, "39": 8, "40": 10, "41": 12, "42": 15, "43": 10, "44": 8, "45": 5}'::jsonb,
  '["Sport", "Casual", "Running"]'::jsonb
),
(
  'Nike Air Force 1',
  'Classique intemporel. Design iconique avec confort optimal.',
  'Nike',
  119.99,
  '["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Blanc", "Noir", "Bleu"]'::jsonb,
  '{"38": 6, "39": 10, "40": 15, "41": 18, "42": 20, "43": 15, "44": 10, "45": 6}'::jsonb,
  '["Casual", "Street", "Lifestyle"]'::jsonb
),
(
  'Nike React Infinity Run',
  'Chaussure de running avec technologie React pour un maximum de confort.',
  'Nike',
  159.99,
  '["https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800", "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Noir", "Gris", "Bleu"]'::jsonb,
  '{"38": 4, "39": 7, "40": 10, "41": 12, "42": 14, "43": 10, "44": 7, "45": 4}'::jsonb,
  '["Running", "Sport", "Performance"]'::jsonb
);

-- Adidas
INSERT INTO products (name, description, brand, price, images, sizes, colors, stock_by_size, categories) VALUES
(
  'Adidas Ultraboost 22',
  'Énergie infinie avec la technologie Boost. Parfait pour les longues distances.',
  'Adidas',
  179.99,
  '["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800", "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Noir", "Blanc", "Gris"]'::jsonb,
  '{"38": 5, "39": 8, "40": 12, "41": 15, "42": 18, "43": 12, "44": 8, "45": 5}'::jsonb,
  '["Running", "Sport", "Performance"]'::jsonb
),
(
  'Adidas Stan Smith',
  'Icône du tennis devenue incontournable. Style minimaliste et élégant.',
  'Adidas',
  99.99,
  '["https://images.unsplash.com/photo-1612902376601-5bc7f0c0b5f8?w=800", "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Blanc", "Vert", "Noir"]'::jsonb,
  '{"38": 8, "39": 12, "40": 18, "41": 20, "42": 22, "43": 18, "44": 12, "45": 8}'::jsonb,
  '["Casual", "Lifestyle", "Tennis"]'::jsonb
),
(
  'Adidas Superstar',
  'Légende du streetwear. Design emblématique avec coque en caoutchouc.',
  'Adidas',
  89.99,
  '["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800", "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Blanc", "Noir", "Rouge"]'::jsonb,
  '{"38": 7, "39": 10, "40": 15, "41": 18, "42": 20, "43": 15, "44": 10, "45": 7}'::jsonb,
  '["Street", "Casual", "Lifestyle"]'::jsonb
);

-- Puma
INSERT INTO products (name, description, brand, price, images, sizes, colors, stock_by_size, categories) VALUES
(
  'Puma RS-X',
  'Design futuriste et audacieux. Confort et style pour tous les jours.',
  'Puma',
  109.99,
  '["https://images.unsplash.com/photo-1539185441755-769473a23570?w=800", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Noir", "Blanc", "Multicolore"]'::jsonb,
  '{"38": 6, "39": 9, "40": 12, "41": 15, "42": 17, "43": 12, "44": 9, "45": 6}'::jsonb,
  '["Casual", "Street", "Lifestyle"]'::jsonb
),
(
  'Puma Suede Classic',
  'Classique intemporel en daim. Confort et style depuis 1968.',
  'Puma',
  79.99,
  '["https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Bleu", "Rouge", "Noir"]'::jsonb,
  '{"38": 8, "39": 11, "40": 14, "41": 16, "42": 18, "43": 14, "44": 11, "45": 8}'::jsonb,
  '["Casual", "Lifestyle", "Street"]'::jsonb
);

-- New Balance
INSERT INTO products (name, description, brand, price, images, sizes, colors, stock_by_size, categories) VALUES
(
  'New Balance 574',
  'Confort légendaire. Design rétro avec technologies modernes.',
  'New Balance',
  94.99,
  '["https://images.unsplash.com/photo-1539185441755-769473a23570?w=800", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Gris", "Bleu", "Noir"]'::jsonb,
  '{"38": 7, "39": 10, "40": 13, "41": 15, "42": 17, "43": 13, "44": 10, "45": 7}'::jsonb,
  '["Casual", "Lifestyle", "Running"]'::jsonb
),
(
  'New Balance 990v5',
  'Performance premium. Fabriqué aux USA avec les meilleurs matériaux.',
  'New Balance',
  184.99,
  '["https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800", "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Gris", "Noir", "Marine"]'::jsonb,
  '{"38": 4, "39": 6, "40": 9, "41": 11, "42": 13, "43": 9, "44": 6, "45": 4}'::jsonb,
  '["Running", "Premium", "Performance"]'::jsonb
);

-- Jordan
INSERT INTO products (name, description, brand, price, images, sizes, colors, stock_by_size, categories) VALUES
(
  'Air Jordan 1 Retro High',
  'Légende du basketball. Design iconique qui a révolutionné le sneaker game.',
  'Jordan',
  169.99,
  '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Rouge/Noir", "Blanc/Noir", "Bleu"]'::jsonb,
  '{"38": 3, "39": 5, "40": 8, "41": 10, "42": 12, "43": 8, "44": 5, "45": 3}'::jsonb,
  '["Basketball", "Street", "Collection"]'::jsonb
),
(
  'Air Jordan 4 Retro',
  'Classique des années 90. Confort et style pour les passionnés.',
  'Jordan',
  199.99,
  '["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800", "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800"]'::jsonb,
  '[38, 39, 40, 41, 42, 43, 44, 45]'::jsonb,
  '["Noir", "Blanc", "Gris"]'::jsonb,
  '{"38": 2, "39": 4, "40": 6, "41": 8, "42": 10, "43": 6, "44": 4, "45": 2}'::jsonb,
  '["Basketball", "Collection", "Premium"]'::jsonb
);

-- 14. Vérifier les produits insérés
SELECT 
  name, 
  brand, 
  price, 
  jsonb_array_length(sizes) as nb_sizes, 
  jsonb_array_length(colors) as nb_colors,
  jsonb_array_length(images) as nb_images
FROM products
ORDER BY brand, name;
