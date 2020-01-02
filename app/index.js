const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const error = require('koa-json-error')

const app = new Koa()
const routing = require('./routes')

// // 模拟编写错误处理中间件
// // 但是这样捕捉不到404错误，但能捕捉到自动抛出的信息
// app.use(async (ctx, next) => {
//   try {
//     await next()
//   } catch (error) {
//     ctx.status = err.status || err.statusCode || 500
//     ctx.body = {
//       message: err.message
//     }
//   }
// })

app.use(error({
  postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))
app.use(bodyparser())
routing(app)

app.listen(3000, () => console.log('server is running in 3000'))
