'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');
const moment = require('moment');

class DayService extends Service {
  // 创建重要日子
  async create(data) {
    const { ctx } = this;
    const day = await ctx.model.ImportantDay.create({
      ...data,
    });
    return await this.findById(day.id, data.user_id);
  }

  // 根据ID查找
  async findById(id, userId) {
    const { ctx } = this;
    const day = await ctx.model.ImportantDay.findOne({
      where: {
        id,
        user_id: userId,
      },
    });
    return day;
  }

  // 获取列表
  async list({ user_id, page, limit, type }) {
    const { ctx } = this;
    const offset = (page - 1) * limit;
    const where = {
      user_id,
      is_active: true,
    };
    
    if (type) {
      where.type = type;
    }

    const { count, rows } = await ctx.model.ImportantDay.findAndCountAll({
      where,
      order: [['date', 'ASC']],
      limit,
      offset,
    });

    return {
      list: rows,
      total: count,
      page,
      limit,
    };
  }

  // 获取即将到来的日子
  async getUpcoming(userId, days) {
    const { ctx } = this;
    const today = moment().format('YYYY-MM-DD');
    const targetDate = moment().add(days, 'days').format('YYYY-MM-DD');

    const upcomingDays = await ctx.model.ImportantDay.findAll({
      where: {
        user_id: userId,
        is_active: true,
        date: {
          [Op.gte]: today,
          [Op.lte]: targetDate,
        },
      },
      order: [['date', 'ASC']],
    });

    return upcomingDays;
  }

  // 更新
  async update(id, data) {
    const { ctx } = this;
    const day = await ctx.model.ImportantDay.findByPk(id);
    if (!day) {
      return false;
    }
    await day.update(data);
    return true;
  }

  // 删除
  async delete(id) {
    const { ctx } = this;
    const day = await ctx.model.ImportantDay.findByPk(id);
    if (!day) {
      return false;
    }
    await day.update({ is_active: false });
    return true;
  }
}

module.exports = DayService;

