# 部署指南 - Render + Supabase

本文档将指导您如何将 PodRead 应用部署到 Render，并使用 Supabase 作为数据库。

## 前置准备

1. **Supabase 账户** - 访问 [supabase.com](https://supabase.com) 注册
2. **Render 账户** - 访问 [render.com](https://render.com) 注册
3. **GitHub 账户** - 用于代码仓库

## 第一步：设置 Supabase

### 1.1 创建 Supabase 项目

1. 登录 Supabase Dashboard
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `podread` (或您喜欢的名称)
   - Database Password: 设置一个强密码（请保存好）
   - Region: 选择离您最近的区域
4. 等待项目创建完成（约 2 分钟）

### 1.2 获取 API 密钥

1. 在项目 Dashboard 中，点击左侧 "Settings" → "API"
2. 复制以下信息：
   - **Project URL** (例如: `https://xxxxx.supabase.co`)
   - **anon public** key (在 Project API keys 部分)

### 1.3 创建数据库表

1. 在 Supabase Dashboard 中，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制并执行 `SUPABASE_SETUP.md` 中的所有 SQL 语句
4. 确认表创建成功（应该看到 "Success. No rows returned"）

## 第二步：准备代码仓库

### 2.1 配置环境变量

在项目根目录创建 `.env` 文件（不要提交到 Git）：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 2.2 提交代码到 GitHub

```bash
git add .
git commit -m "Add Supabase integration and authentication"
git push origin main
```

## 第三步：部署到 Render

您有两种方式部署到 Render：

### 方式一：使用 render.yaml 配置文件（推荐）

项目已经包含了 `render.yaml` 配置文件，可以自动配置**两个服务**：
- **前端服务** (`podread`) - 用户界面
- **后端服务** (`podread-email-api`) - 邮件发送 API

1. **登录 Render Dashboard**
   - 访问 [render.com](https://render.com) 并登录

2. **创建新的 Blueprint**
   - 点击 "New +" → "Blueprint"
   - 连接您的 GitHub 仓库
   - 选择 PodRead 仓库
   - Render 会自动检测 `render.yaml` 文件

3. **配置环境变量**
   - 在 Blueprint 配置页面，您需要为每个环境变量设置值
   - 点击每个环境变量旁边的 "Set value" 按钮
   - 填入对应的值（见下方环境变量说明）
   - **注意**：需要分别配置前端和后端服务的环境变量

4. **应用配置**
   - 点击 "Apply" 创建服务
   - Render 会自动创建两个 Web Service 并开始部署
   - 等待部署完成后，需要配置 `VITE_EMAIL_API_URL` 指向后端服务 URL

**详细的环境变量配置说明，请查看 `RENDER_ENV_SETUP.md` 文件。**

### 方式二：手动创建 Web Service

1. **登录 Render Dashboard**
   - 访问 [render.com](https://render.com) 并登录

2. **创建 Web Service**
   - 点击 "New +" → "Web Service"
   - 连接您的 GitHub 仓库
   - 选择 PodRead 仓库

3. **配置服务**

   填写以下信息：

   - **Name**: `podread` (或您喜欢的名称)
   - **Environment**: `Node`
   - **Region**: 选择离您最近的区域
   - **Branch**: `main` (或您的主分支)
   - **Root Directory**: 留空（如果项目在根目录）
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Plan**: 选择 Free 或 Starter

4. **设置环境变量**

   在 "Environment Variables" 部分，点击 "Add Environment Variable" 添加以下变量：

#### 必需的环境变量

| Key | Value | 说明 |
|-----|-------|------|
| `VITE_SUPABASE_URL` | 您的 Supabase Project URL | 从 Supabase Settings → API 获取 |
| `VITE_SUPABASE_ANON_KEY` | 您的 Supabase anon key | 从 Supabase Settings → API 获取 |

#### 可选的环境变量（AI 配置）

| Key | Value | 说明 |
|-----|-------|------|
| `VITE_AI_PROVIDER` | `gemini` / `deepseek` / `siliconflow` / `openrouter` / `ollama` / `custom` | 默认 AI 提供商，默认为 `gemini` |
| `VITE_AI_API_URL` | API 端点 URL | 如果使用自定义提供商，填写 API URL |
| `VITE_AI_MODEL_NAME` | 模型名称 | 默认模型名称，如 `gemini-3-pro-preview` |
| `VITE_AI_API_KEY` | API 密钥 | 如果使用非 Gemini 提供商，填写 API 密钥 |
| `GEMINI_API_KEY` | Gemini API 密钥 | 如果使用 Gemini 提供商，填写 Gemini API 密钥 |

#### 可选的环境变量（邮件 API 配置）

| Key | Value | 说明 |
|-----|-------|------|
| `VITE_EMAIL_API_URL` | 后端 API URL | 格式：`https://podread-email-api.onrender.com/api/send-email` |

**重要**：如果使用后端 API 发送邮件（推荐），需要：
1. 先部署后端服务 (`podread-email-api`)
2. 获取后端服务的 URL
3. 在前端服务中设置 `VITE_EMAIL_API_URL` 为后端 API 地址

#### 可选的环境变量（SMTP 默认值，仅用于设置面板显示）

| Key | Value | 说明 |
|-----|-------|------|
| `VITE_SMTP_HOST` | SMTP 服务器地址 | 如 `smtp.gmail.com`（仅用于设置面板默认值） |
| `VITE_SMTP_PORT` | SMTP 端口 | 如 `465`（仅用于设置面板默认值） |
| `VITE_SMTP_USER` | 邮箱地址 | 仅用于设置面板默认值 |

**注意**: 
- 不要设置 `VITE_SMTP_PASS`（会被打包到前端代码，存在安全风险）
- 实际邮件发送使用后端 API，后端有自己的 SMTP 配置
- 详细配置说明请查看 `RENDER_ENV_SETUP.md`

### 3.3 配置后端服务环境变量（如果使用邮件 API）

如果使用后端 API 发送邮件，需要在 **`podread-email-api`** 服务中配置：

| Key | Value | 说明 |
|-----|-------|------|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP 服务器地址 |
| `SMTP_PORT` | `465` | SMTP 端口 |
| `SMTP_USER` | 你的邮箱地址 | 用于发送邮件的邮箱 |
| `SMTP_PASS` | 应用专用密码 | Gmail 需要生成应用专用密码 |

**Gmail 应用专用密码获取方法**：
1. 访问：https://myaccount.google.com/apppasswords
2. 选择应用：**"邮件"**
3. 选择设备：**"其他（自定义名称）"**，输入 "PodRead"
4. 复制生成的 16 位密码
5. 在 Render 中设置为 `SMTP_PASS` 的值

**详细配置说明请查看 `RENDER_ENV_SETUP.md` 文件。**

### 3.4 部署

**如果使用方式一（render.yaml）**：
- 配置完成后，点击 "Apply" 即可开始部署
- Render 会自动读取 `render.yaml` 中的配置

**如果使用方式二（手动配置）**：
- 点击 "Create Web Service"
- 等待构建完成（约 5-10 分钟）
- 部署成功后，Render 会提供一个 URL（例如: `https://podread.onrender.com`）

## 第四步：验证部署

### 4.1 检查部署状态

1. 在 Render Dashboard 中，查看您的 Web Service
2. 确认状态显示为 "Live"（绿色）
3. 如果状态为 "Building" 或 "Deploying"，请等待完成
4. 如果状态为 "Failed"，请查看日志排查问题

### 4.2 测试应用功能

1. **访问应用**
   - 点击 Render Dashboard 中的服务 URL，或直接访问提供的 URL（例如: `https://podread.onrender.com`）
   - 您应该看到登录/注册界面

2. **测试用户认证**
   - 点击 "Sign Up" 创建一个新账户
   - 使用有效的邮箱地址注册
   - 检查邮箱中的验证链接（如果启用了邮箱验证）
   - 登录到应用

3. **测试核心功能**
   - 尝试创建一个新章节
   - 输入一些测试文本并转换
   - 验证数据是否保存到 Supabase
   - 检查章节列表是否正确显示

4. **检查 Supabase 数据**
   - 登录 Supabase Dashboard
   - 进入 "Table Editor"
   - 查看 `chapters` 和 `user_settings` 表
   - 确认新创建的数据已保存

## 故障排除

### 问题：无法连接到 Supabase

**解决方案**：
- 检查环境变量是否正确设置
- 确认 Supabase 项目的 RLS (Row Level Security) 策略已正确配置
- 检查 Supabase Dashboard 中的 API 密钥是否有效

### 问题：构建失败

**解决方案**：
- 检查 `package.json` 中的依赖是否正确
- 查看 Render 构建日志中的错误信息（在 Render Dashboard → Logs）
- 确保所有必需的环境变量都已设置
- 确认 Node.js 版本兼容（项目需要 Node.js 18+）
- 检查是否有语法错误或类型错误

### 问题：用户无法注册/登录

**解决方案**：
- 检查 Supabase 的 Authentication 设置
- 确认 Email 认证已启用
- 检查 Supabase Dashboard → Authentication → Providers

### 问题：数据无法保存

**解决方案**：
- 确认数据库表已正确创建（参考 SUPABASE_SETUP.md）
- 检查 RLS 策略是否正确配置
- 查看浏览器控制台（F12）中的错误信息
- 查看 Supabase Dashboard → Logs 中的 API 请求日志
- 确认用户已正确登录（检查 Supabase Auth 状态）

### 问题：应用无法启动或显示空白页面

**解决方案**：
- 检查 Render 日志中的错误信息
- 确认环境变量 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已正确设置
- 检查浏览器控制台是否有 JavaScript 错误
- 确认构建成功完成（检查 Render 构建日志）
- 验证 `npm run preview` 命令是否正确执行

### 问题：端口绑定错误

**解决方案**：
- Render 会自动提供 `PORT` 环境变量
- 确认 `vite.config.ts` 中的预览配置正确读取了 `PORT` 环境变量
- 如果仍有问题，检查 `package.json` 中的 `preview` 脚本

## 更新应用

每次您推送代码到 GitHub 的 main 分支时，Render 会自动重新部署应用。

## 监控和维护

- **Render Dashboard**: 查看应用状态、日志和指标
- **Supabase Dashboard**: 查看数据库使用情况、API 调用和用户数据
- **Supabase Logs**: 在 Supabase Dashboard → Logs 中查看实时日志

## 成本说明

- **Render Free Tier**: 
  - 免费，但服务在 15 分钟无活动后会休眠
  - 适合开发和测试
  
- **Render Starter Plan**: 
  - $7/月，服务始终运行
  - 适合生产环境

- **Supabase Free Tier**:
  - 500MB 数据库空间
  - 2GB 带宽
  - 50,000 月活跃用户
  - 适合中小型应用

## 安全建议

1. **永远不要**将 `.env` 文件提交到 Git
2. 使用 Supabase 的 RLS (Row Level Security) 保护数据
3. 定期更新依赖包以修复安全漏洞
4. 在生产环境中使用强密码
5. 考虑启用 Supabase 的额外安全功能（如 2FA）

## 下一步

- 配置自定义域名（在 Render Dashboard 中）
- 设置自动备份（Supabase 自动备份）
- 配置 CDN 加速（可选）
- 设置监控和告警

