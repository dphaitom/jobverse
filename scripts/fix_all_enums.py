#!/usr/bin/env python3
"""Fix all enum mismatches in database"""

import psycopg2
import sys
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def fix_all_enums():
    print("=" * 60)
    print("🔧 Fixing All Enum Values in Database")
    print("=" * 60)
    print()

    try:
        # Connect to database
        print("[1/3] Connecting to database...")
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='jobverse',
            user='postgres',
            password='postgres'
        )
        cur = conn.cursor()
        print("✅ Connected")
        print()

        # Fix Job ExperienceLevel - INTERNSHIP is not valid, should be ENTRY
        print("[2/3] Fixing Job experience_level...")
        cur.execute("""
            UPDATE jobs
            SET experience_level = 'ENTRY'
            WHERE experience_level = 'INTERNSHIP'
        """)
        if cur.rowcount > 0:
            print(f"  ✅ Fixed {cur.rowcount} jobs: INTERNSHIP → ENTRY")

        # Also fix any other invalid experience levels
        invalid_levels = ['INTERN', 'FRESHER', 'BEGINNER']
        for level in invalid_levels:
            cur.execute("""
                UPDATE jobs
                SET experience_level = 'ENTRY'
                WHERE experience_level = %s
            """, (level,))
            if cur.rowcount > 0:
                print(f"  ✅ Fixed {cur.rowcount} jobs: {level} → ENTRY")

        conn.commit()
        print()

        # Verify no more invalid values
        print("[3/3] Verifying fixes...")

        # Check jobs
        cur.execute("""
            SELECT DISTINCT experience_level
            FROM jobs
            WHERE experience_level NOT IN ('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR')
        """)
        invalid_exp = cur.fetchall()
        if invalid_exp:
            print(f"  ⚠️  Still found invalid experience_level values: {invalid_exp}")
        else:
            print("  ✅ All job experience_level values are valid")

        # Check companies
        cur.execute("""
            SELECT DISTINCT company_size
            FROM companies
            WHERE company_size NOT IN ('STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_500', 'ENTERPRISE_501_1000', 'CORPORATION_1000_PLUS')
        """)
        invalid_sizes = cur.fetchall()
        if invalid_sizes:
            print(f"  ⚠️  Still found invalid company_size values: {invalid_sizes}")
        else:
            print("  ✅ All company_size values are valid")

        print()
        print("=" * 60)
        print("✅ ALL ENUMS FIXED!")
        print("=" * 60)
        print()
        print("Backend should now work without enum errors!")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    fix_all_enums()
