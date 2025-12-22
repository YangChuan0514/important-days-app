'use strict';

module.exports = app => {
  const { STRING, DATE, INTEGER, TEXT } = app.Sequelize;

  const PushLog = app.model.define('push_logs', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: STRING(36),
      allowNull: false,
      comment: '用户ID（UUID）',
    },
    day_id: {
      type: INTEGER,
      allowNull: false,
      comment: '重要日子ID',
    },
    push_date: {
      type: DATE,
      allowNull: false,
      comment: '推送日期',
    },
    push_time: {
      type: DATE,
      allowNull: false,
      comment: '推送时间',
    },
    status: {
      type: STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: '状态：pending/sent/failed',
    },
    message: {
      type: TEXT,
      allowNull: true,
      comment: '推送内容',
    },
    error_msg: {
      type: TEXT,
      allowNull: true,
      comment: '错误信息',
    },
    created_at: {
      type: DATE,
      allowNull: false,
    },
  }, {
    tableName: 'push_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['user_id', 'push_date'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['day_id'],
      },
    ],
  });

  return PushLog;
};

