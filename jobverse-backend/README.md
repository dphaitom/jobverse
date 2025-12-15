# 🚀 JobVerse Backend API

Spring Boot backend cho nền tảng tuyển dụng việc làm JobVerse với AI Matching.

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│              React Web App / Mobile App                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      API GATEWAY                                 │
│                  Nginx / Load Balancer                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                  SPRING BOOT BACKEND                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │ Controllers │ │  Services   │ │ Repositories│                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │  Security   │ │    JWT      │ │   Mappers   │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐       │
│  │PostgreSQL│ │  Redis   │ │Elasticsearch │ │  Kafka   │       │
│  └──────────┘ └──────────┘ └──────────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Spring Boot 3.2 |
| Language | Java 17 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Search | Elasticsearch 8 |
| Queue | Apache Kafka |
| Security | Spring Security + JWT |
| API Docs | SpringDoc OpenAPI |
| Migration | Flyway |
| Build | Maven |
| Container | Docker |

## 📦 Cài đặt & Chạy

### Yêu cầu

- Java 17+
- Maven 3.8+
- Docker & Docker Compose
- PostgreSQL 16 (hoặc sử dụng Docker)

### Cách 1: Chạy với Docker Compose (Khuyến nghị)

```bash
# Clone project
git clone https://github.com/your-repo/jobverse-backend.git
cd jobverse-backend

# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f app

# Dừng services
docker-compose down
```

**Truy cập:**
- API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- pgAdmin: http://localhost:5050
- Redis Commander: http://localhost:8081

### Cách 2: Chạy Local Development

```bash
# 1. Khởi động databases
docker-compose up -d postgres redis elasticsearch kafka zookeeper

# 2. Cấu hình environment
cp .env.example .env
# Chỉnh sửa .env theo môi trường của bạn

# 3. Chạy application
./mvnw spring-boot:run

# Hoặc
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Cách 3: Build JAR

```bash
# Build
./mvnw clean package -DskipTests

# Chạy JAR
java -jar target/jobverse-backend-1.0.0.jar --spring.profiles.active=prod
```

## 🔑 Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobverse
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Elasticsearch
ELASTICSEARCH_URI=http://localhost:9200

# Kafka
KAFKA_SERVERS=localhost:9092

# JWT
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRATION=86400000

# OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AWS S3
AWS_ACCESS_KEY=your_aws_key
AWS_SECRET_KEY=your_aws_secret
AWS_S3_BUCKET=jobverse-uploads
AWS_REGION=ap-southeast-1

# OpenAI (for AI Matching)
OPENAI_API_KEY=your_openai_key
```

## 📚 API Documentation

### Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/register` | Đăng ký tài khoản mới |
| POST | `/v1/auth/login` | Đăng nhập |
| POST | `/v1/auth/refresh-token` | Làm mới access token |
| POST | `/v1/auth/logout` | Đăng xuất |
| POST | `/v1/auth/forgot-password` | Quên mật khẩu |
| POST | `/v1/auth/reset-password` | Đặt lại mật khẩu |
| POST | `/v1/auth/verify-email` | Xác thực email |

### Jobs APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/jobs` | Lấy danh sách việc làm |
| GET | `/v1/jobs/{id}` | Lấy chi tiết việc làm |
| GET | `/v1/jobs/search` | Tìm kiếm full-text |
| GET | `/v1/jobs/recommended` | Việc làm AI đề xuất |
| GET | `/v1/jobs/trending` | Việc làm trending |
| POST | `/v1/jobs` | Tạo tin tuyển dụng |
| PUT | `/v1/jobs/{id}` | Cập nhật tin |
| DELETE | `/v1/jobs/{id}` | Xóa tin |
| POST | `/v1/jobs/{id}/apply` | Ứng tuyển |
| POST | `/v1/jobs/{id}/save` | Lưu việc làm |

### Companies APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/companies` | Danh sách công ty |
| GET | `/v1/companies/{id}` | Chi tiết công ty |
| GET | `/v1/companies/{id}/jobs` | Việc làm của công ty |
| GET | `/v1/companies/{id}/reviews` | Đánh giá công ty |
| POST | `/v1/companies` | Tạo công ty |
| PUT | `/v1/companies/{id}` | Cập nhật công ty |

### AI APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/ai/match-score` | Tính điểm match |
| POST | `/v1/ai/analyze-resume` | Phân tích CV |
| POST | `/v1/ai/career-advice` | Tư vấn nghề nghiệp |
| GET | `/v1/ai/skill-suggestions` | Gợi ý kỹ năng |
| GET | `/v1/ai/salary-prediction` | Dự đoán mức lương |

## 📁 Project Structure

```
jobverse-backend/
├── src/
│   ├── main/
│   │   ├── java/com/jobverse/
│   │   │   ├── config/          # Configurations
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── service/         # Business Logic
│   │   │   ├── repository/      # Data Access
│   │   │   ├── entity/          # JPA Entities
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── request/
│   │   │   │   └── response/
│   │   │   ├── security/        # JWT & Security
│   │   │   ├── exception/       # Exception Handling
│   │   │   ├── kafka/           # Message Queue
│   │   │   ├── elasticsearch/   # Search
│   │   │   ├── mapper/          # Entity Mappers
│   │   │   └── util/            # Utilities
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/    # Flyway migrations
│   └── test/
├── docker-compose.yml
├── Dockerfile
├── pom.xml
└── README.md
```

## 🗄️ Database Schema

### Main Tables
- `users` - Thông tin người dùng
- `user_profiles` - Hồ sơ chi tiết
- `companies` - Thông tin công ty
- `jobs` - Tin tuyển dụng
- `applications` - Đơn ứng tuyển
- `skills` - Kỹ năng
- `categories` - Danh mục ngành nghề

### Relationship Tables
- `user_skills` - Kỹ năng của user
- `job_skills` - Kỹ năng yêu cầu của job
- `saved_jobs` - Việc làm đã lưu
- `job_benefits` - Phúc lợi

## 🔐 Security

- **JWT Authentication**: Access token + Refresh token
- **OAuth2**: Google, LinkedIn
- **Role-based Access Control**: CANDIDATE, EMPLOYER, ADMIN
- **Password Encryption**: BCrypt
- **CORS Configuration**: Configurable origins

## 🚀 Deployment

### Deploy lên AWS EC2

```bash
# 1. SSH vào EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# 2. Cài đặt Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start

# 3. Cài Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Clone và chạy
git clone your-repo
cd jobverse-backend
docker-compose up -d
```

### Deploy lên Railway/Render

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Deploy với Kubernetes

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jobverse-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: jobverse-api
  template:
    spec:
      containers:
      - name: api
        image: jobverse/api:latest
        ports:
        - containerPort: 8080
```

## 📊 Monitoring

- **Health Check**: `/actuator/health`
- **Metrics**: `/actuator/metrics`
- **Prometheus**: `/actuator/prometheus`

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run with coverage
./mvnw test jacoco:report

# Integration tests
./mvnw verify -P integration-test
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

---

Made with ❤️ by JobVerse Team
