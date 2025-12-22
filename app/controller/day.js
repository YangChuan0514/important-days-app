'use strict';

const Controller = require('egg').Controller;
const { requireAuth } = require('../utils/auth');

class DayController extends Controller {
  // 添加重要日子
  async create() {
    const { ctx } = this;
    const userId = requireAuth(ctx);
    if (!userId) return;
    const { name, date, type, note, remind_days, remind_time, is_repeat } = ctx.request.body;

    // 参数验证
    if (!name || !date) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '缺少必要参数',
      };
      return;
    }

    try {
      // 如果没有提供提醒时间，使用用户的默认提醒时间
      let finalRemindTime = remind_time;
      if (!finalRemindTime) {
        const user = await ctx.service.user.findById(userId);
        finalRemindTime = user?.default_remind_time || '09:00';
      }
      
      // 确保时间格式为 HH:mm:00
      if (finalRemindTime.length === 5) {
        finalRemindTime = `${finalRemindTime}:00`;
      }
      
      const day = await ctx.service.day.create({
        user_id: userId,
        name,
        date,
        type: type || 'other',
        note: note || '',
        remind_days: remind_days || 7,
        remind_time: finalRemindTime,
        is_repeat: is_repeat !== undefined ? is_repeat : true,
      });

      // 生成推送任务
      await ctx.service.push.generateTasks(day.id);

      ctx.body = {
        code: 200,
        data: day,
      };
    } catch (error) {
      ctx.logger.error('添加重要日子失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '添加失败',
      };
    }
  }

  // 获取日子列表
  async list() {
    const { ctx } = this;
    const userId = requireAuth(ctx);
    if (!userId) return;
    const { page = 1, limit = 20, type } = ctx.query;

    try {
      const result = await ctx.service.day.list({
        user_id: userId,
        page: parseInt(page),
        limit: parseInt(limit),
        type,
      });

      ctx.body = {
        code: 200,
        data: result,
      };
    } catch (error) {
      ctx.logger.error('获取列表失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '获取列表失败',
      };
    }
  }

  // 获取即将到来的日子
  async upcoming() {
    const { ctx } = this;
    const userId = requireAuth(ctx);
    if (!userId) return;
    const days = parseInt(ctx.query.days) || 30;

    try {
      const list = await ctx.service.day.getUpcoming(userId, days);
      ctx.body = {
        code: 200,
        data: list,
      };
    } catch (error) {
      ctx.logger.error('获取即将到来的日子失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '获取失败',
      };
    }
  }

  // 获取日子详情
  async show() {
    const { ctx } = this;
    const userId = requireAuth(ctx);
    if (!userId) return;
    const { id } = ctx.params;

    try {
      const day = await ctx.service.day.findById(id, userId);
      if (!day) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '记录不存在',
        };
        return;
      }

      ctx.body = {
        code: 200,
        data: day,
      };
    } catch (error) {
      ctx.logger.error('获取详情失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '获取详情失败',
      };
    }
  }

  // 更新重要日子
  async update() {
    const { ctx } = this;
    const userId = requireAuth(ctx);
    if (!userId) return;
    const { id } = ctx.params;
    const data = ctx.request.body;

    try {
      // 检查权限
      const day = await ctx.service.day.findById(id, userId);
      if (!day) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '记录不存在',
        };
        return;
      }

      // 处理提醒时间格式
      if (data.remind_time) {
        // 如果是 HH:mm 格式，转换为 HH:mm:00
        if (data.remind_time.length === 5) {
          data.remind_time = `${data.remind_time}:00`;
        }
      } else {
        // 如果没有提供提醒时间，使用用户的默认提醒时间
        const user = await ctx.service.user.findById(userId);
        if (user?.default_remind_time) {
          data.remind_time = user.default_remind_time.length === 5 
            ? `${user.default_remind_time}:00` 
            : user.default_remind_time;
        }
      }

      // 更新
      await ctx.service.day.update(id, data);

      // 重新生成推送任务
      await ctx.service.push.regenerateTasks(id);

      ctx.body = {
        code: 200,
        message: '更新成功',
      };
    } catch (error) {
      ctx.logger.error('更新失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '更新失败',
      };
    }
  }

  // 删除重要日子
  async destroy() {
    const { ctx } = this;
    const userId = requireAuth(ctx);
    if (!userId) return;
    const { id } = ctx.params;

    try {
      // 检查权限
      const day = await ctx.service.day.findById(id, userId);
      if (!day) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '记录不存在',
        };
        return;
      }

      // 删除
      await ctx.service.day.delete(id);

      // 删除相关推送任务
      await ctx.service.push.deleteTasks(id);

      ctx.body = {
        code: 200,
        message: '删除成功',
      };
    } catch (error) {
      ctx.logger.error('删除失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '删除失败',
      };
    }
  }
}

module.exports = DayController;

