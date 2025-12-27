-- V9__seed_mock_companies.sql
-- Seed mock employer accounts with companies for development/testing
-- Password for all accounts: Test@123 (BCrypt encoded)

-- BCrypt hash for "Test@123" (generated with bcrypt cost factor 10)
-- Note: In production, use proper password hashing. This is for dev/testing only.

-- Insert employer users
INSERT INTO users (email, password_hash, phone, role, status, email_verified, created_at, updated_at) VALUES
('employer@vng.com.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000001', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@fpt.com.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000002', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@shopee.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000003', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@grab.com.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000004', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@tiki.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000005', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@vnpay.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000006', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@momo.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000007', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@zalo.me', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000008', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@vinai.io', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000009', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@elsaspeak.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000010', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@kms-technology.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000011', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('employer@nashtechglobal.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0901000012', 'EMPLOYER', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert user profiles for employers
INSERT INTO user_profiles (user_id, full_name, updated_at)
SELECT id, 
    CASE email
        WHEN 'employer@vng.com.vn' THEN 'VNG HR Manager'
        WHEN 'employer@fpt.com.vn' THEN 'FPT HR Manager'
        WHEN 'employer@shopee.vn' THEN 'Shopee HR Manager'
        WHEN 'employer@grab.com.vn' THEN 'Grab HR Manager'
        WHEN 'employer@tiki.vn' THEN 'Tiki HR Manager'
        WHEN 'employer@vnpay.vn' THEN 'VNPAY HR Manager'
        WHEN 'employer@momo.vn' THEN 'MoMo HR Manager'
        WHEN 'employer@zalo.me' THEN 'Zalo HR Manager'
        WHEN 'employer@vinai.io' THEN 'VinAI HR Manager'
        WHEN 'employer@elsaspeak.com' THEN 'ELSA HR Manager'
        WHEN 'employer@kms-technology.com' THEN 'KMS HR Manager'
        WHEN 'employer@nashtechglobal.com' THEN 'NashTech HR Manager'
    END,
    CURRENT_TIMESTAMP
FROM users 
WHERE email IN (
    'employer@vng.com.vn', 'employer@fpt.com.vn', 'employer@shopee.vn', 
    'employer@grab.com.vn', 'employer@tiki.vn', 'employer@vnpay.vn',
    'employer@momo.vn', 'employer@zalo.me', 'employer@vinai.io',
    'employer@elsaspeak.com', 'employer@kms-technology.com', 'employer@nashtechglobal.com'
)
AND id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Insert companies for each employer (1:1 relationship)
INSERT INTO companies (owner_id, name, slug, industry, website, headquarters, company_size, description, verification_status, is_featured, employee_count, created_at, updated_at)
SELECT 
    u.id,
    CASE u.email
        WHEN 'employer@vng.com.vn' THEN 'VNG Corporation'
        WHEN 'employer@fpt.com.vn' THEN 'FPT Software'
        WHEN 'employer@shopee.vn' THEN 'Shopee Vietnam'
        WHEN 'employer@grab.com.vn' THEN 'Grab Vietnam'
        WHEN 'employer@tiki.vn' THEN 'Tiki'
        WHEN 'employer@vnpay.vn' THEN 'VNPAY'
        WHEN 'employer@momo.vn' THEN 'MoMo'
        WHEN 'employer@zalo.me' THEN 'Zalo (VNG)'
        WHEN 'employer@vinai.io' THEN 'VinAI Research'
        WHEN 'employer@elsaspeak.com' THEN 'ELSA'
        WHEN 'employer@kms-technology.com' THEN 'KMS Technology'
        WHEN 'employer@nashtechglobal.com' THEN 'NashTech'
    END,
    CASE u.email
        WHEN 'employer@vng.com.vn' THEN 'vng-corporation'
        WHEN 'employer@fpt.com.vn' THEN 'fpt-software'
        WHEN 'employer@shopee.vn' THEN 'shopee-vietnam'
        WHEN 'employer@grab.com.vn' THEN 'grab-vietnam'
        WHEN 'employer@tiki.vn' THEN 'tiki'
        WHEN 'employer@vnpay.vn' THEN 'vnpay'
        WHEN 'employer@momo.vn' THEN 'momo'
        WHEN 'employer@zalo.me' THEN 'zalo-vng'
        WHEN 'employer@vinai.io' THEN 'vinai-research'
        WHEN 'employer@elsaspeak.com' THEN 'elsa'
        WHEN 'employer@kms-technology.com' THEN 'kms-technology'
        WHEN 'employer@nashtechglobal.com' THEN 'nashtech'
    END,
    CASE u.email
        WHEN 'employer@vng.com.vn' THEN 'Gaming/Technology'
        WHEN 'employer@fpt.com.vn' THEN 'IT Services'
        WHEN 'employer@shopee.vn' THEN 'E-commerce'
        WHEN 'employer@grab.com.vn' THEN 'Technology/Transportation'
        WHEN 'employer@tiki.vn' THEN 'E-commerce'
        WHEN 'employer@vnpay.vn' THEN 'Fintech'
        WHEN 'employer@momo.vn' THEN 'Fintech'
        WHEN 'employer@zalo.me' THEN 'Technology/Social'
        WHEN 'employer@vinai.io' THEN 'AI/Research'
        WHEN 'employer@elsaspeak.com' THEN 'EdTech'
        WHEN 'employer@kms-technology.com' THEN 'IT Services'
        WHEN 'employer@nashtechglobal.com' THEN 'IT Services'
    END,
    CASE u.email
        WHEN 'employer@vng.com.vn' THEN 'https://vng.com.vn'
        WHEN 'employer@fpt.com.vn' THEN 'https://fpt-software.com'
        WHEN 'employer@shopee.vn' THEN 'https://shopee.vn'
        WHEN 'employer@grab.com.vn' THEN 'https://grab.com'
        WHEN 'employer@tiki.vn' THEN 'https://tiki.vn'
        WHEN 'employer@vnpay.vn' THEN 'https://vnpay.vn'
        WHEN 'employer@momo.vn' THEN 'https://momo.vn'
        WHEN 'employer@zalo.me' THEN 'https://zalo.me'
        WHEN 'employer@vinai.io' THEN 'https://vinai.io'
        WHEN 'employer@elsaspeak.com' THEN 'https://elsaspeak.com'
        WHEN 'employer@kms-technology.com' THEN 'https://kms-technology.com'
        WHEN 'employer@nashtechglobal.com' THEN 'https://nashtechglobal.com'
    END,
    CASE u.email
        WHEN 'employer@vng.com.vn' THEN 'TP. Hồ Chí Minh'
        WHEN 'employer@fpt.com.vn' THEN 'Hà Nội'
        WHEN 'employer@shopee.vn' THEN 'TP. Hồ Chí Minh'
        WHEN 'employer@grab.com.vn' THEN 'TP. Hồ Chí Minh'
        WHEN 'employer@tiki.vn' THEN 'TP. Hồ Chí Minh'
        WHEN 'employer@vnpay.vn' THEN 'Hà Nội'
        WHEN 'employer@momo.vn' THEN 'TP. Hồ Chí Minh'
        WHEN 'employer@zalo.me' THEN 'TP. Hồ Chí Minh'
        WHEN 'employer@vinai.io' THEN 'Hà Nội'
        WHEN 'employer@elsaspeak.com' THEN 'TP. Hồ Chí Minh'
        WHEN 'employer@kms-technology.com' THEN 'TP. Hồ Chí Minh'
        WHEN 'employer@nashtechglobal.com' THEN 'TP. Hồ Chí Minh'
    END,
    CASE u.email
        WHEN 'employer@vng.com.vn' THEN 'CORPORATION_1000_PLUS'
        WHEN 'employer@fpt.com.vn' THEN 'CORPORATION_1000_PLUS'
        WHEN 'employer@shopee.vn' THEN 'CORPORATION_1000_PLUS'
        WHEN 'employer@grab.com.vn' THEN 'CORPORATION_1000_PLUS'
        WHEN 'employer@tiki.vn' THEN 'LARGE_201_500'
        WHEN 'employer@vnpay.vn' THEN 'ENTERPRISE_501_1000'
        WHEN 'employer@momo.vn' THEN 'ENTERPRISE_501_1000'
        WHEN 'employer@zalo.me' THEN 'LARGE_201_500'
        WHEN 'employer@vinai.io' THEN 'MEDIUM_51_200'
        WHEN 'employer@elsaspeak.com' THEN 'MEDIUM_51_200'
        WHEN 'employer@kms-technology.com' THEN 'CORPORATION_1000_PLUS'
        WHEN 'employer@nashtechglobal.com' THEN 'CORPORATION_1000_PLUS'
    END,
    CASE u.email
        WHEN 'employer@vng.com.vn' THEN 'VNG là công ty công nghệ hàng đầu Việt Nam, nổi tiếng với các sản phẩm Zalo, ZaloPay, và nhiều game online phổ biến.'
        WHEN 'employer@fpt.com.vn' THEN 'FPT Software là công ty dịch vụ IT lớn nhất Việt Nam, cung cấp giải pháp chuyển đổi số cho khách hàng toàn cầu.'
        WHEN 'employer@shopee.vn' THEN 'Shopee là sàn thương mại điện tử hàng đầu Đông Nam Á và Đài Loan.'
        WHEN 'employer@grab.com.vn' THEN 'Grab là siêu ứng dụng hàng đầu Đông Nam Á, cung cấp dịch vụ vận chuyển, giao đồ ăn và thanh toán.'
        WHEN 'employer@tiki.vn' THEN 'Tiki là một trong những sàn thương mại điện tử lớn nhất Việt Nam.'
        WHEN 'employer@vnpay.vn' THEN 'VNPAY là công ty fintech hàng đầu Việt Nam, cung cấp giải pháp thanh toán điện tử.'
        WHEN 'employer@momo.vn' THEN 'MoMo là ví điện tử lớn nhất Việt Nam với hơn 31 triệu người dùng.'
        WHEN 'employer@zalo.me' THEN 'Zalo là ứng dụng nhắn tin số 1 Việt Nam với hơn 70 triệu người dùng.'
        WHEN 'employer@vinai.io' THEN 'VinAI là công ty nghiên cứu AI hàng đầu Việt Nam, thuộc Tập đoàn Vingroup.'
        WHEN 'employer@elsaspeak.com' THEN 'ELSA là ứng dụng học tiếng Anh sử dụng AI, được thành lập bởi người Việt tại Silicon Valley.'
        WHEN 'employer@kms-technology.com' THEN 'KMS Technology là công ty dịch vụ phần mềm với hơn 1500 nhân viên tại Việt Nam và Mỹ.'
        WHEN 'employer@nashtechglobal.com' THEN 'NashTech là công ty dịch vụ công nghệ toàn cầu với văn phòng tại Việt Nam, Anh, và nhiều nước khác.'
    END,
    'VERIFIED',
    true,
    CASE u.email
        WHEN 'employer@vng.com.vn' THEN 3000
        WHEN 'employer@fpt.com.vn' THEN 20000
        WHEN 'employer@shopee.vn' THEN 5000
        WHEN 'employer@grab.com.vn' THEN 2000
        WHEN 'employer@tiki.vn' THEN 400
        WHEN 'employer@vnpay.vn' THEN 800
        WHEN 'employer@momo.vn' THEN 700
        WHEN 'employer@zalo.me' THEN 300
        WHEN 'employer@vinai.io' THEN 150
        WHEN 'employer@elsaspeak.com' THEN 100
        WHEN 'employer@kms-technology.com' THEN 1500
        WHEN 'employer@nashtechglobal.com' THEN 2500
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
WHERE u.email IN (
    'employer@vng.com.vn', 'employer@fpt.com.vn', 'employer@shopee.vn', 
    'employer@grab.com.vn', 'employer@tiki.vn', 'employer@vnpay.vn',
    'employer@momo.vn', 'employer@zalo.me', 'employer@vinai.io',
    'employer@elsaspeak.com', 'employer@kms-technology.com', 'employer@nashtechglobal.com'
)
AND u.id NOT IN (SELECT owner_id FROM companies)
AND NOT EXISTS (
    SELECT 1 FROM companies c WHERE c.name IN (
        'VNG Corporation', 'FPT Software', 'Shopee Vietnam', 'Grab Vietnam',
        'Tiki', 'VNPAY', 'MoMo', 'Zalo (VNG)', 'VinAI Research', 'ELSA',
        'KMS Technology', 'NashTech'
    )
)
ON CONFLICT (owner_id) DO NOTHING;

-- Also insert a test candidate account for testing chat
INSERT INTO users (email, password_hash, phone, role, status, email_verified, created_at, updated_at) VALUES
('candidate@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDGGnMhdMvsPJYmhNLLHGaHdtQpK/C', '0909999999', 'CANDIDATE', 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profiles (user_id, full_name, current_position, experience_years, city, open_to_work, open_to_remote, updated_at)
SELECT id, 'Nguyễn Văn Test', 'Senior Software Engineer', 5, 'TP. Hồ Chí Minh', true, true, CURRENT_TIMESTAMP
FROM users 
WHERE email = 'candidate@test.com'
AND id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;
