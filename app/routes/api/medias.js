// module dependencies
const express = require('express')
const bodyParser = require('body-parser')

// initialize router
const router = express.Router()
router.use(bodyParser.json())

router.get('/', (req, res, next) => {
  // correct response
  res.jsonp([{api: 'medias'}])

})

exports = module.exports = router