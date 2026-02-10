# 如何设置 VITE_EMAIL_API_URL

## 🎯 问题

在本地开发时使用：
```env
VITE_EMAIL_API_URL=http://localhost:3000/api/send-email
```

但在 Render 上部署时，需要改为实际的 Render 后端服务 URL。

## ✅ 解决方案

### 方法一：在 Render Dashboard 中配置（推荐）

#### 步骤 1：找到后端服务 URL

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 找到并点击 **`podread-email-api`** 服务
3. 在服务详情页顶部，你会看到服务 URL，例如：
   ```
   https://podread-email-api.onrender.com
   ```
4. 复制这个 URL

#### 步骤 2：在前端服务中设置环境变量

1. 在 Render Dashboard 中，找到并点击 **`podread`** 服务（前端服务）
2. 点击左侧菜单的 **"Environment"** 标签
3. 点击 **"Add Environment Variable"** 按钮
4. 填写：
   - **Key**: `VITE_EMAIL_API_URL`
   - **Value**: `https://podread-email-api.onrender.com/api/send-email`
     - ⚠️ 将 `podread-email-api.onrender.com` 替换为你实际的后端服务域名
     - ⚠️ 确保包含 `/api/send-email` 路径
5. 点击 **"Save Changes"**
6. Render 会自动重新部署前端服务

#### 完整示例

假设你的后端服务 URL 是 `https://podread-email-api.onrender.com`：

**在 Render Dashboard → `podread` → Environment 中添加：**

```
Key: VITE_EMAIL_API_URL
Value: https://podread-email-api.onrender.com/api/send-email
```

### 方法二：使用 render.yaml（自动配置）

如果你想让 Render 自动配置，可以在 `render.yaml` 中使用环境变量引用：

```yaml
envVars:
  - key: VITE_EMAIL_API_URL
    sync: false
    # 注意：需要在 Render Dashboard 中手动设置值
    # 格式：https://podread-email-api.onrender.com/api/send-email
```

然后在 Render Dashboard 中设置实际值。

## 📋 配置检查清单

- [ ] 后端服务 (`podread-email-api`) 已成功部署
- [ ] 已获取后端服务的完整 URL
- [ ] 在前端服务中添加了 `VITE_EMAIL_API_URL` 环境变量
- [ ] URL 格式正确：`https://[服务名].onrender.com/api/send-email`
- [ ] 使用 HTTPS（不是 HTTP）
- [ ] 包含完整的路径 `/api/send-email`
- [ ] 保存后等待重新部署完成

## 🔍 验证配置

### 1. 检查后端服务是否正常运行

在浏览器中访问：
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

### 2. 检查前端环境变量

1. 在 Render Dashboard → `podread` → Environment
2. 确认 `VITE_EMAIL_API_URL` 已正确设置
3. 值应该是：`https://[你的后端服务名].onrender.com/api/send-email`

### 3. 测试邮件发送

1. 访问前端应用
2. 创建一些章节
3. 选择章节并点击 "Push to Email"
4. 检查邮箱是否收到邮件

## ❌ 常见错误

### 错误 1：使用 HTTP 而不是 HTTPS

❌ **错误**：
```
VITE_EMAIL_API_URL=http://podread-email-api.onrender.com/api/send-email
```

✅ **正确**：
```
VITE_EMAIL_API_URL=https://podread-email-api.onrender.com/api/send-email
```

### 错误 2：缺少路径

❌ **错误**：
```
VITE_EMAIL_API_URL=https://podread-email-api.onrender.com
```

✅ **正确**：
```
VITE_EMAIL_API_URL=https://podread-email-api.onrender.com/api/send-email
```

### 错误 3：包含端口号

❌ **错误**：
```
VITE_EMAIL_API_URL=https://podread-email-api.onrender.com:3000/api/send-email
```

✅ **正确**：
```
VITE_EMAIL_API_URL=https://podread-email-api.onrender.com/api/send-email
```

### 错误 4：使用 localhost

❌ **错误**（在 Render 上）：
```
VITE_EMAIL_API_URL=http://localhost:3000/api/send-email
```

✅ **正确**（在 Render 上）：
```
VITE_EMAIL_API_URL=https://podread-email-api.onrender.com/api/send-email
```

## 🔄 本地开发 vs 生产环境

### 本地开发（.env 文件）

在项目根目录的 `.env` 文件中：
```env
VITE_EMAIL_API_URL=http://localhost:3000/api/send-email
```

### 生产环境（Render Dashboard）

在 Render Dashboard → `podread` → Environment 中：
```
VITE_EMAIL_API_URL=https://podread-email-api.onrender.com/api/send-email
```

## 💡 提示

1. **服务名称可能不同**：如果你的后端服务名称不是 `podread-email-api`，请使用实际的服务名称
2. **免费版可能较慢**：Render 免费版服务在闲置后会休眠，首次访问可能需要几秒钟唤醒
3. **查看日志**：如果遇到问题，查看 Render Dashboard → 服务 → "Logs" 标签

## 📚 相关文档

- 完整配置指南：`RENDER_ENV_SETUP.md`
- 快速参考：`RENDER_ENV_QUICK_REFERENCE.md`
- 部署指南：`DEPLOYMENT.md`

