#!/bin/bash

# Yardım Yönetim Paneli - Otomatik Migration Çalıştırma Script
# Bu script oh-my-opencode ile oluşturulan migration'ları otomatik çalıştırır

set -e  # Exit on error

# Renkli çıktı
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Proje dizini bul
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Yardım Yönetim Paneli - Migration Script${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Migration dosyaları dizini
MIGRATIONS_DIR="$PROJECT_ROOT/supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}❌ Hata: Migrations dizini bulunamadı${NC}"
    echo -e "${RED}Beklenen: $MIGRATIONS_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Migrations dizini: $MIGRATIONS_DIR${NC}"
echo ""

# Yeni migration'ları bul (bugünkü tarihten sonrakiler)
TODAY=$(date +%Y%m%d)
echo -e "${GREEN}🔍 Bugünün tarihi: $TODAY${NC}"
echo ""

# Tüm SQL dosyalarını bul
MIGRATION_FILES=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort)

if [ -z "$MIGRATION_FILES" ]; then
    echo -e "${RED}❌ Hata: Migration dosyası bulunamadı${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Bulunan migration dosyaları:${NC}"
echo ""

# Migration dosyalarını listele
for file in $MIGRATION_FILES; do
    filename=$(basename "$file")
    file_date=${filename:0:8} # İlk 8 karakter (YYYYMMDD)
    file_size=$(wc -c < "$file" | awk '{print $1}')

    # Bugünkü tarihten önceki dosyaları (bugünkü tarihe eşit veya sonraki)
    if [ "$file_date" -ge "$TODAY" ]; then
        if [ "$file_date" = "$TODAY" ]; then
            echo -e "${GREEN}✅ $filename${NC} (bugünkü)"
        else
            echo -e "${YELLOW}⏳ $filename${NC} (gelecek)"
        fi
        echo -e "   Dosya boyutu: $file_size bytes"
    fi
done

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${YELLOW}⚠️  UYARI: Bu script migration'ları SİZE YÖNTEMLİK ÇALIŞTIRMAZ${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

echo -e "${YELLOW}Seçenekler:${NC}"
echo ""
echo -e "1. ${GREEN}Supabase Dashboard'a Git${NC} (ÖNERİLEN)"
echo -e "   - Otomatik olarak tarayıcıyı açar"
echo -e "   - Migration'ları SQL Editor'a kopyalamayı hatırlatır"
echo ""
echo -e "2. ${YELLOW}Migration'ları Göster${NC}"
echo -e "   - SQL kodlarını terminalda gösterir"
echo -e "   - Manuel olarak kopyalayıp yapıştırabilirsiniz"
echo ""
echo -e "3. ${RED}Çıkış${NC}"
echo ""

# Kullanıcı seçimi
read -p "Seçiminiz (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🚀 Supabase Dashboard açılıyor...${NC}"
        echo ""
        echo -e "${YELLOW}Supabase Dashboard'a gitmek için:${NC}"
        echo -e "1. ${GREEN}https://supabase.com/dashboard${NC}"
        echo -e "2. Projenizi seçin (jdrncdqyymlwcyvnnzoj)"
        echo -e "3. ${YELLOW}Database → SQL Editor${NC}"
        echo -e "4. Aşağıdaki SQL dosyalarını çalıştırın:"
        echo ""

        echo -e "${GREEN}Bugünkü ve gelecek migration'lar:${NC}"
        echo ""

        for file in $MIGRATION_FILES; do
            filename=$(basename "$file")
            file_date=${filename:0:8}
            if [ "$file_date" -ge "$TODAY" ]; then
                echo -e "${GREEN}✓ $filename${NC}"
            fi
        done

        echo ""
        echo -e "${YELLOW}Veya tek tek yapıştırın:${NC}"
        echo ""

        # Tarayıcıyı açma (Windows için)
        if command -v start &> /dev/null; then
            # Windows start komutu
            start https://supabase.com/dashboard/project/jdrncdqyymlwcyvnnzoj
        elif command -v xdg-open &> /dev/null; then
            # Linux xdg-open
            xdg-open https://supabase.com/dashboard/project/jdrncdqyymlwcyvnnzoj
        elif command -v open &> /dev/null; then
            # macOS open
            open https://supabase.com/dashboard/project/jdrncdqyymlwcyvnnzoj
        else
            echo -e "${RED}Tarayıcı otomatik açılamadı${NC}"
            echo -e "${GREEN}Manuel olarak tıklayın:${NC}"
            echo -e "https://supabase.com/dashboard/project/jdrncdqyymlwcyvnnzoj"
        fi
        ;;

    2)
        echo ""
        echo -e "${GREEN}📋 Migration SQL kodları:${NC}"
        echo ""
        echo -e "${YELLOW}=== Bugünkü ve Gelecek Migration'lar ===${NC}"
        echo ""

        for file in $MIGRATION_FILES; do
            filename=$(basename "$file")
            file_date=${filename:0:8}

            if [ "$file_date" -ge "$TODAY" ]; then
                echo -e "${GREEN}--- $filename ---${NC}"
                cat "$file"
                echo ""
                echo ""
            fi
        done

        echo -e "${YELLOW}Not: Bu kodları Supabase Dashboard SQL Editor'a kopyalayıp çalıştırın${NC}"
        ;;

    3)
        echo -e "${GREEN}👋 Çıkılıyor...${NC}"
        exit 0
        ;;

    *)
        echo -e "${RED}❌ Geçersiz seçim${NC}"
        exit 1
        ;;
esac
