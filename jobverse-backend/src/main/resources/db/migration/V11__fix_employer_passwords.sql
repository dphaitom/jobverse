-- V11__fix_employer_passwords.sql
-- Fix employer account passwords to Test@123!
-- BCrypt hash for "Test@123!" generated with cost factor 10
-- Hash verified: $2a$10$8K1p/a0dR1xqM8CK0hDpRuMDFkMXk3c9RZs7N5o/KLcQq8Z5mGvKi = Test@123!

UPDATE users 
SET password_hash = '$2a$10$8K1p/a0dR1xqM8CK0hDpRuMDFkMXk3c9RZs7N5o/KLcQq8Z5mGvKi'
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
);
