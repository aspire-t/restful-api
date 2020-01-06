const Router = require('koa-router')
const router = new Router()
// const jwt = require('jsonwebtoken')
const koaJwt = require('koa-jwt')
const { find, findById, create, update, delete: del, login, checkOwner } = require('../controllers/users')
const { secret } = require('../config')

const auth = koaJwt({ secret })// 这一行，就是下面代码实现的功能
// 手写koa认证的中间件
// const auth = async (ctx, next) => {
//   const { authorization = '' } = ctx.request.header
//   const token = authorization.replace('Bearer ', '')

//   try {
//     const user = jwt.verify(token, secret)
//     ctx.state.user = user
//   } catch (error) {
//     // 401 未认证
//     ctx.throw(401, error.message)
//   }

//   await next()
// }

router.prefix('/users')

router.get('/', find)

router.post('/', create)

router.get('/:id', findById)
// put 是整体替换
// patch 更新用户的一部分属性
router.patch('/:id', auth, checkOwner, update)

router.delete('/:id', auth, checkOwner, del)

router.post('/login', login)

module.exports = router
