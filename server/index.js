

/*
 * @Author: xiaoju.sun
 * @Date: 2021-01-11 16:01:52
 * @LastEditors: yaojie
 * @LastEditTime: 2021-06-24 19:23:08
 * @Description: file content
 */

const Next = require('next');
const envConfig = require('../config/envConfig');
const server = require('./server');

const dev = process.env.NODE_ENV !== 'production';
const app = Next({ dev });

const handle = app.getRequestHandler();
const init = (nacosConf = {}) => {
  app.prepare().then(() => {
    server(handle, nacosConf);
  });
};

init(envConfig);
