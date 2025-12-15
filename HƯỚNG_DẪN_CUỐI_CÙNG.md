# 🚨 AI CHAT CẦN BACKEND ĐỂ HOẠT ĐỘNG!

## ❌ Tại sao không hoạt động khi chỉ chạy Frontend?

**AI Chat** gọi API backend tại: `http://localhost:8080/api/v1/ai/chat/guest`

Nếu **không có backend** → Lỗi: **"Không thể kết nối"**

---

## ✅ GIẢI PHÁP: BẠN CẦN CHẠY CẢ 2

### 📍 Cần chạy:
1. ✅ **Frontend** - localhost:3001 (đang chạy rồi)
2. ❌ **Backend** - localhost:8080 (BẠN CẦN START)

---

## 🚀 CÁCH START BACKEND (Chọn 1):

### ⚡ Cách 1: Script tự động (NHANH NHẤT)

**Click đúp vào file:**
```
START_BACKEND_SIMPLE.bat
```

Đợi 30 giây, backend sẽ chạy!

---

### 🔧 Cách 2: Thủ công qua CMD

**Mở CMD mới**, chạy:

```bash
cd c:\Users\admin\OneDrive\Desktop\QuangThang_Workplace\Code\doan1\jobverse-backend

mvnw.cmd spring-boot:run
```

Đợi 30 giây cho backend khởi động.

---

### 🛠️ Cách 3: Dùng IDE

Nếu bạn có IntelliJ IDEA hoặc Eclipse:

1. Mở project `jobverse-backend`
2. Tìm file `JobverseApplication.java`
3. Click **Run** (nút ▶️)

---

## ⏳ SAU KHI BACKEND CHẠY (30 giây):

### ✅ Kiểm tra backend có chạy chưa:

**Mở CMD mới**, test:
```bash
curl http://localhost:8080/api/v1/ai/chat/guest -X POST -H "Content-Type: application/json" -d "{\"message\":\"hello\"}"
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

### ✅ Test AI Chat trên Frontend:

1. Mở **http://localhost:3001** (hoặc port bạn đang dùng)
2. **Refresh**: `Ctrl + Shift + R`
3. Click **AI Career Coach** (góc dưới phải)
4. Chat box nổi lên
5. Gõ: **hello**
6. **AI sẽ trả lời!** 🎉

---

## 💬 Tin nhắn test hay:

| Bạn gõ | AI trả lời |
|--------|-----------|
| `hello` hoặc `xin chào` | Giới thiệu AI Coach |
| `tư vấn cv` | Hướng dẫn viết CV |
| `phỏng vấn react` | Tips phỏng vấn |
| `lương frontend` | Mức lương IT |
| `học react` | Roadmap React |

---

## ❓ FAQ

**Q: Tại sao cần backend?**
A: AI Chat gọi API backend để xử lý tin nhắn. Frontend chỉ là giao diện.

**Q: Backend mất bao lâu để start?**
A: Khoảng 30 giây.

**Q: Làm sao biết backend đã chạy?**
A: Terminal hiển thị: `Started JobverseApplication in X seconds`

**Q: Nếu backend lỗi khi start?**
A: Kiểm tra:
- Java đã cài chưa: `java -version`
- Port 8080 có bị chiếm không: `netstat -ano | findstr :8080`

**Q: Có thể test AI mà không cần backend không?**
A: KHÔNG! Phải có backend.

---

## 📋 CHECKLIST HOÀN CHỈNH:

- [x] Frontend đang chạy (localhost:3001)
- [ ] **← START BACKEND** (dùng START_BACKEND_SIMPLE.bat)
- [ ] Đợi 30 giây
- [ ] Test backend bằng curl
- [ ] Test AI Chat trên trình duyệt

---

## 🎯 TÓM TẮT:

```
Frontend (localhost:3001) ──┐
                              ├──> CẦN CẢ HAI ĐỂ AI CHAT HOẠT ĐỘNG
Backend (localhost:8080) ──┘
```

**BẠN CẦN LÀM NGAY:**
1. Click đúp `START_BACKEND_SIMPLE.bat`
2. Đợi 30 giây
3. Test AI Chat

**Chúc may mắn! 🚀**
