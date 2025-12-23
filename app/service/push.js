"use strict";

const Service = require("egg").Service;
const axios = require("axios");
const moment = require("moment");
const cron = require("node-cron");
const { Op } = require("sequelize");

class PushService extends Service {
  // 初始化推送服务
  async init() {
    // 启动定时任务：每分钟检查待推送任务
    cron.schedule("* * * * *", async () => {
      await this.executePendingTasks();
    });

    // 每天凌晨1点生成推送任务
    cron.schedule("0 1 * * *", async () => {
      await this.generateAllTasks();
    });

    this.ctx.logger.info("推送服务初始化完成");
  }

  // 为单个日子生成推送任务
  async generateTasks(dayId) {
    const { ctx } = this;
    const day = await ctx.model.ImportantDay.findByPk(dayId);
    
    if (!day || !day.is_active) {
      return;
    }

    const targetDate = moment(day.date);
    const today = moment().startOf("day");
    const daysDiff = targetDate.diff(today, "days");

    // 如果日子在未来，生成推送任务
    if (daysDiff >= 0 && daysDiff <= day.remind_days) {
      // 删除旧任务
      await ctx.model.PushTask.destroy({
        where: { day_id: dayId },
      });

      // 生成新任务
      const now = moment();
      for (let i = day.remind_days; i >= 0; i--) {
        const taskDate = moment(targetDate).subtract(i, "days");
        
        if (taskDate.isSameOrAfter(today)) {
          // 处理提醒时间格式：可能是 "09:00" 或 "09:00:00"
          let remindTime = day.remind_time || "09:00";
          // 确保时间格式为 HH:mm:ss
          if (remindTime.length === 5) {
            remindTime = `${remindTime}:00`;
          }
          
          // 构建完整的日期时间字符串
          const taskDateTimeStr = `${taskDate.format("YYYY-MM-DD")} ${remindTime}`;
          let taskTime = moment(taskDateTimeStr, "YYYY-MM-DD HH:mm:ss");
          
          // 验证时间是否有效
          if (!taskTime.isValid()) {
            ctx.logger.error(`无效的提醒时间: ${remindTime}, 日子ID: ${dayId}`);
            // 使用默认时间
            taskTime = moment(`${taskDate.format("YYYY-MM-DD")} 09:00:00`, "YYYY-MM-DD HH:mm:ss");
          }
          
          // 关键修复：如果任务时间已经过去，不生成任务（或者设置为未来的时间）
          // 如果任务日期是今天，但提醒时间已经过去，则设置为明天的相同时间
          if (taskTime.isBefore(now)) {
            // 如果任务时间已经过去，检查是否是今天
            if (taskDate.isSame(today, 'day')) {
              // 如果是今天但时间已过，设置为明天的相同时间
              taskTime = taskTime.add(1, 'day');
              ctx.logger.info(`任务时间已过，调整为明天: ${taskTime.format("YYYY-MM-DD HH:mm:ss")}, 日子ID: ${dayId}`);
            } else {
              // 如果是过去的日期，跳过这个任务
              ctx.logger.info(`跳过已过期的任务: ${taskTime.format("YYYY-MM-DD HH:mm:ss")}, 日子ID: ${dayId}`);
              continue;
            }
          }
          
          // 创建任务，确保任务时间是未来的时间
          await ctx.model.PushTask.create({
            user_id: day.user_id,
            day_id: dayId,
            task_date: taskDate.toDate(),
            task_time: taskTime.toDate(),
            status: "pending",
            retry_count: 0,
          });
          
          ctx.logger.info(`生成推送任务: 日子ID=${dayId}, 任务时间=${taskTime.format("YYYY-MM-DD HH:mm:ss")}`);
        }
      }
    }
  }

  // 重新生成推送任务
  async regenerateTasks(dayId) {
    await this.generateTasks(dayId);
  }

  // 删除推送任务
  async deleteTasks(dayId) {
    const { ctx } = this;
    await ctx.model.PushTask.destroy({
      where: { day_id: dayId },
    });
  }

  // 删除用户的所有推送任务（取消订阅时使用）
  async deleteUserTasks(userId) {
    const { ctx } = this;
    const result = await ctx.model.PushTask.destroy({
      where: { 
        user_id: userId,
        status: {
          [Op.in]: ['pending', 'processing'] // 只删除待执行和处理中的任务
        }
      },
    });
    
    this.ctx.logger.info(`用户 ${userId} 取消订阅，已删除 ${result} 个推送任务`);
    return result;
  }

  // 生成所有日子的推送任务
  async generateAllTasks() {
    const { ctx } = this;
    const days = await ctx.model.ImportantDay.findAll({
      where: { is_active: true },
    });

    for (const day of days) {
      await this.generateTasks(day.id);
    }

    this.ctx.logger.info(`生成了 ${days.length} 个日子的推送任务`);
  }

  // 为指定用户的所有日子生成推送任务
  async generateUserTasks(userId) {
    const { ctx } = this;
    const days = await ctx.model.ImportantDay.findAll({
      where: {
        user_id: userId,
        is_active: true,
      },
    });

    let taskCount = 0;
    for (const day of days) {
      await this.generateTasks(day.id);
      taskCount++;
    }

    this.ctx.logger.info(
      `为用户 ${userId} 生成了 ${taskCount} 个日子的推送任务`
    );
    return taskCount;
  }

  // 执行待推送任务
  async executePendingTasks() {
    const { ctx } = this;
    const now = moment();
    // 只执行已经到时间的任务（task_time <= 当前时间）
    // 但不要执行太早的任务（避免重复执行），只执行最近1分钟内的任务
    const oneMinuteAgo = now.clone().subtract(1, 'minute').toDate();
    const currentTime = now.toDate();

    const tasks = await ctx.model.PushTask.findAll({
      where: {
        status: "pending",
        task_time: {
          [Op.lte]: currentTime, // 只执行已经到时间的任务
          [Op.gte]: oneMinuteAgo,  // 但不要执行太早的任务（避免重复执行）
        },
      },
      limit: 10,
      order: [['task_time', 'ASC']], // 按时间顺序执行
    });
    for (const task of tasks) {
      try {
        // 更新任务状态为处理中
        await task.update({ status: "processing" });

        // 执行推送
        await this.sendPush(task);

        // 更新任务状态为完成
        await task.update({ status: "completed" });
      } catch (error) {
        this.ctx.logger.error(`推送任务执行失败: ${task.id}`, error);
        
        // 更新任务状态为失败
        const retryCount = task.retry_count + 1;
        await task.update({
          status: retryCount >= 3 ? "failed" : "pending",
          retry_count: retryCount,
        });
      }
    }
  }

  // 清理字段值，移除不支持的字符
  cleanFieldValue(value, maxLength = 20) {
    if (!value) return "";

    // 移除emoji和特殊字符，只保留中文、英文、数字和基本标点
    let cleaned = value
      .toString()
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "") // 移除emoji
      .replace(/[\u{2600}-\u{26FF}]/gu, "") // 移除杂项符号
      .replace(/[\u{2700}-\u{27BF}]/gu, "") // 移除装饰符号
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s，。！？、：；]/g, "") // 只保留中文、英文、数字和基本标点
      .trim();

    // 限制长度
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength);
    }

    // 如果清理后为空，使用默认值
    if (!cleaned || cleaned.length === 0) {
      cleaned = "重要日子";
    }

    return cleaned;
  }

  // 清理 name 类型字段值（微信要求不能包含数字或不能以数字结尾）
  cleanNameFieldValue(value, maxLength = 20) {
    if (!value) return "重要日子";

    // 先进行基本清理
    let cleaned = this.cleanFieldValue(value, maxLength);

    // 检查是否为纯数字（微信 name 类型字段不允许纯数字）
    if (/^\d+$/.test(cleaned)) {
      // 如果是纯数字，转换为中文数字
      const numToChinese = {
        "0": "零", "1": "一", "2": "二", "3": "三", "4": "四",
        "5": "五", "6": "六", "7": "七", "8": "八", "9": "九"
      };
      
      // 如果是一位数，转换为中文
      if (cleaned.length === 1) {
        cleaned = `第${numToChinese[cleaned] || "一"}个重要日子`;
      } else {
        // 多位数使用通用名称
        cleaned = "重要日子";
      }
    } else {
      // 如果不是纯数字，但包含数字，移除所有数字
      // 微信 name 字段可能不允许包含数字
      cleaned = cleaned.replace(/\d+/g, "").trim();
      
      // 如果移除数字后为空，使用默认值
      if (!cleaned || cleaned.length === 0) {
        cleaned = "重要日子";
      }
    }

    // 确保至少包含一个中文字符或英文字母
    if (!/[\u4e00-\u9fa5a-zA-Z]/.test(cleaned)) {
      cleaned = "重要日子";
    }

    // 最终长度限制
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength);
    }

    // 确保不为空
    if (!cleaned || cleaned.trim().length === 0) {
      cleaned = "重要日子";
    }

    return cleaned;
  }

  // 发送推送
  async sendPush(task) {
    const { ctx, app } = this;
    
    // 获取日子信息
    const day = await ctx.model.ImportantDay.findByPk(task.day_id);
    if (!day) {
      throw new Error("日子不存在");
    }

    // 获取用户信息
    const user = await ctx.model.User.findByPk(task.user_id);
    if (!user) {
      throw new Error("用户不存在");
    }

    // 验证 openid
    if (
      !user.openid ||
      typeof user.openid !== "string" ||
      user.openid.trim().length === 0
    ) {
      ctx.logger.error(`用户 ${user.id} 的 openid 无效: ${user.openid}`);
      throw new Error(`用户 openid 无效: 用户ID=${user.id}`);
    }

    const openid = user.openid.trim();

    // 验证 openid 格式（微信 openid 通常是 28 位字符）
    if (openid.length < 20 || openid.length > 50) {
      ctx.logger.error(
        `用户 ${user.id} 的 openid 格式异常: 长度=${openid.length}`
      );
      throw new Error(
        `用户 openid 格式异常: 用户ID=${user.id}, 长度=${openid.length}`
      );
    }

    // 记录 openid 用于调试（不完整显示）
    ctx.logger.info(
      `准备推送: 用户ID=${user.id}, openid前10位=${openid.substring(
        0,
        10
      )}, 完整长度=${openid.length}`
    );

    // 计算剩余天数
    const daysLeft = moment(day.date).diff(moment(task.task_date), "days");

    // 生成推送消息
    const message = this.generateMessage(day, daysLeft);

    // 清理并验证字段值
    // name1 字段：使用专门的清理函数，确保不是纯数字
    const dayName = this.cleanNameFieldValue(day.name, 20);
    // date2 字段：日期格式
    const dayDate = moment(day.date).format("YYYY年MM月DD日");
    // thing3 字段：消息内容，移除emoji和特殊字符，最大20字符
    const messageText = this.cleanFieldValue(message, 20);

    // 确保所有字段都有值
    if (!dayName || !dayDate || !messageText) {
      throw new Error(
        `推送数据不完整: name=${dayName}, date=${dayDate}, msg=${messageText}`
      );
    }

    // 验证模板ID
    if (!app.config.wechat.templateId) {
      throw new Error("订阅消息模板ID未配置");
    }

    // 获取access_token
    const accessToken = await this.getAccessToken();

    // 发送订阅消息（单个用户推送使用 touser 字段）
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;
    const data = {
      touser: openid, // 单个用户推送使用 touser，批量推送才使用 to_openid_list
      template_id: app.config.wechat.templateId,
      page: `pages/detail/index?id=${day.id}`,
      miniprogram_state: "developer",
      lang: "zh_CN",
      data: {
        name1: { value: dayName },
        date2: { value: dayDate },
        thing3: { value: messageText },
      },
    };
    ctx.logger.info(
      `推送请求: 用户ID=${user.id}, openid=${openid.substring(
        0,
        10
      )}..., 模板ID=${app.config.wechat.templateId}`
    );

    const response = await axios.post(url, data);
    if (response.data.errcode !== 0) {
      ctx.logger.error(`推送失败详情: ${JSON.stringify(response.data)}`);
      ctx.logger.error(`用户信息: ID=${user.id}, openid=${openid}`);
      ctx.logger.error(`原始日子名称: ${day.name}, 清理后: ${dayName}`);
      
      // 处理字段值无效的错误
      if (response.data.errcode === 47003 || response.data.errmsg.includes("invalid")) {
        ctx.logger.error(`字段值验证失败: name1=${dayName}, date2=${dayDate}, thing3=${messageText}`);
        throw new Error(
          `推送失败: 字段值不符合要求 (错误码: ${response.data.errcode})。请检查日子名称是否有效。`
        );
      }
      
      // 处理 openid 相关错误
      if (
        response.data.errcode === 40003 ||
        response.data.errmsg.includes("openid") ||
        response.data.errmsg.includes("invalid openid")
      ) {
        ctx.logger.error(`OpenID 验证失败: 用户ID=${user.id}, openid长度=${openid.length}, openid前10位=${openid.substring(0, 10)}`);
        ctx.logger.error(`可能的原因: 1) openid不属于当前小程序 2) 用户未授权 3) openid已过期`);
        throw new Error(
          `推送失败: openid 无效或不属于当前小程序。请确认用户是通过当前小程序登录的 (用户ID: ${user.id})`
        );
      }
      
      throw new Error(
        `推送失败: ${response.data.errmsg || "未知错误"} (错误码: ${response.data.errcode})`
      );
    }
    // 记录推送日志
    await ctx.model.PushLog.create({
      user_id: task.user_id,
      day_id: task.day_id,
      push_date: task.task_date,
      push_time: moment().toDate(),
      status: "sent",
      message,
    });

    ctx.logger.info(`推送成功: 用户${user.id}, 日子${day.id}`);
  }

  // 生成推送消息
  generateMessage(day, daysLeft) {
    const templates = {
      7: `还有一周就到「${day.name}」了，开始准备吧！`,
      6: `倒计时6天，「${day.name}」即将到来`,
      5: `还有5天就到「${day.name}」了，记得准备礼物哦`,
      4: `倒计时4天，「${day.name}」快到了，期待吗？`,
      3: `还有3天就到「${day.name}」了！`,
      2: `倒计时2天，「${day.name}」最后准备`,
      1: `明天就是「${day.name}」了，准备好了吗？`,
      0: `今天就是「${day.name}」，祝您愉快！🎉`,
    };

    return templates[daysLeft] || `还有${daysLeft}天就到「${day.name}」了`;
  }

  // 获取微信access_token
  async getAccessToken() {
    const { app } = this;
    const cacheKey = "wechat_access_token";
    
    // 从Redis获取缓存（如果 Redis 可用）
    try {
      const cached = await app.redis.get(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      // Redis 不可用，继续从微信获取
      app.logger.warn('Redis 不可用，跳过缓存:', error.message);
    }

    // 从微信获取
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${app.config.wechat.appId}&secret=${app.config.wechat.appSecret}`;
    const response = await axios.get(url);

    if (response.data.access_token) {
      const token = response.data.access_token;
      const expiresIn = response.data.expires_in || 7200;
      
      // 缓存token（提前5分钟过期），如果 Redis 可用
      try {
        await app.redis.set(cacheKey, token, "EX", expiresIn - 300);
      } catch (error) {
        // Redis 不可用，忽略缓存错误
        app.logger.warn('Redis 不可用，跳过缓存写入:', error.message);
      }
      
      return token;
    }

    throw new Error("获取access_token失败");
  }
}

module.exports = PushService;
