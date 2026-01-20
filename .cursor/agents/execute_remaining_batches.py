#!/usr/bin/env python3
"""
Kalan batch'leri (8-15) yüklemek için SQL içeriğini hazırlar
Her batch için Supabase'e yükleme için SQL içeriği gösterir
"""
import sys
import os

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

project_id = 'jdrncdqyymlwcyvnnzoj'
batch_dir = '.cursor/agents'

# Batch 8-15'i oku
for batch_num in range(8, 16):
    batch_file = f'{batch_dir}/batch_{batch_num}.sql'
    if os.path.exists(batch_file):
        with open(batch_file, 'r', encoding='utf-8') as f:
            sql = f.read().strip()
        
        print(f"\n# Batch {batch_num}")
        print(f"# Dosya: {batch_file}")
        print(f"# SQL uzunluğu: {len(sql)} karakter")
        print(f"# INSERT sayısı: yaklaşık {sql.count('INSERT INTO')}")
        print(f"# İlk 200 karakter: {sql[:200]}...")
    else:
        print(f"Batch {batch_num} dosyası bulunamadı!")

print("\n\nTüm batch'ler hazır!")
print(f"Project ID: {project_id}")
