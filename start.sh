#!/bin/bash

# PodRead 本地启动脚本
# 支持从任意目录运行，使用绝对路径

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PodRead 本地启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Node.js 是否安装
echo -e "${YELLOW}[1/5] 检查 Node.js 环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 Node.js${NC}"
    echo -e "${YELLOW}请先安装 Node.js 18 或更高版本: https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ 错误: Node.js 版本过低 (当前: $(node -v))${NC}"
    echo -e "${YELLOW}需要 Node.js 18 或更高版本${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"
echo ""

# 检查 npm 是否安装
echo -e "${YELLOW}[2/5] 检查 npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 npm${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm 版本: $(npm -v)${NC}"
echo ""

# 检查 .env 文件
echo -e "${YELLOW}[3/5] 检查环境变量配置...${NC}"
ENV_FILE="$PROJECT_DIR/.env"
ENV_EXAMPLE="$PROJECT_DIR/env.example"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  未找到 .env 文件${NC}"
    if [ -f "$ENV_EXAMPLE" ]; then
        echo -e "${YELLOW}正在从 env.example 创建 .env 文件...${NC}"
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo -e "${GREEN}✓ 已创建 .env 文件，请编辑配置后再运行${NC}"
        echo -e "${YELLOW}提示: 至少需要配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY${NC}"
        echo ""
        read -p "是否现在编辑 .env 文件? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} "$ENV_FILE"
        fi
    else
        echo -e "${RED}❌ 错误: 未找到 env.example 文件${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ 找到 .env 文件${NC}"
    
    # 检查必需的配置项
    if ! grep -q "VITE_SUPABASE_URL=" "$ENV_FILE" || grep -q "VITE_SUPABASE_URL=your_supabase_project_url" "$ENV_FILE"; then
        echo -e "${YELLOW}⚠️  警告: VITE_SUPABASE_URL 未配置或使用默认值${NC}"
    fi
    if ! grep -q "VITE_SUPABASE_ANON_KEY=" "$ENV_FILE" || grep -q "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" "$ENV_FILE"; then
        echo -e "${YELLOW}⚠️  警告: VITE_SUPABASE_ANON_KEY 未配置或使用默认值${NC}"
    fi
fi
echo ""

# 检查并安装依赖
echo -e "${YELLOW}[4/5] 检查项目依赖...${NC}"
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo -e "${YELLOW}未找到 node_modules，正在安装依赖...${NC}"
    cd "$PROJECT_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 依赖安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ 依赖已存在${NC}"
    # 可选：检查 package.json 是否有更新
    echo -e "${YELLOW}提示: 如果遇到问题，可以运行 'npm install' 更新依赖${NC}"
fi
echo ""

# 启动开发服务器
echo -e "${YELLOW}[5/5] 启动开发服务器...${NC}"
echo -e "${BLUE}项目目录: $PROJECT_DIR${NC}"
echo -e "${BLUE}访问地址: http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  开发服务器启动中...${NC}"
echo -e "${GREEN}  按 Ctrl+C 停止服务器${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

cd "$PROJECT_DIR"
npm run dev

