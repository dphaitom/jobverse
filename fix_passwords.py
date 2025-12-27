#!/usr/bin/env python3
"""Fix employer passwords in database"""

import psycopg2
import bcrypt

# Generate BCrypt hash for Test@123!
password = b"Test@123!"
hashed = bcrypt.hashpw(password, bcrypt.gensalt(10))
print(f"BCrypt hash for 'Test@123!': {hashed.decode()}")

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'jobverse',
    'user': 'postgres',
    'password': 'postgres'
}

try:
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # Update all test account passwords
    cursor.execute("""
        UPDATE users 
        SET password_hash = %s
        WHERE email IN (
            'employer@vng.com.vn', 
            'employer@fpt.com.vn', 
            'employer@shopee.vn', 
            'employer@grab.com.vn', 
            'employer@tiki.vn', 
            'employer@vnpay.vn',
            'employer@momo.vn', 
            'employer@zalo.me', 
            'employer@vinai.io',
            'employer@elsaspeak.com', 
            'employer@kms-technology.com', 
            'employer@nashtechglobal.com',
            'candidate@test.com'
        )
    """, (hashed.decode(),))
    
    updated = cursor.rowcount
    conn.commit()
    
    print(f"✅ Updated {updated} user passwords to 'Test@123!'")
    
    # Verify
    cursor.execute("SELECT email, password_hash FROM users WHERE email = 'employer@vng.com.vn'")
    row = cursor.fetchone()
    if row:
        print(f"Verification - {row[0]}: {row[1][:50]}...")
        # Test password match
        if bcrypt.checkpw(password, row[1].encode()):
            print("✅ Password verification PASSED!")
        else:
            print("❌ Password verification FAILED!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
