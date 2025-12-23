'use strict';

exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};

exports.redis = {
  enable: true,
  package: 'egg-redis',
};

// 使用自定义 CORS 中间件，禁用 egg-cors 插件以避免冲突
// exports.cors = {
//   enable: true,
//   package: 'egg-cors',
// };

