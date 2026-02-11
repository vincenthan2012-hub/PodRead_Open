-- 迁移脚本：为 user_settings 表添加 provider_configs 列
-- 如果您的数据库表已经存在但没有 provider_configs 列，请执行此脚本
-- 
-- 使用方法：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制下面的 ALTER TABLE 语句并执行
-- 3. （可选）如果需要验证，可以单独执行验证查询

-- 添加 provider_configs 列（如果不存在）
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS provider_configs JSONB DEFAULT '{}'::jsonb;

