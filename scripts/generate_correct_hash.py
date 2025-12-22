#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate correct BCrypt hash with strength 10 for Password@123"""
import bcrypt
import sys

if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# Generate hash with strength 10 (same as Spring Security default)
password = "Password@123"
salt = bcrypt.gensalt(rounds=10)  # strength 10, same as BCryptPasswordEncoder default
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)

print("="*60)
print("BCrypt Hash Generator (Strength 10)")
print("="*60)
print(f"\nPassword: {password}")
print(f"Salt rounds: 10")
print(f"\nGenerated hash:")
print(hashed.decode('utf-8'))
print("\n" + "="*60)

# Verify the hash works
if bcrypt.checkpw(password.encode('utf-8'), hashed):
    print("[OK] Hash verification successful!")
else:
    print("[ERROR] Hash verification failed!")
print("="*60)
