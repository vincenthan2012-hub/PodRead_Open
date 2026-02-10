# Render 环境变量快速参考

## 📋 配置清单

### ✅ 后端服务 (`podread-email-api`)

在 Render Dashboard → `podread-email-api` → Environment 中添加：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**获取后端服务 URL：**
- 部署完成后，在服务详情页查看 URL
- 格式：`https://podread-email-api.onrender.com`
- API 端点：`https://podread-email-api.onrender.com/api/send-email`

---

### ✅ 前端服务 (`podread`)

在 Render Dashboard → `podread` → Environment 中添加：

#### 必需变量

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_EMAIL_API_URL=https://podread-email-api.onrender.com/api/send-email
```

#### 可选变量（AI 配置）

```env
VITE_AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
```

#### 可选变量（设置面板默认值）

```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=465
VITE_SMTP_USER=your_email@gmail.com
```

**⚠️ 不要设置 `VITE_SMTP_PASS`**（安全风险）

---

## 🔄 配置顺序

1. ✅ 部署两个服务（自动，基于 `render.yaml`）
2. ✅ 配置后端服务环境变量
3. ✅ 获取后端服务 URL
4. ✅ 配置前端服务环境变量（包含 `VITE_EMAIL_API_URL`）
5. ✅ 等待重新部署完成
6. ✅ 测试功能

---

## 🔍 验证配置

### 检查后端服务
访问：`https://podread-email-api.onrender.com/health`

应该返回：
```json
{"status":"ok","timestamp":"..."}
```

### 检查前端服务
- 访问前端 URL
- 打开浏览器控制台（F12）
- 确认没有环境变量错误

---

## 📚 详细文档

- **完整配置指南**：查看 `RENDER_ENV_SETUP.md`
- **部署指南**：查看 `DEPLOYMENT.md`
- **环境变量说明**：查看 `ENV_FILES_EXPLANATION.md`

---

## ⚡ 快速链接

- [Render Dashboard](https://dashboard.render.com)
- [Gmail 应用专用密码](https://myaccount.google.com/apppasswords)
- [Supabase Dashboard](https://app.supabase.com)

