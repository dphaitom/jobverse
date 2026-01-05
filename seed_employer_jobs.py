#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JobVerse - Seed Employer Jobs
Tạo data công việc chi tiết cho các employer accounts
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import psycopg2
from datetime import datetime, timedelta
import os
import random

# Database config
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'jobverse'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres')
}

# Các công ty mẫu với thông tin chi tiết
COMPANIES = [
    {
        "name": "FPT Software",
        "description": "FPT Software là công ty công nghệ hàng đầu Việt Nam với hơn 30,000 nhân viên trên toàn cầu. Chúng tôi chuyên cung cấp dịch vụ phát triển phần mềm, chuyển đổi số và tư vấn công nghệ cho các doanh nghiệp lớn trên thế giới.",
        "industry": "Information Technology",
        "size": "CORPORATION_1000_PLUS",
        "website": "https://fptsoftware.com",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg"
    },
    {
        "name": "VNG Corporation",
        "description": "VNG là công ty công nghệ hàng đầu Việt Nam, sở hữu các sản phẩm nổi tiếng như Zalo, ZaloPay, và nhiều game online phổ biến. Chúng tôi cam kết đổi mới sáng tạo và phát triển công nghệ Việt Nam.",
        "industry": "Technology & Gaming",
        "size": "ENTERPRISE_501_1000",
        "website": "https://vng.com.vn",
        "logo": "https://vnggames.com/_next/image?url=https%3A%2F%2Fcdn.omnirise.com%2Fcms%2Fvnggames_logo_orange_black_311df8852d.png&w=1920&q=100"
    },
    {
        "name": "Shopee Vietnam",
        "description": "Shopee là nền tảng thương mại điện tử hàng đầu Đông Nam Á. Chúng tôi cung cấp môi trường làm việc năng động, sáng tạo với nhiều cơ hội phát triển cho các kỹ sư công nghệ.",
        "industry": "E-commerce",
        "size": "CORPORATION_1000_PLUS",
        "website": "https://shopee.vn",
        "logo": "https://www.clipartmax.com/png/full/109-1098412_logo-shopee-png.png"
    },
    {
        "name": "Techcombank",
        "description": "Techcombank là một trong những ngân hàng tư nhân lớn nhất Việt Nam. Chúng tôi đang chuyển đổi số mạnh mẽ và tìm kiếm những tài năng công nghệ để xây dựng ngân hàng số hàng đầu.",
        "industry": "Banking & Finance",
        "size": "ENTERPRISE_501_1000",
        "website": "https://techcombank.com.vn",
        "logo": "https://static.wixstatic.com/media/9d8ed5_263edd01c0b847059f8035fd531145d6~mv2.png/v1/fill/w_500,h_500,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/9d8ed5_263edd01c0b847059f8035fd531145d6~mv2.png"
    },
    {
        "name": "Grab Vietnam",
        "description": "Grab là siêu ứng dụng hàng đầu Đông Nam Á, cung cấp dịch vụ gọi xe, giao đồ ăn, thanh toán và nhiều dịch vụ khác. Chúng tôi đang tìm kiếm những kỹ sư tài năng để phát triển công nghệ.",
        "industry": "Technology & Transportation",
        "size": "LARGE_201_500",
        "website": "https://grab.com",
        "logo": "https://www.pikpng.com/pngl/b/101-1017413_logo-from-www-grab-food-promo-code-ph.png"
    },
    {
        "name": "Tiki",
        "description": "Tiki là một trong những sàn thương mại điện tử hàng đầu Việt Nam với dịch vụ giao hàng nhanh TikiNOW. Chúng tôi tập trung vào trải nghiệm khách hàng và công nghệ logistics.",
        "industry": "E-commerce",
        "size": "LARGE_201_500",
        "website": "https://tiki.vn",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/4/43/Logo_Tiki_2023.png"
    },
    {
        "name": "MoMo",
        "description": "MoMo là ví điện tử và siêu ứng dụng tài chính hàng đầu Việt Nam với hơn 31 triệu người dùng. Chúng tôi cung cấp giải pháp thanh toán số và dịch vụ tài chính đa dạng.",
        "industry": "Fintech",
        "size": "LARGE_201_500",
        "website": "https://momo.vn",
        "logo": "https://logos-world.net/wp-content/uploads/2024/12/MoMo-Symbol.png"
    },
    {
        "name": "VNPAY",
        "description": "VNPAY là công ty công nghệ tài chính hàng đầu Việt Nam, cung cấp giải pháp thanh toán điện tử cho ngân hàng và doanh nghiệp. Chúng tôi xử lý hàng tỷ giao dịch mỗi năm.",
        "industry": "Fintech",
        "size": "ENTERPRISE_501_1000",
        "website": "https://vnpay.vn",
        "logo": "https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg"
    },
    {
        "name": "Zalo (VNG)",
        "description": "Zalo là ứng dụng nhắn tin và gọi điện phổ biến nhất Việt Nam với hơn 70 triệu người dùng. Chúng tôi không ngừng đổi mới để mang đến trải nghiệm giao tiếp tốt nhất.",
        "industry": "Technology & Social",
        "size": "LARGE_201_500",
        "website": "https://zalo.me",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
    },
    {
        "name": "VinAI Research",
        "description": "VinAI Research là viện nghiên cứu AI hàng đầu Việt Nam thuộc tập đoàn Vingroup. Chúng tôi tập trung nghiên cứu và ứng dụng AI trong các lĩnh vực computer vision, NLP và autonomous driving.",
        "industry": "AI Research",
        "size": "MEDIUM_51_200",
        "website": "https://vinai.io",
        "logo": "https://avatars.githubusercontent.com/u/53032212?s=200&v=4"
    },
    {
        "name": "ELSA",
        "description": "ELSA là ứng dụng học tiếng Anh sử dụng AI để phân tích phát âm, giúp người dùng cải thiện khả năng nói tiếng Anh. ELSA đã có mặt tại hơn 100 quốc gia với hàng triệu người dùng.",
        "industry": "EdTech",
        "size": "MEDIUM_51_200",
        "website": "https://elsaspeak.com",
        "logo": "https://1900.com.vn/storage/uploads/companies/logo/55/elsa-1693383028.png"
    },
    {
        "name": "KMS Technology",
        "description": "KMS Technology là công ty dịch vụ phần mềm hàng đầu Việt Nam, chuyên cung cấp giải pháp phần mềm cho khách hàng Mỹ và châu Âu trong các lĩnh vực Healthcare, Fintech và E-commerce.",
        "industry": "Software Services",
        "size": "ENTERPRISE_501_1000",
        "website": "https://kms-technology.com",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/6/64/KMS-Logo.png"
    },
    {
        "name": "NashTech",
        "description": "NashTech là công ty công nghệ toàn cầu có trụ sở tại Việt Nam, cung cấp dịch vụ phát triển phần mềm, tư vấn công nghệ và giải pháp số hóa cho doanh nghiệp trên toàn thế giới.",
        "industry": "Software Services",
        "size": "ENTERPRISE_501_1000",
        "website": "https://nashtechglobal.com",
        "logo": "https://thanhnien.mediacdn.vn/Uploaded/quochung.qc/2020_01_16/nashtech/nash_tech_primary_pos_srgb_OYCJ.png?width=500"
    }
]

# Danh sách công việc chi tiết
JOBS_DATA = [
    # FPT Software Jobs
    {
        "company": "FPT Software",
        "title": "Senior Java Developer",
        "description": """
Chúng tôi đang tìm kiếm Senior Java Developer để tham gia dự án outsourcing cho khách hàng Nhật Bản trong lĩnh vực ngân hàng.

**Mô tả công việc:**
- Phát triển và bảo trì các ứng dụng Java/Spring Boot
- Thiết kế và triển khai RESTful APIs
- Làm việc với database Oracle/PostgreSQL
- Tham gia code review và mentor junior developers
- Làm việc trực tiếp với khách hàng Nhật Bản

**Quyền lợi:**
- Lương thưởng cạnh tranh + bonus dự án
- Bảo hiểm sức khỏe cao cấp
- Cơ hội onsite tại Nhật Bản
- Đào tạo tiếng Nhật miễn phí
        """,
        "requirements": """
- Tối thiểu 4 năm kinh nghiệm Java/Spring Boot
- Thành thạo Spring Framework, Hibernate, JPA
- Kinh nghiệm với microservices architecture
- Có kinh nghiệm làm việc với Agile/Scrum
- Tiếng Anh giao tiếp tốt
- Ưu tiên có tiếng Nhật N3 trở lên
        """,
        "location": "Hà Nội",
        "salary_min": 35000000,
        "salary_max": 55000000,
        "job_type": "FULL_TIME",
        "experience_level": "SENIOR",
        "category": "Backend",
        "skills": ["Java", "Spring Boot", "Microservices", "PostgreSQL", "Docker"]
    },
    {
        "company": "FPT Software",
        "title": "React Native Developer",
        "description": """
Tham gia đội ngũ Mobile Development tại FPT Software để phát triển ứng dụng mobile cho các dự án quốc tế.

**Mô tả công việc:**
- Phát triển ứng dụng mobile đa nền tảng với React Native
- Tích hợp APIs và quản lý state với Redux/MobX
- Tối ưu hiệu năng ứng dụng
- Viết unit tests và integration tests
- Collaborate với UI/UX team

**Quyền lợi:**
- Lương thưởng hấp dẫn
- Remote working linh hoạt
- Đào tạo công nghệ mới
        """,
        "requirements": """
- 2-4 năm kinh nghiệm React Native
- Thành thạo JavaScript/TypeScript
- Kinh nghiệm với Redux, React Navigation
- Biết Native modules (iOS/Android) là lợi thế
- Có portfolio ứng dụng đã publish
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 25000000,
        "salary_max": 40000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Mobile",
        "skills": ["React Native", "JavaScript", "TypeScript", "Redux", "iOS", "Android"]
    },
    {
        "company": "FPT Software",
        "title": "DevOps Engineer",
        "description": """
Gia nhập team Infrastructure để xây dựng và vận hành hệ thống CI/CD cho các dự án lớn.

**Mô tả công việc:**
- Thiết kế và triển khai CI/CD pipelines
- Quản lý infrastructure trên AWS/Azure
- Containerization với Docker và Kubernetes
- Monitoring và alerting systems
- Automation với Ansible/Terraform

**Quyền lợi:**
- Lương cạnh tranh top market
- Cơ hội học hỏi cloud technologies
- Chứng chỉ AWS/Azure sponsored
        """,
        "requirements": """
- 3+ năm kinh nghiệm DevOps/SRE
- Thành thạo Docker, Kubernetes
- Kinh nghiệm với AWS hoặc Azure
- Scripting với Python/Bash
- Có chứng chỉ cloud là lợi thế
        """,
        "location": "Đà Nẵng",
        "salary_min": 30000000,
        "salary_max": 50000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "DevOps",
        "skills": ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform", "Python"]
    },

    # VNG Corporation Jobs
    {
        "company": "VNG Corporation",
        "title": "Backend Engineer - Zalo",
        "description": """
Tham gia đội ngũ Zalo để phát triển backend cho ứng dụng chat hàng đầu Việt Nam với hơn 70 triệu người dùng.

**Mô tả công việc:**
- Phát triển các tính năng mới cho Zalo
- Xử lý hệ thống high-traffic, real-time messaging
- Tối ưu performance và scalability
- Làm việc với big data và distributed systems

**Quyền lợi:**
- Mức lương top thị trường
- Stock options
- Môi trường startup culture trong big company
        """,
        "requirements": """
- 3+ năm kinh nghiệm backend development
- Thành thạo Go, Java hoặc C++
- Kinh nghiệm với distributed systems
- Hiểu biết về networking protocols
- Problem-solving skills xuất sắc
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 40000000,
        "salary_max": 70000000,
        "job_type": "FULL_TIME",
        "experience_level": "SENIOR",
        "category": "Backend",
        "skills": ["Go", "Java", "Redis", "Kafka", "gRPC", "Distributed Systems"]
    },
    {
        "company": "VNG Corporation",
        "title": "Game Developer - Unity",
        "description": """
Phát triển game mobile cho thị trường Đông Nam Á tại studio game hàng đầu Việt Nam.

**Mô tả công việc:**
- Phát triển game features với Unity
- Implement game mechanics và AI
- Tối ưu performance cho mobile devices
- Collaborate với game designers và artists

**Quyền lợi:**
- Làm việc trong môi trường sáng tạo
- Được chơi game trong giờ làm việc
- Bonus theo doanh thu game
        """,
        "requirements": """
- 2+ năm kinh nghiệm Unity
- Thành thạo C#
- Hiểu biết về game design patterns
- Kinh nghiệm tối ưu mobile games
- Đam mê gaming
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 25000000,
        "salary_max": 45000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Game Development",
        "skills": ["Unity", "C#", "Game Development", "Mobile", "3D Graphics"]
    },
    {
        "company": "VNG Corporation",
        "title": "AI/ML Engineer - ZaloPay",
        "description": """
Xây dựng các mô hình AI/ML cho ZaloPay - ví điện tử hàng đầu Việt Nam.

**Mô tả công việc:**
- Phát triển fraud detection models
- Xây dựng recommendation systems
- NLP cho customer service chatbot
- A/B testing và model deployment

**Quyền lợi:**
- Làm việc với big data thực tế
- GPU cluster cho training
- Conference và training budget
        """,
        "requirements": """
- 3+ năm kinh nghiệm ML/AI
- Thành thạo Python, TensorFlow/PyTorch
- Kinh nghiệm với ML systems production
- Background toán/thống kê tốt
- PhD/Master là lợi thế
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 45000000,
        "salary_max": 80000000,
        "job_type": "FULL_TIME",
        "experience_level": "SENIOR",
        "category": "AI/ML",
        "skills": ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "NLP"]
    },

    # Shopee Jobs
    {
        "company": "Shopee Vietnam",
        "title": "Frontend Engineer",
        "description": """
Phát triển giao diện người dùng cho Shopee - nền tảng TMĐT hàng đầu Đông Nam Á.

**Mô tả công việc:**
- Phát triển UI components với React
- Tối ưu performance và SEO
- Implement responsive design
- A/B testing và analytics integration

**Quyền lợi:**
- Lương cạnh tranh + RSU
- Văn phòng hiện đại tại Landmark 81
- Unlimited snacks và đồ uống
        """,
        "requirements": """
- 2+ năm kinh nghiệm Frontend
- Thành thạo React, TypeScript
- Kinh nghiệm với Next.js là lợi thế
- Hiểu biết về web performance
- CSS/SCSS proficiency
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 30000000,
        "salary_max": 55000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Frontend",
        "skills": ["React", "TypeScript", "Next.js", "CSS", "JavaScript", "Webpack"]
    },
    {
        "company": "Shopee Vietnam",
        "title": "Data Engineer",
        "description": """
Xây dựng data infrastructure cho Shopee để hỗ trợ business decisions.

**Mô tả công việc:**
- Thiết kế và xây dựng data pipelines
- ETL processing với Spark/Flink
- Data warehouse optimization
- Real-time analytics systems

**Quyền lợi:**
- Làm việc với petabyte-scale data
- Learning & development budget
- Work from home flexible
        """,
        "requirements": """
- 3+ năm kinh nghiệm Data Engineering
- Thành thạo Python, SQL
- Kinh nghiệm Spark, Kafka, Airflow
- Cloud experience (AWS/GCP)
- Distributed systems knowledge
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 35000000,
        "salary_max": 60000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Data",
        "skills": ["Python", "Spark", "Kafka", "Airflow", "SQL", "AWS"]
    },
    {
        "company": "Shopee Vietnam",
        "title": "QA Automation Engineer",
        "description": """
Đảm bảo chất lượng sản phẩm cho hàng triệu users của Shopee.

**Mô tả công việc:**
- Thiết kế và implement test automation frameworks
- API testing và performance testing
- CI/CD integration cho automated tests
- Mentoring manual QA team

**Quyền lợi:**
- Làm việc với sản phẩm có impact lớn
- Career growth opportunities
- Annual bonus và stock options
        """,
        "requirements": """
- 2+ năm kinh nghiệm QA Automation
- Thành thạo Selenium/Playwright
- API testing với Postman/RestAssured
- Performance testing với JMeter/k6
- Programming skills (Python/Java)
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 25000000,
        "salary_max": 45000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "QA",
        "skills": ["Selenium", "Python", "API Testing", "Performance Testing", "CI/CD"]
    },

    # Techcombank Jobs
    {
        "company": "Techcombank",
        "title": "Full-stack Developer",
        "description": """
Phát triển các ứng dụng banking cho Techcombank trong hành trình chuyển đổi số.

**Mô tả công việc:**
- Phát triển web applications với React và Node.js
- Tích hợp core banking systems
- Implement security best practices
- Agile development và DevOps

**Quyền lợi:**
- Lương thưởng hấp dẫn ngành ngân hàng
- Bảo hiểm sức khỏe premium
- Đào tạo chuyên môn liên tục
        """,
        "requirements": """
- 3+ năm kinh nghiệm full-stack
- React, Node.js/Java
- RESTful APIs, GraphQL
- Kiến thức security trong fintech
- Hiểu biết về banking domain là lợi thế
        """,
        "location": "Hà Nội",
        "salary_min": 35000000,
        "salary_max": 55000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Full-stack",
        "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "GraphQL"]
    },
    {
        "company": "Techcombank",
        "title": "Security Engineer",
        "description": """
Bảo vệ hệ thống và dữ liệu khách hàng tại ngân hàng số hàng đầu.

**Mô tả công việc:**
- Security assessment và penetration testing
- Implement security controls
- Incident response và forensics
- Security awareness training

**Quyền lợi:**
- Làm việc với critical systems
- Chứng chỉ security sponsored
- Competitive compensation
        """,
        "requirements": """
- 3+ năm kinh nghiệm InfoSec
- Chứng chỉ CISSP, CEH, hoặc OSCP
- Kinh nghiệm penetration testing
- Knowledge của OWASP, NIST
- Scripting skills (Python, Bash)
        """,
        "location": "Hà Nội",
        "salary_min": 40000000,
        "salary_max": 70000000,
        "job_type": "FULL_TIME",
        "experience_level": "SENIOR",
        "category": "Security",
        "skills": ["Penetration Testing", "Security", "Python", "Network Security", "OWASP"]
    },

    # Grab Jobs
    {
        "company": "Grab Vietnam",
        "title": "Backend Engineer - Payments",
        "description": """
Phát triển hệ thống thanh toán cho Grab - super app hàng đầu SEA.

**Mô tả công việc:**
- Thiết kế payment microservices
- High-availability và fault-tolerant systems
- Integration với banks và payment partners
- Performance optimization

**Quyền lợi:**
- Compensation top market + equity
- Flexible working arrangements
- International exposure
        """,
        "requirements": """
- 4+ năm backend experience
- Go, Java hoặc Python
- Payment systems experience
- Distributed systems knowledge
- Strong problem-solving
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 45000000,
        "salary_max": 75000000,
        "job_type": "FULL_TIME",
        "experience_level": "SENIOR",
        "category": "Backend",
        "skills": ["Go", "Java", "Microservices", "Kafka", "PostgreSQL", "Redis"]
    },
    {
        "company": "Grab Vietnam",
        "title": "iOS Developer",
        "description": """
Phát triển ứng dụng Grab cho hàng triệu users iOS.

**Mô tả công việc:**
- Native iOS development với Swift
- Implement new features cho Grab app
- Performance và UX optimization
- Collaboration với cross-functional teams

**Quyền lợi:**
- Work on a super app
- Latest Apple technologies
- Global team collaboration
        """,
        "requirements": """
- 3+ năm iOS development
- Swift, UIKit, SwiftUI
- Core Location, Maps integration
- Experience với large-scale apps
- Clean architecture knowledge
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 35000000,
        "salary_max": 60000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Mobile",
        "skills": ["Swift", "iOS", "UIKit", "SwiftUI", "Core Location", "MapKit"]
    },
    {
        "company": "Grab Vietnam",
        "title": "Product Manager - Driver Experience",
        "description": """
Định hình trải nghiệm cho hàng triệu tài xế Grab.

**Mô tả công việc:**
- Define product roadmap và strategy
- User research và data analysis
- Work với engineering teams
- Stakeholder management

**Quyền lợi:**
- High-impact role
- Data-driven environment
- Career growth opportunities
        """,
        "requirements": """
- 3+ năm PM experience
- Technical background preferred
- Strong analytical skills
- Excellent communication
- Experience với mobile products
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 40000000,
        "salary_max": 70000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Product",
        "skills": ["Product Management", "Data Analysis", "Agile", "User Research", "SQL"]
    },

    # Junior/Fresher positions
    {
        "company": "FPT Software",
        "title": "Junior Frontend Developer",
        "description": """
Cơ hội cho fresher/junior tham gia các dự án web development.

**Mô tả công việc:**
- Hỗ trợ phát triển UI với React
- Học hỏi từ senior developers
- Tham gia training programs
- Bug fixing và maintenance

**Quyền lợi:**
- Đào tạo bài bản
- Mentor 1-1
- Fast track career growth
        """,
        "requirements": """
- 0-1 năm kinh nghiệm
- Kiến thức HTML, CSS, JavaScript
- Biết React là lợi thế
- Có projects/portfolio
- Ham học hỏi
        """,
        "location": "Hà Nội",
        "salary_min": 12000000,
        "salary_max": 18000000,
        "job_type": "FULL_TIME",
        "experience_level": "JUNIOR",
        "category": "Frontend",
        "skills": ["HTML", "CSS", "JavaScript", "React", "Git"]
    },
    {
        "company": "VNG Corporation",
        "title": "Fresher Backend Developer",
        "description": """
Chương trình đào tạo Backend Developer cho sinh viên mới ra trường.

**Mô tả công việc:**
- Tham gia training program 3 tháng
- Phát triển features đơn giản
- Code review và pair programming
- Làm việc với mentors

**Quyền lợi:**
- Lương competitive cho fresher
- Structured learning path
- Exposure to large-scale systems
        """,
        "requirements": """
- Sinh viên năm cuối hoặc mới tốt nghiệp
- Kiến thức OOP, Data Structures
- Biết Java hoặc Python
- English reading
- Passion for learning
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 10000000,
        "salary_max": 15000000,
        "job_type": "FULL_TIME",
        "experience_level": "ENTRY",
        "category": "Backend",
        "skills": ["Java", "Python", "OOP", "SQL", "Git"]
    },
    {
        "company": "Shopee Vietnam",
        "title": "Intern - Data Analyst",
        "description": """
Internship program cho sinh viên quan tâm đến Data Analytics.

**Mô tả công việc:**
- Hỗ trợ data analysis tasks
- Learn SQL và Python
- Create dashboards và reports
- Support business teams

**Quyền lợi:**
- Hands-on experience
- Mentor từ senior analysts
- Possible full-time conversion
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 6000000,
        "salary_max": 10000000,
        "job_type": "INTERNSHIP",
        "experience_level": "ENTRY",
        "category": "Data",
        "skills": ["SQL", "Excel", "Python", "Statistics"]
    },
    
    # Additional Jobs for more data
    {
        "company": "FPT Software",
        "title": "Python Developer",
        "description": """
Phát triển các ứng dụng Python cho dự án AI/ML và automation.

**Mô tả công việc:**
- Phát triển backend services với Python/Django/FastAPI
- Xây dựng data pipelines và automation scripts
- Tích hợp với các ML models
- API development và documentation

**Quyền lợi:**
- Lương cạnh tranh
- Làm việc với công nghệ mới
- Remote working options
        """,
        "requirements": """
- 2+ năm kinh nghiệm Python
- Django hoặc FastAPI
- SQL và NoSQL databases
- RESTful API design
- Git version control
        """,
        "location": "Hà Nội",
        "salary_min": 20000000,
        "salary_max": 35000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Backend",
        "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "Redis"]
    },
    {
        "company": "FPT Software",
        "title": ".NET Developer",
        "description": """
Tham gia team .NET development cho các dự án enterprise.

**Mô tả công việc:**
- Phát triển ứng dụng với .NET Core/6
- Entity Framework và SQL Server
- Azure cloud services
- Unit testing và code quality

**Quyền lợi:**
- Dự án dài hạn ổn định
- Certification support
- Career development path
        """,
        "requirements": """
- 3+ năm .NET development
- C#, ASP.NET Core
- Entity Framework
- SQL Server
- Azure experience là plus
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 25000000,
        "salary_max": 45000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Backend",
        "skills": [".NET", "C#", "SQL Server", "Azure", "Entity Framework"]
    },
    {
        "company": "VNG Corporation",
        "title": "Senior Frontend Developer",
        "description": """
Lead frontend development cho các sản phẩm của VNG.

**Mô tả công việc:**
- Architect frontend solutions
- Code review và mentoring
- Performance optimization
- Technical decision making

**Quyền lợi:**
- Leadership role
- Stock options
- Flexible working
        """,
        "requirements": """
- 5+ năm frontend experience
- React/Vue mastery
- System design skills
- Team leadership experience
- Strong communication
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 45000000,
        "salary_max": 70000000,
        "job_type": "FULL_TIME",
        "experience_level": "SENIOR",
        "category": "Frontend",
        "skills": ["React", "Vue.js", "TypeScript", "Webpack", "Node.js"]
    },
    {
        "company": "VNG Corporation",
        "title": "Site Reliability Engineer",
        "description": """
Đảm bảo độ tin cậy cho hệ thống Zalo và ZaloPay.

**Mô tả công việc:**
- Monitoring và alerting systems
- Incident response
- Capacity planning
- Automation và tooling

**Quyền lợi:**
- Work on critical systems
- On-call compensation
- Learning opportunities
        """,
        "requirements": """
- 3+ năm SRE/DevOps
- Linux administration
- Kubernetes và Docker
- Prometheus, Grafana
- Scripting skills
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 35000000,
        "salary_max": 60000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "DevOps",
        "skills": ["Kubernetes", "Docker", "Prometheus", "Linux", "Python"]
    },
    {
        "company": "Shopee Vietnam",
        "title": "Android Developer",
        "description": """
Phát triển ứng dụng Shopee cho hàng triệu users Android.

**Mô tả công việc:**
- Native Android development
- Kotlin và Jetpack Compose
- Performance optimization
- A/B testing implementation

**Quyền lợi:**
- Work on top app
- Latest Android tech
- RSU và bonus
        """,
        "requirements": """
- 3+ năm Android
- Kotlin proficiency
- MVVM/Clean Architecture
- Jetpack libraries
- Large app experience
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 30000000,
        "salary_max": 55000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Mobile",
        "skills": ["Android", "Kotlin", "Jetpack Compose", "MVVM", "Retrofit"]
    },
    {
        "company": "Shopee Vietnam",
        "title": "Machine Learning Engineer",
        "description": """
Xây dựng ML systems cho recommendation và search.

**Mô tả công việc:**
- Develop ML models for search ranking
- Recommendation systems
- Model deployment và monitoring
- Feature engineering

**Quyền lợi:**
- Big data environment
- GPU clusters
- Research opportunities
        """,
        "requirements": """
- 3+ năm ML engineering
- Python, TensorFlow/PyTorch
- ML systems in production
- Big data tools (Spark)
- Strong math background
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 40000000,
        "salary_max": 70000000,
        "job_type": "FULL_TIME",
        "experience_level": "SENIOR",
        "category": "AI/ML",
        "skills": ["Python", "TensorFlow", "Spark", "Machine Learning", "Deep Learning"]
    },
    {
        "company": "Techcombank",
        "title": "Cloud Architect",
        "description": """
Thiết kế cloud infrastructure cho digital banking.

**Mô tả công việc:**
- Cloud architecture design
- Migration planning
- Security và compliance
- Cost optimization

**Quyền lợi:**
- Strategic role
- Cloud certifications
- Competitive package
        """,
        "requirements": """
- 5+ năm cloud experience
- AWS/Azure certified
- Security best practices
- Financial industry experience
- Architecture patterns
        """,
        "location": "Hà Nội",
        "salary_min": 50000000,
        "salary_max": 90000000,
        "job_type": "FULL_TIME",
        "experience_level": "LEAD",
        "category": "DevOps",
        "skills": ["AWS", "Azure", "Terraform", "Security", "Architecture"]
    },
    {
        "company": "Techcombank",
        "title": "Business Analyst",
        "description": """
Phân tích nghiệp vụ cho các dự án digital banking.

**Mô tả công việc:**
- Requirement gathering
- Process analysis
- Documentation
- Stakeholder communication

**Quyền lợi:**
- Domain knowledge
- Career growth
- Banking benefits
        """,
        "requirements": """
- 2+ năm BA experience
- Banking knowledge preferred
- SQL skills
- Communication skills
- Agile methodology
        """,
        "location": "Hà Nội",
        "salary_min": 25000000,
        "salary_max": 40000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Product",
        "skills": ["Business Analysis", "SQL", "Agile", "Documentation", "Communication"]
    },
    {
        "company": "Grab Vietnam",
        "title": "Data Scientist",
        "description": """
Phân tích dữ liệu và xây dựng models cho Grab.

**Mô tả công việc:**
- Statistical analysis
- Predictive modeling
- A/B test design
- Business insights

**Quyền lợi:**
- Real-world impact
- Data-driven culture
- Equity package
        """,
        "requirements": """
- 3+ năm data science
- Python, R statistics
- ML algorithms
- SQL proficiency
- Communication skills
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 40000000,
        "salary_max": 65000000,
        "job_type": "FULL_TIME",
        "experience_level": "MID",
        "category": "Data",
        "skills": ["Python", "SQL", "Machine Learning", "Statistics", "A/B Testing"]
    },
    {
        "company": "Grab Vietnam",
        "title": "Technical Program Manager",
        "description": """
Quản lý các technical programs lớn tại Grab.

**Mô tả công việc:**
- Program planning và execution
- Cross-team coordination
- Risk management
- Stakeholder reporting

**Quyền lợi:**
- Leadership exposure
- Global team collaboration
- Competitive compensation
        """,
        "requirements": """
- 5+ năm TPM experience
- Technical background
- Project management skills
- Excellent communication
- Problem-solving ability
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 50000000,
        "salary_max": 80000000,
        "job_type": "FULL_TIME",
        "experience_level": "SENIOR",
        "category": "Product",
        "skills": ["Program Management", "Agile", "Technical Leadership", "Communication"]
    },
    # Remote/Contract Jobs
    {
        "company": "FPT Software",
        "title": "Freelance UI/UX Designer",
        "description": """
Thiết kế UI/UX cho các dự án web và mobile.

**Mô tả công việc:**
- User research và wireframing
- UI design với Figma
- Prototyping
- Design system development

**Quyền lợi:**
- Flexible schedule
- Remote work
- Project-based payment
        """,
        "requirements": """
- 2+ năm UI/UX
- Figma proficiency
- Portfolio required
- Communication skills
- Self-management
        """,
        "location": "Remote",
        "salary_min": 20000000,
        "salary_max": 40000000,
        "job_type": "FREELANCE",
        "experience_level": "MID",
        "category": "Design",
        "skills": ["Figma", "UI Design", "UX Design", "Prototyping", "Adobe XD"]
    },
    {
        "company": "VNG Corporation",
        "title": "Contract Technical Writer",
        "description": """
Viết tài liệu kỹ thuật cho các sản phẩm VNG.

**Mô tả công việc:**
- API documentation
- User guides
- Technical blogs
- Knowledge base articles

**Quyền lợi:**
- Remote friendly
- Flexible hours
- Learning tech domain
        """,
        "requirements": """
- Technical writing experience
- English proficiency
- Basic programming knowledge
- Documentation tools
- Attention to detail
        """,
        "location": "Remote",
        "salary_min": 15000000,
        "salary_max": 25000000,
        "job_type": "CONTRACT",
        "experience_level": "JUNIOR",
        "category": "Content",
        "skills": ["Technical Writing", "English", "Documentation", "Markdown", "API"]
    },
    {
        "company": "Shopee Vietnam",
        "title": "Part-time Customer Support",
        "description": """
Hỗ trợ khách hàng Shopee qua chat và email.

**Mô tả công việc:**
- Respond to customer queries
- Issue resolution
- Feedback collection
- Report generation

**Quyền lợi:**
- Flexible shifts
- Work from home
- Training provided
        """,
        "requirements": """
- Communication skills
- Problem-solving
- Basic computer skills
- Available 20+ hours/week
- Patient và helpful
        """,
        "location": "Hồ Chí Minh",
        "salary_min": 8000000,
        "salary_max": 12000000,
        "job_type": "PART_TIME",
        "experience_level": "ENTRY",
        "category": "Customer Service",
        "skills": ["Communication", "Customer Service", "Problem Solving"]
    },
]

def connect_db():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Connected to database")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)

def get_or_create_employer(cursor, conn, company_data):
    """Get or create employer user and company"""
    # Check if company exists
    cursor.execute("SELECT id, owner_id FROM companies WHERE name = %s", (company_data['name'],))
    result = cursor.fetchone()

    if result:
        company_id, owner_id = result[0], result[1]
        # Update logo if provided
        if company_data.get('logo'):
            cursor.execute(
                "UPDATE companies SET logo_url = %s, updated_at = %s WHERE id = %s",
                (company_data['logo'], datetime.now(), company_id)
            )
            conn.commit()
            print(f"  📌 Company exists, logo updated: {company_data['name']}")
        else:
            print(f"  📌 Company exists: {company_data['name']}")
        return company_id, owner_id

    # Create employer user (full_name is in user_profiles table, not users)
    email = f"hr@{company_data['name'].lower().replace(' ', '').replace('.', '')[:20]}.com"
    cursor.execute("""
        INSERT INTO users (email, password_hash, role, status, email_verified, created_at, updated_at)
        VALUES (%s, '$2a$10$dummyhash', 'EMPLOYER', 'ACTIVE', true, %s, %s)
        ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
        RETURNING id
    """, (email, datetime.now(), datetime.now()))

    owner_id = cursor.fetchone()[0]

    # Create user_profile with full_name
    cursor.execute("""
        INSERT INTO user_profiles (user_id, full_name, updated_at)
        VALUES (%s, %s, %s)
        ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name
    """, (owner_id, f"HR {company_data['name']}", datetime.now()))

    # Create company
    slug = company_data['name'].lower().replace(' ', '-').replace('.', '')[:50]
    cursor.execute("""
        INSERT INTO companies (owner_id, name, slug, logo_url, description, industry, company_size, website, verification_status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'VERIFIED', %s, %s)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    """, (
        owner_id,
        company_data['name'],
        slug,
        company_data.get('logo'),
        company_data['description'],
        company_data['industry'],
        company_data['size'],
        company_data.get('website'),
        datetime.now(),
        datetime.now()
    ))

    company_id = cursor.fetchone()[0]
    conn.commit()
    print(f"  ✅ Created company: {company_data['name']}")
    return company_id, owner_id

def get_or_create_category(cursor, conn, category_name):
    """Get or create category"""
    cursor.execute("SELECT id FROM categories WHERE name = %s", (category_name,))
    result = cursor.fetchone()

    if result:
        return result[0]

    slug = category_name.lower().replace(' ', '-').replace('/', '-')
    cursor.execute("""
        INSERT INTO categories (name, slug, description)
        VALUES (%s, %s, %s)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
    """, (category_name, slug, f"Việc làm {category_name}"))

    result = cursor.fetchone()
    if result:
        category_id = result[0]
    else:
        # If conflict, get existing
        cursor.execute("SELECT id FROM categories WHERE slug = %s", (slug,))
        category_id = cursor.fetchone()[0]

    conn.commit()
    return category_id

def get_or_create_skill(cursor, conn, skill_name):
    """Get or create skill"""
    cursor.execute("SELECT id FROM skills WHERE name = %s", (skill_name,))
    result = cursor.fetchone()

    if result:
        return result[0]

    slug = skill_name.lower().replace(' ', '-').replace('/', '-').replace('#', 'sharp').replace('+', 'plus')
    cursor.execute("""
        INSERT INTO skills (name, slug)
        VALUES (%s, %s)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
    """, (skill_name, slug))

    result = cursor.fetchone()
    if result:
        skill_id = result[0]
    else:
        # If conflict, get existing
        cursor.execute("SELECT id FROM skills WHERE slug = %s", (slug,))
        skill_id = cursor.fetchone()[0]

    conn.commit()
    return skill_id

def seed_jobs(conn, cursor):
    """Seed all jobs"""
    print("\n🚀 Starting job seeding...")

    # Build company map
    company_map = {}
    for company_data in COMPANIES:
        company_id, owner_id = get_or_create_employer(cursor, conn, company_data)
        company_map[company_data['name']] = {'id': company_id, 'owner_id': owner_id}

    print(f"\n📊 Companies ready: {len(company_map)}")

    # Seed jobs
    jobs_created = 0
    for job_data in JOBS_DATA:
        company_name = job_data['company']
        if company_name not in company_map:
            print(f"  ⚠️ Company not found: {company_name}")
            continue

        company_id = company_map[company_name]['id']
        owner_id = company_map[company_name]['owner_id']

        # Get or create category
        category_id = get_or_create_category(cursor, conn, job_data['category'])

        # Generate unique slug
        timestamp = datetime.now().timestamp()
        slug = f"{job_data['title']}-{company_name}-{timestamp}".lower()
        slug = slug.replace(' ', '-').replace('/', '-')[:200]

        # Random deadline 30-60 days from now
        deadline = datetime.now() + timedelta(days=random.randint(30, 60))

        try:
            cursor.execute("""
                INSERT INTO jobs (
                    title, slug, description, requirements, location,
                    salary_min, salary_max, job_type, experience_level,
                    deadline, status, company_id, category_id, posted_by,
                    is_featured, is_urgent, view_count, application_count,
                    created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                job_data['title'],
                slug,
                job_data['description'],
                job_data.get('requirements', ''),
                job_data['location'],
                job_data['salary_min'],
                job_data['salary_max'],
                job_data['job_type'],
                job_data['experience_level'],
                deadline.strftime('%Y-%m-%d'),
                'ACTIVE',  # Changed from APPROVED to ACTIVE
                company_id,
                category_id,
                owner_id,
                random.choice([True, False]),  # is_featured
                random.choice([True, False, False]),  # is_urgent (less likely)
                random.randint(50, 500),  # view_count
                random.randint(5, 30),  # application_count
                datetime.now(),
                datetime.now()
            ))

            job_id = cursor.fetchone()[0]

            # Add skills
            for skill_name in job_data.get('skills', []):
                skill_id = get_or_create_skill(cursor, conn, skill_name)
                cursor.execute("""
                    INSERT INTO job_skills (job_id, skill_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (job_id, skill_id))

            conn.commit()
            jobs_created += 1
            print(f"  ✅ Created: {job_data['title']}")

        except Exception as e:
            print(f"  ❌ Error creating job '{job_data['title']}': {e}")
            conn.rollback()

    print(f"\n🎉 Total jobs created: {jobs_created}")

def main():
    print("=" * 60)
    print("🌱 JobVerse - Employer Jobs Seeder")
    print("=" * 60)
    print(f"\n📦 Database: {DB_CONFIG['database']}@{DB_CONFIG['host']}")

    conn = connect_db()
    cursor = conn.cursor()

    try:
        seed_jobs(conn, cursor)
        print("\n✅ Seeding completed successfully!")
    except Exception as e:
        print(f"\n❌ Seeding failed: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()
        print("🔌 Database connection closed")

if __name__ == '__main__':
    main()
