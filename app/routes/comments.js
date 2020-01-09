const Router = require('koa-router')
const { find, findById, create, update, delete: del, checkCommentExist, checkCommentator } = require('../controllers/comments')
const { secret } = require('../config')
const koaJwt = require('koa-jwt')

const router = new Router()
router.prefix('/questions/:questionId/answers/:answerId/comments') // 嵌套路由

const auth = koaJwt({ secret })

router.get('/', find)

router.post('/', auth, create)

router.get('/:id', checkCommentExist, findById)

router.patch('/:id', auth, checkCommentExist, checkCommentator, update)

router.delete('/:id', auth, checkCommentExist, checkCommentator, del)

module.exports = router