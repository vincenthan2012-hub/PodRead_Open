-- 验证脚本：检查 provider_configs 列是否已成功添加
-- 这是一个可选的验证查询，可以单独执行

SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name = 'provider_configs';

