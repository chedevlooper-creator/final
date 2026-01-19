#!/usr/bin/env python3
"""
SQL dosyasını parse edip batch'leri JSON olarak çıkarır
"""
import sys
import json

# Windows'ta UTF-8 encoding sorununu çöz
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# SQL dosyasını oku
sql_file = '.cursor/agents/output.sql'

with open(sql_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# SQL statement'larını topla
queries = []
current_query = ''

for line in lines:
    line = line.strip()
    if not line or line.startswith('--'):
        continue
    
    current_query += ' ' + line if current_query else line
    
    if line.endswith(';'):
        queries.append(current_query)
        current_query = ''

print(f"Toplam {len(queries)} INSERT statement bulundu")

# Batch'ler halinde grupla (her batch 50 INSERT)
batch_size = 50
batches = []

for i in range(0, len(queries), batch_size):
    batch = queries[i:i + batch_size]
    batch_sql = ' '.join(batch)
    batches.append({
        'batch_number': len(batches) + 1,
        'total_batches': (len(queries) + batch_size - 1) // batch_size,
        'queries_count': len(batch),
        'sql': batch_sql
    })

# JSON olarak çıktı ver
output = {
    'total_queries': len(queries),
    'total_batches': len(batches),
    'batches': batches
}

print(json.dumps(output, ensure_ascii=False, indent=2))
