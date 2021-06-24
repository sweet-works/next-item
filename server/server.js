

/*
 * @Author: xiaoju.sun
 * @Date: 2021-01-04 10:55:56
 * @LastEditors: yaojie
 * @LastEditTime: 2021-06-24 19:24:41
 * @Description: file content
 */
const Koa = require('koa');
const Router = require('koa-router');
const session = require('koa-session2');
// const k2c = require('koa2-connect');
// const koaBody = require('koa-body');
const compress = require('koa-compress');
// const proxy = require('http-proxy-middleware');
const Store = require('redis-sessions');
const opn = require('better-opn');
// const api = require('./api');
// const download = require('./download');
// const encryVer = require('./encryVer');
// const nodeApi = require('./nodeApi');
// const authorization = require('./authorization/authorization');
// const middleSession = require('./authorization/session');

const dev = process.env.NODE_ENV !== 'production';

const server = (handle, nacosConf = {}) => {
  const envconf = nacosConf;
  const port = envconf.port;
  const app = new Koa();
  const router = new Router();
  app.keys = ['some secret hurr'];

  const sessionConfig = {
    ...envconf.sessionConfig,
    store: new Store(envconf),
  };
  // envconf.sessionConfig.store = new Store(envconf);
  const options = { threshold: 2048 };
  app.use(compress(options));
  app.use(session(sessionConfig));

  // app.use(koaBody());
  app.use(router.routes()).use(router.allowedMethods());

  app.use(async (ctx, next) => {
    // ctx.storeConfig = sessionConfig;
    await next({ dev });
  });

  router.get('/health', (ctx) => {
    ctx.status = 200;
  });

  // 拦截登录校验
  // router.all(/^\/authorization/, authorization(envconf));

  // TODO: 暂时只对api做处理
  // router.all(/^\/api/, middleSession(envconf, sessionConfig));
  // verify
  // router.all(/./, encryVer(envconf));
  // node api
  // router.all(/^\/node\//, nodeApi(envconf));

  // app.use(k2c(proxy('/api', api(envconf))));
  // app.use(k2c(proxy('/download', download(envconf))));

  router.get(/^(?!\/(api|download)\/).*/, async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
  });

  app.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    if (dev) {
      opn(`http://localhost:${port}`);
    }
  });
  app.on('error', (err) => {
    if (err.toString().includes('read ECONNRESET')) {
      console.log('read ECONNRESET');
    }
  });
};

module.exports = server;
