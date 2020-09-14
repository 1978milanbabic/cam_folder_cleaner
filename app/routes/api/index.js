const express = require('express')
const passport = require('../../components/passport')

// initialize router
const router = express.Router()

// require authentication (for non local)
// router.use((req, res, next) => {
  // if (['::1', '127.0.0.1'].indexOf(req.ip) > -1) return next()
//   return passport.authenticate('basic', { session: false })(req, res, next)
// })

// mount config api
// router.use('/config', require('./config'))

// // mount medias api
router.use('/medias', require('./medias'))

// // mount stats api
// router.use('/', require('./stats'))

// // mount zones api
// router.use('/', require('./zone'))

// // mount user api
// router.use('/', require('./user'))

// mount system reboot api
router.use('/reboot', require('./reboot'))

exports = module.exports = router
