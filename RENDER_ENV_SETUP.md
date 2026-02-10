# Render 环境变量配置指南

## 概述

项目包含两个服务，需要在 Render Dashboard 中分别配置环境变量：

1. **前端服务** (`podread`) - 用户界面
2. **后端服务** (`podread-email-api`) - 邮件发送 API

## 配置步骤

### 第一步：部署服务

1. 推送代码到 GitHub
2. 在 Render Dashboard 中，两个服务会自动创建（基于 `render.yaml`）
3. 等待两个服务部署完成

### 第二步：配置后端服务环境变量

进入 **`podread-email-api`** 服务：

1. 点击服务名称进入详情页
2. 点击左侧菜单的 **"Environment"** 标签
3. 添加以下环境变量：

| 变量名 | 值 | 说明 | 是否必需 |
|--------|-----|------|---------|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP 服务器地址 | ✅ 是 |
| `SMTP_PORT` | `465` | SMTP 端口（Gmail 使用 465） | ✅ 是 |
| `SMTP_USER` | `your_email@gmail.com` | 你的邮箱地址 | ✅ 是 |
| `SMTP_PASS` | `your_app_password` | 应用专用密码（不是登录密码） | ✅ 是 |

**注意：**
- `PORT` 变量不需要设置，Render 会自动提供
- Gmail 用户需要生成应用专用密码：https://myaccount.google.com/apppasswords

**示例配置：**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=myemail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

### 第三步：获取后端服务 URL

1. 在 **`podread-email-api`** 服务详情页
2. 查看服务 URL（通常在页面顶部，格式如：`https://podread-email-api.onrender.com`）
3. 复制完整的 URL

**后端 API 端点 URL 格式：**
```
https://podread-email-api.onrender.com/api/send-email
```

### 第四步：配置前端服务环境变量

进入 **`podread`** 服务：

1. 点击服务名称进入详情页
2. 点击左侧菜单的 **"Environment"** 标签
3. 添加以下环境变量：

#### 必需的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase 匿名密钥 |
| `VITE_EMAIL_API_URL` | `https://podread-email-api.onrender.com/api/send-email` | 后端 API 地址（使用第三步获取的 URL） |

#### 可选的环境变量（AI 配置）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_AI_PROVIDER` | `gemini` | AI 提供商（默认：gemini） |
| `VITE_AI_API_URL` | `https://...` | AI API 端点（可选） |
| `VITE_AI_MODEL_NAME` | `gemini-3-pro-preview` | AI 模型名称（可选） |
| `VITE_AI_API_KEY` | `your_api_key` | AI API 密钥（可选） |
| `GEMINI_API_KEY` | `your_gemini_key` | Gemini API 密钥（如果使用 Gemini） |

#### 可选的环境变量（SMTP 默认值）

这些变量仅用于前端设置面板的默认值显示，**不会真正用于发送邮件**：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_SMTP_HOST` | `smtp.gmail.com` | SMTP 主机（可选） |
| `VITE_SMTP_PORT` | `465` | SMTP 端口（可选） |
| `VITE_SMTP_USER` | `your_email@gmail.com` | 邮箱地址（可选） |

**⚠️ 注意：** 不要设置 `VITE_SMTP_PASS`，因为会被打包到前端代码中，存在安全风险。

## 完整配置示例

### 后端服务 (`podread-email-api`) 环境变量

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=myemail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

### 前端服务 (`podread`) 环境变量

```env
# 必需
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_EMAIL_API_URL=https://podread-email-api.onrender.com/api/send-email

# 可选 - AI 配置
VITE_AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key

# 可选 - SMTP 默认值（仅用于设置面板显示）
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=465
VITE_SMTP_USER=myemail@gmail.com
```

## 在 Render Dashboard 中添加环境变量

### 方法 1：通过 Web 界面添加

1. 进入服务详情页
2. 点击 **"Environment"** 标签
3. 点击 **"Add Environment Variable"** 按钮
4. 输入变量名和值
5. 点击 **"Save Changes"**
6. 服务会自动重新部署

### 方法 2：批量添加（推荐）

1. 进入服务详情页
2. 点击 **"Environment"** 标签
3. 点击 **"Add Environment Variable"** 按钮
4. 可以一次添加多个变量
5. 添加完所有变量后，点击 **"Save Changes"**

## 验证配置

### 1. 检查后端服务

访问后端健康检查端点：
```
https://podread-email-api.onrender.com/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 检查前端服务

1. 访问前端应用 URL
2. 打开浏览器开发者工具（F12）
3. 查看控制台，确认没有环境变量相关的错误
4. 尝试登录/注册功能，确认 Supabase 连接正常

### 3. 测试邮件发送

1. 在应用中创建一些章节
2. 选择章节并点击 "Push to Email"
3. 检查邮箱是否收到邮件

## 常见问题

### Q: 如何找到后端服务的 URL？

**A:** 
1. 在 Render Dashboard 中进入 `podread-email-api` 服务
2. 页面顶部会显示服务 URL（格式：`https://podread-email-api.onrender.com`）
3. API 端点 URL = 服务 URL + `/api/send-email`

### Q: 后端服务部署后 URL 是什么？

**A:** Render 会自动生成 URL，格式为：
```
https://[服务名].onrender.com
```

例如：`https://podread-email-api.onrender.com`

### Q: 修改环境变量后需要重新部署吗？

**A:** 是的，Render 会自动触发重新部署。但有时需要手动触发：
1. 进入服务详情页
2. 点击 **"Manual Deploy"** → **"Deploy latest commit"**

### Q: 环境变量设置后多久生效？

**A:** 
- 保存环境变量后，Render 会自动重新部署
- 通常需要 2-5 分钟完成部署
- 可以在 **"Events"** 标签页查看部署进度

### Q: 如何确认环境变量已正确设置？

**A:** 
1. 在服务详情页的 **"Environment"** 标签中查看所有变量
2. 检查变量名和值是否正确
3. 确保没有拼写错误（注意大小写）

### Q: 前端服务找不到后端 API？

**A:** 检查：
1. `VITE_EMAIL_API_URL` 是否正确（应该以 `/api/send-email` 结尾）
2. 后端服务是否正常运行（访问 `/health` 端点）
3. 两个服务是否都已成功部署

### Q: Gmail 应用专用密码如何获取？

**A:** 
1. 访问：https://myaccount.google.com/apppasswords
2. 选择应用：**"邮件"**
3. 选择设备：**"其他（自定义名称）"**，输入 "PodRead"
4. 点击 **"生成"**
5. 复制生成的 16 位密码（格式：`abcd efgh ijkl mnop`）
6. 在 Render 中设置为 `SMTP_PASS` 的值

## 安全建议

1. ✅ **不要在环境变量中暴露敏感信息**（虽然 Render 会加密存储）
2. ✅ **使用应用专用密码**，不要使用账户登录密码
3. ✅ **定期轮换密码**
4. ✅ **不要在前端环境变量中设置 `VITE_SMTP_PASS`**
5. ✅ **使用 Render 的 Secret 功能**（环境变量默认是加密的）

## 下一步

配置完成后：
1. 等待两个服务部署完成
2. 测试前端应用功能
3. 测试邮件发送功能
4. 查看服务日志确认没有错误

如有问题，查看：
- 服务日志：在 Render Dashboard → 服务 → **"Logs"** 标签
- 部署事件：在 Render Dashboard → 服务 → **"Events"** 标签

