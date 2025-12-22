'use strict';

module.exports = app => {
  const { STRING, DATE, INTEGER, BOOLEAN, TEXT } = app.Sequelize;

  const ImportantDay = app.model.define('important_days', {
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
    name: {
      type: STRING(100),
      allowNull: false,
      comment: '日子名称',
    },
    date: {
      type: DATE,
      allowNull: false,
      comment: '日期',
    },
    type: {
      type: STRING(20),
      allowNull: false,
      defaultValue: 'other',
      comment: '类型：birthday/anniversary/holiday/other',
    },
    note: {
      type: TEXT,
      allowNull: true,
      comment: '备注',
    },
    remind_days: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 7,
      comment: '提前提醒天数',
    },
    remind_time: {
      type: STRING(8),
      allowNull: false,
      defaultValue: '09:00:00',
      comment: '提醒时间',
    },
    is_repeat: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否每年重复',
    },
    is_active: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用',
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
    tableName: 'important_days',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id', 'date'],
      },
      {
        fields: ['date'],
      },
      {
        fields: ['user_id', 'is_active'],
      },
    ],
  });

  // 关联关系
  ImportantDay.associate = function() {
    app.model.ImportantDay.belongsTo(app.model.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return ImportantDay;
};

