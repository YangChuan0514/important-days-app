'use strict';

const Controller = require('egg').Controller;
const { requireAuth } = require('../utils/auth');

class UserController extends Controller {
  // 获取用户信息
  async info() {
    const { ctx } = this;
    
    const userId = requireAuth(ctx);
    if (!userId) return;
    
    try {
      const user = await ctx.service.user.findById(userId);
      if (!user) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '用户不存在',
        };
        return;
      }

      ctx.body = {
        code: 200,
        data: {
          id: user.id,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          default_remind_time: user.default_remind_time || '09:00',
        },
      };
    } catch (error) {
      ctx.logger.error('获取用户信息失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '获取用户信息失败',
      };
    }
  }

  // 更新用户信息（昵称、头像、默认提醒时间等）
  async updateInfo() {
    const { ctx } = this;
    
    const userId = requireAuth(ctx);
    if (!userId) return;
    const { nickname, avatar_url, default_remind_time } = ctx.request.body;

    try {
      const updateData = {};
      if (nickname !== undefined) updateData.nickname = nickname;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (default_remind_time !== undefined) {
        // 验证时间格式
        const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timePattern.test(default_remind_time)) {
          ctx.status = 400;
          ctx.body = {
            code: 400,
            message: '提醒时间格式不正确，应为 HH:mm 格式',
          };
          return;
        }
        updateData.default_remind_time = default_remind_time;
      }

      const user = await ctx.service.user.update(userId, updateData);

      if (!user) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '用户不存在',
        };
        return;
      }

      ctx.body = {
        code: 200,
        data: {
          id: user.id,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          default_remind_time: user.default_remind_time || '09:00',
        },
      };
    } catch (error) {
      ctx.logger.error('更新用户信息失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '更新用户信息失败',
      };
    }
  }
}

module.exports = UserController;

