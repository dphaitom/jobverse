# 🚨 QUAN TRỌNG: BẠN CẦN RESTART BACKEND NGAY!

## ✅ Frontend đã OK:
- Chạy tại: **http://localhost:3001**
- Chat box đã sửa z-index: nổi lên trên
- API endpoint đã đúng

## ❌ Backend chưa áp dụng code mới:
Backend đang chạy **CODE CŨ** → Phải restart để load **CODE MỚI**!

---

## 🔄 RESTART BACKEND NGAY (Chọn 1 cách):

### ⚡ Cách 1: Script tự động (NHANH NHẤT)
```bash
# Click đúp vào file:
RESTART_BACKEND.bat
```

### 🔧 Cách 2: Thủ công qua CMD

**Bước 1: Mở CMD/PowerShell mới**

**Bước 2: Chạy lệnh:**
```bash
cd c:\Users\admin\OneDrive\Desktop\QuangThang_Workplace\Code\doan1\jobverse-backend

# Kill backend cũ
taskkill /F /FI "WINDOWTITLE eq *spring-boot*" 2>nul

# Start backend mới
mvnw.cmd spring-boot:run
```

### 🛠️ Cách 3: Dùng IDE (IntelliJ/Eclipse)
1. **Stop** server hiện tại (nút Stop màu đỏ)
2. **Run** lại application main class

---

## ⏳ Sau khi restart (đợi ~30 giây):

### ✅ Test backend:
Mở CMD mới và chạy:
```bash
curl -X POST http://localhost:8080/api/v1/ai/chat/guest -H "Content-Type: application/json" -d "{\"message\":\"hello\"}"
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

### ✅ Test frontend:
1. Mở **http://localhost:3001** (hoặc port bạn đang dùng)
2. **Refresh trang**: `Ctrl + Shift + R`
3. Click **AI Career Coach** button (góc dưới phải)
4. Chat box nổi lên TRÊN
5. Gõ: **hello**
6. AI sẽ trả lời!

---

## 💬 Tin nhắn test:

| Gõ tin nhắn | AI trả lời về |
|-------------|--------------|
| `hello` hoặc `xin chào` | Giới thiệu AI Coach |
| `tư vấn cv` | Hướng dẫn viết CV |
| `phỏng vấn react` | Tips phỏng vấn |
| `lương frontend` | Mức lương IT VN |
| `học react` | Roadmap React |

---

## 📋 TÓM TẮT:

✅ Frontend OK (localhost:3001)
✅ Code backend đã sửa xong
❌ **Backend chưa restart** ← BẠN CẦN LÀM NGAY!

**Hành động:**
1. Restart backend (dùng RESTART_BACKEND.bat)
2. Đợi 30 giây
3. Test AI Chat

---

## ❓ Câu hỏi thường gặp:

**Q: Tại sao phải restart backend?**
A: Code Java không tự reload như React. Phải restart mới load code mới.

**Q: Mất bao lâu?**
A: ~30 giây để backend khởi động lại.

**Q: Làm sao biết backend đã restart xong?**
A: Terminal hiện: "Started JobverseApplication in X seconds"

**Q: Nếu lỗi khi restart?**
A: Check port 8080 có bị chiếm không:
```bash
netstat -ano | findstr :8080
taskkill /F /PID <số_PID>
```

---

## 🎯 LÀM NGAY:

```
1. [ ] Dừng backend cũ
2. [ ] Start backend mới
3. [ ] Đợi 30 giây
4. [ ] Test AI Chat tại localhost:3001
```

**Chúc may mắn! 🚀**
