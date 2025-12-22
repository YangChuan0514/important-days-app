'use strict';

module.exports = app => {
  const { STRING, DATE } = app.Sequelize;
  const { v4: uuidv4 } = require('uuid');

  const User = app.model.define('users', {
    id: {
      type: STRING(36),
      primaryKey: true,
      defaultValue: () => uuidv4(),
      comment: '用户ID（UUID）',
    },
    openid: {
      type: STRING(100),
      allowNull: false,
      unique: true,
      comment: '微信openid',
    },
    unionid: {
      type: STRING(100),
      allowNull: true,
      comment: '微信unionid',
    },
    nickname: {
      type: STRING(50),
      allowNull: true,
      comment: '昵称',
    },
    avatar_url: {
      type: STRING(255),
      allowNull: true,
      comment: '头像',
    },
    phone: {
      type: STRING(20),
      allowNull: true,
      comment: '手机号',
    },
    default_remind_time: {
      type: STRING(8),
      allowNull: true,
      defaultValue: '09:00',
      comment: '默认提醒时间',
      // 如果字段不存在，Sequelize 会忽略这个字段定义
    },
    created_at: {
      type: DATE,
      allowNull: false,
    },
    updated_at: {
      type: DATE,
      allowNull: false,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return User;
};

