'use strict';

module.exports = () => {
  return async function cors(ctx, next) {
    // 设置 CORS 响应头
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    ctx.set('Access-Control-Expose-Headers', 'Content-Length,Content-Type');
    ctx.set('Access-Control-Max-Age', '86400'); // 24小时

    // 处理 OPTIONS 预检请求
    if (ctx.method === 'OPTIONS') {
      ctx.status = 204;
      return;
    }

    await next();
  };
};

