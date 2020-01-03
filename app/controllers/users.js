const db = [{ name: '李雷' }]

class UsersController {
  find (ctx) {
    ctx.body = db
  }

  findById (ctx) {
    ctx.body = db[ctx.params.id - 0]
  }

  create (ctx) {
    db.push(ctx.request.body)
    ctx.body = ctx.request.body
  }

  update (ctx) {
    db[ctx.params.id - 0] = ctx.request.body
    ctx.body = ctx.request.body
  }

  delete (ctx) {
    db.splice(ctx.params.id - 0, 1)
    ctx.status = 204
  }
}

module.exports = new UsersController()