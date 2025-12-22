"use strict";

const jwt = require("jsonwebtoken");

module.exports = () => {
  return async function auth(ctx, next) {
    // 只处理 /api 开头的路径
    if (!ctx.path.startsWith("/api")) {
      await next();
      return;
    }

    // 获取基础路径（去除查询参数）
    const basePath = ctx.path.split('?')[0];
    
    // 白名单路径，不需要认证（与 config.default.js 中的配置保持一致）
    const whiteList = ["/api/auth/login", "/api/auth/login-phone"];

    if (whiteList.includes(basePath)) {
      await next();
      return;
    }

    // 获取token
    const token = ctx.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: "未授权，请先登录",
      };
      return;
    }
    try {
      const tokenString = token.replace("Bearer ", "");
      // 验证token
      const decoded = jwt.verify(
        tokenString,
        ctx.app.config.jwt.secret
      );
      // 将解码后的用户信息存储到 ctx.state.user
      ctx.state.user = decoded;
      await next();
    } catch (error) {
      ctx.logger.error('Token验证失败:', {
        error: error.message,
        errorName: error.name,
        path: ctx.path,
        tokenPrefix: token ? token.substring(0, 20) + '...' : 'no token',
      });
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: error.name === 'TokenExpiredError' 
          ? "Token已过期，请重新登录" 
          : "Token无效，请重新登录",
      };
    }
  };
};
