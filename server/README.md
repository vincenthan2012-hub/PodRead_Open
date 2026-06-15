# PodRead Email API Server

这是 PodRead 应用的邮件发送后端 API 服务。

## 功能

- 接收前端请求并发送邮件
- 支持自定义 SMTP 配置（通过请求体或环境变量）
- 自动生成 HTML 格式的邮件
- 健康检查端点


### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. 运行服务器

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。


## 快速开始

1. 安装node.js (https://nodejs.org/en/download)
2. Windows 直接运行 start-windows.bat；Mac 用终端运行start.sh。
3. 在浏览器中访问http://localhost:3000。
4. 在 Settings中配置大模型即可使用，推荐文案能力较好的模型比如Claude和GLM。

## API 端点

### POST /api/send-email

发送邮件。

**请求体：**
```json
{
  "to": "recipient@example.com",
  "subject": "邮件主题",
  "content": "邮件内容（纯文本）",
  "smtpConfig": {
    "host": "smtp.gmail.com",
    "port": 465,
    "user": "sender@gmail.com",
    "pass": "app_password"
  }
}
```

**注意：** `smtpConfig` 是可选的。如果未提供，将使用环境变量中的配置。

**响应：**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "message-id-here"
}
```

### GET /health

健康检查端点。

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 部署

### 部署到 Render

1. 在 Render Dashboard 创建新的 Web Service
2. 连接你的 GitHub 仓库
3. 设置以下配置：
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node
4. 添加环境变量（在 Render Dashboard → Environment 中）：
   - `PORT` (Render 会自动提供)
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`

### 部署到其他平台

确保：
- Node.js 版本 >= 18
- 设置 `PORT` 环境变量（某些平台会自动提供）
- 配置 SMTP 相关环境变量

## 安全注意事项

1. **不要在前端代码中暴露 SMTP 密码**
2. **使用环境变量存储敏感信息**
3. **在生产环境中启用 HTTPS**
4. **考虑添加 API 密钥认证**（可选）

## 故障排除

### SMTP 连接失败

- 检查 SMTP 主机和端口是否正确
- 确认使用的是应用专用密码（不是登录密码）
- 检查防火墙设置

### Gmail 应用专用密码

如果使用 Gmail：
1. 启用两步验证
2. 生成应用专用密码：https://myaccount.google.com/apppasswords
3. 使用应用专用密码作为 `SMTP_PASS`

### 端口被占用

如果 3000 端口被占用，可以：
- 修改 `.env` 中的 `PORT` 值
- 或使用环境变量覆盖：`PORT=3001 npm start`

