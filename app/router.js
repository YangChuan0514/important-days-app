'use strict';

module.exports = app => {
  const { router, controller } = app;

  // 认证相关
  router.post('/api/auth/login', controller.auth.login);
  router.post('/api/auth/login-phone', controller.auth.loginWithPhone);

  // 用户相关
  router.get('/api/user/info', controller.user.info);
  router.put('/api/user/info', controller.user.updateInfo);

  // 重要日子相关
  router.post('/api/days', controller.day.create);
  router.get('/api/days', controller.day.list);
  router.get('/api/days/upcoming', controller.day.upcoming);
  router.get('/api/days/:id', controller.day.show);
  router.put('/api/days/:id', controller.day.update);
  router.delete('/api/days/:id', controller.day.destroy);

  // 推送相关
  router.get('/api/push/logs', controller.push.logs);
  router.post('/api/push/subscribe', controller.push.subscribe);
};

