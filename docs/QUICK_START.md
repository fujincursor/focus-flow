# 快速开始 - 5分钟部署 Focus Flow

本指南将帮助你在 5 分钟内部署 Focus Flow 到生产环境。

## 🚀 最快部署方式：Vercel (推荐)

### 步骤 1: 准备 Supabase

1. 访问 [Supabase](https://supabase.com) 并创建账号
2. 创建新项目
3. 在 SQL Editor 中执行迁移脚本：
   - 复制 `supabase/migrations/20251119000000_init.sql` 的内容并执行
   - 复制 `supabase/migrations/20251119000001_update_daily_summaries.sql` 的内容并执行
4. 在 Settings > API 中获取：
   - Project URL
   - anon public key

### 步骤 2: 部署到 Vercel

**方式 A: 一键部署（最简单）**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/focus-flow)

点击按钮后：
1. 导入仓库到 Vercel
2. 配置环境变量：
   - `VITE_SUPABASE_URL`: 你的 Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: 你的 Supabase anon key
   - `VITE_APP_URL`: 将由 Vercel 自动分配
3. 点击 Deploy

**方式 B: 通过 GitHub**

1. 推送代码到 GitHub：
```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

2. 在 [Vercel](https://vercel.com) 导入 GitHub 仓库

3. 配置环境变量（同上）

4. 部署！

### 步骤 3: 测试应用

访问 Vercel 提供的 URL，测试以下功能：
- ✅ 用户注册
- ✅ 用户登录
- ✅ 创建任务
- ✅ 查看每日总结

🎉 **完成！你的应用已上线！**

---

## 🐳 使用 Docker 部署

### Windows 用户

```powershell
# 1. 创建环境变量文件
Copy-Item .env.example .env.production
# 编辑 .env.production 填入你的 Supabase 凭据

# 2. 运行部署脚本
.\scripts\deploy.ps1 docker

# 3. 访问应用
# http://localhost:3000
```

### Linux/Mac 用户

```bash
# 1. 创建环境变量文件
cp .env.example .env.production
# 编辑 .env.production 填入你的 Supabase 凭据

# 2. 赋予脚本执行权限
chmod +x scripts/deploy.sh

# 3. 运行部署脚本
./scripts/deploy.sh docker

# 4. 访问应用
# http://localhost:3000
```

---

## 💻 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 启动本地 Supabase（可选）
pnpm supabase:start

# 3. 运行数据库迁移
pnpm supabase:migrate

# 4. 启动开发服务器
pnpm dev

# 访问 http://localhost:5173
```

---

## 📦 手动构建

```bash
# Windows
.\scripts\deploy.ps1 local

# Linux/Mac
./scripts/deploy.sh local
```

构建产物位于 `apps/web/dist`，可以部署到任何静态服务器。

---

## 🔧 环境变量说明

创建 `.env.production` 文件：

```bash
# 必需
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# 可选（Vercel 会自动设置）
VITE_APP_URL=https://your-app.vercel.app
```

---

## ❓ 常见问题

### Q: 构建失败怎么办？

```bash
# 清理并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Q: 部署后页面空白？

1. 检查浏览器控制台错误
2. 验证环境变量是否正确
3. 确认 Supabase 迁移已执行

### Q: 如何更新部署？

**Vercel:**
```bash
git add .
git commit -m "更新内容"
git push
# Vercel 自动部署
```

**Docker:**
```bash
# Windows
.\scripts\deploy.ps1 docker

# Linux/Mac
./scripts/deploy.sh docker
```

---

## 📚 更多资源

- [完整部署指南](./DEPLOYMENT.md)
- [项目结构](../PROJECT_STRUCTURE.md)
- [开发文档](../README.md)

---

**需要帮助？** 提交 [Issue](https://github.com/你的用户名/focus-flow/issues)
