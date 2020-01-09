const Router = require('koa-router')
const { find, findById, create, update, delete: del, checkAnswerExist, checkAnswerer } = require('../controllers/answers')
const { secret } = require('../config')
const koaJwt = require('koa-jwt')

const router = new Router()
router.prefix('/questions/:questionId/answers') // 嵌套路由

const auth = koaJwt({ secret })

router.get('/', find)

router.post('/', auth, create)

router.get('/:id', checkAnswerExist, findById)

router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)

router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del)

module.exports = router