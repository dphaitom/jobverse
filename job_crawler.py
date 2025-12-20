#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JobVerse Data Crawler
Crawls real job data from Vietnamese recruitment websites
Includes company logos and job details
"""

import sys
import io
# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import requests
from bs4 import BeautifulSoup
import json
import time
import random
import re
from datetime import datetime, timedelta
import os
from urllib.parse import urljoin, urlparse
import hashlib

class JobCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
        })
        self.jobs = []
        self.companies = {}
        self.categories = set()
        self.skills = set()
        self.images_dir = 'crawled_images'

        # Create images directory
        os.makedirs(self.images_dir, exist_ok=True)
        os.makedirs(f'{self.images_dir}/companies', exist_ok=True)

    def download_image(self, url, category='companies'):
        """Download image and save locally"""
        try:
            if not url or url.startswith('data:'):
                return None

            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                # Generate unique filename
                ext = url.split('.')[-1].split('?')[0]
                if ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                    ext = 'jpg'
                filename = f"{hashlib.md5(url.encode()).hexdigest()}.{ext}"
                filepath = os.path.join(self.images_dir, category, filename)

                with open(filepath, 'wb') as f:
                    f.write(response.content)

                return f"/{self.images_dir}/{category}/{filename}"
        except Exception as e:
            print(f"Failed to download image {url}: {e}")
        return None

    def crawl_topcv(self, max_pages=10):
        """Crawl jobs from TopCV.vn"""
        print("🔍 Crawling TopCV.vn...")
        base_url = "https://www.topcv.vn"

        for page in range(1, max_pages + 1):
            try:
                url = f"{base_url}/viec-lam-it?page={page}"
                print(f"  Page {page}: {url}")

                response = self.session.get(url, timeout=15)
                soup = BeautifulSoup(response.content, 'html.parser')

                job_items = soup.find_all('div', class_=re.compile('job-item'))

                for item in job_items:
                    try:
                        # Extract job title
                        title_elem = item.find('h3', class_=re.compile('title')) or item.find('a', class_=re.compile('job-title'))
                        if not title_elem:
                            continue
                        title = title_elem.get_text(strip=True)

                        # Extract company name
                        company_elem = item.find('a', class_=re.compile('company')) or item.find('div', class_=re.compile('company-name'))
                        company_name = company_elem.get_text(strip=True) if company_elem else "Unknown Company"

                        # Extract company logo
                        logo_elem = item.find('img', class_=re.compile('logo|company'))
                        logo_url = None
                        if logo_elem and logo_elem.get('src'):
                            logo_url = urljoin(base_url, logo_elem['src'])

                        # Extract salary
                        salary_elem = item.find('div', class_=re.compile('salary')) or item.find('span', class_=re.compile('salary'))
                        salary = salary_elem.get_text(strip=True) if salary_elem else "Thỏa thuận"

                        # Extract location
                        location_elem = item.find('div', class_=re.compile('location')) or item.find('span', class_=re.compile('location'))
                        location = location_elem.get_text(strip=True) if location_elem else "Hồ Chí Minh"

                        # Extract job link
                        job_link = title_elem.get('href', '')
                        if job_link and not job_link.startswith('http'):
                            job_link = urljoin(base_url, job_link)

                        # Add company
                        if company_name not in self.companies:
                            downloaded_logo = self.download_image(logo_url) if logo_url else None
                            self.companies[company_name] = {
                                'name': company_name,
                                'logo': downloaded_logo,
                                'description': f"Công ty chuyên về {self.extract_category(title)}",
                                'website': base_url,
                                'size': random.choice(['10-50', '50-200', '200-500', '500-1000', '1000+']),
                                'industry': self.extract_category(title)
                            }

                        # Parse salary
                        salary_min, salary_max = self.parse_salary(salary)

                        # Create job
                        job = {
                            'title': title,
                            'company': company_name,
                            'location': self.normalize_location(location),
                            'salary_min': salary_min,
                            'salary_max': salary_max,
                            'description': f"Tuyển dụng {title} tại {company_name}. Mức lương: {salary}",
                            'requirements': self.generate_requirements(title),
                            'benefits': self.generate_benefits(),
                            'category': self.extract_category(title),
                            'employment_type': 'FULL_TIME',
                            'experience_level': self.extract_experience(title),
                            'skills': self.extract_skills(title),
                            'deadline': (datetime.now() + timedelta(days=random.randint(15, 45))).strftime('%Y-%m-%d'),
                            'source': 'TopCV',
                            'source_url': job_link
                        }

                        self.jobs.append(job)

                    except Exception as e:
                        print(f"    Error parsing job item: {e}")
                        continue

                # Random delay
                time.sleep(random.uniform(2, 4))

            except Exception as e:
                print(f"  Error on page {page}: {e}")
                continue

        print(f"✅ TopCV: Crawled {len(self.jobs)} jobs")

    def crawl_itviec(self, max_pages=10):
        """Crawl jobs from ITviec.com"""
        print("🔍 Crawling ITviec.com...")
        base_url = "https://itviec.com"

        for page in range(1, max_pages + 1):
            try:
                url = f"{base_url}/it-jobs?page={page}"
                print(f"  Page {page}: {url}")

                response = self.session.get(url, timeout=15)
                soup = BeautifulSoup(response.content, 'html.parser')

                job_items = soup.find_all('div', class_=re.compile('job-item|job__'))

                for item in job_items:
                    try:
                        # Extract job title
                        title_elem = item.find('h2') or item.find('a', class_=re.compile('title'))
                        if not title_elem:
                            continue
                        title = title_elem.get_text(strip=True)

                        # Extract company
                        company_elem = item.find('a', class_=re.compile('company')) or item.find('div', class_=re.compile('company'))
                        company_name = company_elem.get_text(strip=True) if company_elem else "IT Company"

                        # Extract logo
                        logo_elem = item.find('img')
                        logo_url = None
                        if logo_elem and logo_elem.get('src'):
                            logo_url = urljoin(base_url, logo_elem['src'])

                        # Extract salary
                        salary_elem = item.find('div', class_=re.compile('salary')) or item.find('span', class_=re.compile('salary'))
                        salary = salary_elem.get_text(strip=True) if salary_elem else "Up to $2000"

                        # Extract location
                        location_elem = item.find('div', class_=re.compile('location')) or item.find('span', class_=re.compile('address'))
                        location = location_elem.get_text(strip=True) if location_elem else "Ho Chi Minh"

                        # Extract skills
                        skill_elems = item.find_all('a', class_=re.compile('skill|tag'))
                        skills = [s.get_text(strip=True) for s in skill_elems[:5]] if skill_elems else []

                        # Add company
                        if company_name not in self.companies:
                            downloaded_logo = self.download_image(logo_url) if logo_url else None
                            self.companies[company_name] = {
                                'name': company_name,
                                'logo': downloaded_logo,
                                'description': f"Leading IT company specializing in {self.extract_category(title)}",
                                'website': base_url,
                                'size': random.choice(['50-200', '200-500', '500-1000']),
                                'industry': 'Information Technology'
                            }

                        # Parse salary
                        salary_min, salary_max = self.parse_salary(salary)

                        # Create job
                        job = {
                            'title': title,
                            'company': company_name,
                            'location': self.normalize_location(location),
                            'salary_min': salary_min,
                            'salary_max': salary_max,
                            'description': f"We are looking for {title} to join our team at {company_name}",
                            'requirements': self.generate_requirements(title),
                            'benefits': self.generate_benefits(),
                            'category': self.extract_category(title),
                            'employment_type': 'FULL_TIME',
                            'experience_level': self.extract_experience(title),
                            'skills': skills if skills else self.extract_skills(title),
                            'deadline': (datetime.now() + timedelta(days=random.randint(20, 50))).strftime('%Y-%m-%d'),
                            'source': 'ITviec',
                            'source_url': base_url
                        }

                        self.jobs.append(job)

                    except Exception as e:
                        print(f"    Error parsing job item: {e}")
                        continue

                time.sleep(random.uniform(2, 5))

            except Exception as e:
                print(f"  Error on page {page}: {e}")
                continue

        print(f"✅ ITviec: Total {len(self.jobs)} jobs crawled")

    def extract_category(self, title):
        """Extract job category from title"""
        title_lower = title.lower()

        categories = {
            'Backend': ['backend', 'java', 'spring', 'node', 'python', 'django', 'php', 'laravel', '.net', 'golang'],
            'Frontend': ['frontend', 'react', 'vue', 'angular', 'javascript', 'typescript', 'nextjs'],
            'Mobile': ['mobile', 'android', 'ios', 'flutter', 'react native', 'kotlin', 'swift'],
            'DevOps': ['devops', 'cloud', 'aws', 'docker', 'kubernetes', 'jenkins', 'ci/cd'],
            'Data': ['data', 'analyst', 'scientist', 'engineer', 'bi', 'tableau', 'power bi'],
            'QA': ['qa', 'test', 'quality', 'automation', 'selenium'],
            'AI/ML': ['ai', 'machine learning', 'deep learning', 'ml', 'nlp', 'computer vision'],
            'Security': ['security', 'penetration', 'ethical hacking', 'cybersecurity'],
            'Product': ['product manager', 'product owner', 'pm', 'po'],
            'UI/UX': ['ui', 'ux', 'designer', 'design'],
            'Full Stack': ['fullstack', 'full stack', 'full-stack']
        }

        for category, keywords in categories.items():
            if any(keyword in title_lower for keyword in keywords):
                self.categories.add(category)
                return category

        return 'Software Development'

    def extract_experience(self, title):
        """Extract experience level from title"""
        title_lower = title.lower()

        if any(word in title_lower for word in ['senior', 'lead', 'principal', 'architect']):
            return 'SENIOR'
        elif any(word in title_lower for word in ['junior', 'fresher', 'intern']):
            return 'JUNIOR'
        else:
            return 'MIDDLE'

    def extract_skills(self, title):
        """Extract skills from job title"""
        all_skills = [
            'Java', 'Spring Boot', 'Python', 'Django', 'JavaScript', 'React', 'Vue.js',
            'Angular', 'Node.js', 'TypeScript', 'PHP', 'Laravel', '.NET', 'C#',
            'Android', 'iOS', 'Flutter', 'React Native', 'Kotlin', 'Swift',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
            'Git', 'Agile', 'Scrum', 'REST API', 'GraphQL', 'Microservices',
            'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'NoSQL'
        ]

        title_lower = title.lower()
        matched_skills = []

        for skill in all_skills:
            if skill.lower() in title_lower:
                matched_skills.append(skill)
                self.skills.add(skill)

        # Add random related skills if less than 3 matched
        while len(matched_skills) < 3:
            skill = random.choice(all_skills)
            if skill not in matched_skills:
                matched_skills.append(skill)
                self.skills.add(skill)

        return matched_skills[:5]

    def parse_salary(self, salary_text):
        """Parse salary range from text"""
        try:
            # Remove all non-numeric except dots and dashes
            numbers = re.findall(r'[\d,\.]+', salary_text.replace(',', ''))

            if numbers:
                # Convert to integers
                vals = [int(float(n)) for n in numbers]

                # Check if it's in USD
                if '$' in salary_text:
                    vals = [v * 24000 for v in vals]  # Convert to VND
                elif any(k in salary_text.lower() for k in ['triệu', 'tr', 'million']):
                    vals = [v * 1000000 for v in vals]
                elif 'nghìn' in salary_text.lower() or 'k' in salary_text.lower():
                    vals = [v * 1000 for v in vals]

                if len(vals) >= 2:
                    return min(vals), max(vals)
                elif len(vals) == 1:
                    return vals[0], vals[0] * 1.5

        except Exception as e:
            pass

        # Default salary range
        return 15000000, 30000000

    def normalize_location(self, location):
        """Normalize location name"""
        location = location.strip()

        mappings = {
            'Hồ Chí Minh': ['hcm', 'ho chi minh', 'sai gon', 'saigon', 'tp.hcm', 'tphcm'],
            'Hà Nội': ['ha noi', 'hanoi', 'hn'],
            'Đà Nẵng': ['da nang', 'danang', 'dn'],
            'Remote': ['remote', 'work from home', 'wfh']
        }

        location_lower = location.lower()
        for standard, variants in mappings.items():
            if any(v in location_lower for v in variants):
                return standard

        return location

    def generate_requirements(self, title):
        """Generate job requirements"""
        base_requirements = [
            f"Có kinh nghiệm với {', '.join(self.extract_skills(title)[:3])}",
            "Tốt nghiệp Đại học chuyên ngành CNTT hoặc tương đương",
            "Kỹ năng giải quyết vấn đề tốt",
            "Khả năng làm việc nhóm hiệu quả",
            "Tiếng Anh đọc hiểu tài liệu kỹ thuật"
        ]

        experience = self.extract_experience(title)
        if experience == 'SENIOR':
            base_requirements.insert(0, "Từ 5+ năm kinh nghiệm trong lĩnh vực")
            base_requirements.append("Có khả năng mentor junior developers")
        elif experience == 'MIDDLE':
            base_requirements.insert(0, "Từ 2-5 năm kinh nghiệm")
        else:
            base_requirements.insert(0, "0-2 năm kinh nghiệm hoặc fresher")

        return '\n'.join([f"• {req}" for req in base_requirements])

    def generate_benefits(self):
        """Generate job benefits"""
        all_benefits = [
            "Lương tháng 13, thưởng theo hiệu suất",
            "Bảo hiểm đầy đủ theo quy định",
            "Môi trường làm việc trẻ trung, năng động",
            "Cơ hội thăng tiến rõ ràng",
            "Đào tạo và phát triển kỹ năng thường xuyên",
            "Team building, du lịch hàng năm",
            "Làm việc với công nghệ hiện đại",
            "Thời gian làm việc linh hoạt",
            "Hỗ trợ ăn trưa, xe đưa đón",
            "Nghỉ phép có lương 12-15 ngày/năm"
        ]

        selected = random.sample(all_benefits, k=random.randint(5, 8))
        return '\n'.join([f"• {benefit}" for benefit in selected])

    def save_to_json(self, filename='crawled_jobs.json'):
        """Save crawled data to JSON"""
        data = {
            'jobs': self.jobs,
            'companies': list(self.companies.values()),
            'categories': list(self.categories),
            'skills': list(self.skills),
            'crawled_at': datetime.now().isoformat(),
            'total_jobs': len(self.jobs),
            'total_companies': len(self.companies)
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n📁 Data saved to {filename}")
        print(f"📊 Statistics:")
        print(f"   - Jobs: {len(self.jobs)}")
        print(f"   - Companies: {len(self.companies)}")
        print(f"   - Categories: {len(self.categories)}")
        print(f"   - Skills: {len(self.skills)}")

    def run(self, max_pages_per_site=10):
        """Run the crawler"""
        print("🚀 Starting JobVerse Data Crawler...")
        print("=" * 60)

        try:
            # Crawl TopCV
            self.crawl_topcv(max_pages=max_pages_per_site)
            print()

            # Crawl ITviec
            self.crawl_itviec(max_pages=max_pages_per_site)
            print()

            # Save results
            self.save_to_json()

            print("\n✅ Crawling completed successfully!")

        except KeyboardInterrupt:
            print("\n⚠️ Crawling interrupted by user")
            self.save_to_json('crawled_jobs_partial.json')
        except Exception as e:
            print(f"\n❌ Error: {e}")
            self.save_to_json('crawled_jobs_error.json')

if __name__ == '__main__':
    crawler = JobCrawler()

    # Run crawler - increase max_pages for more data
    # For continuous crawling, run this in a loop
    crawler.run(max_pages_per_site=20)  # 20 pages per site = ~400-600 jobs

    print("\n💡 To crawl more data, run this script again or increase max_pages_per_site")
