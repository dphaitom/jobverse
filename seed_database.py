#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JobVerse Database Seeder
Imports crawled job data into PostgreSQL database
"""

import sys
import io
# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import json
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import os

class DatabaseSeeder:
    def __init__(self, db_config):
        self.db_config = db_config
        self.conn = None
        self.cursor = None

    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            print("✅ Connected to database successfully")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            sys.exit(1)

    def close(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("🔌 Database connection closed")

    def load_json(self, filename='crawled_jobs.json'):
        """Load crawled data from JSON"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"✅ Loaded data from {filename}")
            return data
        except Exception as e:
            print(f"❌ Failed to load JSON: {e}")
            sys.exit(1)

    def seed_categories(self, categories):
        """Insert categories"""
        print("\n📂 Seeding categories...")

        try:
            # First, get existing categories
            self.cursor.execute("SELECT name FROM categories")
            existing = {row[0] for row in self.cursor.fetchall()}

            # Filter new categories
            new_categories = [cat for cat in categories if cat not in existing]

            if new_categories:
                for cat in new_categories:
                    try:
                        slug = cat.lower().replace(' ', '-').replace('/', '-')
                        self.cursor.execute(
                            "INSERT INTO categories (name, slug, description) VALUES (%s, %s, %s) ON CONFLICT (slug) DO NOTHING",
                            (cat, slug, f"Các công việc liên quan đến {cat}")
                        )
                    except Exception as e:
                        print(f"   ⚠️ Skipped category '{cat}': {e}")
                        continue

                self.conn.commit()
                print(f"   ✅ Processed {len(new_categories)} categories")
            else:
                print("   ⏭️ No new categories to insert")

            # Return category ID mapping
            self.cursor.execute("SELECT id, name FROM categories")
            return {name: id for id, name in self.cursor.fetchall()}

        except Exception as e:
            self.conn.rollback()
            print(f"   ❌ Error seeding categories: {e}")
            return {}

    def seed_skills(self, skills):
        """Insert skills"""
        print("\n🎯 Seeding skills...")

        try:
            # Get existing skills
            self.cursor.execute("SELECT name FROM skills")
            existing = {row[0] for row in self.cursor.fetchall()}

            # Filter new skills
            new_skills = [skill for skill in skills if skill not in existing]

            if new_skills:
                values = [(skill, skill.lower().replace(' ', '-')) for skill in new_skills]

                execute_values(
                    self.cursor,
                    "INSERT INTO skills (name, slug) VALUES %s",
                    values
                )
                self.conn.commit()
                print(f"   ✅ Inserted {len(new_skills)} new skills")
            else:
                print("   ⏭️ No new skills to insert")

            # Return skill ID mapping
            self.cursor.execute("SELECT id, name FROM skills")
            return {name: id for id, name in self.cursor.fetchall()}

        except Exception as e:
            self.conn.rollback()
            print(f"   ❌ Error seeding skills: {e}")
            return {}

    def seed_companies(self, companies):
        """Insert companies"""
        print("\n🏢 Seeding companies...")

        try:
            # Get or create a system user for company ownership
            self.cursor.execute("SELECT id FROM users WHERE email = 'system@jobverse.com' LIMIT 1")
            result = self.cursor.fetchone()

            if result:
                system_user_id = result[0]
            else:
                # Create system user
                self.cursor.execute("""
                    INSERT INTO users (email, password_hash, role, status, email_verified, created_at, updated_at)
                    VALUES ('system@jobverse.com', '$2a$10$dummyhash', 'ADMIN', 'ACTIVE', true, %s, %s)
                    RETURNING id
                """, (datetime.now(), datetime.now()))
                system_user_id = self.cursor.fetchone()[0]
                self.conn.commit()
                print(f"   📝 Created system user with ID: {system_user_id}")

            # Get existing companies
            self.cursor.execute("SELECT name FROM companies")
            existing = {row[0] for row in self.cursor.fetchall()}

            # Filter new companies
            new_companies = [comp for comp in companies if comp['name'] not in existing]

            if new_companies:
                # Map size to CompanySize enum
                size_mapping = {
                    '10-50': 'SMALL',
                    '50-200': 'MEDIUM',
                    '200-500': 'LARGE',
                    '500-1000': 'LARGE',
                    '1000+': 'ENTERPRISE'
                }

                inserted_count = 0
                for comp in new_companies:
                    try:
                        slug = comp['name'].lower().replace(' ', '-').replace('/', '-').replace('.', '')[:100]
                        # Add unique suffix if needed
                        slug = f"{slug}-{hash(comp['name']) % 10000}"

                        self.cursor.execute("""
                            INSERT INTO companies
                            (owner_id, name, slug, logo_url, description, industry, company_size, website, verification_status, created_at, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (slug) DO NOTHING
                        """, (
                            system_user_id,
                            comp['name'],
                            slug,
                            comp.get('logo'),
                            comp.get('description', ''),
                            comp.get('industry', 'Information Technology'),
                            size_mapping.get(comp.get('size', 'MEDIUM'), 'MEDIUM'),
                            comp.get('website'),
                            'PENDING',
                            datetime.now(),
                            datetime.now()
                        ))
                        inserted_count += 1
                    except Exception as e:
                        print(f"   ⚠️ Skipped company '{comp['name']}': {e}")
                        continue

                self.conn.commit()
                print(f"   ✅ Processed {inserted_count} companies")
            else:
                print("   ⏭️ No new companies to insert")

            # Return company ID mapping
            self.cursor.execute("SELECT id, name FROM companies")
            return {name: id for id, name in self.cursor.fetchall()}

        except Exception as e:
            self.conn.rollback()
            print(f"   ❌ Error seeding companies: {e}")
            return {}

    def seed_jobs(self, jobs, category_map, company_map, skill_map, system_user_id):
        """Insert jobs"""
        print("\n💼 Seeding jobs...")

        try:
            inserted_count = 0

            for job in jobs:
                try:
                    # Get company_id
                    company_id = company_map.get(job['company'])
                    if not company_id:
                        continue

                    # Get category_id
                    category_id = category_map.get(job['category'], 1)

                    # Generate slug
                    slug = f"{job['title']}-{job['company']}-{datetime.now().timestamp()}".lower()
                    slug = slug.replace(' ', '-').replace('/', '-')

                    # Map employment_type to job_type
                    job_type_mapping = {
                        'FULL_TIME': 'FULL_TIME',
                        'PART_TIME': 'PART_TIME',
                        'CONTRACT': 'CONTRACT',
                        'TEMPORARY': 'TEMPORARY',
                        'INTERNSHIP': 'INTERNSHIP'
                    }
                    job_type = job_type_mapping.get(job.get('employment_type', 'FULL_TIME'), 'FULL_TIME')

                    # Insert job
                    self.cursor.execute(
                        """
                        INSERT INTO jobs
                        (title, slug, description, requirements, location,
                         salary_min, salary_max, job_type, experience_level,
                         deadline, status, company_id, category_id, posted_by, is_featured, is_urgent,
                         view_count, application_count, created_at, updated_at)
                        VALUES
                        (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                        """,
                        (
                            job['title'],
                            slug,
                            job.get('description', ''),
                            job.get('requirements', ''),
                            job.get('location', 'Hồ Chí Minh'),
                            job.get('salary_min', 15000000),
                            job.get('salary_max', 30000000),
                            job_type,
                            job.get('experience_level', 'MID'),
                            job.get('deadline', (datetime.now()).strftime('%Y-%m-%d')),
                            'APPROVED',  # Auto-approve crawled jobs
                            company_id,
                            category_id,
                            system_user_id,  # posted_by
                            False,  # is_featured
                            False,  # is_urgent
                            0,  # view_count
                            0,  # application_count
                            datetime.now(),
                            datetime.now()
                        )
                    )

                    job_id = self.cursor.fetchone()[0]

                    # Insert job skills
                    job_skills = job.get('skills', [])
                    for skill_name in job_skills:
                        skill_id = skill_map.get(skill_name)
                        if skill_id:
                            self.cursor.execute(
                                "INSERT INTO job_skills (job_id, skill_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                                (job_id, skill_id)
                            )

                    inserted_count += 1

                    if inserted_count % 50 == 0:
                        self.conn.commit()
                        print(f"   📝 Inserted {inserted_count} jobs...")

                except Exception as e:
                    print(f"   ⚠️ Skipped job '{job.get('title', 'unknown')}': {e}")
                    continue

            self.conn.commit()
            print(f"   ✅ Total inserted: {inserted_count} jobs")

        except Exception as e:
            self.conn.rollback()
            print(f"   ❌ Error seeding jobs: {e}")

    def run(self, json_file='crawled_jobs.json'):
        """Run the seeder"""
        print("🌱 Starting Database Seeder...")
        print("=" * 60)

        # Load data
        data = self.load_json(json_file)

        # Connect to database
        self.connect()

        try:
            # Get system user for posting jobs
            self.cursor.execute("SELECT id FROM users WHERE email = 'system@jobverse.com' LIMIT 1")
            system_user_id = self.cursor.fetchone()[0]

            # Seed in order (foreign key dependencies)
            category_map = self.seed_categories(data.get('categories', []))
            skill_map = self.seed_skills(data.get('skills', []))
            company_map = self.seed_companies(data.get('companies', []))
            self.seed_jobs(data.get('jobs', []), category_map, company_map, skill_map, system_user_id)

            print("\n✅ Database seeding completed successfully!")
            print(f"📊 Summary:")
            print(f"   - Categories: {len(category_map)}")
            print(f"   - Skills: {len(skill_map)}")
            print(f"   - Companies: {len(company_map)}")

        except Exception as e:
            print(f"\n❌ Seeding failed: {e}")
        finally:
            self.close()

if __name__ == '__main__':
    # Database configuration
    DB_CONFIG = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'database': os.getenv('DB_NAME', 'jobverse'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'postgres')
    }

    print("🔧 Database Configuration:")
    print(f"   Host: {DB_CONFIG['host']}")
    print(f"   Port: {DB_CONFIG['port']}")
    print(f"   Database: {DB_CONFIG['database']}")
    print(f"   User: {DB_CONFIG['user']}")
    print()

    seeder = DatabaseSeeder(DB_CONFIG)
    seeder.run('crawled_jobs.json')
