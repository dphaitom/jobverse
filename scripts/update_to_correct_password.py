#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Update passwords with correct BCrypt hash (strength 10)"""
import psycopg2
import bcrypt
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

    print("Generating new BCrypt hash with strength 10...")

    # Generate new hash with strength 10 (same as Spring Security default)
    password = "Password@123"
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    new_hash = hashed.decode('utf-8')

    print(f"New hash: {new_hash}")
    print("\nUpdating passwords in database...")

    # Update both accounts with the new hash
    cur.execute("UPDATE users SET password_hash = %s WHERE email = %s",
                (new_hash, 'admin@jobverse.com'))
    print(f"  [OK] Updated admin@jobverse.com")

    cur.execute("UPDATE users SET password_hash = %s WHERE email = %s",
                (new_hash, 'test.candidate@jobverse.com'))
    print(f"  [OK] Updated test.candidate@jobverse.com")

    conn.commit()

    print("\n" + "="*60)
    print("[SUCCESS] Passwords updated with correct BCrypt hash!")
    print("="*60)
    print("\nBoth accounts now use password: Password@123")
    print("\n1. Admin:")
    print("   Email: admin@jobverse.com")
    print("   Password: Password@123")
    print("\n2. Candidate:")
    print("   Email: test.candidate@jobverse.com")
    print("   Password: Password@123")
    print("\n" + "="*60)

    # Verify in database
    print("\nVerifying passwords in database...")
    for email in ['admin@jobverse.com', 'test.candidate@jobverse.com']:
        cur.execute("SELECT password_hash FROM users WHERE email = %s", (email,))
        result = cur.fetchone()
        if result:
            db_hash = result[0]
            print(f"\n[{email}]")
            print(f"  Hash in DB: {db_hash[:60]}...")
            # Verify the hash
            if bcrypt.checkpw(password.encode('utf-8'), db_hash.encode('utf-8')):
                print(f"  [OK] Hash verification successful!")
            else:
                print(f"  [ERROR] Hash verification failed!")

    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
