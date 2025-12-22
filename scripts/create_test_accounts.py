#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create test accounts for testing authentication and features
"""

import psycopg2
from datetime import datetime
import sys

# Set UTF-8 encoding
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'jobverse',
    'user': 'postgres',
    'password': 'postgres'
}

def create_test_accounts():
    """Create test accounts with proper setup"""
    conn = None
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # Account 1: Admin account
        print("\n[1] Creating ADMIN account...")
        admin_email = "admin@jobverse.com"

        # Check if admin exists
        cur.execute("SELECT id FROM users WHERE email = %s", (admin_email,))
        if cur.fetchone():
            print(f"  [SKIP] Admin account already exists: {admin_email}")
        else:
            # Password: Admin@123 (BCrypt hash)
            admin_password_hash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"

            cur.execute("""
                INSERT INTO users (email, password_hash, role, status, email_verified, created_at)
                VALUES (%s, %s, 'ADMIN', 'ACTIVE', true, %s)
                RETURNING id
            """, (admin_email, admin_password_hash, datetime.now()))

            admin_id = cur.fetchone()[0]

            # Update phone in users table
            cur.execute("""
                UPDATE users SET phone = %s WHERE id = %s
            """, ('0123456789', admin_id))

            # Create profile
            cur.execute("""
                INSERT INTO user_profiles (user_id, full_name, city, bio)
                VALUES (%s, 'System Admin', 'Hà Nội', 'Administrator account')
            """, (admin_id,))

            print(f"  [OK] Created admin: {admin_email}")
            print(f"       Password: Admin@123")

        # Account 2: Test Candidate account
        print("\n[2] Creating TEST CANDIDATE account...")
        candidate_email = "test.candidate@jobverse.com"

        cur.execute("SELECT id FROM users WHERE email = %s", (candidate_email,))
        existing = cur.fetchone()

        if existing:
            print(f"  [SKIP] Candidate already exists: {candidate_email}")
            candidate_id = existing[0]
        else:
            # Password: Test@123 (BCrypt hash)
            candidate_password_hash = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8VZJcBMEQNMEjtkNdNU.mZCzsfF1Se"

            cur.execute("""
                INSERT INTO users (email, password_hash, role, status, email_verified, created_at)
                VALUES (%s, %s, 'CANDIDATE', 'ACTIVE', true, %s)
                RETURNING id
            """, (candidate_email, candidate_password_hash, datetime.now()))

            candidate_id = cur.fetchone()[0]

            # Update phone in users table
            cur.execute("""
                UPDATE users SET phone = %s WHERE id = %s
            """, ('0987654321', candidate_id))

            # Create profile
            cur.execute("""
                INSERT INTO user_profiles (
                    user_id, full_name, city, bio,
                    experience_years, current_position, open_to_work
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                candidate_id,
                'Test Candidate',
                'Hồ Chí Minh',
                'Test candidate for development',
                3,
                'Software Engineer',
                True
            ))

            print(f"  [OK] Created candidate: {candidate_email}")
            print(f"       Password: Test@123")

        # Create resume for candidate
        print("\n[3] Creating resume for test candidate...")
        cur.execute("SELECT COUNT(*) FROM resumes WHERE user_id = %s", (candidate_id,))
        resume_count = cur.fetchone()[0]

        if resume_count == 0:
            cur.execute("""
                INSERT INTO resumes (
                    user_id, title, file_url, file_type,
                    parsed_content, is_primary, view_count, created_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                candidate_id,
                'CV - Test Candidate',
                f'/resumes/test/{candidate_id}.pdf',
                'application/pdf',
                'Test resume content\nSoftware Engineer with 3 years experience',
                True,
                0,
                datetime.now()
            ))
            print("  [OK] Created primary resume")
        else:
            # Set existing resume as primary
            cur.execute("""
                UPDATE resumes
                SET is_primary = true
                WHERE id = (
                    SELECT id FROM resumes
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                    LIMIT 1
                )
            """, (candidate_id,))
            print("  [OK] Set existing resume as primary")

        # Commit all changes
        conn.commit()

        print("\n" + "="*60)
        print("[SUCCESS] Test accounts created!")
        print("="*60)
        print("\nYou can now login with:")
        print("\n1. Admin Account:")
        print(f"   Email: admin@jobverse.com")
        print(f"   Password: Admin@123")
        print("\n2. Candidate Account:")
        print(f"   Email: test.candidate@jobverse.com")
        print(f"   Password: Test@123")
        print("\n" + "="*60)

        cur.close()

    except psycopg2.Error as e:
        print(f"\n[ERROR] Database error: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("="*60)
    print("Create Test Accounts Script")
    print("="*60)
    create_test_accounts()
