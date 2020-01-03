class HomeController {
  index (ctx) {
    ctx.body = `<h1>主页</h1>`
  }
}

module.exports = new HomeController()