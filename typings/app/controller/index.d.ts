// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportAuth = require('../../../app/controller/auth');
import ExportDay = require('../../../app/controller/day');
import ExportPush = require('../../../app/controller/push');
import ExportUser = require('../../../app/controller/user');

declare module 'egg' {
  interface IController {
    auth: ExportAuth;
    day: ExportDay;
    push: ExportPush;
    user: ExportUser;
  }
}
