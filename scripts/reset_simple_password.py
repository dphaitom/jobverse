#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Reset to simple known passwords"""
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

    print("Resetting to simple passwords...")

    # Password: Password@123
    # This is a known BCrypt hash for "Password@123"
    simple_hash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GibSBQ/4bzTi"

    # Update both accounts
    cur.execute("UPDATE users SET password_hash = %s WHERE email = %s",
                (simple_hash, 'admin@jobverse.com'))

    cur.execute("UPDATE users SET password_hash = %s WHERE email = %s",
                (simple_hash, 'test.candidate@jobverse.com'))

    conn.commit()

    print("\n" + "="*60)
    print("[SUCCESS] Passwords reset!")
    print("="*60)
    print("\nBoth accounts now use password: Password@123")
    print("\n1. Admin:")
    print("   Email: admin@jobverse.com")
    print("   Password: Password@123")
    print("\n2. Candidate:")
    print("   Email: test.candidate@jobverse.com")
    print("   Password: Password@123")
    print("\n" + "="*60)

    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
