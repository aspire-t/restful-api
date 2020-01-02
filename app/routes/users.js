const Router = require('koa-router')
const router = new Router()

router.prefix('/users')

const db = [{ name: '李雷' }]

router.get('/', ctx => {
  ctx.body = db
})

router.post('/', ctx => {
  db.push(ctx.request.body)
  ctx.body = ctx.request.body
})

router.get('/:id', ctx => {
  ctx.body = db[ctx.params.id - 0]
})

router.put('/:id', ctx => {
  db[ctx.params.id - 0] = ctx.request.body
  ctx.body = ctx.request.body
})

router.delete('/:id', ctx => {
  db.splice(ctx.params.id - 0, 1)
  ctx.status = 204
})

module.exports = router
