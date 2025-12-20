#!/usr/bin/env python3
"""Create JobVerse database on PostgreSQL"""

import sys
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    """Create jobverse database if it doesn't exist"""

    print("=" * 60)
    print("🗄️  JobVerse Database Creator")
    print("=" * 60)
    print()

    # Connect to PostgreSQL default database
    print("[1/3] Connecting to PostgreSQL on port 5433...")
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5433,
            database='postgres',  # Connect to default database first
            user='postgres',
            password='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print("✅ Connected to PostgreSQL")
        print()

    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print()
        print("Make sure:")
        print("  1. PostgreSQL 18 is running")
        print("  2. Port is 5433")
        print("  3. Username/password is postgres/postgres")
        sys.exit(1)

    # Check if database exists
    print("[2/3] Checking if 'jobverse' database exists...")
    cursor.execute(
        "SELECT 1 FROM pg_database WHERE datname = 'jobverse'"
    )
    exists = cursor.fetchone()

    if exists:
        print("ℹ️  Database 'jobverse' already exists")
        print()
    else:
        # Create database
        print("[3/3] Creating 'jobverse' database...")
        try:
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier('jobverse')
            ))
            print("✅ Database 'jobverse' created successfully!")
            print()
        except Exception as e:
            print(f"❌ Failed to create database: {e}")
            cursor.close()
            conn.close()
            sys.exit(1)

    # Verify
    print("Verifying database exists...")
    cursor.execute(
        "SELECT datname FROM pg_database WHERE datname = 'jobverse'"
    )
    result = cursor.fetchone()

    if result:
        print(f"✅ Confirmed: Database '{result[0]}' exists")
        print()

    cursor.close()
    conn.close()

    print("=" * 60)
    print("✅ DATABASE READY!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Start backend: .\\START_BACKEND_POSTGRES.bat")
    print("  2. Wait 60 seconds for Flyway migrations")
    print("  3. Seed database: cd scripts && .\\simple_seed.bat")
    print()

if __name__ == '__main__':
    try:
        create_database()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
