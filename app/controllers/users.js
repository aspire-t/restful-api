const User = require('../models/users')
const jwt = require('jsonwebtoken')
const { secret } = require('../config')

class UsersController {
  async find (ctx) {
    ctx.body = await User.find()
  }

  async findById (ctx) {
    const user = await User.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }

  async create (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
    })
    // 唯一性校验
    const { name } = ctx.request.body
    const repeatedUser = await User.findOne({ name })
    if (repeatedUser) {
      // 409 表示冲突
      ctx.throw(409, '用户已存在')
    }

    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }
  // 权限校验（中间件）
  async checkOwner (ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      // 403 未授权
      ctx.throw(403, '没有权限')
    }
    await next()
  }

  async update (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
    })
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }

  async delete (ctx) {
    // db.splice(ctx.params.id - 0, 1)
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.status = 204
  }

  async login (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
    })
    const user = await User.findOne(ctx.request.body)
    if (!user) {
      ctx.throw(401, '用户名和密码不正确')
    }
    const { _id, name } = user
    const token = jwt.sign({ _id, name }, secret, { expiresIn: 3600 })
    ctx.body = { token }
  }
}

module.exports = new UsersController()