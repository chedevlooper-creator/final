#!/usr/bin/env python3
"""
Tüm batch'leri yüklemek için SQL'leri oluşturur
Her batch için ayrı SQL dosyası oluşturur
"""
import sys
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Batch sayısını bul
sql_file = '.cursor/agents/output.sql'

with open(sql_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

queries = []
current_query = ''

for line in lines:
    line = line.strip()
    if not line or line.startswith('--'):
        continue
    
    current_query += ' ' + line if current_query else line
    
    if line.endswith(';'):
        if 'INSERT INTO' in current_query:
            queries.append(current_query)
        current_query = ''

batch_size = 50
total_batches = (len(queries) + batch_size - 1) // batch_size

print(f"Toplam {len(queries)} INSERT statement")
print(f"Toplam {total_batches} batch oluşturulacak\n")

# Her batch için SQL dosyası oluştur
for batch_num in range(1, total_batches + 1):
    start_idx = (batch_num - 1) * batch_size
    end_idx = start_idx + batch_size
    batch = queries[start_idx:end_idx]
    
    if batch:
        batch_sql = ' '.join(batch)
        filename = f'.cursor/agents/batch_{batch_num}.sql'
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(batch_sql)
        print(f"Batch {batch_num}/{total_batches} oluşturuldu: {len(batch)} INSERT, {len(batch_sql)} karakter")

print(f"\nTüm batch'ler hazır!")
