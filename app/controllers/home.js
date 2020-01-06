const path = require('path')
class HomeController {
  index (ctx) {
    ctx.body = `<h1>主页</h1>`
  }

  upload (ctx) {
    const file = ctx.request.files.file // 绝对路径
    const basename = path.basename(file.path)// 图片名称+拓展名
    ctx.body = { url: `${ctx.origin}/uploads/${basename}` }
  }
}

module.exports = new HomeController()