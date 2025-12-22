'use strict';

const Controller = require('egg').Controller;
const { requireAuth } = require('../utils/auth');

class PushController extends Controller {
  // 获取推送记录
  async logs() {
    const { ctx } = this;
    const userId = requireAuth(ctx);
    if (!userId) return;
    const { page = 1, limit = 20 } = ctx.query;

    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await ctx.model.PushLog.findAndCountAll({
        where: { user_id: userId },
        order: [['push_time', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      ctx.body = {
        code: 200,
        data: {
          list: rows,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      ctx.logger.error('获取推送记录失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '获取推送记录失败',
      };
    }
  }

  // 订阅消息接受后，立即生成推送任务；取消订阅时，删除推送任务
  async subscribe() {
    const { ctx } = this;
    const userId = requireAuth(ctx);
    if (!userId) return;
    const { templateId, accept } = ctx.request.body;

    try {
      if (accept && templateId) {
        // 用户接受订阅，立即为该用户的所有重要日子生成推送任务
        await ctx.service.push.generateUserTasks(userId);
        
        ctx.logger.info(`用户 ${userId} 接受订阅消息，已生成推送任务`);
        
        ctx.body = {
          code: 200,
          message: '订阅成功，已生成推送任务',
        };
      } else {
        // 用户取消订阅，删除该用户的所有待执行推送任务
        const deletedCount = await ctx.service.push.deleteUserTasks(userId);
        
        ctx.logger.info(`用户 ${userId} 取消订阅，已删除 ${deletedCount} 个推送任务`);
        
        ctx.body = {
          code: 200,
          message: '已取消订阅',
          data: {
            deletedTasks: deletedCount,
          },
        };
      }
    } catch (error) {
      ctx.logger.error('处理订阅消息失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '处理订阅消息失败',
      };
    }
  }
}

module.exports = PushController;

