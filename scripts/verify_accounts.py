#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify test accounts"""
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

    print("="*60)
    print("Checking test accounts...")
    print("="*60)

    accounts = [
        ('admin@jobverse.com', 'Admin@123'),
        ('test.candidate@jobverse.com', 'Test@123')
    ]

    for email, password in accounts:
        print(f"\n[{email}]")

        cur.execute("""
            SELECT u.id, u.email, u.password_hash, u.role, u.status, u.email_verified,
                   up.full_name
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.email = %s
        """, (email,))

        result = cur.fetchone()

        if result:
            user_id, email, pwd_hash, role, status, verified, full_name = result
            print(f"  ID: {user_id}")
            print(f"  Name: {full_name}")
            print(f"  Role: {role}")
            print(f"  Status: {status}")
            print(f"  Email Verified: {verified}")
            print(f"  Password Hash: {pwd_hash[:50]}...")
            print(f"  Expected Password: {password}")

            # Check if has resume (for candidate)
            if role == 'CANDIDATE':
                cur.execute("""
                    SELECT COUNT(*),
                           SUM(CASE WHEN is_primary THEN 1 ELSE 0 END) as primary_count
                    FROM resumes WHERE user_id = %s
                """, (user_id,))
                resume_count, primary_count = cur.fetchone()
                print(f"  Resumes: {resume_count} (Primary: {primary_count})")
        else:
            print(f"  [NOT FOUND]")

    print("\n" + "="*60)
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
