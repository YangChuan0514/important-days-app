'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  // 根据openid查找用户
  async findByOpenid(openid) {
    const { ctx } = this;
    try {
    const user = await ctx.model.User.findOne({
      where: { openid },
        // 明确指定字段，如果 default_remind_time 不存在会报错，这里先尝试查询所有字段
        attributes: { exclude: [] },
    });
    return user;
    } catch (error) {
      // 如果字段不存在，使用原始查询（不包含 default_remind_time）
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('default_remind_time')) {
        ctx.logger.warn('default_remind_time 字段不存在，使用兼容模式查询');
        const user = await ctx.model.User.findOne({
          where: { openid },
          attributes: ['id', 'openid', 'unionid', 'nickname', 'avatar_url', 'phone', 'created_at', 'updated_at'],
        });
        // 添加默认值
        if (user) {
          user.default_remind_time = '09:00';
        }
        return user;
      }
      throw error;
    }
  }

  // 根据ID查找用户
  async findById(id) {
    const { ctx } = this;
    try {
    const user = await ctx.model.User.findByPk(id);
    return user;
    } catch (error) {
      // 如果字段不存在，使用兼容模式
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('default_remind_time')) {
        ctx.logger.warn('default_remind_time 字段不存在，使用兼容模式查询');
        const user = await ctx.model.User.findByPk(id, {
          attributes: ['id', 'openid', 'unionid', 'nickname', 'avatar_url', 'phone', 'created_at', 'updated_at'],
        });
        if (user) {
          user.default_remind_time = '09:00';
        }
        return user;
      }
      throw error;
    }
  }

  // 创建用户
  async create(data) {
    const { ctx } = this;
    const { v4: uuidv4 } = require('uuid');
    const userData = {
      id: uuidv4(), // 生成UUID
      openid: data.openid,
      unionid: data.unionid || null,
      nickname: data.nickname || null,
      avatar_url: data.avatar_url || null,
      phone: data.phone || null,
    };
    // 如果提供了默认提醒时间，则添加
    if (data.default_remind_time !== undefined) {
      userData.default_remind_time = data.default_remind_time;
    }
    const user = await ctx.model.User.create(userData);
    return user;
  }

  // 更新用户信息
  async update(id, data) {
    const { ctx } = this;
    const user = await ctx.model.User.findByPk(id);
    if (!user) {
      return null;
    }
    await user.update(data);
    return user;
  }
}

module.exports = UserService;

