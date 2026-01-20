#!/usr/bin/env python3
"""
SQL dosyasını parse edip batch'ler halinde Supabase'e yükler (MCP kullanımı için)
"""
import sys

# Windows'ta UTF-8 encoding sorununu çöz
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# SQL dosyasını oku
sql_file = '.cursor/agents/output.sql'

with open(sql_file, 'r', encoding='utf-8') as f:
    content = f.read()

# SQL statement'larını ayır
queries = []
for line in content.split('\n'):
    line = line.strip()
    if line and not line.startswith('--'):
        # Eğer satır sonunda ; varsa ekle
        if line.endswith(';'):
            queries.append(line)
        else:
            # Satır devam ediyor, bir önceki sorguya ekle
            if queries:
                queries[-1] += ' ' + line

# Son satırdaki toplam kayıt sayısını bul
total_line = None
for line in content.split('\n'):
    if 'Toplam' in line and 'kayıt' in line.lower():
        total_line = line.strip()
        break

print(f"-- Toplam {len(queries)} INSERT statement bulundu\n")

# Batch'ler halinde grupla (her batch 50 INSERT)
batch_size = 50
batches = []
for i in range(0, len(queries), batch_size):
    batch = queries[i:i + batch_size]
    batches.append(batch)

print(f"-- {len(batches)} batch oluşturuldu (her batch {batch_size} INSERT)\n")

# Her batch için SQL oluştur
for batch_idx, batch in enumerate(batches, 1):
    print(f"-- Batch {batch_idx}/{len(batches)}")
    # Tüm INSERT'leri birleştir
    batch_sql = ' '.join(batch)
    print(batch_sql)
    print("\n")
