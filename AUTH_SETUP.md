# Configuration de l'authentification Supabase

## Étapes de configuration

### 1. Configuration de la base de données Supabase

Exécutez les requêtes SQL suivantes dans l'éditeur SQL de Supabase :

```sql
-- Création de la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Activation de RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique d'accès pour les profils
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=votre_cle_stripe
```

### 3. Structure du projet

Le projet utilise les fichiers suivants pour l'authentification :

- **`lib/supabase.ts`** : Configuration du client Supabase avec les headers d'authentification
- **`contexts/AuthContext.tsx`** : Contexte React pour gérer l'état d'authentification
- **`app/(auth)/login.tsx`** : Écran de connexion
- **`app/(auth)/signup.tsx`** : Écran d'inscription
- **`app/(auth)/forgot-password.tsx`** : Écran de réinitialisation du mot de passe

### 4. Fonctionnalités disponibles

#### AuthContext

Le contexte d'authentification fournit les fonctions et états suivants :

```typescript
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  refreshProfile: () => Promise<Profile | null>;
}
```

#### Utilisation dans un composant

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <Text>Please log in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {profile?.full_name}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
```

### 5. Gestion des erreurs

Toutes les fonctions d'authentification retournent un objet `AuthResponse` :

```typescript
type AuthResponse = {
  error: Error | null;
};
```

Exemple d'utilisation :

```typescript
const handleLogin = async (email: string, password: string) => {
  const { error } = await signIn(email, password);
  
  if (error) {
    Alert.alert('Error', error.message);
    return;
  }
  
  // Connexion réussie
  router.replace('/(tabs)');
};
```

### 6. Sécurité

- Les mots de passe sont gérés par Supabase Auth
- Les sessions sont stockées de manière sécurisée avec AsyncStorage
- RLS (Row Level Security) est activé sur toutes les tables
- Les utilisateurs ne peuvent accéder qu'à leurs propres données

### 7. Dépannage

#### Erreur 401 Unauthorized

Si vous rencontrez des erreurs 401, vérifiez :

1. Les variables d'environnement sont correctement définies
2. La clé anon de Supabase est valide
3. Les politiques RLS sont correctement configurées
4. Le serveur Expo a été redémarré après modification du `.env`

#### Profil non créé

Si le profil utilisateur n'est pas créé après l'inscription :

1. Vérifiez que la table `profiles` existe
2. Vérifiez les politiques RLS
3. Consultez les logs de la console pour les erreurs

#### Session non persistée

Si la session n'est pas persistée entre les rechargements :

1. Vérifiez qu'AsyncStorage est correctement installé
2. Vérifiez la configuration du client Supabase dans `lib/supabase.ts`

### 8. Tests

Pour tester l'authentification :

1. Lancez le serveur de développement : `npx expo start`
2. Créez un nouveau compte via l'écran d'inscription
3. Vérifiez que le profil est créé dans Supabase
4. Testez la connexion avec les identifiants créés
5. Testez la déconnexion
6. Testez la réinitialisation du mot de passe

### 9. Production

Avant de déployer en production :

1. Activez l'authentification par email dans Supabase
2. Configurez les URLs de redirection autorisées
3. Activez la vérification par email si nécessaire
4. Configurez les templates d'email personnalisés
5. Testez tous les flux d'authentification
