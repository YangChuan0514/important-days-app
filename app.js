'use strict';

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad() {
    // 此时 config 文件已经被读取并合并，但是还并未生效
    // 这是应用层修改配置的最后时机
  }

  async didLoad() {
    // 所有的配置已经加载完毕
    // 可以用来加载应用自定义的文件，启动自定义的服务
  }

  async willReady() {
    // 所有的插件都已启动完毕，但是应用整体还未 ready
    // 可以做一些数据初始化等操作，这些操作成功才会启动应用
  }

  async didReady() {
    // 应用已经启动完毕
    // 初始化推送服务
    const pushService = this.app.serviceClasses.push;
    if (pushService && pushService.prototype.init) {
      const ctx = await this.app.createAnonymousContext();
      await ctx.service.push.init();
    }
  }

  async serverDidReady() {
    // http / https server 已启动，开始接受外部请求
  }
}

module.exports = AppBootHook;

