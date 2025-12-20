#!/usr/bin/env python3
"""Fix company_size enum values in database"""

import psycopg2
import sys
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def fix_company_sizes():
    print("=" * 60)
    print("🔧 Fixing Company Size Enum Values")
    print("=" * 60)
    print()

    # Size mapping
    size_map = {
        "1-10": "STARTUP_1_10",
        "10-50": "SMALL_11_50",
        "11-50": "SMALL_11_50",
        "50-100": "MEDIUM_51_200",
        "51-200": "MEDIUM_51_200",
        "100-200": "MEDIUM_51_200",
        "200-500": "LARGE_201_500",
        "201-500": "LARGE_201_500",
        "500-1000": "ENTERPRISE_501_1000",
        "501-1000": "ENTERPRISE_501_1000",
        "1000-5000": "CORPORATION_1000_PLUS",
        "5000-10000": "CORPORATION_1000_PLUS",
        "10000+": "CORPORATION_1000_PLUS"
    }

    try:
        # Connect to database
        print("[1/2] Connecting to database...")
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

        # Fix each company
        print("[2/2] Updating company sizes...")
        for old_size, new_size in size_map.items():
            cur.execute("""
                UPDATE companies
                SET company_size = %s
                WHERE company_size = %s
            """, (new_size, old_size))

            if cur.rowcount > 0:
                print(f"  ✅ Updated {cur.rowcount} companies: {old_size} → {new_size}")

        conn.commit()
        print()
        print("=" * 60)
        print("✅ ALL COMPANY SIZES FIXED!")
        print("=" * 60)
        print()
        print("You can now restart the backend.")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    fix_company_sizes()
