const fs = require('fs')

// 这个模块用来动态读取路由，
module.exports = app => {
  fs.readdirSync(__dirname).forEach(file => {
    if (file === 'index.js') return
    const route = require(`./${file}`)
    // allowedMethods ，用来相应options
    app.use(route.routes()).use(route.allowedMethods())
  })
}