# 🚨 Sửa lỗi AI Chat nhanh

## ✅ Đã sửa giao diện:
1. ✅ Chat box giờ nổi lên trên tất cả (z-index: 9999)
2. ✅ API endpoint đã dùng đúng URL từ .env

## 🔄 BẠN CẦN RESTART BACKEND NGAY:

### Cách 1: Dùng script tự động (KHUYÊN DÙNG)
```bash
# Click đúp vào file này:
RESTART_BACKEND.bat
```

### Cách 2: Thủ công

**Bước 1: Dừng backend cũ**
```bash
# Tìm process
netstat -ano | findstr :8080

# Kill process (thay 40268 bằng số PID thật)
taskkill /F /PID 40268
```

**Bước 2: Start backend mới**
```bash
cd jobverse-backend
mvnw.cmd spring-boot:run
```

---

## ⏳ Sau khi restart (đợi ~30 giây)

### Test backend:
```bash
curl -X POST http://localhost:8080/api/v1/ai/chat/guest ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"hello\"}"
```

**Kết quả đúng:**
```json
{
  "success": true,
  "data": {
    "reply": "Xin chào! 👋 Tôi là AI Career Coach..."
  }
}
```

### Test trên Frontend:
1. Mở http://localhost:3001
2. Click button **AI Career Coach** (góc dưới phải)
3. Chat box giờ sẽ nổi lên TRÊN tất cả
4. Gõ: **hello**
5. AI sẽ trả lời ngay!

---

## 💬 Tin nhắn test hay:

| Tin nhắn | AI sẽ trả lời về |
|----------|------------------|
| `xin chào` | Giới thiệu dịch vụ |
| `tư vấn cv` | Hướng dẫn viết CV |
| `phỏng vấn react` | Tips phỏng vấn React |
| `lương frontend` | Mức lương Frontend VN |
| `học react` | Roadmap học React |

---

## ❌ Nếu vẫn lỗi:

### 1. Backend chưa restart
```bash
# Kiểm tra backend có đang chạy không
curl http://localhost:8080/api/v1/ai/chat/guest
```

### 2. Frontend cache
```bash
# Refresh trình duyệt
Ctrl + Shift + R (Chrome)
Ctrl + F5 (Firefox)
```

### 3. Check console
- F12 → Tab Console
- Xem lỗi gì

---

## 🎯 TÓM TẮT:

1. ✅ Giao diện đã sửa (z-index cao, API đúng)
2. ⏳ **RESTART BACKEND** (dùng RESTART_BACKEND.bat)
3. ⏳ Đợi 30 giây
4. ✅ Test AI Chat

**QUAN TRỌNG:** Phải restart backend thì code mới mới hoạt động!
