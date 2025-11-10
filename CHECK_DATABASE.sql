-- ========================================
-- VÉRIFICATION DE LA BASE DE DONNÉES
-- ========================================

-- 1. Vérifier si la table products existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'products'
) as products_table_exists;

-- 2. Compter le nombre de produits
SELECT COUNT(*) as total_products FROM products;

-- 3. Lister tous les produits
SELECT id, name, brand, price FROM products ORDER BY brand, name;

-- 4. Vérifier les colonnes de la table products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
