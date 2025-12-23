'use strict';

const Controller = require('egg').Controller;
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class AuthController extends Controller {
  // 微信登录（使用 code）
  async login() {
    const { ctx } = this;
    const { code } = ctx.request.body;
    if (!code) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '缺少code参数',
      };
      return;
    }

    try {
      // 调用微信API获取openid
      const wechatConfig = ctx.app.config.wechat;
      if (!wechatConfig.appId || !wechatConfig.appSecret) {
        ctx.status = 500;
        ctx.body = {
          code: 500,
          message: '微信配置未设置，请检查 AppID 和 AppSecret',
        };
        return;
      }

      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${wechatConfig.appId}&secret=${wechatConfig.appSecret}&js_code=${code}&grant_type=authorization_code`;
      const response = await axios.get(url);
      const responseData = response.data;

      // 检查微信API返回的错误
      if (responseData.errcode) {
        ctx.logger.error('微信API错误:', responseData);
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: `微信登录失败: ${responseData.errmsg || '未知错误'} (错误码: ${responseData.errcode})`,
        };
        return;
      }

      const { openid, session_key, unionid } = responseData;

      if (!openid) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '微信登录失败：未获取到 openid',
        };
        return;
      }

      // 查找或创建用户
      let user = await ctx.service.user.findByOpenid(openid);
      if (!user) {
        user = await ctx.service.user.create({
          openid,
          unionid,
        });
      }

      // 保存 session_key 到 Redis（用于解密手机号），如果 Redis 可用
      if (session_key) {
        try {
          await ctx.app.redis.set(`session_key:${openid}`, session_key, 'EX', 7200);
        } catch (error) {
          // Redis 不可用，记录警告但不影响登录
          ctx.logger.warn('Redis 不可用，无法缓存 session_key:', error.message);
        }
      }

      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, openid: user.openid },
        ctx.app.config.jwt.secret,
        { expiresIn: ctx.app.config.jwt.expiresIn }
      );
      ctx.body = {
        code: 200,
        data: {
          token,
          user: {
            id: user.id,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
          },
        },
      };
    } catch (error) {
      ctx.logger.error('登录失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '登录失败，请重试',
      };
    }
  }

  // 手机号登录
  async loginWithPhone() {
    const { ctx } = this;
    const { code, phoneData } = ctx.request.body;

    if (!code) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '缺少code参数',
      };
      return;
    }

    if (!phoneData || !phoneData.encryptedData || !phoneData.iv) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '缺少手机号授权信息',
      };
      return;
    }

    try {
      // 调用微信API获取openid和session_key
      const wechatConfig = ctx.app.config.wechat;
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${wechatConfig.appId}&secret=${wechatConfig.appSecret}&js_code=${code}&grant_type=authorization_code`;
      
      const response = await axios.get(url);
      const { openid, session_key, unionid } = response.data;

      if (!openid || !session_key) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '微信登录失败',
        };
        return;
      }

      // 解密手机号
      const phoneNumber = this.decryptPhone(phoneData.encryptedData, phoneData.iv, session_key);
      
      if (!phoneNumber) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '手机号解密失败',
        };
        return;
      }

      // 查找或创建用户
      let user = await ctx.service.user.findByOpenid(openid);
      if (!user) {
        user = await ctx.service.user.create({
          openid,
          unionid,
          phone: phoneNumber,
        });
      } else {
        // 更新手机号
        await ctx.service.user.update(user.id, {
          phone: phoneNumber,
        });
        user.phone = phoneNumber;
      }

      // 保存 session_key 到 Redis，如果 Redis 可用
      try {
        await ctx.app.redis.set(`session_key:${openid}`, session_key, 'EX', 7200);
      } catch (error) {
        // Redis 不可用，记录警告但不影响登录
        ctx.logger.warn('Redis 不可用，无法缓存 session_key:', error.message);
      }

      // 生成JWT token
      console.log(ctx.app.config.jwt.secret,'-22222--->')
      const token = jwt.sign(
        { userId: user.id, openid: user.openid },
        ctx.app.config.jwt.secret,
        { expiresIn: ctx.app.config.jwt.expiresIn }
      );

      ctx.body = {
        code: 200,
        data: {
          token,
          user: {
            id: user.id,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            phone: user.phone,
          },
        },
      };
    } catch (error) {
      ctx.logger.error('手机号登录失败:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '登录失败，请重试',
      };
    }
  }

  // 解密手机号
  decryptPhone(encryptedData, iv, sessionKey) {
    try {
      const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');
      const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');

      // 微信小程序使用 AES-128-CBC 解密
      // session_key base64 解码后应该是 16 字节（AES-128 需要 16 字节 key）
      // 如果解码后长度不是 16，则使用前 16 字节
      const key = sessionKeyBuffer.length >= 16 
        ? sessionKeyBuffer.slice(0, 16) 
        : sessionKeyBuffer;
      
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, ivBuffer);
      decipher.setAutoPadding(true);
      
      let decrypted = decipher.update(encryptedDataBuffer, '', 'utf8');
      decrypted += decipher.final('utf8');

      const data = JSON.parse(decrypted);
      // 返回手机号，字段可能是 phoneNumber 或 purePhoneNumber
      return data.phoneNumber || data.purePhoneNumber || null;
    } catch (error) {
      this.ctx.logger.error('解密手机号失败:', error);
      this.ctx.logger.error('错误详情:', error.message);
      return null;
    }
  }
}

module.exports = AuthController;

