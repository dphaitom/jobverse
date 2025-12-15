# 🚀 Hướng dẫn tích hợp các tính năng nâng cao

## 📍 1. API Search Địa điểm

### Option A: Mapbox (Khuyên dùng - Free 100k/month)

```javascript
// .env
VITE_MAPBOX_TOKEN=your_mapbox_token

// src/services/locationService.js
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const searchLocations = async (query) => {
  if (!query || query.length < 2) return [];
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=vn&types=place&limit=5&language=vi`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  return data.features.map(f => ({
    id: f.id,
    name: f.place_name_vi || f.place_name
  }));
};
```

### Option B: Backend Static List

```java
@RestController
@RequestMapping("/v1/locations")
public class LocationController {
    
    private static final List<String> CITIES = List.of(
        "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", 
        "Cần Thơ", "Biên Hòa", "Nha Trang", "Huế"
    );
    
    @GetMapping("/search")
    public List<String> search(@RequestParam String q) {
        return CITIES.stream()
            .filter(c -> c.toLowerCase().contains(q.toLowerCase()))
            .limit(5).toList();
    }
}
```

---

## 🔐 2. Đăng nhập Google OAuth2

### Bước 1: Tạo Google Credentials

1. Vào https://console.cloud.google.com/
2. APIs & Services > Credentials > Create OAuth Client ID
3. Web application > Thêm redirect URI:
   - `http://localhost:5173` (frontend)
4. Copy Client ID

### Bước 2: Frontend - Cài Google Sign-In

```bash
npm install @react-oauth/google
```

### Bước 3: Frontend - Wrap App với GoogleOAuthProvider

```jsx
// main.jsx
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
```

### Bước 4: Frontend - Nút đăng nhập Google

```jsx
// src/components/GoogleLoginButton.jsx
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  
  const handleSuccess = async (credentialResponse) => {
    try {
      const result = await fetch('/api/v1/auth/oauth2/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await result.json();
      
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log('Login Failed')}
      theme="filled_black"
      size="large"
      text="continue_with"
      shape="rectangular"
    />
  );
};

export default GoogleLoginButton;
```

### Bước 5: Backend - OAuth2 Controller

```java
// src/main/java/com/jobverse/controller/OAuth2Controller.java
package com.jobverse.controller;

@RestController
@RequestMapping("/v1/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {
    
    private final OAuth2Service oauth2Service;
    
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @RequestBody Map<String, String> request
    ) {
        String idToken = request.get("token");
        AuthResponse response = oauth2Service.handleGoogleLogin(idToken);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
```

### Bước 6: Backend - OAuth2Service

```java
// src/main/java/com/jobverse/service/OAuth2Service.java
package com.jobverse.service;

@Service
@RequiredArgsConstructor
public class OAuth2Service {
    
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Value("${google.client-id}")
    private String googleClientId;
    
    @Transactional
    public AuthResponse handleGoogleLogin(String idTokenString) {
        try {
            // Verify token với Google
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
            
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) throw new RuntimeException("Invalid token");
            
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            
            // Tìm hoặc tạo user
            User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setPasswordHash("");
                    newUser.setRole(User.Role.CANDIDATE);
                    newUser.setStatus(User.Status.ACTIVE);
                    newUser.setEmailVerified(true);
                    newUser.setOauthProvider("google");
                    User saved = userRepository.save(newUser);
                    
                    // Tạo profile
                    UserProfile profile = new UserProfile();
                    profile.setUser(saved);
                    profile.setFullName(name);
                    profile.setAvatarUrl(picture);
                    userProfileRepository.save(profile);
                    
                    return saved;
                });
            
            // Generate tokens
            String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
            
            return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponse.fromEntity(user))
                .build();
                
        } catch (Exception e) {
            throw new RuntimeException("Google auth failed: " + e.getMessage());
        }
    }
}
```

### Bước 7: Thêm vào LoginPage

```jsx
// Trong LoginPage.jsx, thêm sau form login
<div className="my-6 flex items-center">
  <div className="flex-1 border-t border-gray-700"></div>
  <span className="px-4 text-gray-500 text-sm">hoặc</span>
  <div className="flex-1 border-t border-gray-700"></div>
</div>

<GoogleLoginButton />
```

---

## 🤖 3. Chat với AI (OpenAI Integration)

### Bước 1: Lấy API Key

1. Vào https://platform.openai.com/
2. API Keys > Create new secret key
3. Copy key

### Bước 2: Backend - Cấu hình

```yaml
# application.yml
openai:
  api-key: ${OPENAI_API_KEY}
  model: gpt-3.5-turbo
```

### Bước 3: Backend - AI Service

```java
// src/main/java/com/jobverse/service/AIService.java
package com.jobverse.service;

@Service
@RequiredArgsConstructor
public class AIService {
    
    @Value("${openai.api-key}")
    private String apiKey;
    
    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public String chat(String userMessage, String context) {
        String systemPrompt = """
            Bạn là AI Career Coach của JobVerse - nền tảng tuyển dụng IT.
            Bạn giúp ứng viên:
            - Tư vấn định hướng nghề nghiệp
            - Review và cải thiện CV
            - Chuẩn bị phỏng vấn
            - Đề xuất việc làm phù hợp
            Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
            """ + (context != null ? "\nThông tin user: " + context : "");
        
        Map<String, Object> request = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            ),
            "max_tokens", 500,
            "temperature", 0.7
        );
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(
            "https://api.openai.com/v1/chat/completions",
            entity,
            Map.class
        );
        
        Map<String, Object> body = response.getBody();
        List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        
        return (String) message.get("content");
    }
}
```

### Bước 4: Backend - AI Controller

```java
// src/main/java/com/jobverse/controller/AIController.java
package com.jobverse.controller;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AIController {
    
    private final AIService aiService;
    
    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, String> request
    ) {
        String message = request.get("message");
        String context = "Email: " + currentUser.getEmail() + ", Role: " + currentUser.getRole();
        
        String reply = aiService.chat(message, context);
        
        return ResponseEntity.ok(ApiResponse.success("Reply generated", Map.of("reply", reply)));
    }
    
    // Endpoint không cần đăng nhập (giới hạn tính năng)
    @PostMapping("/chat/guest")
    public ResponseEntity<ApiResponse<Map<String, String>>> guestChat(
            @RequestBody Map<String, String> request
    ) {
        String message = request.get("message");
        String reply = aiService.chat(message, null);
        
        return ResponseEntity.ok(ApiResponse.success("Reply generated", Map.of("reply", reply)));
    }
}
```

### Bước 5: Frontend - AI Chat Component

```jsx
// src/components/AIChat.jsx
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Loader2 } from 'lucide-react';

const AIChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! 👋 Tôi là AI Career Coach. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => scrollToBottom(), [messages]);
  
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = token ? '/api/v1/ai/chat' : '/api/v1/ai/chat/guest';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Không thể kết nối. Vui lòng thử lại sau.' }]);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] glass-card rounded-2xl flex flex-col overflow-hidden z-50 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Career Coach</h3>
            <span className="text-xs text-green-400">● Online</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-violet-600 text-white rounded-br-sm' 
                : 'bg-gray-800 text-gray-200 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-sm">
              <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Hỏi AI Coach..."
            className="flex-1 px-4 py-3 bg-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 bg-violet-600 rounded-xl text-white disabled:opacity-50 hover:bg-violet-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
```

### Bước 6: Sử dụng trong App

```jsx
// Thêm vào HomePage hoặc Layout
const [showAI, setShowAI] = useState(false);

// Floating button
<button 
  onClick={() => setShowAI(true)}
  className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg hover:shadow-violet-500/30"
>
  <Sparkles className="w-6 h-6 text-white" />
</button>

<AIChat isOpen={showAI} onClose={() => setShowAI(false)} />
```

---

## 📦 Tổng kết Dependencies cần cài

### Backend (pom.xml)
```xml
<!-- Google OAuth -->
<dependency>
    <groupId>com.google.api-client</groupId>
    <artifactId>google-api-client</artifactId>
    <version>2.2.0</version>
</dependency>
```

### Frontend (package.json)
```bash
npm install @react-oauth/google
```

### Environment Variables
```env
# Frontend (.env)
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MAPBOX_TOKEN=your_mapbox_token

# Backend (application.yml)
google:
  client-id: your_google_client_id
openai:
  api-key: your_openai_api_key
```