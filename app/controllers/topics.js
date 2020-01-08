const Topic = require('../models/topics')
const User = require('../models/users')

class TopicsController {
  //话题查重中间
  async checkTopicExist (ctx, next) {
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) ctx.throw(404, '话题不存在')
    await next()
  }

  async find (ctx) {
    // ctx.body = await Topic.find().limit(10).skip(10) // limit：每页10个，skip：跳过的10个
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page - 0, 1) - 1//第几页
    const perPage = Math.max(per_page - 0, 1)// 每页显示的个数
    ctx.body = await Topic
      .find({ name: new RegExp(ctx.query.q) })// 用正则，匹配模糊搜索
      .limit(perPage).skip(page * perPage)
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    console.log(selectFields);
    const topic = await Topic.findById(ctx.params.id).select(selectFields)
    ctx.body = topic
  }

  async create (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    })
    const { name } = ctx.request.body
    const repeatedTopic = await Topic.findOne({ name })
    if (repeatedTopic) {
      // 409 表示冲突
      ctx.throw(409, '话题已存在')
    }

    const topic = await new Topic(ctx.request.body).save()
    ctx.body = topic
  }

  async update (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', require: false },
    })
    const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    ctx.body = topic
  }

  // 获取话题列表
  async listTopicFollowers (ctx) {
    const users = await User.find({ followingTopics: ctx.params.id })
    ctx.body = users
  }
}

module.exports = new TopicsController()