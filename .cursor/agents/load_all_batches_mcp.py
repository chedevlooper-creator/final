#!/usr/bin/env python3
"""
Tüm batch SQL dosyalarını okuyup MCP Supabase'e yüklemek için hazırlar
"""
import sys
import os

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

project_id = 'jdrncdqyymlwcyvnnzoj'
batch_dir = '.cursor/agents'

# Tüm batch dosyalarını bul
batch_files = []
for i in range(1, 16):  # 1-15 arası
    batch_file = f'{batch_dir}/batch_{i}.sql'
    if os.path.exists(batch_file):
        batch_files.append((i, batch_file))

print(f"Toplam {len(batch_files)} batch dosyası bulundu\n")

# Her batch için SQL'i oku ve yükleme talimatı ver
for batch_num, batch_file in batch_files:
    with open(batch_file, 'r', encoding='utf-8') as f:
        sql = f.read().strip()
    
    print(f"# Batch {batch_num}")
    print(f"# Dosya: {batch_file}")
    print(f"# SQL uzunluğu: {len(sql)} karakter")
    print(f"# INSERT sayısı: yaklaşık {sql.count('INSERT INTO')}")
    print()

print("\nTüm batch'ler hazır!")
print(f"Project ID: {project_id}")
print("\nYüklemek için MCP Supabase execute_sql kullanın.")
