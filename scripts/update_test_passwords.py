#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Update password for test accounts"""
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

    print("Updating test account passwords...")

    # Admin@123 hash
    admin_hash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
    cur.execute("UPDATE users SET password_hash = %s WHERE email = %s",
                (admin_hash, 'admin@jobverse.com'))

    # Test@123 hash
    test_hash = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8VZJcBMEQNMEjtkNdNU.mZCzsfF1Se"
    cur.execute("UPDATE users SET password_hash = %s WHERE email = %s",
                (test_hash, 'test.candidate@jobverse.com'))

    conn.commit()

    print("\n" + "="*60)
    print("[SUCCESS] Passwords updated!")
    print("="*60)
    print("\nYou can now login with:")
    print("\n1. Admin Account:")
    print("   Email: admin@jobverse.com")
    print("   Password: Admin@123")
    print("\n2. Candidate Account:")
    print("   Email: test.candidate@jobverse.com")
    print("   Password: Test@123")
    print("\n" + "="*60)

    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
