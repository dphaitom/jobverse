# ❓ TÀI LIỆU HỎI ĐÁP - JOBVERSE PROJECT

## 📚 Danh mục câu hỏi

1. [Câu hỏi về dự án](#1-câu-hỏi-về-dự-án)
2. [Câu hỏi về công nghệ](#2-câu-hỏi-về-công-nghệ)
3. [Câu hỏi về tính năng](#3-câu-hỏi-về-tính-năng)
4. [Câu hỏi về kiến trúc](#4-câu-hỏi-về-kiến-trúc)
5. [Câu hỏi về AI](#5-câu-hỏi-về-ai)
6. [Câu hỏi kỹ thuật nâng cao](#6-câu-hỏi-kỹ-thuật-nâng-cao)
7. [Câu hỏi về bảo mật](#7-câu-hỏi-về-bảo-mật)
8. [Câu hỏi về triển khai](#8-câu-hỏi-về-triển-khai)

---

## 1. CÂU HỎI VỀ DỰ ÁN

### Q1.1: Dự án JobVerse giải quyết vấn đề gì?

**Trả lời ngắn gọn:**
"JobVerse giải quyết vấn đề tìm việc và tuyển dụng không hiệu quả bằng công nghệ AI để matching thông minh, giúp ứng viên nhanh chóng tìm được việc phù hợp và nhà tuyển dụng tìm được ứng viên phù hợp."

**Trả lời chi tiết hơn (nếu được hỏi thêm):**
- Ứng viên: Phải duyệt quá nhiều tin, không biết CV có đạt yêu cầu, thiếu chuẩn bị phỏng vấn
- Nhà tuyển dụng: Nhận nhiều CV không phù hợp, tốn thời gian sàng lọc
- Giải pháp: AI tính điểm phù hợp, phân tích CV, luyện phỏng vấn

### Q1.2: Tại sao chọn đề tài này?

**Trả lời:**
"Em chọn đề tài này vì ba lý do:
1. **Thực tiễn**: Tuyển dụng là nhu cầu thực tế của thị trường
2. **Công nghệ**: Kết hợp được full-stack development và AI
3. **Học hỏi**: Áp dụng được kiến thức Spring Boot, React, và AI integration"

### Q1.3: Dự án mất bao lâu để hoàn thành?

**Trả lời:**
"Dự án được thực hiện trong khoảng [X tuần/tháng], bao gồm:
- Tuần 1-2: Research và thiết kế hệ thống
- Tuần 3-4: Xây dựng backend API
- Tuần 5-6: Phát triển frontend
- Tuần 7-8: Tích hợp AI và testing
- Tuần 9-10: Bug fixing và hoàn thiện"

### Q1.4: Bạn làm một mình hay làm nhóm?

**Trả lời (nếu làm một mình):**
"Em làm một mình toàn bộ dự án, từ thiết kế đến implementation cả backend và frontend."

**Trả lời (nếu làm nhóm):**
"Em làm nhóm [X người]. Em phụ trách [phần của bạn: backend/frontend/AI], các bạn khác phụ trách [các phần khác]."

### Q1.5: Có khó khăn gì trong quá trình làm dự án không?

**Trả lời:**
"Có một số khó khăn như:
1. **Tích hợp AI**: Lần đầu làm việc với OpenAI API, phải tìm hiểu cách prompt engineering
2. **Performance**: Xử lý query database hiệu quả với nhiều joins
3. **WebSocket**: Implement realtime notification lần đầu
Nhưng em đã giải quyết bằng cách research documentation và tham khảo best practices."

---

## 2. CÂU HỎI VỀ CÔNG NGHỆ

### Q2.1: Tại sao chọn Spring Boot cho backend?

**Trả lời:**
"Em chọn Spring Boot vì:
1. **Ecosystem mạnh**: Spring Security, Spring Data JPA sẵn có
2. **Production-ready**: Built-in monitoring, health checks
3. **Dễ deploy**: Đóng gói thành JAR file chạy standalone
4. **Documentation tốt**: Nhiều tài liệu và community support"

### Q2.2: Tại sao chọn React thay vì Angular/Vue?

**Trả lời:**
"Em chọn React vì:
1. **Phổ biến nhất**: Nhiều job posting yêu cầu React
2. **Ecosystem lớn**: Nhiều thư viện hỗ trợ
3. **Dễ học**: Component-based, JSX dễ hiểu
4. **Performance tốt**: Virtual DOM, re-render hiệu quả"

### Q2.3: PostgreSQL hay MySQL? Tại sao chọn PostgreSQL?

**Trả lời:**
"Em chọn PostgreSQL vì:
1. **Feature-rich**: Hỗ trợ JSON, full-text search native
2. **Performance**: Tốt cho complex queries với nhiều joins
3. **ACID compliance**: Đảm bảo tính nhất quán dữ liệu
4. **Open source**: Free và có community mạnh"

### Q2.4: Redis dùng để làm gì trong dự án?

**Trả lời:**
"Redis trong JobVerse dùng để:
1. **Cache**: Cache danh sách jobs, company info để giảm database load
2. **Session storage**: Lưu JWT tokens
3. **Rate limiting**: Giới hạn số request từ một IP
Giúp tăng tốc độ response time từ database query 200ms xuống còn 10ms."

### Q2.5: Có sử dụng Docker không? Để làm gì?

**Trả lời:**
"Có, em dùng Docker để:
1. **Development**: Docker Compose chạy PostgreSQL, Redis local
2. **Consistency**: Đảm bảo môi trường dev giống production
3. **Deployment**: Dễ dàng deploy lên server
File docker-compose.yml define tất cả services cần thiết."

---

## 3. CÂU HỎI VỀ TÍNH NĂNG

### Q3.1: AI Matching hoạt động như thế nào?

**Trả lời:**
"AI Matching hoạt động qua các bước:
1. **Extract**: Lấy skills từ CV của ứng viên và JD của job
2. **Call OpenAI**: Gửi prompt yêu cầu tính điểm phù hợp (0-100)
3. **Score**: AI phân tích và trả về điểm + explanation
4. **Display**: Hiển thị điểm cho user

Ví dụ: CV có Java, Spring Boot → Job yêu cầu Java, Spring → Score 85/100"

### Q3.2: Resume Analysis phân tích được những gì?

**Trả lời:**
"Resume Analysis phân tích:
1. **Structure**: Format, layout, organization
2. **Content**: Skills, experience, education
3. **Keywords**: So sánh với job requirements
4. **Suggestions**: Đề xuất cải thiện cụ thể

Output: Điểm tổng + danh sách strengths/weaknesses + action items"

### Q3.3: Interview Practice hoạt động ra sao?

**Trả lời:**
"Interview Practice là chatbot AI:
1. User chọn vị trí muốn luyện (vd: Backend Dev)
2. AI generate câu hỏi phỏng vấn phù hợp
3. User gõ câu trả lời
4. AI evaluate và cho feedback + score
5. Continue với câu hỏi tiếp theo

Giúp ứng viên luyện tập trước khi phỏng vấn thật."

### Q3.4: Hệ thống có gửi email thông báo không?

**Trả lời:**
"Hiện tại dự án đã chuẩn bị infrastructure cho email nhưng chưa implement hoàn chỉnh. Trong tương lai sẽ gửi email khi:
- Xác thực tài khoản
- Có người ứng tuyển vào job
- Trạng thái đơn ứng tuyển thay đổi"

### Q3.5: Có tính năng real-time notification không?

**Trả lời:**
"Có, em implement WebSocket để:
- Thông báo real-time khi có người ứng tuyển
- Tin nhắn giữa ứng viên và nhà tuyển dụng
- Update trạng thái đơn ứng tuyển

Sử dụng STOMP over WebSocket với Spring Boot."

---

## 4. CÂU HỎI VỀ KIẾN TRÚC

### Q4.1: Mô tả kiến trúc tổng thể của hệ thống?

**Trả lời:**
"JobVerse dùng kiến trúc 3-tier:
1. **Presentation**: React frontend (port 5173)
2. **Application**: Spring Boot backend (port 8080)
3. **Data**: PostgreSQL + Redis

Frontend gọi REST API, backend xử lý business logic, query database và trả về JSON. Tách biệt rõ ràng giúp dễ maintain và scale."

### Q4.2: Backend và Frontend giao tiếp với nhau thế nào?

**Trả lời:**
"Giao tiếp qua RESTful API:
1. **Frontend**: Gửi HTTP request (GET, POST, PUT, DELETE) với Axios
2. **Backend**: REST Controllers nhận request, xử lý và trả JSON response
3. **Authentication**: JWT token trong header `Authorization: Bearer <token>`

Ví dụ: `GET /api/v1/jobs` → Backend query DB → Return JSON list"

### Q4.3: Database schema được thiết kế như thế nào?

**Trả lời:**
"Database có các bảng chính:
- **users**: Thông tin đăng nhập (email, password, role)
- **user_profiles**: Hồ sơ chi tiết (skills, experience)
- **companies**: Công ty
- **jobs**: Tin tuyển dụng
- **applications**: Đơn ứng tuyển (foreign key tới users và jobs)
- **skills, categories**: Master data

Quan hệ: users 1-N applications N-1 jobs N-1 companies"

### Q4.4: Xử lý authentication và authorization như thế nào?

**Trả lời:**
"Dùng JWT (JSON Web Token):
1. **Login**: User nhập email/password → Backend verify → Tạo JWT token
2. **Access**: Frontend gửi token trong header mỗi request
3. **Verify**: Backend verify token, extract user info
4. **Authorization**: Check role (CANDIDATE, EMPLOYER, ADMIN)

JWT có expiration time, cần refresh sau 24h."

### Q4.5: API được document như thế nào?

**Trả lời:**
"Dùng Swagger/OpenAPI:
- Tự động generate từ annotations
- Truy cập tại `/api/swagger-ui.html`
- Hiển thị tất cả endpoints, parameters, response schemas
- Có thể test API trực tiếp trên UI"

---

## 5. CÂU HỎI VỀ AI

### Q5.1: Sử dụng AI model nào? GPT-3.5 hay GPT-4?

**Trả lời:**
"Dự án sử dụng OpenAI GPT-3.5-turbo vì:
1. **Cost-effective**: Rẻ hơn GPT-4 đáng kể
2. **Speed**: Response time nhanh hơn
3. **Sufficient**: Đủ tốt cho use case matching và analysis

Có thể upgrade lên GPT-4 khi cần độ chính xác cao hơn."

### Q5.2: Prompt engineering được làm như thế nào?

**Trả lời:**
"Em design prompt có cấu trúc:
```
System: You are a job matching expert...
User: Compare this CV: [cv_text]
      With this JD: [jd_text]
      Return score 0-100 and explanation
```

Prompt rõ ràng giúp AI trả về format consistent, dễ parse."

### Q5.3: Chi phí API OpenAI như thế nào?

**Trả lời:**
"GPT-3.5-turbo giá ~$0.002/1K tokens:
- 1 request matching: ~500 tokens = $0.001
- 1000 users/day: ~$1/day = $30/month

Có thể optimize bằng cách:
- Cache kết quả đã tính
- Giới hạn số lần request/user
- Dùng shorter prompts"

### Q5.4: Nếu OpenAI API lỗi thì xử lý thế nào?

**Trả lời:**
"Có error handling:
1. **Retry logic**: Tự động retry 2-3 lần nếu network error
2. **Fallback**: Trả về default score dựa trên keyword matching
3. **Error message**: Thông báo user 'AI temporarily unavailable'
4. **Logging**: Log lỗi để debug

Đảm bảo app vẫn hoạt động khi AI service down."

### Q5.5: Có train model riêng không?

**Trả lời:**
"Không, em sử dụng pre-trained OpenAI model vì:
1. **Time constraint**: Train model mất nhiều thời gian
2. **Data**: Thiếu training data chất lượng cao
3. **Performance**: GPT-3.5 đủ tốt cho use case này

Tương lai có thể fine-tune model nếu có đủ dữ liệu."

---

## 6. CÂU HỎI KỸ THUẬT NÂNG CAO

### Q6.1: Xử lý concurrency như thế nào?

**Trả lời:**
"Xử lý concurrency bằng:
1. **Database transactions**: ACID trong PostgreSQL
2. **Optimistic locking**: Version field trong entity
3. **Connection pool**: HikariCP với max 10 connections
4. **Thread pool**: Spring Boot async với @Async

Ví dụ: 2 users apply cùng lúc → Transactions đảm bảo không conflict."

### Q6.2: Performance optimization được làm gì?

**Trả lời:**
"Optimize nhiều điểm:
1. **Database**: Indexes trên foreign keys, frequently queried columns
2. **Caching**: Redis cache popular queries
3. **Pagination**: Limit results, load more on demand
4. **Lazy loading**: JPA fetch type LAZY
5. **Frontend**: Code splitting, image optimization

Response time < 200ms cho most requests."

### Q6.3: Có implement testing không? Test gì?

**Trả lời:**
"Có implement testing:
1. **Unit tests**: Test services với JUnit + Mockito
2. **Integration tests**: Test API endpoints với MockMvc
3. **E2E tests**: Playwright test user flows

Coverage khoảng [X]%, focus vào critical paths."

### Q6.4: Migration database được quản lý thế nào?

**Trả lời:**
"Dùng Flyway:
- File SQL trong `src/main/resources/db/migration`
- Naming: `V1__create_users.sql`, `V2__add_skills.sql`
- Tự động chạy khi start app
- Version control trong bảng `flyway_schema_history`

Đảm bảo database schema consistency."

### Q6.5: Có logging và monitoring không?

**Trả lời:**
"Có:
1. **Logging**: Logback với level INFO
2. **Spring Actuator**: Health checks, metrics
3. **Access logs**: Log mỗi API request
4. **Error tracking**: Log exceptions với stack trace

Giúp debug và monitor application health."

---

## 7. CÂU HỎI VỀ BẢO MẬT

### Q7.1: Làm thế nào để bảo mật password?

**Trả lời:**
"Password được bảo mật bằng:
1. **BCrypt hashing**: One-way hash với salt
2. **Never store plaintext**: Chỉ lưu hash vào database
3. **Password validation**: Min 8 chars, phải có chữ và số
4. **No password in logs**: Never log sensitive data

Ngay cả admin không thể xem password gốc."

### Q7.2: JWT token có an toàn không?

**Trả lời:**
"JWT có các biện pháp bảo mật:
1. **Secret key**: Sign với 256-bit secret key
2. **Expiration**: Token expire sau 24h
3. **HTTPS**: Truyền qua HTTPS để tránh intercept
4. **HttpOnly**: Refresh token trong HttpOnly cookie

Không hoàn hảo nhưng đủ cho most use cases."

### Q7.3: Có ngăn chặn SQL Injection không?

**Trả lời:**
"Có, bằng cách:
1. **JPA/Hibernate**: Tự động escape parameters
2. **Prepared statements**: Không concat SQL string
3. **Input validation**: Validate input trước khi query

Ví dụ: `@Query('SELECT * FROM users WHERE email = :email')`"

### Q7.4: CORS được config thế nào?

**Trả lời:**
"CORS config trong Spring Security:
```java
@CrossOrigin(origins = 'http://localhost:5173')
```
- Allow frontend origin
- Credentials: true cho cookies
- Methods: GET, POST, PUT, DELETE
- Headers: Authorization, Content-Type

Production sẽ update origin thành domain thật."

### Q7.5: Có rate limiting không?

**Trả lời:**
"Có implement rate limiting với Redis:
- Max 100 requests/minute per IP
- Sử dụng Redis INCR với expiration
- Return 429 Too Many Requests khi vượt limit

Ngăn chặn DDoS và abuse API."

---

## 8. CÂU HỎI VỀ TRIỂN KHAI

### Q8.1: Dự án hiện đang deploy ở đâu?

**Trả lời (nếu chưa deploy):**
"Hiện tại dự án chạy local. Em có kế hoạch deploy lên:
- Frontend: Vercel/Netlify (free tier)
- Backend: Railway/Render (free tier)
- Database: Supabase/ElephantSQL (free PostgreSQL)"

**Trả lời (nếu đã deploy):**
"Dự án đã deploy lên [platform]:
- Frontend: [URL frontend]
- Backend: [URL backend]
- Database: [Cloud provider]"

### Q8.2: Quy trình deploy như thế nào?

**Trả lời:**
"Quy trình deploy:
1. **Push code** lên GitHub
2. **CI/CD**: GitHub Actions build và test
3. **Build**: Maven build JAR, npm build static files
4. **Deploy**: Push lên cloud platform
5. **Database migration**: Flyway tự động chạy
6. **Health check**: Verify services running

Toàn bộ tự động hóa."

### Q8.3: Có CI/CD không?

**Trả lời (nếu có):**
"Có, dùng GitHub Actions:
- Trigger khi push code
- Chạy tests
- Build artifacts
- Deploy lên staging/production

File `.github/workflows/deploy.yml`"

**Trả lời (nếu chưa có):**
"Chưa implement CI/CD, đang deploy manual. Kế hoạch sẽ setup GitHub Actions."

### Q8.4: Môi trường dev và prod khác nhau thế nào?

**Trả lời:**
"Khác nhau ở:

| Aspect | Development | Production |
|--------|-------------|------------|
| Database | Local PostgreSQL | Cloud PostgreSQL |
| Port | 8080/5173 | 80/443 |
| HTTPS | HTTP | HTTPS với SSL |
| Logging | DEBUG level | INFO level |
| Caching | Optional | Always on |
| AI calls | Có thể mock | Real API |

Config bằng Spring profiles: dev, prod"

### Q8.5: Scalability của hệ thống thế nào?

**Trả lời:**
"Hệ thống có thể scale:
1. **Horizontal scaling**: Deploy nhiều backend instances behind load balancer
2. **Database**: Thêm read replicas cho PostgreSQL
3. **Cache**: Redis cluster
4. **CDN**: Static assets qua CloudFront

Hiện tại handle được ~1000 concurrent users, scale lên handle 10K-100K."

---

## 9. CÂU HỎI CHUNG

### Q9.1: Điểm nổi bật nhất của dự án là gì?

**Trả lời:**
"Điểm nổi bật nhất là **tích hợp AI một cách thực tế**:
- Không chỉ demo AI mà apply vào use case cụ thể
- AI Matching giúp solve pain point thực sự
- User experience được cải thiện rõ rệt

Kết hợp fullstack + AI là điểm mạnh."

### Q9.2: Khó khăn lớn nhất khi làm dự án?

**Trả lời:**
"Khó khăn lớn nhất là:
1. **Scope management**: Project lớn, nhiều features, phải prioritize
2. **AI integration**: Lần đầu làm việc với LLM, phải học prompt engineering
3. **Performance**: Optimize để AI calls không làm chậm hệ thống

Nhưng em đã overcome bằng research và perseverance."

### Q9.3: Nếu có thêm thời gian, bạn muốn cải thiện gì?

**Trả lời:**
"Nếu có thêm thời gian, em muốn:
1. **Video interview**: Real-time video call với WebRTC
2. **Mobile app**: React Native app
3. **Analytics dashboard**: Cho employer xem insights
4. **More AI features**: Career path recommendation
5. **Better testing**: Increase test coverage

Nhưng hiện tại đã đạt được core features."

### Q9.4: Dự án này áp dụng được trong thực tế không?

**Trả lời:**
"Hoàn toàn có thể áp dụng:
1. **Tech stack production-ready**: Spring Boot, React đang dùng rộng rãi
2. **Scalable architecture**: Có thể scale khi user tăng
3. **Real use case**: Tuyển dụng là nhu cầu thực tế
4. **Value proposition**: AI matching tiết kiệm thời gian

Cần thêm:
- Polish UX/UI
- Marketing và user acquisition
- Legal compliance (GDPR)"

### Q9.5: Học được gì từ dự án này?

**Trả lời:**
"Em học được rất nhiều:
1. **Technical**: Full-stack development, AI integration, system design
2. **Soft skills**: Time management, problem solving, self-learning
3. **Best practices**: Security, testing, documentation
4. **Real-world**: Production-ready application requirements

Là foundation tốt cho career sau này."

---

## 💡 TIPS TRẢ LỜI CÂU HỎI

### Công thức trả lời hiệu quả:

1. **Trả lời ngắn trước**
   - Đi thẳng vào câu trả lời trong 1-2 câu
   - Nếu người hỏi muốn biết thêm, họ sẽ hỏi tiếp

2. **Có ví dụ cụ thể**
   - Đừng chỉ nói lý thuyết
   - Cho ví dụ thực tế trong dự án

3. **Thành thật nếu không biết**
   - "Em chưa tìm hiểu sâu về vấn đề này"
   - "Em sẽ research thêm và trả lời sau"

4. **Tự tin nhưng khiêm tốn**
   - Không nói "Em biết tất cả"
   - Nhấn mạnh đây là learning project

5. **Link với dự án của bạn**
   - Đưa câu hỏi về context dự án JobVerse
   - Show understanding về ứng dụng thực tế

### Các câu trả lời chuẩn bị sẵn:

**Nếu hỏi về performance:**
"Em đã optimize bằng caching với Redis, database indexing và pagination. Response time trung bình dưới 200ms."

**Nếu hỏi về security:**
"Em implement JWT authentication, BCrypt password hashing, input validation và CORS config."

**Nếu hỏi về testing:**
"Em có unit tests cho services, integration tests cho APIs và E2E tests với Playwright."

**Nếu hỏi về scalability:**
"Architecture cho phép horizontal scaling backend và database read replicas khi cần."

---

## 🎯 LƯU Ý QUAN TRỌNG

### Điều nên làm:
✅ Trả lời tự tin và rõ ràng
✅ Thừa nhận nếu không biết
✅ Cho ví dụ cụ thể từ dự án
✅ Giữ câu trả lời ngắn gọn (30-60 giây)
✅ Nhìn người hỏi khi trả lời

### Điều không nên làm:
❌ Nói dài dòng, lan man
❌ Bịa đặt nếu không biết
❌ So sánh với dự án khác một cách tiêu cực
❌ Nói quá kỹ thuật khó hiểu
❌ Thiếu tự tin, ngập ngừng

---

**Chúc bạn trả lời câu hỏi thành công! 💪**
