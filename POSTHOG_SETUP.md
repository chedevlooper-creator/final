# PostHog Analytics Kurulumu

## Kuruldu
- posthog-js ve posthog-node paketleri yüklendi
- PostHog provider component oluşturuldu
- Analytics fonksiyonları oluşturuldu

## Environment Variables

Vercel dashboard'ından şu environment variables'ı ekleyin:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_qnxniytK8Vv4SKn578uVzD07IsZY0xa96NjkJL6sbJE
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## Kullanım

### Event Tracking

```tsx
import { trackEvent } from '@/lib/analytics'

function MyComponent() {
  const handleClick = () => {
    trackEvent('button_clicked', {
      button_name: 'submit',
      page: 'dashboard'
    })
  }
}
```

### Page View Tracking

```tsx
import { trackPageView } from '@/lib/analytics'

trackPageView('/dashboard/needy', {
  user_role: 'admin'
})
```

### User Identification

```tsx
import { identifyUser } from '@/lib/analytics'

// User login sonrası
identifyUser(userId, {
  email: user.email,
  name: user.name
})
```

## PostHog Dashboard

Analytics'i görüntülemek için: https://app.posthog.com

## Next Steps

1. Vercel dashboard'dan environment variables'ı ekleyin
2. Deploy sırasında PostHog otomatik olarak initialize olacak
3. Dashboard'da event'leri ve sayfa görüntülemelerini takip edin
