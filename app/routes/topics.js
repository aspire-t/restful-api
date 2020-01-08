const Router = require('koa-router')
const { find, findById, create, update, listTopicFollowers, checkTopicExist, listQuestions } = require('../controllers/topics')
const { secret } = require('../config')
const koaJwt = require('koa-jwt')

const router = new Router()
router.prefix('/topics')
const auth = koaJwt({ secret })

router.get('/', find)

router.post('/', auth, create)

router.get('/:id', checkTopicExist, findById)

router.patch('/:id', auth, checkTopicExist, update)

router.get('/:id/followers', checkTopicExist, listTopicFollowers)

router.get('/:id/questions', checkTopicExist, listQuestions)

module.exports = router