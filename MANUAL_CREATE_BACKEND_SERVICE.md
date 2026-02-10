# 手动创建后端邮件 API 服务

如果你在 Render Dashboard 中没有找到 `podread-email-api` 服务，可以按照以下步骤手动创建。

## 📋 前提条件

- ✅ 代码已推送到 GitHub
- ✅ Render 账户已登录
- ✅ 前端服务（`podread`）可能已经存在

## 🚀 创建后端服务的步骤

### 步骤 1：进入 Render Dashboard

1. 访问 [Render Dashboard](https://dashboard.render.com)
2. 登录你的账户

### 步骤 2：创建新的 Web Service

1. 点击页面右上角的 **"New +"** 按钮
2. 在下拉菜单中选择 **"Web Service"**

### 步骤 3：连接 GitHub 仓库

1. 如果还没有连接 GitHub，点击 **"Connect GitHub"** 或 **"Configure GitHub"**
2. 授权 Render 访问你的 GitHub 账户
3. 选择包含 PodRead 项目的仓库
4. 点击 **"Connect"**

### 步骤 4：配置服务信息

填写以下信息：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Name** | `podread-email-api` | 服务名称（可以自定义，但建议使用这个名称） |
| **Environment** | `Node` | 选择 Node.js 环境 |
| **Region** | 选择离你最近的区域 | 例如：Singapore, Oregon 等 |
| **Branch** | `main` | 你的主分支名称（通常是 `main` 或 `master`） |
| **Root Directory** | `server` | ⚠️ **重要**：设置为 `server`（后端代码在这个目录） |
| **Build Command** | `npm install` | 安装依赖 |
| **Start Command** | `npm start` | 启动服务器 |
| **Plan** | `Free` | 选择免费计划（或付费计划） |

**重要配置说明：**

- **Root Directory**: 必须设置为 `server`，因为后端代码在 `server/` 目录下
- **Build Command**: `npm install`（在 server 目录下安装依赖）
- **Start Command**: `npm start`（启动服务器）

### 步骤 5：配置环境变量

在 **"Environment Variables"** 部分，点击 **"Add Environment Variable"** 添加以下变量：

#### 必需的环境变量

| Key | Value | 说明 |
|-----|-------|------|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP 服务器地址（Gmail 使用这个） |
| `SMTP_PORT` | `465` | SMTP 端口（Gmail SSL 使用 465） |
| `SMTP_USER` | `your_email@gmail.com` | 你的邮箱地址 |
| `SMTP_PASS` | `your_app_password` | Gmail 应用专用密码（不是登录密码） |

**注意：**
- `PORT` 变量**不需要设置**，Render 会自动提供
- Gmail 用户需要生成应用专用密码（见下方说明）

#### Gmail 应用专用密码获取方法

1. 访问：https://myaccount.google.com/apppasswords
2. 如果提示输入密码，输入你的 Google 账户密码
3. 选择应用：**"邮件"**
4. 选择设备：**"其他（自定义名称）"**，输入 "PodRead"
5. 点击 **"生成"**
6. 复制生成的 16 位密码（格式：`abcd efgh ijkl mnop`，包含空格）
7. 在 Render 中设置为 `SMTP_PASS` 的值（可以包含空格，也可以去掉空格）

### 步骤 6：创建服务

1. 检查所有配置是否正确
2. 点击页面底部的 **"Create Web Service"** 按钮
3. Render 会开始构建和部署服务

### 步骤 7：等待部署完成

1. 部署过程通常需要 3-5 分钟
2. 可以在 **"Logs"** 标签页查看构建日志
3. 等待状态变为 **"Live"**（绿色）

### 步骤 8：获取服务 URL

1. 部署完成后，在服务详情页顶部查看服务 URL
2. URL 格式通常是：`https://podread-email-api.onrender.com`
3. 复制这个 URL

**API 端点 URL** = 服务 URL + `/api/send-email`

例如：
```
https://podread-email-api.onrender.com/api/send-email
```

### 步骤 9：验证后端服务

在浏览器中访问健康检查端点：
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

如果看到这个响应，说明后端服务运行正常！

### 步骤 10：配置前端服务

现在需要在前端服务中配置 `VITE_EMAIL_API_URL`：

1. 在 Render Dashboard 中找到 **`podread`** 服务（前端服务）
2. 点击进入服务详情页
3. 点击左侧菜单的 **"Environment"** 标签
4. 点击 **"Add Environment Variable"**
5. 填写：
   - **Key**: `VITE_EMAIL_API_URL`
   - **Value**: `https://podread-email-api.onrender.com/api/send-email`
     - ⚠️ 将 `podread-email-api.onrender.com` 替换为你实际的后端服务域名
6. 点击 **"Save Changes"**
7. 等待前端服务重新部署完成

## 📝 配置检查清单

- [ ] 后端服务已创建
- [ ] Root Directory 设置为 `server`
- [ ] Build Command 设置为 `npm install`
- [ ] Start Command 设置为 `npm start`
- [ ] 已配置所有必需的环境变量（SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS）
- [ ] 后端服务部署成功（状态为 "Live"）
- [ ] 健康检查端点返回正常（/health）
- [ ] 已获取后端服务 URL
- [ ] 在前端服务中配置了 `VITE_EMAIL_API_URL`

## ❌ 常见问题

### Q: 构建失败，提示找不到 package.json

**A:** 检查 **Root Directory** 是否设置为 `server`。

### Q: 启动失败，提示找不到模块

**A:** 检查 **Build Command** 是否正确。应该是 `npm install`（在 server 目录下执行）。

### Q: 服务启动后无法访问

**A:** 
1. 检查服务状态是否为 "Live"
2. 查看 **"Logs"** 标签页中的错误信息
3. 确认 `PORT` 环境变量没有被手动设置（Render 会自动提供）

### Q: SMTP 连接失败

**A:** 
1. 检查 SMTP 配置是否正确
2. 确认使用的是应用专用密码（不是登录密码）
3. 检查 Gmail 是否启用了两步验证（应用专用密码需要两步验证）

### Q: 服务名称冲突

**A:** 如果 `podread-email-api` 名称已被使用，可以改为其他名称，例如：
- `podread-api`
- `podread-email-service`
- `my-podread-api`

但记得在前端服务的 `VITE_EMAIL_API_URL` 中使用正确的服务名称。

## 🔄 使用 render.yaml 自动创建（可选）

如果你想使用 `render.yaml` 自动创建服务：

1. 在 Render Dashboard 中点击 **"New +"** → **"Blueprint"**
2. 连接 GitHub 仓库
3. Render 会自动检测 `render.yaml` 文件
4. 配置环境变量
5. 点击 **"Apply"** 创建所有服务

但如果你已经手动创建了前端服务，可能需要先删除它，然后使用 Blueprint 重新创建。

## 📚 相关文档

- 环境变量配置：`RENDER_ENV_SETUP.md`
- 快速参考：`RENDER_ENV_QUICK_REFERENCE.md`
- 如何设置 VITE_EMAIL_API_URL：`HOW_TO_SET_VITE_EMAIL_API_URL.md`

