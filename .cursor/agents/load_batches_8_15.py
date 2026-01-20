#!/usr/bin/env python3
"""
Batch 8-15'i Supabase'e yüklemek için SQL içeriğini hazırlar
Her batch için ayrı ayrı yükleme yapılacak
"""
import sys
import os

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

project_id = 'jdrncdqyymlwcyvnnzoj'
batch_dir = '.cursor/agents'

print("Batch 8-15 yükleme hazırlığı\n")
print(f"Project ID: {project_id}\n")

# Batch 8-15'i kontrol et
for batch_num in range(8, 16):
    batch_file = os.path.join(batch_dir, f'batch_{batch_num}.sql')
    if os.path.exists(batch_file):
        with open(batch_file, 'r', encoding='utf-8') as f:
            sql = f.read().strip()
        
        insert_count = sql.count('INSERT INTO')
        print(f"Batch {batch_num}: {len(sql)} karakter, {insert_count} INSERT")
    else:
        print(f"Batch {batch_num}: DOSYA BULUNAMADI!")

print("\nTüm batch'ler hazır. MCP Supabase execute_sql ile yüklenecek.")
