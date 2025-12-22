# 重要日子提醒小程序 - 后端

基于 Egg.js 的后端服务

## 技术栈

- Node.js 18+
- Egg.js 3.0
- MySQL 8.0
- Redis 6.x
- node-cron (定时任务)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=important_days

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=your_jwt_secret_key

WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
WECHAT_TEMPLATE_ID=your_template_id
```

### 3. 初始化数据库

执行 `数据库设计.sql` 文件创建表结构

### 4. 启动服务

```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## API文档

### 认证相关

- `POST /api/auth/login` - 微信登录

### 用户相关

- `GET /api/user/info` - 获取用户信息

### 重要日子相关

- `POST /api/days` - 添加重要日子
- `GET /api/days` - 获取日子列表
- `GET /api/days/upcoming` - 获取即将到来的日子
- `GET /api/days/:id` - 获取日子详情
- `PUT /api/days/:id` - 更新重要日子
- `DELETE /api/days/:id` - 删除重要日子

### 推送相关

- `GET /api/push/logs` - 获取推送记录

## 定时任务

- 每分钟：执行待推送任务
- 每天凌晨1点：生成所有日子的推送任务

## 部署

使用 PM2 或 Docker 部署

