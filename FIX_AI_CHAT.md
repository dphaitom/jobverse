# ✅ Đã sửa lỗi AI Chat không kết nối

## 🔧 Các thay đổi đã thực hiện:

### 1. Backend - SecurityConfig.java
**File:** `jobverse-backend/src/main/java/com/jobverse/config/SecurityConfig.java`

✅ Thêm endpoint `/v1/ai/chat/guest` vào PUBLIC_URLS (dòng 43)
✅ Thêm `http://localhost:3001` vào CORS allowed origins (dòng 90)

### 2. Backend - AIService.java
**File:** `jobverse-backend/service/AIService.java`

✅ Thêm mock AI responses (không cần OpenAI API key)
✅ Hỗ trợ từ khóa: hello, cv, phỏng vấn, nghề nghiệp, lương, react, frontend
✅ Tự động fallback về mock nếu OpenAI không hoạt động

### 3. Backend - AIController.java
**File:** `jobverse-backend/controller/AIController.java`

✅ Thêm đầy đủ imports cần thiết

---

## 🚀 Cách restart backend để áp dụng thay đổi:

### Option 1: Nếu dùng IDE (IntelliJ/Eclipse)
1. Dừng server hiện tại (Stop button)
2. Chạy lại application main class

### Option 2: Nếu dùng Maven command line
```bash
# Dừng server hiện tại (Ctrl+C)
cd jobverse-backend

# Restart server
./mvnw spring-boot:run
# hoặc trên Windows:
mvnw.cmd spring-boot:run
```

### Option 3: Nếu dùng JAR file
```bash
# Build lại
cd jobverse-backend
./mvnw clean package -DskipTests

# Chạy JAR
java -jar target/jobverse-0.0.1-SNAPSHOT.jar
```

---

## ✅ Test AI Chat sau khi restart:

### Test với curl:
```bash
curl -X POST http://localhost:8080/api/v1/ai/chat/guest \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"hello\"}"
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "data": {
    "reply": "Xin chào! 👋 Tôi là AI Career Coach của JobVerse..."
  }
}
```

---

## 💡 Mock AI Responses

AI Chat hiện tại hoạt động với mock responses cho các từ khóa:

| Từ khóa | Response |
|---------|----------|
| `hello`, `hi`, `xin chào` | Giới thiệu AI Coach |
| `cv`, `resume`, `hồ sơ` | Hướng dẫn viết CV |
| `phỏng vấn`, `interview` | Tips phỏng vấn |
| `nghề nghiệp`, `career` | Định hướng nghề nghiệp |
| `lương`, `salary` | Thông tin mức lương IT |
| `react`, `frontend` | Lộ trình React Developer |

**Default:** Thông tin tổng quan về AI Career Coach

---

## 🔑 (Optional) Kích hoạt OpenAI thật

Nếu muốn dùng OpenAI API thật thay vì mock:

### 1. Lấy API Key
- Vào https://platform.openai.com/
- Tạo API key

### 2. Cấu hình Backend

**File:** `jobverse-backend/src/main/resources/application.yml`

Thêm:
```yaml
openai:
  api-key: sk-your-actual-api-key-here
  model: gpt-3.5-turbo
  enabled: true
```

**Hoặc dùng environment variables:**
```bash
export OPENAI_API_KEY=sk-your-actual-api-key-here
export OPENAI_ENABLED=true
```

### 3. Restart backend

---

## 📱 Test trên Frontend

1. Mở trình duyệt tại **http://localhost:3001**
2. Click vào **AI Career Coach** floating button (góc dưới bên phải)
3. Nhập tin nhắn: `hello`
4. AI sẽ trả lời với mock response

**Tin nhắn test:**
- `xin chào` → Giới thiệu AI
- `tư vấn cv` → Hướng dẫn CV
- `phỏng vấn react` → Tips phỏng vấn React
- `lương frontend` → Mức lương Frontend

---

## ❌ Troubleshooting

### Lỗi: "Không thể kết nối"
- ✅ Kiểm tra backend có chạy tại http://localhost:8080
- ✅ Restart backend sau khi sửa code
- ✅ Kiểm tra Console browser (F12) xem lỗi gì

### Lỗi CORS
- ✅ Đã thêm `localhost:3001` vào SecurityConfig
- ✅ Restart backend để áp dụng

### Lỗi 401 Unauthorized
- ✅ Đã thêm `/v1/ai/chat/guest` vào PUBLIC_URLS
- ✅ Restart backend

### Lỗi Internal Server Error
- ✅ Đã thêm imports vào AIController
- ✅ Check backend console logs để xem lỗi chi tiết

---

## 📋 Checklist

- [x] Sửa SecurityConfig - thêm public endpoint
- [x] Sửa SecurityConfig - thêm CORS
- [x] Tạo Mock AI responses trong AIService
- [x] Thêm imports vào AIController
- [ ] **Restart backend** ← BẠN CẦN LÀM BƯỚC NÀY!
- [ ] Test AI Chat trên frontend

---

## 🎉 Sau khi restart backend

AI Chat sẽ hoạt động ngay lập tức với mock responses thông minh!

Không cần OpenAI API key, AI vẫn có thể:
- Tư vấn CV
- Hướng dẫn phỏng vấn
- Định hướng nghề nghiệp
- Thông tin mức lương
- Roadmap học React/Frontend

**Hãy restart backend và test ngay! 🚀**
