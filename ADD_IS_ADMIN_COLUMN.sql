-- ========================================
-- MIGRATION: Ajouter la colonne is_admin à la table profiles
-- ========================================

-- Ajouter la colonne is_admin si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
    RAISE NOTICE 'Colonne is_admin ajoutée avec succès';
  ELSE
    RAISE NOTICE 'La colonne is_admin existe déjà';
  END IF;
END $$;

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
