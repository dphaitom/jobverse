#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JobVerse Database Seeder
Seed the PostgreSQL database with realistic job data
"""

import psycopg2
from psycopg2.extras import execute_values
import json
import sys
import io
from datetime import datetime, timedelta
import random
from typing import List, Dict

# Fix Windows encoding for emojis
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

class DatabaseSeeder:
    def __init__(self, db_config):
        """Initialize database connection"""
        self.conn = psycopg2.connect(**db_config)
        self.cur = self.conn.cursor()
        print("✅ Connected to database")

    def __del__(self):
        """Close database connection"""
        if hasattr(self, 'cur'):
            self.cur.close()
        if hasattr(self, 'conn'):
            self.conn.close()

    def seed_categories(self) -> Dict[str, int]:
        """Seed job categories and return mapping"""
        categories = [
            ("Frontend Development", "frontend", "Build beautiful user interfaces"),
            ("Backend Development", "backend", "Server-side application development"),
            ("Full-Stack Development", "fullstack", "End-to-end web development"),
            ("Mobile Development", "mobile", "iOS and Android applications"),
            ("DevOps & Cloud", "devops", "Infrastructure and deployment"),
            ("Data Engineering", "data", "Data pipelines and analytics"),
            ("AI & Machine Learning", "ai-ml", "Artificial intelligence and ML"),
            ("QA & Testing", "qa", "Quality assurance and testing"),
            ("UI/UX Design", "design", "User interface and experience design"),
            ("Product Management", "product", "Product strategy and management"),
            ("Security", "security", "Cybersecurity and information security"),
            ("Blockchain", "blockchain", "Blockchain and Web3 development"),
        ]

        print("\n📁 Seeding categories...")

        category_map = {}
        for name, slug, description in categories:
            try:
                self.cur.execute("""
                    INSERT INTO categories (name, slug, description)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
                    RETURNING id
                """, (name, slug, description))

                category_id = self.cur.fetchone()[0]
                category_map[name] = category_id
                print(f"  ✅ {name} (ID: {category_id})")
            except Exception as e:
                print(f"  ❌ Error seeding category {name}: {e}")

        self.conn.commit()
        return category_map

    def seed_skills(self) -> Dict[str, int]:
        """Seed skills and return mapping"""
        skills_data = {
            "React": "JavaScript library for building UIs",
            "Vue.js": "Progressive JavaScript framework",
            "Angular": "TypeScript-based web framework",
            "JavaScript": "Programming language for web",
            "TypeScript": "Typed superset of JavaScript",
            "HTML/CSS": "Web markup and styling",
            "Tailwind CSS": "Utility-first CSS framework",
            "Redux": "State management library",
            "Next.js": "React framework for production",
            "Vite": "Next generation frontend tooling",
            "Java": "Object-oriented programming language",
            "Spring Boot": "Java framework for web apps",
            "Node.js": "JavaScript runtime for server-side",
            "Python": "High-level programming language",
            "Django": "Python web framework",
            "Flask": "Lightweight Python web framework",
            "PostgreSQL": "Open source relational database",
            "MongoDB": "NoSQL document database",
            "Redis": "In-memory data structure store",
            "Docker": "Containerization platform",
            "Kubernetes": "Container orchestration",
            "AWS": "Amazon Web Services cloud platform",
            "Azure": "Microsoft cloud platform",
            "GCP": "Google Cloud Platform",
            "Terraform": "Infrastructure as code",
            "Jenkins": "Automation server for CI/CD",
            "Git": "Version control system",
            "React Native": "Framework for mobile apps",
            "Flutter": "UI toolkit for mobile apps",
            "Swift": "Programming language for iOS",
            "Kotlin": "Programming language for Android",
            "TensorFlow": "Machine learning framework",
            "PyTorch": "Deep learning framework",
            "Scikit-learn": "Machine learning library",
            "Pandas": "Data manipulation library",
            "NumPy": "Numerical computing library",
            "SQL": "Structured Query Language",
            "GraphQL": "Query language for APIs",
            "REST API": "Representational State Transfer",
            "Microservices": "Architectural style",
            "Kafka": "Distributed streaming platform",
            "Elasticsearch": "Search and analytics engine",
            "Spark": "Unified analytics engine",
            "Airflow": "Workflow automation platform",
            "Solidity": "Smart contract language",
            "Web3.js": "Ethereum JavaScript API",
            "Go": "Programming language by Google",
            "Rust": "Systems programming language",
            "C++": "General-purpose programming language",
        }

        print("\n🔧 Seeding skills...")

        skill_map = {}
        for name in skills_data.keys():
            try:
                # Generate slug from name
                slug = name.lower().replace(' ', '-').replace('/', '-').replace('.', '')
                self.cur.execute("""
                    INSERT INTO skills (name, slug)
                    VALUES (%s, %s)
                    ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug
                    RETURNING id
                """, (name, slug))

                skill_id = self.cur.fetchone()[0]
                skill_map[name] = skill_id
                if len(skill_map) % 10 == 0:
                    print(f"  ✅ Seeded {len(skill_map)} skills...")
            except Exception as e:
                print(f"  ❌ Error seeding skill {name}: {e}")

        self.conn.commit()
        print(f"  ✅ Total skills seeded: {len(skill_map)}")
        return skill_map

    def seed_companies(self, count=20) -> List[int]:
        """Seed companies and return their IDs"""
        companies_data = [
            ("VNG Corporation", "vng-corporation", "Leading Vietnamese technology company", "Ho Chi Minh City", "https://www.vng.com.vn", "5000-10000"),
            ("FPT Software", "fpt-software", "Global IT services provider", "Hanoi", "https://www.fpt-software.com", "10000+"),
            ("Viettel", "viettel", "Telecommunications and IT services", "Hanoi", "https://viettel.com.vn", "10000+"),
            ("MOMO", "momo", "Leading mobile payment platform", "Ho Chi Minh City", "https://www.momo.vn", "1000-5000"),
            ("Tiki", "tiki", "E-commerce platform", "Ho Chi Minh City", "https://tiki.vn", "1000-5000"),
            ("Shopee Vietnam", "shopee-vietnam", "E-commerce and tech platform", "Ho Chi Minh City", "https://shopee.vn", "1000-5000"),
            ("Grab Vietnam", "grab-vietnam", "Super app for transportation and more", "Ho Chi Minh City", "https://www.grab.com", "1000-5000"),
            ("ZaloPay", "zalopay", "Digital wallet and payment", "Ho Chi Minh City", "https://zalopay.vn", "500-1000"),
            ("VinID", "vinid", "Digital identity and rewards", "Ho Chi Minh City", "https://vinid.net", "500-1000"),
            ("Be Group", "be-group", "Multi-service technology platform", "Ho Chi Minh City", "https://be.com.vn", "1000-5000"),
            ("Sendo", "sendo", "E-commerce marketplace", "Ho Chi Minh City", "https://www.sendo.vn", "500-1000"),
            ("Topica", "topica", "EdTech and online education", "Hanoi", "https://topica.edu.vn", "500-1000"),
            ("VnTrip", "vntrip", "Travel booking platform", "Ho Chi Minh City", "https://www.vntrip.vn", "200-500"),
            ("Teko", "teko", "Retail technology solutions", "Ho Chi Minh City", "https://teko.vn", "500-1000"),
            ("Got It", "got-it", "AI and education technology", "Ho Chi Minh City", "https://www.got-it.ai", "100-200"),
            ("NashTech", "nashtech", "Global software services", "Ho Chi Minh City", "https://www.nashtechglobal.com", "1000-5000"),
            ("KMS Technology", "kms-technology", "Software development services", "Ho Chi Minh City", "https://www.kms-technology.com", "1000-5000"),
            ("TMA Solutions", "tma-solutions", "IT services and outsourcing", "Ho Chi Minh City", "https://www.tma.vn", "5000-10000"),
            ("Harvey Nash Vietnam", "harvey-nash", "Technology recruitment and outsourcing", "Ho Chi Minh City", "https://www.harveynash.com", "100-200"),
            ("Orient Software", "orient-software", "Software development company", "Da Nang", "https://www.orientsoftware.com", "200-500"),
        ]

        print("\n🏢 Seeding companies...")

        # First, create a default admin user for company ownership
        print("  Creating default admin user for companies...")
        try:
            self.cur.execute("""
                INSERT INTO users (email, role, status, email_verified)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
                RETURNING id
            """, ('admin@jobverse.com', 'ADMIN', 'ACTIVE', True))
            admin_id = self.cur.fetchone()[0]
            self.conn.commit()
            print(f"  ✅ Admin user created (ID: {admin_id})")
        except Exception as e:
            print(f"  ❌ Error creating admin user: {e}")
            # Try to get existing admin
            self.cur.execute("SELECT id FROM users WHERE email = %s", ('admin@jobverse.com',))
            result = self.cur.fetchone()
            admin_id = result[0] if result else None
            if not admin_id:
                print("  ❌ Cannot proceed without admin user")
                return []

        # Map size ranges to enum values
        size_to_enum = {
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

        company_ids = []
        for name, slug, description, location, website, size in companies_data:
            try:
                # Extract numeric value from size (e.g., "1000-5000" -> 1000)
                employee_count = int(size.split('-')[0]) if '-' in size else 100

                # Convert size to enum value
                company_size_enum = size_to_enum.get(size, "MEDIUM_51_200")

                self.cur.execute("""
                    INSERT INTO companies (owner_id, name, slug, description, website, headquarters,
                                         employee_count, company_size, verification_status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
                    RETURNING id
                """, (admin_id, name, slug, description, website, location, employee_count, company_size_enum, 'VERIFIED'))

                company_id = self.cur.fetchone()[0]
                company_ids.append(company_id)
                print(f"  ✅ {name} (ID: {company_id})")
            except Exception as e:
                print(f"  ❌ Error seeding company {name}: {e}")

        self.conn.commit()
        return company_ids

    def seed_jobs_from_json(self, json_file: str, category_map: Dict, skill_map: Dict, company_ids: List[int]):
        """Seed jobs from JSON file"""
        print(f"\n💼 Loading jobs from {json_file}...")

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                jobs_data = json.load(f)
        except FileNotFoundError:
            print(f"❌ File not found: {json_file}")
            return
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON: {e}")
            return

        print(f"  Found {len(jobs_data)} jobs in file")
        print("\n📝 Seeding jobs...")

        # Get admin user ID for posted_by
        self.cur.execute("SELECT id FROM users WHERE email = %s", ('admin@jobverse.com',))
        result = self.cur.fetchone()
        admin_id = result[0] if result else None
        if not admin_id:
            print("  ❌ Cannot seed jobs: admin user not found")
            return

        # Valid enum mappings
        valid_experience_levels = {'ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR'}
        experience_level_map = {
            'INTERNSHIP': 'ENTRY',
            'INTERN': 'ENTRY',
            'FRESHER': 'ENTRY',
            'BEGINNER': 'ENTRY',
        }

        seeded_count = 0
        for idx, job in enumerate(jobs_data, 1):
            try:
                # Map category
                category_id = category_map.get(job.get('category', 'Full-Stack Development'))

                # Pick random company
                company_id = random.choice(company_ids)

                # Validate and map experience_level
                exp_level = job.get('experience_level', 'MID').upper()
                if exp_level not in valid_experience_levels:
                    exp_level = experience_level_map.get(exp_level, 'MID')

                # Create job
                self.cur.execute("""
                    INSERT INTO jobs (
                        company_id, posted_by, title, slug, description, requirements,
                        location, job_type, experience_level, salary_min, salary_max,
                        is_remote, is_urgent, category_id, status, view_count
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s
                    )
                    RETURNING id
                """, (
                    company_id,
                    admin_id,
                    job['title'],
                    self._slugify(job['title']),
                    job.get('description', 'No description provided'),
                    job.get('requirements', 'Requirements not specified'),
                    job.get('location', 'Ho Chi Minh City'),
                    job.get('job_type', 'FULL_TIME'),
                    exp_level,
                    job.get('salary_min', 15000000),
                    job.get('salary_max', 30000000),
                    job.get('is_remote', False),
                    job.get('is_urgent', False),
                    category_id,
                    'ACTIVE',
                    job.get('views', random.randint(10, 1000))
                ))

                job_id = self.cur.fetchone()[0]

                # Add skills
                job_skills = job.get('skills', [])
                for skill_name in job_skills:
                    skill_id = skill_map.get(skill_name)
                    if skill_id:
                        self.cur.execute("""
                            INSERT INTO job_skills (job_id, skill_id, is_required)
                            VALUES (%s, %s, %s)
                            ON CONFLICT DO NOTHING
                        """, (job_id, skill_id, random.choice([True, False])))

                seeded_count += 1
                if seeded_count % 10 == 0:
                    print(f"  ✅ Seeded {seeded_count}/{len(jobs_data)} jobs...")
                    self.conn.commit()

            except Exception as e:
                print(f"  ❌ Error seeding job {idx}: {e}")
                continue

        self.conn.commit()
        print(f"\n✅ Successfully seeded {seeded_count} jobs!")

    def _slugify(self, text: str) -> str:
        """Create URL-friendly slug"""
        import re
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[\s_-]+', '-', text)
        text = re.sub(r'^-+|-+$', '', text)
        return text[:100] + f"-{random.randint(1000, 9999)}"

    def verify_seeding(self):
        """Verify that data was seeded correctly"""
        print("\n🔍 Verifying seeded data...")

        tables = ['categories', 'skills', 'companies', 'jobs']
        for table in tables:
            self.cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = self.cur.fetchone()[0]
            print(f"  {table}: {count} records")


def main():
    """Main execution"""
    print("=" * 60)
    print("🌱 JobVerse Database Seeder")
    print("=" * 60)

    # Database configuration
    DB_CONFIG = {
        'host': 'localhost',
        'port': 5432,  # PostgreSQL 16 default port
        'database': 'jobverse',
        'user': 'postgres',
        'password': 'postgres'
    }

    try:
        seeder = DatabaseSeeder(DB_CONFIG)

        # Seed reference data
        category_map = seeder.seed_categories()
        skill_map = seeder.seed_skills()
        company_ids = seeder.seed_companies()

        # Seed jobs from crawler output
        # Look for the most recent jobs JSON file
        import glob
        import os

        json_files = glob.glob("jobs_data_*.json")
        if json_files:
            # Use the most recent file
            latest_file = max(json_files, key=os.path.getctime)
            print(f"\n📂 Found job data file: {latest_file}")
            seeder.seed_jobs_from_json(latest_file, category_map, skill_map, company_ids)
        else:
            print("\n⚠️  No job data files found. Run job_crawler.py first!")
            print("    python scripts/job_crawler.py")

        # Verify
        seeder.verify_seeding()

        print("\n" + "=" * 60)
        print("✅ Database seeding complete!")
        print("=" * 60)

    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        print("\n💡 Make sure:")
        print("  1. PostgreSQL is running")
        print("  2. Database 'jobverse' exists")
        print("  3. Credentials are correct")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
