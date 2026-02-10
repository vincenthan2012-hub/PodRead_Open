# 环境变量配置说明

本文档详细说明 PodRead 应用支持的所有环境变量。

## 必需的环境变量

这些环境变量是应用运行所必需的，必须配置。

### Supabase 配置

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL | 在 Supabase Dashboard → Settings → API 中获取 |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 在 Supabase Dashboard → Settings → API 中获取 |

## 可选的环境变量

这些环境变量用于设置默认配置，可以在应用内的设置面板中覆盖。

### AI 提供商配置

| 变量名 | 说明 | 可选值 | 默认值 |
|--------|------|--------|--------|
| `VITE_AI_PROVIDER` | 默认 AI 提供商 | `gemini`, `deepseek`, `siliconflow`, `openrouter`, `ollama`, `custom` | `gemini` |
| `VITE_AI_API_URL` | AI API 端点 URL | 根据提供商填写，如 `https://api.deepseek.com/v1` | 根据提供商自动设置 |
| `VITE_AI_MODEL_NAME` | 默认模型名称 | 根据提供商填写，如 `gemini-3-pro-preview`, `deepseek-chat` | `gemini-3-pro-preview` |
| `VITE_AI_API_KEY` | AI API 密钥 | 如果使用非 Gemini 提供商，填写对应的 API 密钥 | - |
| `GEMINI_API_KEY` | Gemini API 密钥 | 如果使用 Gemini 提供商，填写 Gemini API 密钥 | - |

### SMTP 邮件配置

| 变量名 | 说明 | 示例值 | 默认值 |
|--------|------|--------|--------|
| `VITE_SMTP_HOST` | SMTP 服务器地址 | `smtp.gmail.com`, `smtp.qq.com` | - |
| `VITE_SMTP_PORT` | SMTP 端口 | `465` (SSL), `587` (TLS) | `465` |
| `VITE_SMTP_USER` | 邮箱地址 | `your_email@gmail.com` | - |
| `VITE_SMTP_PASS` | 应用专用密码 | 邮箱的应用专用密码（不是登录密码） | - |

## 配置示例

### 完整配置示例

```env
# Supabase Configuration (必需)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Provider Configuration (可选)
VITE_AI_PROVIDER=gemini
VITE_AI_API_URL=
VITE_AI_MODEL_NAME=gemini-3-pro-preview
GEMINI_API_KEY=AIzaSy...

# SMTP Email Configuration (可选)
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=465
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASS=your_app_password
```

### 使用 DeepSeek 的配置示例

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

VITE_AI_PROVIDER=deepseek
VITE_AI_API_URL=https://api.deepseek.com/v1
VITE_AI_MODEL_NAME=deepseek-chat
VITE_AI_API_KEY=sk-...
```

### 使用自定义 SMTP 的配置示例

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=465
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASS=your_app_password
```

## 环境变量优先级

1. **应用内设置** (最高优先级) - 用户在设置面板中配置的值
2. **环境变量** - 从 `.env` 文件或部署平台读取的值
3. **默认值** - 代码中定义的默认值

## 安全建议

1. **永远不要**将 `.env` 文件提交到 Git 仓库
2. 在生产环境中，使用部署平台的环境变量配置功能
3. 定期轮换 API 密钥和密码
4. 使用应用专用密码而不是账户登录密码（对于 SMTP）
5. 限制 API 密钥的权限范围

## 常见问题

### Q: 环境变量和应用内设置有什么区别？

A: 环境变量用于设置默认值，适合团队统一配置。应用内设置允许每个用户自定义配置，优先级更高。

### Q: 如果同时设置了环境变量和应用内设置，会使用哪个？

A: 应用内设置的优先级更高。环境变量只在用户首次使用或未配置时生效。

### Q: 如何获取 Gmail 的应用专用密码？

A: 
1. 登录 Google 账户
2. 进入"安全性" → "两步验证"
3. 在"应用专用密码"部分生成新密码
4. 使用生成的 16 位密码作为 `VITE_SMTP_PASS`

### Q: 支持哪些 SMTP 服务商？

A: 支持所有标准的 SMTP 服务，包括：
- Gmail (smtp.gmail.com:465)
- Outlook (smtp-mail.outlook.com:587)
- QQ 邮箱 (smtp.qq.com:465)
- 163 邮箱 (smtp.163.com:465)
- 其他支持 SMTP 的邮件服务

