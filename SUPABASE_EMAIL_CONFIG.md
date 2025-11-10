# Configuration de l'authentification par email dans Supabase

## Problème : "Email not confirmed"

Si vous rencontrez l'erreur **"Email not confirmed"** lors de la connexion, c'est parce que Supabase exige par défaut que les utilisateurs confirment leur email avant de pouvoir se connecter.

## Solution 1 : Désactiver la confirmation d'email (Recommandé pour le développement)

### Étapes dans le tableau de bord Supabase :

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **Authentication**
4. Cliquez sur **Providers**
5. Cliquez sur **Email** dans la liste des providers
6. **Désactivez** l'option **"Confirm email"**
7. Cliquez sur **Save**

### Capture d'écran de la configuration :

```
Authentication > Providers > Email

┌─────────────────────────────────────────┐
│ Email Provider Settings                 │
├─────────────────────────────────────────┤
│                                         │
│ ☐ Confirm email                        │
│   Require users to confirm their       │
│   email before signing in              │
│                                         │
│ ☑ Enable email provider                │
│                                         │
│ [Save]                                  │
└─────────────────────────────────────────┘
```

## Solution 2 : Confirmer manuellement les emails (Pour tester)

Si vous voulez garder la confirmation d'email activée mais tester rapidement :

1. Allez dans **Authentication** > **Users**
2. Trouvez l'utilisateur que vous venez de créer
3. Cliquez sur les trois points (...) à droite
4. Sélectionnez **"Confirm email"**
5. L'utilisateur peut maintenant se connecter

## Solution 3 : Configurer un service d'email (Pour la production)

Pour la production, vous devriez configurer un service d'email :

### Étape 1 : Configurer SMTP dans Supabase

1. Allez dans **Project Settings** > **Auth**
2. Faites défiler jusqu'à **SMTP Settings**
3. Configurez votre serveur SMTP :
   - **Host** : smtp.gmail.com (pour Gmail)
   - **Port** : 587
   - **Username** : votre-email@gmail.com
   - **Password** : votre-mot-de-passe-app
   - **Sender email** : votre-email@gmail.com
   - **Sender name** : Votre Application

### Étape 2 : Personnaliser les templates d'email

1. Allez dans **Authentication** > **Email Templates**
2. Personnalisez les templates :
   - **Confirm signup** : Email de confirmation d'inscription
   - **Magic Link** : Email de connexion magique
   - **Change Email Address** : Email de changement d'adresse
   - **Reset Password** : Email de réinitialisation de mot de passe

## Configuration recommandée par environnement

### Développement
- ✅ Désactiver la confirmation d'email
- ✅ Utiliser des emails de test
- ✅ Pas besoin de configurer SMTP

### Staging/Test
- ⚠️ Activer la confirmation d'email
- ⚠️ Configurer SMTP avec un service de test (Mailtrap, etc.)
- ⚠️ Tester tous les flux d'email

### Production
- ✅ Activer la confirmation d'email
- ✅ Configurer SMTP avec un service professionnel (SendGrid, AWS SES, etc.)
- ✅ Personnaliser tous les templates d'email
- ✅ Configurer les URLs de redirection

## Vérification de la configuration

Après avoir désactivé la confirmation d'email :

1. **Créez un nouveau compte** via l'écran d'inscription
2. **Vérifiez dans Supabase** :
   - Allez dans **Authentication** > **Users**
   - L'utilisateur doit avoir un statut **"Confirmed"** automatiquement
3. **Testez la connexion** :
   - Utilisez les identifiants du compte créé
   - La connexion doit fonctionner immédiatement

## Dépannage

### L'erreur persiste après désactivation

1. **Supprimez les anciens utilisateurs** :
   - Les utilisateurs créés avant la désactivation peuvent avoir un statut non confirmé
   - Supprimez-les et créez-en de nouveaux

2. **Videz le cache** :
   - Redémarrez votre serveur Expo : `Ctrl+C` puis `npx expo start`
   - Videz le cache du navigateur si vous testez sur web

3. **Vérifiez les politiques RLS** :
   - Les politiques RLS peuvent bloquer l'accès même si l'utilisateur est connecté
   - Vérifiez que les politiques permettent l'accès aux utilisateurs authentifiés

### Emails non reçus (si confirmation activée)

1. **Vérifiez les spams** : Les emails de confirmation peuvent être dans les spams
2. **Vérifiez la configuration SMTP** : Assurez-vous que les paramètres sont corrects
3. **Vérifiez les logs** : Allez dans **Logs** > **Auth Logs** pour voir les erreurs

## Code de gestion dans l'application

Le code a été mis à jour pour gérer automatiquement les deux cas :

### Avec confirmation d'email désactivée
```typescript
// L'utilisateur est connecté automatiquement après inscription
const { error } = await signUp(email, password, fullName);
if (!error) {
  // Redirection vers l'application
  router.replace('/(tabs)');
}
```

### Avec confirmation d'email activée
```typescript
// L'utilisateur reçoit un message pour confirmer son email
const { error } = await signUp(email, password, fullName);
if (error && error.message.includes('check your email')) {
  // Message : "Veuillez vérifier votre email"
  router.replace('/(auth)/login');
}
```

## Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Configuration SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
