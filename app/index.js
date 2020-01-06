const path = require('path')
const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')

const routing = require('./routes')
const { dbs } = require('./config')

mongoose.connect(dbs, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, () => console.log('mongodb link success'))
mongoose.connection.on('error', console.error)

const app = new Koa()
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

app.use(koaStatic(path.join(__dirname, 'public')))// 这个其实是把public目录当做了一个静态资源目录，其实也就是最简单的服务端渲染

app.use(error({
  postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))
app.use(koaBody({
  multipart: true, // 表示支持文件上传 文件的content-type：Multipart/form-data
  formidable: {
    uploadDir: path.join(__dirname, 'public/uploads'),// 文件上传目录
    keepExtensions: true, // 保留扩展名 .png  .jpg
  }
}))
app.use(parameter(app))
routing(app)

app.listen(3000, () => console.log('server is running in 3000'))
