# 🚀 JobVerse - AI-Powered Job Portal

Nền tảng tuyển dụng việc làm thông minh với giao diện dark theme hiện đại, animations mượt mà và các tính năng AI độc đáo.

![JobVerse Preview](https://via.placeholder.com/800x400/0a0a0b/8b5cf6?text=JobVerse+-+AI+Job+Portal)

## ✨ Tính năng nổi bật

- 🤖 **AI Matching** - Đề xuất việc làm phù hợp với kỹ năng
- 📹 **Video Interview** - Phỏng vấn qua video với AI đánh giá
- 💰 **Salary Insights** - Dữ liệu mức lương thị trường real-time
- ⚡ **Quick Apply** - Ứng tuyển chỉ với 1 click
- 🎯 **Skill Assessment** - Đánh giá kỹ năng với chứng chỉ
- 💬 **AI Career Coach** - Chatbot tư vấn sự nghiệp 24/7
- 👆 **Swipe to Apply** - Vuốt để ứng tuyển (kiểu Tinder)
- 🎤 **Voice Search** - Tìm kiếm bằng giọng nói

## 🎨 Thiết kế

- Dark theme (đen xám) chuyên nghiệp
- Glass morphism effects
- Smooth animations & micro-interactions
- Responsive trên mọi thiết bị
- Cursor glow effect
- Floating particles background

## 🛠 Tech Stack

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS
- Lucide React (icons)

**Backend (cần phát triển thêm):**
- Spring Boot
- PostgreSQL/MySQL
- JWT Authentication
- RESTful API

---

## 📦 Cài đặt & Chạy Local

### Yêu cầu
- Node.js 18+ 
- npm hoặc yarn

### Bước 1: Giải nén và vào thư mục project

```bash
cd jobverse
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Chạy development server

```bash
npm run dev
```

### Bước 4: Mở trình duyệt

Truy cập: **http://localhost:3000**

---

## 🚀 Deploy lên Production

### Option 1: Deploy lên Vercel (Khuyến nghị - Miễn phí)

#### Cách 1: Deploy qua Git

1. Push code lên GitHub/GitLab/Bitbucket
2. Truy cập [vercel.com](https://vercel.com)
3. Đăng nhập và click "New Project"
4. Import repository từ Git
5. Vercel tự động detect Vite và deploy

#### Cách 2: Deploy qua Vercel CLI

```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

### Option 2: Deploy lên Netlify (Miễn phí)

#### Cách 1: Drag & Drop

1. Build project:
```bash
npm run build
```

2. Truy cập [app.netlify.com](https://app.netlify.com)
3. Kéo thả thư mục `dist` vào trang Netlify

#### Cách 2: Deploy qua Git

1. Push code lên GitHub
2. Kết nối repo với Netlify
3. Cấu hình:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Cách 3: Deploy qua Netlify CLI

```bash
# Cài đặt Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy preview
netlify deploy

# Deploy production
netlify deploy --prod
```

### Option 3: Deploy lên Firebase Hosting (Miễn phí)

```bash
# Cài đặt Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Khởi tạo project
firebase init hosting

# Chọn:
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite index.html: No

# Build
npm run build

# Deploy
firebase deploy
```

### Option 4: Deploy lên GitHub Pages (Miễn phí)

1. Thêm vào `vite.config.js`:
```javascript
export default defineConfig({
  base: '/jobverse/', // tên repo của bạn
  // ... config khác
})
```

2. Cài đặt gh-pages:
```bash
npm install -D gh-pages
```

3. Thêm scripts vào `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

### Option 5: Deploy lên Railway/Render (Miễn phí tier)

1. Push code lên GitHub
2. Tạo account tại [railway.app](https://railway.app) hoặc [render.com](https://render.com)
3. Kết nối GitHub repo
4. Cấu hình:
   - Build command: `npm run build`
   - Start command: `npm run preview`

---

## 📁 Cấu trúc Project

```
jobverse/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Component chính
│   ├── main.jsx         # Entry point
│   └── index.css        # Styles + Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🔧 Scripts

| Command | Mô tả |
|---------|-------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run preview` | Preview production build |

---

## 🌐 Environment Variables (Tùy chọn)

Tạo file `.env` nếu cần:

```env
VITE_API_URL=https://api.jobverse.com
VITE_APP_NAME=JobVerse
```

---

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 🔮 Roadmap - Tính năng sắp tới

- [ ] Tích hợp Spring Boot Backend
- [ ] Authentication (Login/Register)
- [ ] Upload CV với AI Parser
- [ ] Video Interview Recording
- [ ] Real-time Chat
- [ ] Push Notifications
- [ ] Mobile App (React Native)

---

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Pull Request hoặc Issue.

---

## 📞 Liên hệ

- Website: [jobverse.com](https://jobverse.com)
- Email: contact@jobverse.com
- GitHub: [@jobverse](https://github.com/jobverse)

---

Made with ❤️ in Vietnam
