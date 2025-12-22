// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportImportantDay = require('../../../app/model/important_day');
import ExportPushLog = require('../../../app/model/push_log');
import ExportPushTask = require('../../../app/model/push_task');
import ExportUser = require('../../../app/model/user');

declare module 'egg' {
  interface IModel {
    ImportantDay: ReturnType<typeof ExportImportantDay>;
    PushLog: ReturnType<typeof ExportPushLog>;
    PushTask: ReturnType<typeof ExportPushTask>;
    User: ReturnType<typeof ExportUser>;
  }
}
