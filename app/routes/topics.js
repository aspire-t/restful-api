const Router = require('koa-router')
const { find, findById, create, update } = require('../controllers/topics')
const { secret } = require('../config')
const koaJwt = require('koa-jwt')

const router = new Router()
router.prefix('/topics')
const auth = koaJwt({ secret })

router.get('/', find)

router.post('/', auth, create)

router.get('/:id', findById)

router.patch('/:id', auth, update)

module.exports = router