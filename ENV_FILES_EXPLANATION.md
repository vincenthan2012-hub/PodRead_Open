# 环境变量文件说明

## 两个 .env 文件的作用

项目中有两个 `.env` 文件，它们服务于不同的服务，**不需要合并**。

### 1. 根目录的 `.env`（前端配置）

**位置**: `/项目根目录/.env`

**用途**: 前端应用（Vite）的环境变量

**特点**:
- 所有变量必须以 `VITE_` 开头（Vite 的要求）
- 这些变量会被打包到前端代码中
- 在浏览器中可以通过 `import.meta.env.VITE_*` 访问

**包含的变量**:
```env
# Supabase 配置（必需）
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# AI 配置（可选）
VITE_AI_PROVIDER=...
VITE_AI_API_URL=...
VITE_AI_MODEL_NAME=...
VITE_AI_API_KEY=...

# 邮件 API 配置（重要！）
VITE_EMAIL_API_URL=http://localhost:3000/api/send-email

# SMTP 配置（可选，仅用于前端设置面板显示）
# 注意：这些不会真正用于发送邮件，只是让用户在设置中看到
VITE_SMTP_HOST=...
VITE_SMTP_PORT=...
VITE_SMTP_USER=...
VITE_SMTP_PASS=...
```

**重要说明**:
- `VITE_SMTP_*` 变量只是用于前端设置面板的默认值显示
- **实际邮件发送使用的是后端 API**，后端有自己的 SMTP 配置
- `VITE_EMAIL_API_URL` 是连接前端和后端的关键变量

### 2. server/.env（后端配置）

**位置**: `/server/.env`

**用途**: 后端 API 服务器的环境变量

**特点**:
- 使用 `dotenv` 加载，不需要 `VITE_` 前缀
- 这些变量只在服务器端使用，不会暴露给前端
- 用于实际的邮件发送功能

**包含的变量**:
```env
# 服务器配置
PORT=3000

# SMTP 配置（实际用于发送邮件）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**重要说明**:
- 这些 SMTP 配置是后端实际使用的
- 如果前端请求中提供了 `smtpConfig`，会优先使用请求中的配置
- 否则使用这里的环境变量作为默认值

## 为什么不需要合并？

### 1. 不同的服务
- **前端**：运行在浏览器中，使用 Vite 构建
- **后端**：运行在 Node.js 服务器上

### 2. 不同的加载方式
- **前端**：Vite 在构建时读取 `VITE_` 前缀的变量
- **后端**：使用 `dotenv` 在运行时读取 `server/.env`

### 3. 安全性考虑
- 后端的 SMTP 密码不应该暴露给前端
- 如果合并，前端的 `VITE_SMTP_PASS` 会被打包到前端代码中，任何人都可以看到

## 配置流程

### 本地开发

1. **配置后端** (`server/.env`):
```bash
cd server
cp env.example .env
# 编辑 .env，填写 SMTP 配置
```

2. **配置前端** (根目录 `.env`):
```bash
# 在项目根目录
cp env.example .env
# 编辑 .env，填写：
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_EMAIL_API_URL=http://localhost:3000/api/send-email
```

### 生产环境（Render）

1. **后端服务** (`podread-email-api`):
   - 在 Render Dashboard 中配置：
     - `SMTP_HOST`
     - `SMTP_PORT`
     - `SMTP_USER`
     - `SMTP_PASS`

2. **前端服务** (`podread`):
   - 在 Render Dashboard 中配置：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_EMAIL_API_URL=https://podread-email-api.onrender.com/api/send-email`

## 常见问题

### Q: 为什么前端也有 SMTP 配置？

**A**: 这些配置（`VITE_SMTP_*`）只是用于：
1. 在设置面板中显示默认值
2. 让用户可以在前端设置中配置（这些设置会保存到数据库）
3. 当用户点击"发送邮件"时，这些设置会通过 API 请求传递给后端

**但实际发送邮件的是后端**，使用 `server/.env` 中的配置或请求中的 `smtpConfig`。

### Q: 可以删除前端的 SMTP 配置吗？

**A**: 可以，但：
- 如果删除，用户需要在应用内的设置面板手动输入 SMTP 配置
- 这些配置会通过 API 请求传递给后端
- 或者后端使用 `server/.env` 中的默认配置

### Q: 两个文件中的 SMTP 配置需要一致吗？

**A**: 不需要完全一致：
- 前端配置：用于设置面板的默认值显示
- 后端配置：实际发送邮件时使用（如果请求中没有提供 `smtpConfig`）

**推荐做法**：
- 后端配置：设置你常用的 SMTP 服务器（作为默认值）
- 前端配置：可以留空，让用户在应用内设置

### Q: 如何确保安全性？

**A**: 
1. ✅ **后端密码** (`server/.env` 中的 `SMTP_PASS`)：安全，只在服务器端使用
2. ⚠️ **前端密码** (`VITE_SMTP_PASS`)：会被打包到前端代码中，**不推荐在生产环境使用**
3. ✅ **推荐做法**：前端不配置 SMTP 密码，让用户在应用内设置，然后通过 API 请求传递给后端

## 总结

- ✅ **两个文件分开管理**，不需要合并
- ✅ **前端配置**：主要用于连接后端 API 和显示默认值
- ✅ **后端配置**：实际用于发送邮件
- ✅ **安全性**：后端密码不会暴露给前端

