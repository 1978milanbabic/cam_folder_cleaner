// module dependencies
const express = require('express')
const fs = require('fs')
const path = require('path')
const mediaDir = require('../components/config')
const passport = require('../components/passport')

// initialize router
const router = express.Router()

// require authentication (for non local)
router.use((req, res, next) => {
  if (['::1', '127.0.0.1'].indexOf(req.ip) > -1) return next()
  return passport.authenticate('basic', { session: false })(req, res, next)
})

// media send file
// router.get('/medias/:id', (req, res) => {
//   const reqFile = req.params.id
//   const filePath = path.join(mediaDir.mediadir, reqFile)
//   // check if file exists
//   if (fs.existsSync(filePath)) {
//     res.sendFile(filePath)
//   } else {
//     res.status(404).send('Requested File Does Not Exists!')
//   }
// })

// logout
router.get('/logout', (req, res) => {
  res.status(401).send('logged out')
})

exports = module.exports = router