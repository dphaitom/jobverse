#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import psycopg2
import sys

if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        database='jobverse',
        user='postgres',
        password='postgres'
    )
    cur = conn.cursor()

    print("Deleting test accounts...")
    cur.execute("DELETE FROM users WHERE email IN (%s, %s)",
                ('admin@jobverse.com', 'test.candidate@jobverse.com'))

    conn.commit()
    print(f"[OK] Deleted test accounts")

    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
