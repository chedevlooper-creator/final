#!/usr/bin/env python3
"""
Batch 14 ve 15'i yüklemek için SQL içeriklerini hazırlar
"""
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Batch 14
with open('batch_14.sql', 'r', encoding='utf-8') as f:
    batch_14_sql = f.read().strip()

# Batch 15
with open('batch_15.sql', 'r', encoding='utf-8') as f:
    batch_15_sql = f.read().strip()

print(f"Batch 14: {len(batch_14_sql)} karakter")
print(f"Batch 15: {len(batch_15_sql)} karakter")
print("\nSQL içerikleri hazır. MCP Supabase execute_sql ile çalıştırılacak.")
