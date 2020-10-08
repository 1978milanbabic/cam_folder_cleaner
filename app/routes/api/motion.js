// module dependencies
const express = require('express')
const fs = require('fs')

// initialize router
const router = express.Router()

// get logs
router.get('/log', async (req, res) => {
  let text = '', dataArray = []
  try {
    text = fs.readFileSync('/var/log/motion/motion.log','utf8')
    if (text) {
      dataArray = text.split('\n').filter(row => row !== '').reverse()
      res.jsonp(dataArray)
    }
  } catch {
    res.jsonp(dataArray)
  }
})

exports = module.exports = router
