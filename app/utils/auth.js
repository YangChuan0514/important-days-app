'use strict';

/**
 * 获取当前登录用户ID
 * @param {Object} ctx - Koa context
 * @returns {Number|null} 用户ID，如果未登录返回null
 */
function getUserId(ctx) {
  if (!ctx.state.user || !ctx.state.user.userId) {
    return null;
  }
  return ctx.state.user.userId;
}

/**
 * 检查用户是否已登录，如果未登录则返回401错误
 * @param {Object} ctx - Koa context
 * @returns {Number|null} 用户ID，如果未登录则已发送401响应并返回null
 */
function requireAuth(ctx) {
  const userId = getUserId(ctx);
  if (!userId) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: '未授权，请先登录',
    };
    return null;
  }
  return userId;
}

module.exports = {
  getUserId,
  requireAuth,
};

