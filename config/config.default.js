module.exports = appInfo => {
  const config = exports = {};

  // 应用基础配置
  config.keys = appInfo.name + '_secret_key_change_in_production';

  // 中间件配置
  config.middleware = ['errorHandler', 'auth'];
  
  // auth中间件配置（只使用ignore，排除不需要认证的路径）
  config.auth = {
    ignore: ['/api/auth/login', '/api/auth/login-phone'],
  };

  // 安全配置
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ['*'],
  };

  // CORS配置
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  // Sequelize配置（支持MySQL 8.0+）
  config.sequelize = {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'wx-day-app',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'yc990514',
    timezone: '+08:00',
    define: {
      freezeTableName: true,
      underscored: false,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };

  // Redis配置
  config.redis = {
    client: {
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST || '127.0.0.1',
      password: process.env.REDIS_PASSWORD || '',
      db: 0,
    },
  };

  // JWT配置
  config.jwt = {
    secret: process.env.JWT_SECRET || '49a9426c2315c4e2ff8cbee48602410f4f8cf96eacf12247388e579642161df7',
    expiresIn: '7d',
  };

  // 微信小程序配置
  config.wechat = {
    appId: process.env.WECHAT_APPID || 'wx31e92686f9b0b45f',
    appSecret: process.env.WECHAT_SECRET || '534d57aec482778bea9b1520729e6e6e',
    templateId: process.env.WECHAT_TEMPLATE_ID || 'AhAC1V5V_8dnj622uJjIeBGSMnAiAh2N2Hn4sqppZH0',
  };

  // 定时任务配置
  config.schedule = {
    enable: true,
  };

  return config;
};

