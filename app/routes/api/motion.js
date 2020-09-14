// module dependencies
const express = require('express')
const config = require('../../components/config')
const multer = require('multer')
const { extensionTypeMap } = require('../../utils/mediaFilesExtensions')
const path = require('path')
const fs = require('fs')
const klaw = require('klaw')

// initialize router
const router = express.Router()

// inject media url middleware
router.use((req, res, next) => {
  req.mediaUrl = (name = '') => `${req.protocol}://${req.get('host')}/medias/${name}`
  next()
})

// get logs
router.get('/log', async (req, res) => {
  const fs = require('fs')
  let text = '', dataArray = []
  try {
    text = fs.readFileSync('/var/log/motion/motion.log','utf8')
    dataArray = text.split('\n').filter(row => row !== '').reverse()
    res.jsonp(dataArray)
  } catch {
    res.jsonp(dataArray)
  }
})

// list medias
router.get('/medias', async (req, res) => {
  let medias = []
  for await (const file of klaw(config.motionmediadir)) {
    if (file.stats.isDirectory()) continue
    let name = path.basename(file.path)
    // not recognized extension
    if (!extensionTypeMap[path.extname(name)]) continue
    medias.push({
      name,
      type: extensionTypeMap[path.extname(name)],
      size: file.stats.size,
      created_at: file.stats.ctime,
      url: req.mediaUrl(name)
    })
  }
  medias = medias.sort((a, b) => b.created_at - a.created_at)
  res.jsonp(medias)
})


exports = module.exports = router
