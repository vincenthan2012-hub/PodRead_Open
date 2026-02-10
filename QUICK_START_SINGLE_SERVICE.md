# 单服务部署快速开始

## 🎯 概述

使用**一个 Web Service** 同时提供前端和后端功能，简化部署。

## ⚡ 快速步骤

### 1. 准备代码

确保代码已推送到 GitHub，并且包含：
- ✅ `server/index-unified.js` - 统一服务器
- ✅ 更新后的 `services/epubService.ts` - 支持相对路径 API 调用
- ✅ `render-unified.yaml` - 单服务配置

### 2. 在 Render 上创建服务

#### 方式一：使用 render-unified.yaml（推荐）

1. **重命名配置文件**
   ```bash
   # 备份原配置（如果存在）
   mv render.yaml render.yaml.backup
   
   # 使用单服务配置
   mv render-unified.yaml render.yaml
   ```

2. **提交到 GitHub**
   ```bash
   git add .
   git commit -m "Add single-service deployment configuration"
   git push
   ```

3. **在 Render Dashboard 创建 Blueprint**
   - 点击 "New +" → "Blueprint"
   - 连接 GitHub 仓库
   - Render 会自动检测 `render.yaml`
   - 配置环境变量（见下方）
   - 点击 "Apply"

#### 方式二：手动创建

1. **创建 Web Service**
   - 点击 "New +" → "Web Service"
   - 连接 GitHub 仓库

2. **配置服务**
   - **Name**: `podread`
   - **Root Directory**: 留空
   - **Build Command**: `npm install && npm run build && cd server && npm install`
   - **Start Command**: `node server/index-unified.js`

3. **配置环境变量**（见下方）

### 3. 配置环境变量

在 Render Dashboard → 服务 → Environment 中添加：

#### 必需变量

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### 可选变量

```env
# AI 配置
VITE_AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key

# 设置面板默认值
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=465
VITE_SMTP_USER=your_email@gmail.com

# API URL（可选，默认使用相对路径）
VITE_EMAIL_API_URL=/api/send-email
```

**注意：**
- `VITE_EMAIL_API_URL` 可以设置为 `/api/send-email` 或留空（代码会自动使用相对路径）
- 不要设置 `VITE_SMTP_PASS`（安全风险）

### 4. 等待部署完成

- 构建时间：约 5-10 分钟
- 查看日志：在 Render Dashboard → 服务 → Logs

### 5. 验证部署

1. **访问应用**
   - 访问服务 URL（例如：`https://podread.onrender.com`）
   - 应该能看到应用界面

2. **测试 API**
   - 访问：`https://podread.onrender.com/health`
   - 应该返回：`{"status":"ok",...}`

3. **测试邮件发送**
   - 在应用中创建章节
   - 点击 "Push to Email"
   - 检查邮箱

## 📋 配置对比

### 单服务 vs 双服务

| 特性 | 单服务 | 双服务 |
|------|--------|--------|
| **服务数量** | 1 个 | 2 个 |
| **构建命令** | `npm install && npm run build && cd server && npm install` | 分别构建 |
| **启动命令** | `node server/index-unified.js` | 分别启动 |
| **API 调用** | 相对路径 `/api/send-email` | 完整 URL |
| **配置复杂度** | 简单 | 中等 |
| **成本** | 低 | 中等 |
| **扩展性** | 一般 | 好 |

## ✅ 优势

- ✅ **简化部署**：只需要创建一个服务
- ✅ **统一管理**：所有配置在一个地方
- ✅ **降低成本**：只需要一个服务实例
- ✅ **自动配置**：前端自动使用同域名的 API

## ⚠️ 注意事项

1. **构建时间**：需要同时构建前端和后端，时间可能稍长
2. **资源占用**：一个服务需要处理所有请求
3. **扩展性**：无法独立扩展前端或后端

## 🔄 从双服务迁移

如果你已经有双服务部署：

1. **备份现有服务**（可选）
2. **更新代码**：使用单服务配置
3. **创建新服务**：使用单服务配置
4. **测试新服务**：确保一切正常
5. **删除旧服务**：如果新服务运行正常

## 📚 相关文档

- 详细配置：`SINGLE_SERVICE_SETUP.md`
- 双服务方案：`WHY_TWO_SERVICES.md`
- 环境变量说明：`RENDER_ENV_SETUP.md`

