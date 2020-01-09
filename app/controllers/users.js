const User = require('../models/users')
const Questions = require('../models/questions')
const Answer = require('../models/answers')
const jwt = require('jsonwebtoken')
const { secret } = require('../config')

class UsersController {
  // 权限校验（中间件）
  async checkOwner (ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      // 403 未授权
      ctx.throw(403, '没有权限')
    }
    await next()
  }

  // 权限校验中间件
  async checkUserExist (ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) ctx.throw(404, '用户不存在')
    await next()
  }

  async find (ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page - 0, 1) - 1//第几页
    const perPage = Math.max(per_page - 0, 1)// 每页显示的个数
    ctx.body = await User
      .find({ name: new RegExp(ctx.query.q) })
      .limit(perPage).skip(page * perPage)
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    // .filter(f => f) 过滤空字符串  针对的这种查询字符串localhost:3000/users/5e130604ee65b901000f65e9?fields=;
    const selectFields = fields.split(';').filter(f => f).map(item => ' +' + item).join('')
    const populateField = fields.split(';').filter(f => f).map(f => {
      if (f === 'employments') {
        return 'employments.company employments.job'
      }
      if (f === 'educations') {
        return 'educations.school educations.major'
      }
      return f
    }).join(' ')
    // mongoose 默认支持这种加select的方式，查询别的字段
    // const user = await User.findById(ctx.params.id).select('+educations+business')
    const user = await User.findById(ctx.params.id).select(selectFields).populate(populateField)
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

  async update (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },// itemType 表示数组里面每一项的类型
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false },
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

  async listFollowing (ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following') // populate('following') 获取返回用户的具体信息，否则只有id
    if (!user) ctx.throw(404, '用户不存在')
    ctx.body = user.following
  }

  // 获取粉丝列表
  async listFollowers (ctx) {
    const users = await User.find({ following: ctx.params.id })
    ctx.body = users
  }

  // 关注一个人
  async follow (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    console.log(me.following) // 这个返回的是mongoose的一种类型，需要转换一下
    if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }
  // 取消关注
  async unFollow (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 关注话题
  async followTopics (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }
  // 取消关注话题
  async unFollowTopics (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingTopics.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 获取关注的话题
  async listFollowingTopics (ctx) {
    const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics') // populate('following') 获取返回用户的具体信息，否则只有id
    if (!user) ctx.throw(404, '用户不存在')
    ctx.body = user.followingTopics
  }

  async listQuestions (ctx) {
    const questions = await Questions.find({ questioner: ctx.params.id })
    ctx.body = questions
  }

  // 赞
  async likeAnswer (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
    }
    ctx.status = 204
    await next()
  }
  // 取消赞
  async unlikeAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.likingAnswers.splice(index, 1)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
    }
    ctx.status = 204
  }
  // 获取赞的答案
  async listLikingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
    if (!user) ctx.throw(404, '用户不存在')
    ctx.body = user.likingAnswers
  }

  // 踩
  async dislikeAnswer (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.dislikingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
    await next()
  }
  // 取消踩
  async unDislikeAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
  // 获取踩的答案
  async listDislikingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
    if (!user) ctx.throw(404, '用户不存在')
    ctx.body = user.dislikingAnswers
  }
}

module.exports = new UsersController()