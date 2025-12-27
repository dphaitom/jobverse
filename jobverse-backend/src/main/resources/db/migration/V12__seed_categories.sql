-- V12__seed_categories.sql
-- Seed job categories for the job portal

INSERT INTO categories (name, slug, icon, description, job_count, is_active) VALUES
('Công nghệ thông tin', 'cong-nghe-thong-tin', 'Code', 'Phát triển phần mềm, lập trình, IT', 0, true),
('Marketing', 'marketing', 'TrendingUp', 'Marketing, quảng cáo, truyền thông', 0, true),
('Kinh doanh', 'kinh-doanh', 'Briefcase', 'Kinh doanh, bán hàng, phát triển thị trường', 0, true),
('Tài chính - Kế toán', 'tai-chinh-ke-toan', 'DollarSign', 'Kế toán, tài chính, ngân hàng', 0, true),
('Nhân sự', 'nhan-su', 'Users', 'Nhân sự, tuyển dụng, đào tạo', 0, true),
('Thiết kế', 'thiet-ke', 'Palette', 'Thiết kế đồ họa, UI/UX, sáng tạo', 0, true),
('Sản xuất', 'san-xuat', 'Factory', 'Sản xuất, vận hành, quản lý chất lượng', 0, true),
('Hành chính - Văn phòng', 'hanh-chinh-van-phong', 'FileText', 'Hành chính, thư ký, trợ lý', 0, true),
('Dịch vụ khách hàng', 'dich-vu-khach-hang', 'Headphones', 'Chăm sóc khách hàng, hỗ trợ', 0, true),
('Giáo dục - Đào tạo', 'giao-duc-dao-tao', 'GraduationCap', 'Giảng dạy, đào tạo, nghiên cứu', 0, true),
('Y tế - Dược phẩm', 'y-te-duoc-pham', 'Heart', 'Y tế, chăm sóc sức khỏe, dược phẩm', 0, true),
('Xây dựng', 'xay-dung', 'Building', 'Xây dựng, kiến trúc, bất động sản', 0, true),
('Logistics', 'logistics', 'Truck', 'Vận chuyển, kho bãi, chuỗi cung ứng', 0, true),
('Du lịch - Nhà hàng', 'du-lich-nha-hang', 'Utensils', 'Du lịch, khách sạn, ẩm thực', 0, true),
('Truyền thông - Báo chí', 'truyen-thong-bao-chi', 'Newspaper', 'Báo chí, truyền thông, nội dung', 0, true),
('Pháp lý', 'phap-ly', 'Scale', 'Luật, pháp chế, tư vấn pháp lý', 0, true),
('Data - AI', 'data-ai', 'Database', 'Khoa học dữ liệu, AI, Machine Learning', 0, true),
('DevOps - Cloud', 'devops-cloud', 'Cloud', 'DevOps, Cloud, hạ tầng', 0, true),
('Mobile Development', 'mobile-development', 'Smartphone', 'Phát triển ứng dụng di động', 0, true),
('Game Development', 'game-development', 'Gamepad', 'Phát triển game, đồ họa game', 0, true)
ON CONFLICT (slug) DO NOTHING;
