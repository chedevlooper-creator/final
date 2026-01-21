#!/bin/bash

# YYP-Engine: Proje Standartları ve Sağlık Kontrolü

# Renk tanımlamaları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}🛡️  YYP-Engine Geliştirme Denetimi          ${NC}"
echo -e "${BLUE}==========================================${NC}"

# 1. Next.js Versiyon Kontrolü
NEXT_VERSION=$(node -p "require('./package.json').dependencies.next")
echo -e "🚀 Next.js Versiyonu: ${GREEN}$NEXT_VERSION${NC}"

# 2. Kritik Klasör Yapısı
echo -e "\n${YELLOW}📂 Klasör Yapısı Kontrol Ediliyor...${NC}"
CHECK_DIRS=("src/lib/supabase" "src/hooks/queries" "src/lib/validations" "src/lib/errors.ts")

for item in "${CHECK_DIRS[@]}"; do
    if [ -e "$item" ]; then
        echo -e "  ✅ [OK] $item"
    else
        echo -e "  ❌ [HATA] $item BULUNAMADI!"
    fi
done

# 3. TypeScript & Alias Yapılandırması
echo -e "\n${YELLOW}⚙️  Yapılandırma Kontrol Ediliyor...${NC}"
if grep -q "./.agent/\*\*/\*.ts" tsconfig.json; then
    echo -e "  ✅ [OK] tsconfig.json: .agent klasörü taranıyor."
else
    echo -e "  ⚠️  [UYARI] tsconfig.json: .agent klasörü tarama kapsamı dışında!"
fi

if grep -q "\"baseUrl\": \".\"" tsconfig.json; then
    echo -e "  ✅ [OK] tsconfig.json: baseUrl ayarlanmış."
else
    echo -e "  ⚠️  [UYARI] tsconfig.json: baseUrl ayarı eksik olabilir!"
fi

# 4. RBAC Sistemi
if [ -f "src/lib/rbac.tsx" ]; then
    echo -e "  ✅ [OK] RBAC (Yetki) sistemi aktif."
else
    echo -e "  ❌ [HATA] RBAC sistemi (src/lib/rbac.tsx) EKSİK!"
fi

echo -e "\n${BLUE}==========================================${NC}"
echo -e "${GREEN}✨ Denetim Tamamlandı.${NC}"
echo -e "${BLUE}==========================================${NC}"
