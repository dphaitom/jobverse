#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to add default/primary resumes for users who don't have one
This fixes the quick apply feature
"""

import psycopg2
from datetime import datetime
import os
import sys

# Set UTF-8 encoding for console output
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'jobverse'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres')
}

def add_default_resumes():
    """Add default primary resume for users who don't have one"""
    conn = None
    try:
        # Connect to database
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # Find users without primary resume
        print("\nFinding users without primary resume...")
        cur.execute("""
            SELECT u.id, COALESCE(up.full_name, u.email), u.email
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.role = 'CANDIDATE'
            AND NOT EXISTS (
                SELECT 1 FROM resumes r
                WHERE r.user_id = u.id AND r.is_primary = true
            )
        """)

        users_without_resume = cur.fetchall()

        if not users_without_resume:
            print("[OK] All users already have primary resumes!")
            return

        print(f"Found {len(users_without_resume)} users without primary resume")

        # Add default resume for each user
        added_count = 0
        for user_id, full_name, email in users_without_resume:
            print(f"\nAdding default resume for: {full_name} ({email})")

            # Check if user has any resumes
            cur.execute("SELECT COUNT(*) FROM resumes WHERE user_id = %s", (user_id,))
            resume_count = cur.fetchone()[0]

            if resume_count > 0:
                # User has resumes but none is primary - set the first one as primary
                print(f"  > User has {resume_count} resume(s). Setting first one as primary...")
                cur.execute("""
                    UPDATE resumes
                    SET is_primary = true
                    WHERE id = (
                        SELECT id FROM resumes
                        WHERE user_id = %s
                        ORDER BY created_at DESC
                        LIMIT 1
                    )
                """, (user_id,))
                print("  [OK] Updated existing resume to primary")
            else:
                # User has no resumes - create a default one
                print("  > Creating default resume...")
                cur.execute("""
                    INSERT INTO resumes (
                        user_id,
                        title,
                        file_url,
                        file_type,
                        parsed_content,
                        is_primary,
                        view_count,
                        created_at
                    ) VALUES (
                        %s,
                        %s,
                        %s,
                        'application/pdf',
                        %s,
                        true,
                        0,
                        %s
                    )
                """, (
                    user_id,
                    f"CV - {full_name}",
                    f"/resumes/default/{user_id}.pdf",
                    f"Default resume for {full_name}\nEmail: {email}",
                    datetime.now()
                ))
                print("  [OK] Created default resume")

            added_count += 1

        # Commit changes
        conn.commit()

        print(f"\n{'='*60}")
        print(f"[OK] Successfully processed {added_count} users")
        print(f"{'='*60}")

        # Verify results
        print("\nVerifying results...")
        cur.execute("""
            SELECT COUNT(*) FROM users u
            WHERE u.role = 'CANDIDATE'
            AND NOT EXISTS (
                SELECT 1 FROM resumes r
                WHERE r.user_id = u.id AND r.is_primary = true
            )
        """)
        remaining = cur.fetchone()[0]

        if remaining == 0:
            print("[OK] All candidate users now have primary resumes!")
        else:
            print(f"[WARNING] {remaining} users still don't have primary resumes")

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
            print("\nDatabase connection closed.")

if __name__ == "__main__":
    print("="*60)
    print("Add Default Primary Resumes Script")
    print("="*60)
    add_default_resumes()
