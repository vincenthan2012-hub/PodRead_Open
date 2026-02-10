# 邮件 API 快速开始指南

## 5 分钟快速设置

### 步骤 1: 安装后端依赖

```bash
cd server
cd server
```

### 步骤 2: 配置环境变量

```bash
cd server
cp env.example .env
```

编辑 `server/.env` 文件，填写你的 SMTP 配置：

```env
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Gmail 用户注意：**
- 需要启用两步验证
- 生成应用专用密码：https://myaccount.google.com/apppasswords
- 使用应用专用密码作为 `SMTP_PASS`（不是你的登录密码）

### 步骤 3: 启动后端服务器

```bash
cd server
npm start
```

你应该看到：
```
Email API server running on port 3000
Health check: http://localhost:3000/health
Email endpoint: http://localhost:3000/api/send-email
```

### 步骤 4: 配置前端

在项目根目录的 `.env` 文件中添加：

```env
VITE_EMAIL_API_URL=http://localhost:3000/api/send-email
```

### 步骤 5: 测试

1. 启动前端应用（如果还没启动）：
```bash
npm run dev
```

2. 在应用中：
   - 选择一些章节
   - 点击 "Push to Email" 按钮
   - 检查你的邮箱

## 部署到 Render

### 自动部署（推荐）

项目已经配置好了 `render.yaml`，包含前端和后端两个服务。

1. **推送代码到 GitHub**

2. **在 Render Dashboard**：
   - 两个服务会自动创建
   - 前端服务：`podread`
   - 后端服务：`podread-email-api`

3. **配置后端服务环境变量**：
   - 进入 `podread-email-api` 服务
   - 在 Environment 标签页添加：
     - `SMTP_HOST`
     - `SMTP_PORT`
     - `SMTP_USER`
     - `SMTP_PASS`

4. **配置前端服务环境变量**：
   - 进入 `podread` 服务
   - 在 Environment 标签页添加：
     - `VITE_EMAIL_API_URL` = `https://podread-email-api.onrender.com/api/send-email`
     - （替换为你的实际后端服务 URL）

5. **等待部署完成**

### 手动部署

如果你想单独部署后端服务：

1. 在 Render Dashboard 创建新的 Web Service
2. 连接 GitHub 仓库
3. 设置：
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. 添加环境变量（同上）

## 验证部署

### 检查后端服务

访问健康检查端点：
```
https://your-backend-url.onrender.com/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 测试邮件发送

使用 curl 测试：

```bash
curl -X POST https://your-backend-url.onrender.com/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "content": "This is a test email from PodRead API"
  }'
```

## 常见问题

### Q: 后端服务启动失败

**A:** 检查：
- Node.js 版本 >= 18
- 端口 3000 是否被占用
- 环境变量是否正确配置

### Q: 邮件发送失败

**A:** 检查：
- SMTP 配置是否正确
- 是否使用了应用专用密码（Gmail）
- 防火墙是否阻止了 SMTP 连接

### Q: 前端无法连接到后端

**A:** 检查：
- `VITE_EMAIL_API_URL` 是否正确
- 后端服务是否正常运行
- CORS 设置（已默认启用）

### Q: Render 部署后无法访问

**A:** 检查：
- 服务是否已成功部署（查看日志）
- 环境变量是否已正确设置
- 等待几分钟让服务完全启动（免费版可能需要一些时间）

## 下一步

- 查看 `server/README.md` 了解详细配置
- 查看 `EMAIL_SETUP.md` 了解完整文档
- 考虑添加 API 密钥认证以提高安全性

