const koa = require('koa');
const app = new koa();
const logger = require('koa-logger');
const Router = require('koa-router');
const router = new Router();
const controller = require('./controller');
const bodyParser = require('koa-bodyparser');

router.get('/api/result', controller.getSearchResults);
router.get('/api/detail/:id', controller.getDetailResults);

router.post('/api/login', controller.login);

app.use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3001, () => {
  console.log('server is running...')
});
