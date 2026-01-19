#!/usr/bin/env python3
"""
CSV dosyasını parse edip Supabase'e yükler
"""
import csv
import sys
import re
from datetime import datetime

# Windows'ta UTF-8 encoding sorununu çöz
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# CSV dosyasını oku
csv_file = '.cursor/agents/Aynı_Aileden_Olanlar.xlsx - Sheet1.csv'

def parse_name(full_name):
    """Ad Soyad'dan first_name ve last_name ayırır"""
    if not full_name or full_name.strip() == '':
        return None, None
    
    parts = full_name.strip().split()
    if len(parts) == 0:
        return None, None
    elif len(parts) == 1:
        return parts[0], None
    else:
        return parts[0], ' '.join(parts[1:])

def clean_phone(phone):
    """Telefon numarasını temizler"""
    if not phone or phone.strip() == '' or phone.strip() == '-':
        return None
    # Boşlukları ve özel karakterleri temizle
    phone = re.sub(r'[^\d]', '', phone.strip())
    if len(phone) == 0:
        return None
    return phone

def parse_date(date_str):
    """Tarih string'ini parse eder"""
    if not date_str or date_str.strip() == '':
        return None
    try:
        # "2024-08-21 00:00:00" formatından sadece tarih kısmını al
        date_part = date_str.strip().split()[0]
        return date_part
    except:
        return None

def clean_city(city):
    """Şehir adını temizler (parantez içindeki kısımları kaldırır)"""
    if not city or city.strip() == '':
        return None
    # "İstanbul (Avrupa)" -> "İstanbul"
    city = re.sub(r'\s*\([^)]*\)', '', city.strip())
    return city

def generate_sql_with_lookups(row_data):
    """Lookup ID'leri ile SQL INSERT oluşturur"""
    def sql_value(val):
        if val is None or val == '' or val == '-':
            return 'NULL'
        if isinstance(val, str):
            val = val.replace("'", "''")
            return f"'{val}'"
        return str(val)
    
    fields = []
    values = []
    
    if row_data.get('first_name'):
        fields.append('first_name')
        values.append(sql_value(row_data['first_name']))
    
    if row_data.get('last_name'):
        fields.append('last_name')
        values.append(sql_value(row_data['last_name']))
    
    if row_data.get('identity_number'):
        fields.append('identity_number')
        values.append(sql_value(row_data['identity_number']))
    
    # Lookup ID'leri için subquery
    if row_data.get('nationality_name'):
        fields.append('nationality_id')
        values.append(f"(SELECT id FROM countries WHERE name = {sql_value(row_data['nationality_name'])} LIMIT 1)")
    
    if row_data.get('country_name'):
        fields.append('country_id')
        values.append(f"(SELECT id FROM countries WHERE name = {sql_value(row_data['country_name'])} LIMIT 1)")
    
    if row_data.get('city_name'):
        fields.append('city_id')
        values.append(f"(SELECT id FROM cities WHERE name = {sql_value(row_data['city_name'])} LIMIT 1)")
    
    if row_data.get('district_name'):
        fields.append('district_id')
        values.append(f"(SELECT id FROM districts WHERE name = {sql_value(row_data['district_name'])} LIMIT 1)")
    
    if row_data.get('neighborhood_name'):
        fields.append('neighborhood_id')
        values.append(f"(SELECT id FROM neighborhoods WHERE name = {sql_value(row_data['neighborhood_name'])} LIMIT 1)")
    
    if row_data.get('address'):
        fields.append('address')
        values.append(sql_value(row_data['address']))
    
    if row_data.get('family_size') is not None:
        fields.append('family_size')
        values.append(sql_value(row_data['family_size']))
    
    if row_data.get('phone'):
        fields.append('phone')
        values.append(sql_value(row_data['phone']))
    
    if row_data.get('category_name'):
        fields.append('category_id')
        values.append(f"(SELECT id FROM categories WHERE name = {sql_value(row_data['category_name'])} LIMIT 1)")
    
    if row_data.get('partner_name'):
        fields.append('partner_id')
        values.append(f"(SELECT id FROM partners WHERE name = {sql_value(row_data['partner_name'])} LIMIT 1)")
    
    if row_data.get('created_at'):
        fields.append('created_at')
        values.append(f"'{row_data['created_at']}'::TIMESTAMPTZ")
    
    if row_data.get('fund_region'):
        fields.append('fund_region')
        values.append(sql_value(row_data['fund_region']))
    
    fields.append('status')
    values.append("'active'")
    
    fields.append('is_active')
    values.append('true')
    
    if len(fields) < 3:  # En az first_name, last_name, status olmalı
        return None
    
    sql = f"INSERT INTO needy_persons ({', '.join(fields)}) VALUES ({', '.join(values)});"
    return sql

# CSV'yi oku ve SQL INSERT statement'ları oluştur
print("-- CSV'den üretilen INSERT statement'ları")
print("-- Toplu yükleme için hazırlanmıştır\n")

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    count = 0
    for row in reader:
        # Boş satırları atla
        if not row.get('ID') or row['ID'].strip() == '':
            continue
        
        # Ad Soyad'dan first_name ve last_name ayır
        first_name, last_name = parse_name(row.get('Ad Soyad', ''))
        if not first_name:
            continue
        
        # Veri hazırla (lookup ID'ler sonra eklenecek)
        row_data = {
            'first_name': first_name,
            'last_name': last_name,
            'identity_number': row.get('Kimlik No', '').strip() if row.get('Kimlik No') and row.get('Kimlik No').strip() != '-' else None,
            'address': row.get('Adres', '').strip() if row.get('Adres') else None,
            'family_size': int(row.get('Ailedeki Kişi Sayısı', 0)) if row.get('Ailedeki Kişi Sayısı') and row.get('Ailedeki Kişi Sayısı').strip() != '-' else None,
            'phone': clean_phone(row.get('Telefon No', '')),
            'created_at': parse_date(row.get('Kayıt Tarihi', '')),
            'fund_region': row.get('Fon Bölgesi', '').strip().lower() if row.get('Fon Bölgesi') else None,
            # Lookup değerleri (sonra ID'ye çevrilecek)
            'nationality_name': row.get('Uyruk', '').strip() if row.get('Uyruk') else None,
            'country_name': row.get('Ülkesi', '').strip() if row.get('Ülkesi') else None,
            'city_name': clean_city(row.get('Şehri', '')),
            'district_name': row.get('Yerleşimi', '').strip() if row.get('Yerleşimi') else None,
            'neighborhood_name': row.get('Mahalle', '').strip() if row.get('Mahalle') else None,
            'category_name': row.get('Kategori', '').strip() if row.get('Kategori') else None,
            'partner_name': row.get('Kaydı Açan Birim', '').strip() if row.get('Kaydı Açan Birim') else None,
        }
        
        # SQL oluştur (lookup ID'ler için subquery kullan)
        sql = generate_sql_with_lookups(row_data)
        if sql:
            print(sql)
            count += 1

print(f"\n-- Toplam {count} kayıt hazırlandı")
