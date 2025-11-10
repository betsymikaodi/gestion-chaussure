-- ========================================
-- CORRECTION DE LA TABLE PROFILES
-- ========================================

-- 1. Vérifier les colonnes existantes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Ajouter les colonnes manquantes si elles n'existent pas
DO $$ 
BEGIN
  -- Ajouter la colonne phone si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
    RAISE NOTICE 'Colonne phone ajoutée';
  END IF;

  -- Ajouter la colonne full_name si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
    RAISE NOTICE 'Colonne full_name ajoutée';
  END IF;

  -- Ajouter la colonne is_admin si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
    RAISE NOTICE 'Colonne is_admin ajoutée';
  END IF;

  -- Ajouter la colonne created_at si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at timestamptz DEFAULT now();
    RAISE NOTICE 'Colonne created_at ajoutée';
  END IF;

  -- Ajouter la colonne updated_at si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Colonne updated_at ajoutée';
  END IF;
END $$;

-- 3. Créer le trigger pour updated_at si nécessaire
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Vérifier les colonnes après modification
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
