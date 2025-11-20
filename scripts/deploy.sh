#!/bin/bash

# Focus Flow 部署脚本
# 使用方法: ./scripts/deploy.sh [环境]
# 环境选项: local | vercel | docker

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_success() {
    echo -e "${GREEN}✓${NC} $1"
}

echo_error() {
    echo -e "${RED}✗${NC} $1"
}

echo_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# 检查环境变量
check_env_vars() {
    echo_info "检查环境变量..."

    if [ ! -f ".env.production" ]; then
        echo_error ".env.production 文件不存在"
        echo_info "请创建 .env.production 文件并配置以下变量："
        echo "  VITE_SUPABASE_URL=https://your-project.supabase.co"
        echo "  VITE_SUPABASE_ANON_KEY=your-anon-key"
        echo "  VITE_APP_URL=https://your-domain.com"
        exit 1
    fi

    echo_success "环境变量文件存在"
}

# 检查依赖
check_dependencies() {
    echo_info "检查依赖..."

    if ! command -v pnpm &> /dev/null; then
        echo_error "pnpm 未安装"
        echo_info "请运行: npm install -g pnpm"
        exit 1
    fi

    echo_success "依赖检查通过"
}

# 运行测试
run_tests() {
    echo_info "运行测试..."

    if pnpm test --run; then
        echo_success "所有测试通过"
    else
        echo_error "测试失败"
        read -p "是否继续部署？(y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 运行 lint
run_lint() {
    echo_info "运行代码检查..."

    if pnpm lint; then
        echo_success "代码检查通过"
    else
        echo_error "代码检查失败"
        exit 1
    fi
}

# 本地构建
build_local() {
    echo_info "开始本地构建..."

    check_env_vars
    check_dependencies
    run_tests
    run_lint

    echo_info "清理旧构建..."
    rm -rf apps/web/dist

    echo_info "安装依赖..."
    pnpm install --frozen-lockfile

    echo_info "构建项目..."
    pnpm build

    echo_success "构建完成！"
    echo_info "构建产物位于: apps/web/dist"
    echo_info "运行 'pnpm preview' 预览构建结果"
}

# Vercel 部署
deploy_vercel() {
    echo_info "部署到 Vercel..."

    if ! command -v vercel &> /dev/null; then
        echo_error "Vercel CLI 未安装"
        echo_info "请运行: npm install -g vercel"
        exit 1
    fi

    run_tests
    run_lint

    echo_info "开始部署..."
    vercel --prod

    echo_success "部署到 Vercel 完成！"
}

# Docker 构建和部署
deploy_docker() {
    echo_info "使用 Docker 构建和部署..."

    if ! command -v docker &> /dev/null; then
        echo_error "Docker 未安装"
        echo_info "请访问 https://docs.docker.com/get-docker/"
        exit 1
    fi

    check_env_vars
    run_tests
    run_lint

    echo_info "构建 Docker 镜像..."
    docker build -t focus-flow:latest .

    echo_info "停止旧容器..."
    docker stop focus-flow 2>/dev/null || true
    docker rm focus-flow 2>/dev/null || true

    echo_info "启动新容器..."
    docker run -d \
        -p 3000:80 \
        --name focus-flow \
        --restart unless-stopped \
        focus-flow:latest

    echo_success "Docker 部署完成！"
    echo_info "访问 http://localhost:3000"
}

# 主函数
main() {
    echo "Focus Flow 部署脚本"
    echo "===================="
    echo

    ENV=${1:-local}

    case $ENV in
        local)
            build_local
            ;;
        vercel)
            deploy_vercel
            ;;
        docker)
            deploy_docker
            ;;
        *)
            echo_error "未知环境: $ENV"
            echo_info "使用方法: ./scripts/deploy.sh [local|vercel|docker]"
            exit 1
            ;;
    esac
}

main "$@"
