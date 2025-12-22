'use strict';

module.exports = app => {
  const { STRING, DATE, INTEGER } = app.Sequelize;

  const PushTask = app.model.define('push_tasks', {
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
    task_date: {
      type: DATE,
      allowNull: false,
      comment: '任务日期',
    },
    task_time: {
      type: DATE,
      allowNull: false,
      comment: '任务执行时间',
    },
    status: {
      type: STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: '状态：pending/processing/completed/failed',
    },
    retry_count: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '重试次数',
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
    tableName: 'push_tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['task_time', 'status'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['status'],
      },
    ],
  });

  return PushTask;
};

