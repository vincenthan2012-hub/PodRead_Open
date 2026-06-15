<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PodRead - Podcast to Literature Transformer

将播客转录文本转换为精美文学作品的 AI 工具。

## 功能特性

- 📝 **智能转换**: 使用 AI 将播客转录文本转换为结构化的书籍章节
- 📚 **个人图书馆**: 保存和管理所有转换的章节
- 💾 **本地存储**: 章节和设置保存在浏览器 localStorage 中，无需配置数据库
- 📧 **邮件发送**: 将章节导出为 EPUB 并通过邮件发送
- ⚙️ **灵活配置**: 支持多种 AI 提供商（Gemini, DeepSeek, OpenRouter 等）

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **数据存储**: 浏览器 localStorage
- **AI 服务**: Google Gemini / 其他 OpenAI 兼容 API
- **部署**: Render

## 本地快速运行


1. 安装node.js (https://nodejs.org/en/download)
2. Windows 直接运行 start-windows.bat；Mac 用终端运行start.sh。
3. 在浏览器中访问http://localhost:3000。
4. 在 Settings中配置大模型即可使用，推荐文案能力较好的模型比如Claude和GLM。



### 部署到生产环境

请参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解详细的部署步骤。

## 项目结构

```
├── components/          # React 组件
│   ├── Header.tsx      # 顶部导航栏
│   ├── ChapterList.tsx # 章节列表
│   ├── BookPreview.tsx # 章节预览
│   └── SettingsModal.tsx # 设置面板
├── services/           # 业务逻辑服务
│   ├── aiService.ts    # AI 转换服务
│   ├── epubService.ts  # EPUB 生成服务
│   └── databaseService.ts # localStorage 本地存储服务
├── lib/                # 工具库
│   └── envConfig.ts    # 环境变量默认配置
├── types.ts            # TypeScript 类型定义
├── constants.ts        # 常量配置
└── App.tsx             # 主应用组件
```

## 环境变量说明

### 可选的环境变量（AI 配置）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_AI_PROVIDER` | AI 提供商 (gemini/deepseek/siliconflow/openrouter/ollama/custom) | `gemini` |
| `VITE_AI_API_URL` | AI API 端点 URL | 根据提供商自动设置 |
| `VITE_AI_MODEL_NAME` | 默认模型名称 | `gemini-3-pro-preview` |
| `VITE_AI_API_KEY` | AI API 密钥（非 Gemini 提供商） | - |
| `GEMINI_API_KEY` | Gemini API 密钥 | - |

### 可选的环境变量（SMTP 邮件配置）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_SMTP_HOST` | SMTP 服务器地址 | - |
| `VITE_SMTP_PORT` | SMTP 端口 | `465` |
| `VITE_SMTP_USER` | 邮箱地址 | - |
| `VITE_SMTP_PASS` | 应用密码 | - |

**注意**: 所有可选的环境变量都可以在应用内的设置面板中配置。环境变量主要用于设置默认值，方便团队统一配置。

## 数据存储

应用不再依赖外部数据库。数据会保存在当前浏览器的 localStorage 中：

1. **podread:chapters**: 存储创建的章节、原始转录文本和选中状态
2. **podread:settings**: 存储 AI 提供商、模型、API Key 和 SMTP 设置

这些数据仅在当前浏览器和设备上可用。清除浏览器站点数据、切换浏览器或更换设备后，需要重新配置设置并重新导入章节。

## 开发指南

### 添加新的 AI 提供商

1. 在 `types.ts` 中的 `AIProvider` 类型添加新提供商
2. 在 `constants.ts` 的 `PROVIDER_DEFAULTS` 中添加默认配置
3. 在 `services/aiService.ts` 中添加处理逻辑

### 自定义样式

应用使用 Tailwind CSS。所有样式类都在组件中内联定义。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 支持

如有问题，请查看：
- [部署指南](./DEPLOYMENT.md)
