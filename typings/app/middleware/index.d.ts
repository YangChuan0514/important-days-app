// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportAuth = require('../../../app/middleware/auth');
import ExportCors = require('../../../app/middleware/cors');
import ExportErrorHandler = require('../../../app/middleware/error_handler');

declare module 'egg' {
  interface IMiddleware {
    auth: typeof ExportAuth;
    cors: typeof ExportCors;
    errorHandler: typeof ExportErrorHandler;
  }
}
