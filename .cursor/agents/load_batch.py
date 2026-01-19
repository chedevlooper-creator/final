#!/usr/bin/env python3
"""
SQL dosyasından batch numarasına göre SQL sorgusunu çıkarır
"""
import sys
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

batch_num = int(sys.argv[1]) if len(sys.argv) > 1 else 1
batch_size = 50

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

# Batch hesapla
start_idx = (batch_num - 1) * batch_size
end_idx = start_idx + batch_size
batch = queries[start_idx:end_idx]

if batch:
    batch_sql = ' '.join(batch)
    print(json.dumps({
        'batch_number': batch_num,
        'total_batches': (len(queries) + batch_size - 1) // batch_size,
        'queries_in_batch': len(batch),
        'sql': batch_sql
    }, ensure_ascii=False))
else:
    print(json.dumps({
        'error': f'Batch {batch_num} bulunamadı'
    }, ensure_ascii=False))
