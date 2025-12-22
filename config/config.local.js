// 本地开发环境配置
module.exports = () => {
  const config = exports = {};

  // 本地开发时可以覆盖默认配置
  config.logger = {
    level: 'DEBUG',
    consoleLevel: 'DEBUG',
  };

  // JWT配置（本地开发环境）
  // 注意：生产环境应该使用环境变量 JWT_SECRET
  config.jwt = {
    secret: process.env.JWT_SECRET || '49a9426c2315c4e2ff8cbee48602410f4f8cf96eacf12247388e579642161df7'
  };  

  // 本地数据库配置（如果需要覆盖）
  // config.sequelize = {
  //   password: 'your_local_password',
  // };

  return config;
};
