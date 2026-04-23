# Supabase 数据库设置指南

本文档将指导您如何在 Supabase 中设置数据库表结构。

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录
2. 点击 "New Project" 创建新项目
3. 填写项目信息并等待项目创建完成

## 2. 获取 API 密钥

1. 在项目设置中，进入 "API" 页面
2. 复制以下信息：
   - Project URL (用于 `VITE_SUPABASE_URL`)
   - anon/public key (用于 `VITE_SUPABASE_ANON_KEY`)

## 3. 创建数据库表

在 Supabase Dashboard 中，进入 SQL Editor，执行以下 SQL 语句：

### 创建 chapters 表

```sql
-- 创建 chapters 表
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  original_transcript TEXT NOT NULL,
  source_file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  selected BOOLEAN DEFAULT FALSE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS chapters_user_id_idx ON chapters(user_id);
CREATE INDEX IF NOT EXISTS chapters_created_at_idx ON chapters(created_at DESC);

-- 启用 Row Level Security (RLS)
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的章节
CREATE POLICY "Users can view their own chapters"
  ON chapters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chapters"
  ON chapters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chapters"
  ON chapters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chapters"
  ON chapters FOR DELETE
  USING (auth.uid() = user_id);
```

### 创建 user_settings 表

```sql
-- 创建 user_settings 表
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_provider TEXT DEFAULT 'gemini',
  api_key TEXT DEFAULT '',
  model_name TEXT DEFAULT '',
  api_url TEXT DEFAULT '',
  provider_configs JSONB DEFAULT '{}'::jsonb,
  saved_models JSONB DEFAULT '[]'::jsonb,
  use_custom_smtp BOOLEAN DEFAULT FALSE,
  smtp_host TEXT DEFAULT '',
  smtp_port TEXT DEFAULT '465',
  smtp_user TEXT DEFAULT '',
  smtp_pass TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);

-- 启用 Row Level Security (RLS)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的设置
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
```

### 迁移现有数据库（如果表已存在）

如果您的 `user_settings` 表已经存在但没有 `provider_configs` 列，请执行以下 SQL 来添加该列：

```sql
-- 添加 provider_configs 列（如果不存在）
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS provider_configs JSONB DEFAULT '{}'::jsonb;

-- 添加 source_file_name 列（如果不存在）
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS source_file_name TEXT;
```

## 4. 配置环境变量

1. 在项目根目录创建 `.env` 文件
2. 填入以下环境变量：

```env
# Supabase Configuration (必需)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# AI Provider Configuration (可选 - 可在应用内设置)
# 支持的提供商: gemini, deepseek, siliconflow, openrouter, ollama, custom
VITE_AI_PROVIDER=gemini
VITE_AI_API_URL=
VITE_AI_MODEL_NAME=gemini-3-pro-preview
VITE_AI_API_KEY=

# SMTP Email Configuration (可选 - 可在应用内设置)
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=465
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASS=your_app_password

# Gemini API Key (可选 - 可在应用内设置)
GEMINI_API_KEY=your-gemini-api-key-here
```

### 环境变量说明

- **VITE_SUPABASE_URL** 和 **VITE_SUPABASE_ANON_KEY**: 必需，用于连接 Supabase 数据库和认证
- **VITE_AI_PROVIDER**: AI 提供商，默认为 `gemini`
- **VITE_AI_API_URL**: AI API 端点 URL（如果使用自定义提供商）
- **VITE_AI_MODEL_NAME**: 默认使用的模型名称
- **VITE_AI_API_KEY**: AI API 密钥（如果使用非 Gemini 提供商）
- **VITE_SMTP_***: SMTP 邮件服务器配置（可选，可在应用设置中配置）
- **GEMINI_API_KEY**: Gemini API 密钥（如果使用 Gemini 提供商）

## 5. 验证设置

1. 运行 `npm install` 安装依赖
2. 运行 `npm run dev` 启动开发服务器
3. 访问应用并尝试注册/登录
4. 如果一切正常，您应该能够创建和保存章节

## 注意事项

- 确保 RLS (Row Level Security) 已启用，以保护用户数据
- 所有敏感数据（如 API 密钥）应存储在环境变量中，不要提交到版本控制
- 在生产环境中，建议使用 Supabase 的 service_role key 进行服务器端操作（如果需要）

