# Focus Flow 部署脚本 (Windows PowerShell)
# 使用方法: .\scripts\deploy.ps1 [环境]
# 环境选项: local | vercel | docker

param(
    [Parameter(Position=0)]
    [ValidateSet('local', 'vercel', 'docker')]
    [string]$Environment = 'local'
)

$ErrorActionPreference = "Stop"

# 颜色输出函数
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

# 检查环境变量
function Test-EnvVars {
    Write-Info "检查环境变量..."

    if (-not (Test-Path ".env.production")) {
        Write-Error ".env.production 文件不存在"
        Write-Info "请创建 .env.production 文件并配置以下变量："
        Write-Host "  VITE_SUPABASE_URL=https://your-project.supabase.co"
        Write-Host "  VITE_SUPABASE_ANON_KEY=your-anon-key"
        Write-Host "  VITE_APP_URL=https://your-domain.com"
        exit 1
    }

    Write-Success "环境变量文件存在"
}

# 检查依赖
function Test-Dependencies {
    Write-Info "检查依赖..."

    try {
        $null = Get-Command pnpm -ErrorAction Stop
        Write-Success "pnpm 已安装"
    }
    catch {
        Write-Error "pnpm 未安装"
        Write-Info "请运行: npm install -g pnpm"
        exit 1
    }
}

# 运行测试
function Invoke-Tests {
    Write-Info "运行测试..."

    try {
        pnpm test --run
        Write-Success "所有测试通过"
    }
    catch {
        Write-Error "测试失败"
        $continue = Read-Host "是否继续部署？(y/N)"
        if ($continue -ne 'y' -and $continue -ne 'Y') {
            exit 1
        }
    }
}

# 运行 lint
function Invoke-Lint {
    Write-Info "运行代码检查..."

    try {
        pnpm lint
        Write-Success "代码检查通过"
    }
    catch {
        Write-Error "代码检查失败"
        exit 1
    }
}

# 本地构建
function Build-Local {
    Write-Info "开始本地构建..."

    Test-EnvVars
    Test-Dependencies
    Invoke-Tests
    Invoke-Lint

    Write-Info "清理旧构建..."
    if (Test-Path "apps\web\dist") {
        Remove-Item -Recurse -Force "apps\web\dist"
    }

    Write-Info "安装依赖..."
    pnpm install --frozen-lockfile

    Write-Info "构建项目..."
    pnpm build

    Write-Success "构建完成！"
    Write-Info "构建产物位于: apps\web\dist"
    Write-Info "运行 'pnpm preview' 预览构建结果"
}

# Vercel 部署
function Deploy-Vercel {
    Write-Info "部署到 Vercel..."

    try {
        $null = Get-Command vercel -ErrorAction Stop
    }
    catch {
        Write-Error "Vercel CLI 未安装"
        Write-Info "请运行: npm install -g vercel"
        exit 1
    }

    Invoke-Tests
    Invoke-Lint

    Write-Info "开始部署..."
    vercel --prod

    Write-Success "部署到 Vercel 完成！"
}

# Docker 构建和部署
function Deploy-Docker {
    Write-Info "使用 Docker 构建和部署..."

    try {
        $null = Get-Command docker -ErrorAction Stop
    }
    catch {
        Write-Error "Docker 未安装"
        Write-Info "请访问 https://docs.docker.com/get-docker/"
        exit 1
    }

    Test-EnvVars
    Invoke-Tests
    Invoke-Lint

    Write-Info "构建 Docker 镜像..."
    docker build -t focus-flow:latest .

    Write-Info "停止旧容器..."
    docker stop focus-flow 2>$null
    docker rm focus-flow 2>$null

    Write-Info "启动新容器..."
    docker run -d `
        -p 3000:80 `
        --name focus-flow `
        --restart unless-stopped `
        focus-flow:latest

    Write-Success "Docker 部署完成！"
    Write-Info "访问 http://localhost:3000"
}

# 主函数
function Main {
    Write-Host "Focus Flow 部署脚本" -ForegroundColor Cyan
    Write-Host "====================" -ForegroundColor Cyan
    Write-Host ""

    switch ($Environment) {
        'local' {
            Build-Local
        }
        'vercel' {
            Deploy-Vercel
        }
        'docker' {
            Deploy-Docker
        }
    }
}

# 执行主函数
Main
