#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JobVerse Job Crawler
Crawl job listings from Vietnamese IT job boards (ITviec, TopDev)
"""

import sys
import io

# Fix encoding for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import requests
from bs4 import BeautifulSoup
import json
import time
import random
from datetime import datetime
from typing import List, Dict
import re

class JobCrawler:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def crawl_itviec(self, max_pages=5) -> List[Dict]:
        """
        Crawl jobs from ITviec.com
        Note: This is a simplified version. Real implementation should respect robots.txt
        """
        jobs = []
        base_url = "https://itviec.com/it-jobs"

        print(f"🔍 Crawling ITviec.com (max {max_pages} pages)...")

        for page in range(1, max_pages + 1):
            try:
                print(f"📄 Page {page}...")
                url = f"{base_url}?page={page}" if page > 1 else base_url

                response = self.session.get(url, timeout=10)
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')

                # Find job cards (this selector may need updating based on ITviec's HTML structure)
                job_cards = soup.select('.job-item, .job-card, [class*="job"]')

                if not job_cards:
                    print(f"⚠️  No jobs found on page {page}")
                    break

                for idx, card in enumerate(job_cards[:10]):  # Limit to 10 jobs per page
                    try:
                        job_data = self._extract_itviec_job(card, idx + 1)
                        if job_data:
                            jobs.append(job_data)
                            print(f"✅ Extracted: {job_data['title'][:50]}...")
                    except Exception as e:
                        print(f"❌ Error extracting job {idx + 1}: {e}")
                        continue

                # Respectful crawling - wait between requests
                time.sleep(random.uniform(2, 4))

            except Exception as e:
                print(f"❌ Error on page {page}: {e}")
                continue

        print(f"\n✅ Total jobs crawled from ITviec: {len(jobs)}")
        return jobs

    def _extract_itviec_job(self, card, idx) -> Dict:
        """Extract job information from ITviec job card"""
        # This is a template - actual selectors depend on ITviec's HTML structure
        job = {
            'title': self._safe_text(card, 'h2, .job-title, [class*="title"]'),
            'company': self._safe_text(card, '.company-name, [class*="company"]'),
            'location': self._safe_text(card, '.location, [class*="location"]'),
            'salary': self._safe_text(card, '.salary, [class*="salary"]'),
            'description': self._safe_text(card, '.job-description, [class*="description"]', limit=500),
            'skills': self._extract_skills(card),
            'job_type': self._extract_job_type(card),
            'experience_level': self._extract_experience_level(card),
            'source': 'ITviec',
            'crawled_at': datetime.now().isoformat(),
        }

        # Clean and validate
        if not job['title'] or not job['company']:
            return None

        return job

    def _safe_text(self, element, selector, limit=None):
        """Safely extract text from element"""
        try:
            found = element.select_one(selector)
            if found:
                text = found.get_text(strip=True)
                if limit:
                    text = text[:limit]
                return text
        except:
            pass
        return ""

    def _extract_skills(self, card) -> List[str]:
        """Extract skills from job card"""
        skills = []
        try:
            skill_elements = card.select('.skill, .tag, [class*="skill"], [class*="tag"]')
            skills = [el.get_text(strip=True) for el in skill_elements if el.get_text(strip=True)]
        except:
            pass
        return skills[:10]  # Limit to 10 skills

    def _extract_job_type(self, card) -> str:
        """Extract job type (Full-time, Part-time, etc.)"""
        text = card.get_text().lower()
        if 'full-time' in text or 'full time' in text:
            return 'FULL_TIME'
        elif 'part-time' in text or 'part time' in text:
            return 'PART_TIME'
        elif 'contract' in text:
            return 'CONTRACT'
        elif 'internship' in text or 'intern' in text:
            return 'INTERNSHIP'
        return 'FULL_TIME'  # Default

    def _extract_experience_level(self, card) -> str:
        """Extract experience level"""
        text = card.get_text().lower()
        if 'senior' in text or 'lead' in text:
            return 'SENIOR'
        elif 'mid' in text or 'middle' in text:
            return 'MID'
        elif 'junior' in text:
            return 'JUNIOR'
        elif 'intern' in text or 'fresher' in text:
            return 'INTERNSHIP'
        return 'MID'  # Default

    def generate_mock_jobs(self, count=50) -> List[Dict]:
        """
        Generate mock job data for development/testing
        This is useful when we can't crawl real sites
        """
        print(f"🎨 Generating {count} mock jobs...")

        companies = [
            "VNG Corporation", "FPT Software", "Viettel", "MOMO", "Tiki",
            "Shopee Vietnam", "Grab Vietnam", "ZaloPay", "VinID", "Be Group",
            "Sendo", "Topica", "VnTrip", "Teko", "Got It", "NashTech",
            "KMS Technology", "TMA Solutions", "Harvey Nash Vietnam", "Orient Software"
        ]

        titles = [
            "Senior Frontend Developer (React/Next.js)",
            "Backend Developer (Java Spring Boot)",
            "Full-Stack Developer (MERN Stack)",
            "Mobile Developer (React Native)",
            "DevOps Engineer (AWS/Docker/K8s)",
            "AI/ML Engineer (Python/TensorFlow)",
            "Data Engineer (Spark/Kafka)",
            "QA Automation Engineer",
            "UI/UX Designer",
            "Product Manager",
            "Senior Java Developer",
            "Node.js Developer",
            "Flutter Developer",
            "Cloud Architect (AWS/Azure)",
            "Security Engineer",
            "Business Analyst",
            "Scrum Master",
            "Tech Lead (Full-Stack)",
            "Software Engineer (Go/Microservices)",
            "Frontend Developer (Vue.js)"
        ]

        locations = [
            "Ho Chi Minh City", "Hanoi", "Da Nang", "Binh Duong",
            "Dong Nai", "Can Tho", "Hai Phong", "Remote"
        ]

        skill_sets = {
            "Frontend": ["React", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind", "Redux", "Next.js", "Vite"],
            "Backend": ["Java", "Spring Boot", "Node.js", "Python", "Django", "PostgreSQL", "MongoDB", "Redis", "Kafka", "Microservices"],
            "Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Firebase"],
            "DevOps": ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Jenkins", "GitLab CI", "Prometheus"],
            "AI/ML": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "NLP", "Computer Vision", "LLMs"],
            "Data": ["SQL", "Python", "Spark", "Airflow", "Kafka", "Data Warehouse", "ETL", "BigQuery"],
        }

        job_types = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]
        exp_levels = ["INTERNSHIP", "JUNIOR", "MID", "SENIOR"]

        jobs = []

        for i in range(count):
            # Pick random category
            category = random.choice(list(skill_sets.keys()))
            skills = random.sample(skill_sets[category], k=random.randint(3, 6))

            # Generate salary range based on experience
            exp_level = random.choice(exp_levels)
            if exp_level == "INTERNSHIP":
                salary_min, salary_max = 3000000, 7000000
            elif exp_level == "JUNIOR":
                salary_min, salary_max = 8000000, 15000000
            elif exp_level == "MID":
                salary_min, salary_max = 15000000, 35000000
            else:  # SENIOR
                salary_min, salary_max = 30000000, 70000000

            job = {
                "title": random.choice(titles),
                "company": random.choice(companies),
                "location": random.choice(locations),
                "salary": f"${salary_min:,} - ${salary_max:,}",
                "salary_min": salary_min,
                "salary_max": salary_max,
                "description": self._generate_job_description(skills, exp_level),
                "requirements": self._generate_requirements(skills, exp_level),
                "benefits": self._generate_benefits(),
                "skills": skills,
                "job_type": random.choice(job_types) if random.random() > 0.2 else "FULL_TIME",
                "experience_level": exp_level,
                "category": category,
                "is_remote": random.choice([True, False]),
                "is_urgent": random.random() > 0.8,
                "views": random.randint(50, 5000),
                "applications": random.randint(5, 200),
                "source": "Mock Data",
                "crawled_at": datetime.now().isoformat(),
            }

            jobs.append(job)

            if (i + 1) % 10 == 0:
                print(f"✅ Generated {i + 1}/{count} jobs...")

        print(f"✅ Mock job generation complete!")
        return jobs

    def _generate_job_description(self, skills, exp_level) -> str:
        """Generate realistic job description"""
        templates = [
            f"We are seeking a talented developer to join our growing team. You will work with cutting-edge technologies including {', '.join(skills[:3])}.",
            f"Join our innovative team and help build scalable solutions using {', '.join(skills[:3])}. This is a great opportunity for {exp_level.lower()} developers.",
            f"We're looking for a passionate engineer who loves working with {', '.join(skills[:3])}. You'll collaborate with cross-functional teams to deliver high-quality products.",
        ]
        return random.choice(templates)

    def _generate_requirements(self, skills, exp_level) -> str:
        """Generate job requirements"""
        years = {"INTERNSHIP": "0-1", "JUNIOR": "1-3", "MID": "3-5", "SENIOR": "5+"}.get(exp_level, "2+")

        return f"""
• {years} years of experience in software development
• Strong proficiency in {', '.join(skills[:3])}
• Experience with {skills[3] if len(skills) > 3 else 'modern development tools'}
• Good communication and teamwork skills
• Bachelor's degree in Computer Science or related field
• Problem-solving mindset and attention to detail
        """.strip()

    def _generate_benefits(self) -> str:
        """Generate company benefits"""
        all_benefits = [
            "13th month salary",
            "Performance bonus up to 6 months",
            "Premium health insurance",
            "Annual health check-up",
            "Flexible working hours",
            "Remote work options",
            "Modern office with free snacks",
            "Team building activities",
            "Training and development budget",
            "Annual company trip",
            "Competitive salary",
            "Laptop and equipment provided",
        ]

        selected = random.sample(all_benefits, k=random.randint(5, 8))
        return "\n• " + "\n• ".join(selected)

    def save_to_json(self, jobs: List[Dict], filename: str):
        """Save jobs to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(jobs, f, ensure_ascii=False, indent=2)
        print(f"💾 Saved {len(jobs)} jobs to {filename}")


def main():
    """Main execution"""
    print("=" * 60)
    print("🚀 JobVerse Job Crawler")
    print("=" * 60)

    crawler = JobCrawler()

    # For development, we'll use mock data
    # In production, you would uncomment the real crawler

    # Option 1: Crawl real data (requires respecting robots.txt and rate limiting)
    # jobs = crawler.crawl_itviec(max_pages=3)

    # Option 2: Generate mock data (for development/testing)
    jobs = crawler.generate_mock_jobs(count=100)

    # Save to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"jobs_data_{timestamp}.json"
    crawler.save_to_json(jobs, filename)

    print("\n" + "=" * 60)
    print(f"✅ Crawling complete!")
    print(f"📊 Total jobs: {len(jobs)}")
    print(f"📁 Output file: {filename}")
    print("=" * 60)

    # Print sample
    if jobs:
        print("\n📋 Sample job:")
        print(json.dumps(jobs[0], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
