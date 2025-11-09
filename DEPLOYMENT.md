# Deployment Guide

## Prerequisites

- Expo account (create at https://expo.dev)
- EAS CLI installed globally
- Configured `.env` file with all credentials
- Supabase project set up and running
- Stripe account (for payment features)

## Supabase Setup

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Note your project URL and anon key
4. Database migrations are already applied

### 2. Configure Authentication

In Supabase Dashboard:
1. Navigate to Authentication > Settings
2. Disable email confirmation (or configure email templates)
3. Set redirect URLs for password reset

### 3. Set Up Storage (Optional)

For product image uploads:
1. Go to Storage in Supabase Dashboard
2. Create bucket named `product-images`
3. Set public access policies
4. Configure CORS if needed

## Expo Application Services (EAS)

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure EAS Build

```bash
eas build:configure
```

This creates `eas.json` with build profiles:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 4. Set Environment Variables

Add secrets to EAS:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value your_supabase_url
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your_supabase_anon_key
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value your_stripe_key
```

Verify secrets:
```bash
eas secret:list
```

## Building

### iOS Build

```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

**Requirements for iOS:**
- Apple Developer account ($99/year)
- Provisioning profile
- App Store Connect app created

### Android Build

```bash
# Development build
eas build --profile development --platform android

# Production build
eas build --profile production --platform android
```

**Requirements for Android:**
- Google Play Developer account ($25 one-time)
- Signing key (generated automatically by EAS)

### Web Build

```bash
npm run build:web
```

Output in `dist/` folder, ready for deployment to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

## App Store Submission

### iOS App Store

1. **Prepare Assets**
   - App icon (1024x1024)
   - Screenshots for all device sizes
   - App description and keywords
   - Privacy policy URL

2. **Configure app.json**
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.shoestore",
      "buildNumber": "1.0.0"
    }
  }
}
```

3. **Build and Submit**
```bash
eas build --profile production --platform ios
eas submit --platform ios
```

4. **Review in App Store Connect**
   - Complete app metadata
   - Set pricing and availability
   - Submit for review

### Google Play Store

1. **Prepare Assets**
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots
   - App description
   - Privacy policy URL

2. **Configure app.json**
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.shoestore",
      "versionCode": 1
    }
  }
}
```

3. **Build and Submit**
```bash
eas build --profile production --platform android
eas submit --platform android
```

4. **Review in Play Console**
   - Complete store listing
   - Set content rating
   - Submit for review

## Stripe Configuration

### 1. Create Stripe Account

1. Go to https://stripe.com
2. Create account and verify business
3. Get API keys from Dashboard > Developers > API keys

### 2. Set Up Payment Backend

Create Supabase Edge Function for payment intents:

```typescript
// supabase/functions/create-payment-intent/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const { amount } = await req.json()

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
  })

  return new Response(
    JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

Deploy function:
```bash
supabase functions deploy create-payment-intent --no-verify-jwt
```

Set Stripe secret:
```bash
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 3. Test Payments

Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- 3D Secure: 4000 0025 0000 3155

## Environment Configuration

### Development
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Production
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

## Monitoring & Analytics

### 1. Supabase Dashboard

Monitor:
- Database queries
- Auth activity
- Storage usage
- API requests

### 2. Expo Analytics

Track:
- App crashes
- Update adoption
- Platform distribution

### 3. Stripe Dashboard

Monitor:
- Payment success rates
- Revenue
- Failed payments

## Updates

### Over-The-Air (OTA) Updates

Push updates without app store review:

```bash
# Create update
eas update --branch production --message "Bug fixes"

# Preview update
eas update --branch preview --message "Testing new feature"
```

Configure channels in `app.json`:
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

## Security Checklist

- [ ] Environment variables not in code
- [ ] RLS policies enabled on all tables
- [ ] Supabase anon key is public, service key is secret
- [ ] HTTPS enforced everywhere
- [ ] Input validation on all forms
- [ ] JWT token expiration configured
- [ ] Stripe webhook signatures verified
- [ ] Admin routes protected
- [ ] Sensitive logs removed from production
- [ ] CORS configured properly

## Performance Optimization

### 1. Images
- Use Pexels or CDN for product images
- Implement lazy loading
- Optimize image sizes for mobile

### 2. Caching
- React Query cache configured (5 min stale time)
- AsyncStorage persistence enabled
- Offline-first approach

### 3. Bundle Size
- Remove unused dependencies
- Code splitting where possible
- Tree shaking enabled

## Troubleshooting

### Build Failures

**Problem**: iOS build fails with provisioning error
- Solution: Check Apple Developer account status
- Verify bundle identifier matches

**Problem**: Android build fails with signing error
- Solution: Let EAS generate new keystore
- Don't use existing keystore unless necessary

### Runtime Issues

**Problem**: App crashes on launch
- Check environment variables are set
- Verify Supabase project is active
- Review error logs in Expo dashboard

**Problem**: Authentication not working
- Confirm Supabase URL and anon key
- Check redirect URLs configured
- Verify network connectivity

### Payment Issues

**Problem**: Stripe not initializing
- Verify publishable key is correct
- Check Stripe account is active
- Test with test mode keys first

## Rollback Plan

If issues occur in production:

1. **Immediate Rollback (OTA)**
```bash
eas update --branch production --message "Rollback to previous version"
```

2. **App Store Rollback**
   - iOS: Phased release in App Store Connect
   - Android: Rollout percentage in Play Console

3. **Database Rollback**
   - Supabase has point-in-time recovery
   - Restore from backup if needed

## Maintenance

### Regular Tasks

**Weekly:**
- Monitor error rates
- Check payment success rates
- Review user feedback

**Monthly:**
- Update dependencies
- Review and optimize database queries
- Check storage usage

**Quarterly:**
- Security audit
- Performance review
- Feature planning

## Support

### Resources
- Expo Documentation: https://docs.expo.dev
- Supabase Documentation: https://supabase.com/docs
- Stripe Documentation: https://stripe.com/docs

### Getting Help
- Expo Forums: https://forums.expo.dev
- Supabase Discord: https://discord.supabase.com
- Stack Overflow with relevant tags

## Cost Estimation

### Monthly Costs (estimated)

**Supabase:**
- Free tier: $0 (up to 500MB database, 1GB file storage)
- Pro: $25/month (8GB database, 100GB storage)

**Expo:**
- Free: Unlimited builds (with queue)
- Production: $29/month/member (priority builds)

**Stripe:**
- 2.9% + $0.30 per successful transaction

**Apple Developer:**
- $99/year

**Google Play:**
- $25 one-time

Total estimated: $50-150/month + transaction fees
