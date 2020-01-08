const Questions = require('../models/questions')

class QuestionsController {
  //话题查重中间件
  async checkQuestionExist (ctx, next) {
    const question = await Questions.findById(ctx.params.id).select('+questioner')
    if (!question) ctx.throw(404, '问题不存在')
    ctx.state.question = question
    await next()
  }

  // 验证是否是同一个人的中间件 
  async checkQuestioner (ctx, next) {
    const { question } = ctx.state
    console.log(ctx.state.user);
    if (question.questioner.toString() !== ctx.state.user._id) ctx.throw(403, '没有权限')
    await next()
  }

  async find (ctx) {
    // ctx.body = await Questions.find().limit(10).skip(10) // limit：每页10个，skip：跳过的10个
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page - 0, 1) - 1//第几页
    const perPage = Math.max(per_page - 0, 1)// 每页显示的个数
    const q = new RegExp(ctx.query.q)
    ctx.body = await Questions
      .find({ $or: [{ title: q }, { description: q }] })// 用正则，匹配模糊搜索，这样可以匹配多个字段
      .limit(perPage).skip(page * perPage)
  }

  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    console.log(selectFields);
    const question = await Questions.findById(ctx.params.id).select(selectFields).populate('questioner topics')
    ctx.body = question
  }

  async create (ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false },
    })
    const { title } = ctx.request.body
    const repeatedQuestion = await Questions.findOne({ title })
    if (repeatedQuestion) {
      // 409 表示冲突
      ctx.throw(409, '话题已存在')
    }

    const question = await new Questions({ ...ctx.request.body, questioner: ctx.state.user._id }).save()
    ctx.body = question
  }

  async update (ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false },
    })
    await ctx.state.question.update(ctx.request.body)
    ctx.body = ctx.state.question
  }

  async delete (ctx) {
    await Questions.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new QuestionsController()