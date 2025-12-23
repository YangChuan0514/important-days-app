'use strict';

module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      // 所有的异常都在 app 上触发一个 error 事件
      ctx.app.emit('error', err, ctx);

      const status = err.status || 500;
      const error = status === 500 && ctx.app.config.env === 'prod'
        ? 'Internal Server Error'
        : err.message;

      // 确保错误响应也包含 CORS 头
      ctx.set('Access-Control-Allow-Origin', '*');
      ctx.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
      
      ctx.status = status;
      ctx.body = {
        code: status,
        message: error,
        ...(ctx.app.config.env === 'development' && { stack: err.stack }),
      };
    }
  };
};

