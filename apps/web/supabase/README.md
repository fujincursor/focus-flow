# Supabase 数据库配置

Focus Flow 支持两种 Supabase 使用方式：

## 🌐 方式 1: 云端 Supabase（推荐）

**优点：**
- ✅ 无需安装 Docker
- ✅ 即时可用
- ✅ 自动备份
- ✅ 免费计划够用
- ✅ 团队协作方便

**详细配置指南：** 请查看 [CLOUD_SETUP.md](./CLOUD_SETUP.md)

**快速开始：**
1. 访问 https://supabase.com 创建项目
2. 复制 Project URL 和 anon key 到 `apps/web/.env.local`
3. 在 Supabase Dashboard 的 SQL Editor 中执行迁移脚本
4. 运行 `pnpm dev` 启动应用

---

## 🏠 方式 2: 本地 Supabase

仅当您需要完全离线开发或有特殊需求时使用。

### 前置要求

1. 安装 Docker Desktop（Supabase 本地实例需要）
2. 安装 Supabase CLI：

```bash
# Windows (使用 Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# macOS
brew install supabase/tap/supabase

# Linux
brew install supabase/tap/supabase
```

## 启动本地 Supabase

```bash
# 从项目根目录运行
pnpm supabase:start

# 或者直接在 apps/web 目录运行
cd apps/web
supabase start
```

首次启动会下载 Docker 镜像（约 1-2 GB），可能需要几分钟时间。

启动成功后，你会看到：

```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 访问 Supabase Studio

打开浏览器访问：http://localhost:54323

在 Studio 中你可以：
- 查看数据库表和数据
- 执行 SQL 查询
- 管理用户认证
- 查看实时订阅
- 测试 API

## 停止 Supabase

```bash
pnpm supabase:stop

# 或
cd apps/web
supabase stop
```

## 应用迁移

迁移文件位于 `migrations/` 目录。当你运行 `supabase start` 时，所有迁移会自动应用。

如果你修改了迁移文件或添加了新的迁移：

```bash
# 重置数据库（会清空所有数据）
supabase db reset

# 或者手动应用迁移
pnpm supabase:migrate
```

## 数据库连接信息

- **Host**: localhost
- **Port**: 54322
- **Database**: postgres
- **User**: postgres
- **Password**: postgres

你可以使用任何 PostgreSQL 客户端工具连接（如 pgAdmin, TablePlus, DBeaver）。

## 环境变量

确保 `apps/web/.env.local` 文件包含以下配置：

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## 测试邮件

本地开发时，所有邮件（注册确认、密码重置等）都会发送到 Inbucket。

访问：http://localhost:54324 查看所有发送的邮件。

## 数据库 Schema

当前迁移包含以下表：

### `tasks` 表
- 任务管理的核心表
- 包含 `time_sensitivity` 字段（'today', 'this_week', 'anytime'）
- 启用 RLS（行级安全策略）

### `daily_summaries` 表
- 每日任务完成统计
- 通过数据库触发器自动更新
- 支持用户反思笔记（`reflection_note`）

### `user_profiles` 表
- 用户个人资料
- 新用户注册时自动创建

## 故障排除

### Docker 未运行
```
Error: Cannot connect to the Docker daemon
```
解决：确保 Docker Desktop 已启动

### 端口被占用
```
Error: Port 54321 is already in use
```
解决：修改 `config.toml` 中的端口配置，或停止占用端口的其他服务

### 迁移失败
```
Error: migration failed
```
解决：
1. 检查迁移 SQL 语法
2. 运行 `supabase db reset` 重置数据库
3. 查看详细错误日志
