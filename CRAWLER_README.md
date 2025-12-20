# JobVerse Data Crawler

Công cụ crawl dữ liệu việc làm IT thực từ các trang tuyển dụng Việt Nam.

## Tính năng

✅ **Crawl từ nhiều nguồn:**
- TopCV.vn - Trang tuyển dụng hàng đầu VN
- ITviec.com - Chuyên IT jobs
- Có thể mở rộng thêm nguồn khác

✅ **Dữ liệu thu thập:**
- Thông tin công việc (title, description, requirements, benefits)
- Thông tin công ty (name, logo, description, website, size, industry)
- Mức lương (salary range)
- Địa điểm làm việc
- Skills yêu cầu
- Categories
- Company logos (download về local)

✅ **Tự động:**
- Normalize location (Hồ Chí Minh, Hà Nội, Đà Nẵng, Remote)
- Extract category từ job title
- Extract experience level (JUNIOR, MIDDLE, SENIOR)
- Extract skills từ title
- Parse salary range
- Generate requirements và benefits
- Download company logos

## Cài đặt

### 1. Cài đặt Python dependencies:

```bash
pip install -r requirements.txt
```

### 2. Cấu hình database (cho seeder):

Tạo file `.env` hoặc export environment variables:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=jobverse
export DB_USER=postgres
export DB_PASSWORD=your_password
```

Hoặc sửa trực tiếp trong file `seed_database.py`:

```python
DB_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'jobverse',
    'user': 'postgres',
    'password': 'your_password'
}
```

## Sử dụng

### Bước 1: Crawl dữ liệu

```bash
python job_crawler.py
```

**Output:**
- File `crawled_jobs.json` - Chứa toàn bộ dữ liệu crawled
- Folder `crawled_images/companies/` - Chứa logo công ty

**Tuỳ chỉnh số lượng:**

Mở file `job_crawler.py` và sửa dòng cuối:

```python
crawler.run(max_pages_per_site=20)  # Tăng số này để crawl nhiều hơn
```

- 10 pages = ~200-300 jobs
- 20 pages = ~400-600 jobs
- 50 pages = ~1000-1500 jobs

### Bước 2: Import vào database

```bash
python seed_database.py
```

Script sẽ tự động:
1. Kết nối database
2. Insert categories
3. Insert skills
4. Insert companies (với logo)
5. Insert jobs + job_skills

**Lưu ý:** Script tự động kiểm tra duplicate, chỉ insert dữ liệu mới.

## Crawl liên tục

Để crawl liên tục và có càng nhiều data càng tốt:

### Cách 1: Chạy lặp lại thủ công

```bash
# Lần 1
python job_crawler.py
python seed_database.py

# Lần 2 (sau vài giờ/ngày)
python job_crawler.py
python seed_database.py
```

### Cách 2: Shell script tự động

Tạo file `crawl_loop.sh`:

```bash
#!/bin/bash
while true; do
    echo "🚀 Starting crawl cycle..."
    python job_crawler.py
    python seed_database.py
    echo "✅ Cycle complete. Waiting 6 hours..."
    sleep 21600  # 6 hours
done
```

Chạy:
```bash
chmod +x crawl_loop.sh
./crawl_loop.sh
```

### Cách 3: Windows batch script

Tạo file `crawl_loop.bat`:

```batch
@echo off
:loop
echo Starting crawl cycle...
python job_crawler.py
python seed_database.py
echo Waiting 6 hours...
timeout /t 21600 /nobreak
goto loop
```

Chạy:
```batch
crawl_loop.bat
```

### Cách 4: Cron job (Linux/Mac)

```bash
# Crawl mỗi 6 giờ
0 */6 * * * cd /path/to/doan1 && python job_crawler.py && python seed_database.py
```

## Cấu trúc dữ liệu

### crawled_jobs.json

```json
{
  "jobs": [
    {
      "title": "Senior Backend Developer",
      "company": "FPT Software",
      "location": "Hồ Chí Minh",
      "salary_min": 25000000,
      "salary_max": 45000000,
      "description": "...",
      "requirements": "...",
      "benefits": "...",
      "category": "Backend",
      "employment_type": "FULL_TIME",
      "experience_level": "SENIOR",
      "skills": ["Java", "Spring Boot", "MySQL"],
      "deadline": "2025-02-15",
      "source": "TopCV",
      "source_url": "https://..."
    }
  ],
  "companies": [
    {
      "name": "FPT Software",
      "logo": "/crawled_images/companies/abc123.jpg",
      "description": "...",
      "website": "https://...",
      "size": "1000+",
      "industry": "Information Technology"
    }
  ],
  "categories": ["Backend", "Frontend", "Mobile", ...],
  "skills": ["Java", "React", "Python", ...],
  "crawled_at": "2025-12-20T10:30:00",
  "total_jobs": 542,
  "total_companies": 87
}
```

## Mở rộng thêm nguồn

Để crawl từ thêm trang khác, thêm method vào class `JobCrawler`:

```python
def crawl_new_site(self, max_pages=10):
    """Crawl jobs from NewSite.com"""
    print("🔍 Crawling NewSite.com...")
    base_url = "https://newsite.com"

    for page in range(1, max_pages + 1):
        url = f"{base_url}/jobs?page={page}"
        response = self.session.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        # Parse job items...
        # Add to self.jobs

        time.sleep(random.uniform(2, 4))
```

Sau đó gọi trong `run()`:

```python
def run(self, max_pages_per_site=10):
    self.crawl_topcv(max_pages_per_site)
    self.crawl_itviec(max_pages_per_site)
    self.crawl_new_site(max_pages_per_site)  # Thêm dòng này
```

## Xử lý lỗi

### Lỗi kết nối database:

```
❌ Database connection failed: ...
```

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy: `pg_ctl status`
2. Kiểm tra credentials trong DB_CONFIG
3. Kiểm tra firewall/port 5432

### Lỗi crawl bị block:

```
Error on page X: 403 Forbidden
```

**Giải pháp:**
1. Tăng delay giữa requests: `time.sleep(random.uniform(5, 10))`
2. Thêm proxy rotation
3. Thêm random User-Agent

### Lỗi parse HTML:

```
Error parsing job item: ...
```

**Giải pháp:**
- Website có thể đã thay đổi cấu trúc HTML
- Cần update selectors trong code

## Performance Tips

1. **Tăng tốc crawl:**
   - Giảm delay: `time.sleep(1)` thay vì `time.sleep(3)`
   - Sử dụng async/await với `aiohttp`
   - Multi-threading

2. **Tránh duplicate:**
   - Seeder tự động check duplicate
   - Có thể thêm unique constraint trên job slug

3. **Optimize database:**
   - Batch insert (đã implement với `execute_values`)
   - Create indexes trên columns thường query

## Statistics

Với cấu hình mặc định (`max_pages_per_site=20`):

- **Crawl time:** ~5-10 phút
- **Jobs crawled:** 400-600 jobs
- **Companies:** 80-150 companies
- **Categories:** 10-15 categories
- **Skills:** 30-50 skills
- **Images downloaded:** 80-150 logos
- **File size:** ~500KB-2MB JSON

## License

MIT License - Free to use for JobVerse project

## Author

Quang Thang - December 2025
