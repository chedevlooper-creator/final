#!/bin/bash

# CAUTION: This script is a template. Please set your actual secrets below before running (and do not commit real secrets).

# Check if logged in
if ! gh auth status &>/dev/null; then
    echo "⚠️  GitHub CLI'ya giriş yapılmamış. Lütfen önce şu komutu çalıştırıp giriş yapın:"
    echo "   gh auth login"
    exit 1
fi

REPO=$(git remote get-url origin | sed 's/https:\/\/github.com\///' | sed 's/.git//')
echo "📍 Hedef Repo: $REPO"

echo "🚀 Secrets yükleniyor..."

# REPLACE THESE VALUES WITH YOUR ACTUAL SECRETS
VERCEL_ORG_ID="<YOUR_VERCEL_ORG_ID>"
VERCEL_PROJECT_ID="<YOUR_VERCEL_PROJECT_ID>"
VERCEL_TOKEN="<YOUR_VERCEL_TOKEN>"
SUPABASE_URL="<YOUR_SUPABASE_URL>"
SUPABASE_ANON="<YOUR_SUPABASE_ANON_KEY>"
POSTHOG_KEY="<YOUR_POSTHOG_KEY>"
POSTHOG_HOST="https://us.i.posthog.com"

gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID" --repo "$REPO"
echo "✅ VERCEL_ORG_ID ayarlandı"

gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID" --repo "$REPO"
echo "✅ VERCEL_PROJECT_ID ayarlandı"

gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN" --repo "$REPO"
echo "✅ VERCEL_TOKEN ayarlandı"

gh secret set NEXT_PUBLIC_SUPABASE_URL --body "$SUPABASE_URL" --repo "$REPO"
echo "✅ NEXT_PUBLIC_SUPABASE_URL ayarlandı"

gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "$SUPABASE_ANON" --repo "$REPO"
echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY ayarlandı"

gh secret set NEXT_PUBLIC_POSTHOG_KEY --body "$POSTHOG_KEY" --repo "$REPO"
echo "✅ NEXT_PUBLIC_POSTHOG_KEY ayarlandı"

gh secret set NEXT_PUBLIC_POSTHOG_HOST --body "$POSTHOG_HOST" --repo "$REPO"
echo "✅ NEXT_PUBLIC_POSTHOG_HOST ayarlandı"

echo "🎉 Tüm secret'lar şablon üzerinden işlendi (lütfen değerleri kontrol edin)!"
