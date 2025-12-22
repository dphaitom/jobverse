#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import psycopg2
import sys

# Set UTF-8 encoding
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

    print("Checking users with 'tom' in email...")
    cur.execute("""
        SELECT id, email, role, status, email_verified
        FROM users
        WHERE email LIKE '%tom%'
    """)

    rows = cur.fetchall()
    for r in rows:
        print(f"\nID: {r[0]}")
        print(f"Email: {r[1]}")
        print(f"Role: {r[2]}")
        print(f"Status: {r[3]}")
        print(f"Email Verified: {r[4]}")

    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
