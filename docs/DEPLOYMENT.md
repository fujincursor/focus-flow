# Focus Flow 部署指南

本文档提供 Focus Flow 应用的完整部署说明。

## 📋 目录

1. [前置要求](#前置要求)
2. [环境变量配置](#环境变量配置)
3. [部署方式](#部署方式)
   - [方式一：Vercel 部署（推荐）](#方式一vercel-部署推荐)
   - [方式二：Docker 部署](#方式二docker-部署)
   - [方式三：传统服务器部署](#方式三传统服务器部署)
4. [数据库迁移](#数据库迁移)
5. [生产环境检查清单](#生产环境检查清单)

---

## 前置要求

### 必需服务

- **Supabase 项目**：用于数据库和认证
  - 创建账号：https://supabase.com
  - 创建新项目并获取：
    - Project URL（项目地址）
    - Anon Key（匿名密钥）

### 开发环境（仅本地构建需要）

- Node.js >= 18.0.0
- pnpm >= 8.0.0

---

## 环境变量配置

### 必需的环境变量

创建 `.env.production` 文件（或在部署平台配置）：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的匿名密钥

# 应用配置
VITE_APP_URL=https://你的域名.com
```

### 获取 Supabase 凭据

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 Settings > API
4. 复制：
   - Project URL → `VITE_SUPABASE_URL`
   - anon public → `VITE_SUPABASE_ANON_KEY`

---

## 部署方式

### 方式一：Vercel 部署（推荐）

**优点**：零配置、自动 HTTPS、全球 CDN、CI/CD 集成

#### A. 通过 GitHub 自动部署

1. **推送代码到 GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/focus-flow.git
git push -u origin main
```

2. **连接 Vercel**

- 访问 [Vercel](https://vercel.com)
- 点击 "Import Project"
- 选择你的 GitHub 仓库
- Vercel 会自动检测 `vercel.json` 配置

3. **配置环境变量**

在 Vercel 项目设置中添加：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`

4. **部署**

- 推送到 `main` 分支自动部署生产环境
- 推送到 `develop` 分支自动部署预览环境

#### B. 通过 CLI 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 首次部署（预览）
vercel

# 部署到生产环境
vercel --prod
```

---

### 方式二：Docker 部署

**优点**：环境隔离、易于迁移、可在任何支持 Docker 的平台运行

#### 1. 本地构建并运行

```bash
# 构建镜像
docker build -t focus-flow:latest .

# 运行容器
docker run -d \
  -p 3000:80 \
  --name focus-flow \
  focus-flow:latest
```

访问 http://localhost:3000

#### 2. 使用 Docker Compose

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

#### 3. 部署到云平台

**部署到 Railway：**

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

**部署到 Fly.io：**

```bash
# 安装 Fly CLI
curl -L https://fly.io/install.sh | sh

# 登录
fly auth login

# 启动部署
fly launch

# 部署
fly deploy
```

---

### 方式三：传统服务器部署

**适用于**：VPS、专用服务器（如 DigitalOcean、AWS EC2、阿里云）

#### 1. 本地构建

```bash
# 安装依赖
pnpm install

# 构建生产版本
pnpm build

# 测试构建结果
pnpm preview
```

构建产物位于：`apps/web/dist`

#### 2. 上传到服务器

```bash
# 使用 SCP 上传
scp -r apps/web/dist/* user@your-server:/var/www/focus-flow

# 或使用 rsync
rsync -avz apps/web/dist/ user@your-server:/var/www/focus-flow
```

#### 3. 配置 Nginx

创建 `/etc/nginx/sites-available/focus-flow`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/focus-flow;
    index index.html;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/focus-flow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. 配置 HTTPS（使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 数据库迁移

### 首次部署

1. **运行迁移脚本**

在 Supabase Dashboard 的 SQL Editor 中执行：

```bash
# 本地文件路径
supabase/migrations/20251119000000_init.sql
supabase/migrations/20251119000001_update_daily_summaries.sql
```

或使用 Supabase CLI：

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref 你的项目ID

# 推送迁移
supabase db push
```

2. **验证迁移**

在 Supabase Dashboard > Database 中检查：
- ✅ `tasks` 表已创建
- ✅ `daily_summaries` 表已创建
- ✅ RLS 策略已启用
- ✅ 触发器已创建

### 更新部署

如有新的迁移文件：

```bash
# 推送新迁移
supabase db push
```

---

## 生产环境检查清单

### 部署前

- [ ] 环境变量已正确配置
- [ ] Supabase 数据库迁移已完成
- [ ] 本地构建成功（`pnpm build`）
- [ ] 本地预览正常（`pnpm preview`）
- [ ] 所有测试通过（`pnpm test`）
- [ ] 代码已通过 lint 检查（`pnpm lint`）

### 部署后

- [ ] 应用可正常访问
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 任务 CRUD 操作正常
- [ ] 每日总结功能正常
- [ ] 实时同步功能正常
- [ ] 离线模式功能正常
- [ ] 移动端响应式布局正常

### 安全检查

- [ ] HTTPS 已启用
- [ ] 环境变量未泄露到前端代码
- [ ] Supabase RLS 策略已启用
- [ ] CSP 头已配置
- [ ] XSS 防护已启用

### 性能优化

- [ ] 静态资源已启用 Gzip/Brotli 压缩
- [ ] 静态资源已配置缓存策略
- [ ] 图片已优化
- [ ] 关键 CSS 已内联（如需要）
- [ ] 懒加载已启用

---

## 监控和日志

### Vercel

- 访问 Vercel Dashboard 查看：
  - 部署日志
  - 运行时日志
  - 分析数据

### Docker

```bash
# 查看容器日志
docker logs focus-flow

# 实时查看日志
docker logs -f focus-flow

# 查看容器状态
docker ps
```

### 传统服务器

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

---

## 常见问题

### Q1: 构建失败，提示找不到模块

**解决方案**：
```bash
# 清理缓存并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Q2: 部署后页面空白

**可能原因**：
1. 检查浏览器控制台错误
2. 验证环境变量是否正确
3. 检查 Supabase URL 是否可访问

### Q3: 路由刷新 404

**解决方案**：
- 确保服务器配置了 SPA fallback（所有路由指向 index.html）
- Nginx: `try_files $uri $uri/ /index.html;`
- Vercel: 自动处理

### Q4: 数据库连接失败

**检查**：
1. VITE_SUPABASE_URL 是否正确
2. VITE_SUPABASE_ANON_KEY 是否正确
3. Supabase 项目是否暂停（免费版闲置会暂停）

---

## 回滚策略

### Vercel

在 Vercel Dashboard：
1. 进入 Deployments
2. 选择之前的稳定版本
3. 点击 "Promote to Production"

### Docker

```bash
# 使用之前的镜像标签
docker run -d -p 3000:80 focus-flow:v1.0.0
```

### 传统服务器

```bash
# 保留之前的构建
mv /var/www/focus-flow /var/www/focus-flow-backup
# 恢复时
mv /var/www/focus-flow-backup /var/www/focus-flow
```

---

## 支持

如有问题，请：
1. 检查本文档的常见问题部分
2. 查看项目 Issues
3. 提交新 Issue

---

**祝部署顺利！** 🚀
