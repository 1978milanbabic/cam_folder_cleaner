// module dependencies
const express = require('express')
const bodyParser = require('body-parser')
const { execSync } = require('child_process')

// initialize router
const router = express.Router()
router.use(bodyParser.json())

router.get('/', (req, res, next) => {
  // correct response
  res.jsonp({system: 'reboot'})
  // reboot
  let cmd = 'sudo reboot'
  if (process.getuid && process.getuid() === 0) {
    cmd = 'reboot'
  }
  setTimeout(() => {
    console.log('rebooting system!')
    execSync(cmd)
  }, 250)
})

exports = module.exports = router