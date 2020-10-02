// module dependencies
const express = require('express')
const config = require('../../components/config')
const multer = require('multer')
const { isMedia, mediaType } = require('../../utils/mediaFilesExtensions')
const path = require('path')
const fs = require('fs')
const klaw = require('klaw')
const { response } = require('express')
const { exec } = require('child_process')

// console.log('ENV var XXX motion stream url: ', process.env.SENDER_EMAIL, process.env.SENDER_PASS)

// assure that medias is not already deleted
let deletedMedias = []

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
  // empty delete arr
  deletedMedias = []
  let medias = []
  for await (const file of klaw(config.mediadir)) {
    if (file.stats.isDirectory()) continue
    let name = path.basename(file.path)
    // not recognized extension
    if (!isMedia(path.extname(name))) continue
    if (mediaType(path.extname(name)) === 'image') continue
    medias.push({
      name: name.replace('.mp4', '-01.jpg'),
      type: mediaType(path.extname(name)),
      size: file.stats.size,
      created_at: file.stats.ctime,
      url: req.mediaUrl(name).replace('.mp4', '-01.jpg'),
      videoUrl: req.mediaUrl(name)
    })
  }
  medias = medias.sort((a, b) => b.created_at - a.created_at)
  res.jsonp(medias)
})

// delete medias
router.delete('/medias/:id', async (req, res, err) => {
  // filter only naming part of file (01-555-01.jpg -> 01-555 || 01-555.mp4 -> 01-555) - in order to delete both pic and video
  const fileForDeleteArr = req.params.id.split('-')
  const fileCapitals = fileForDeleteArr[0] + '-' + fileForDeleteArr[1]
  const picForDelete = fileCapitals + '-01.jpg'
  const videoForDelete = fileCapitals + '.mp4'

  const filePathPic = path.join(config.mediadir, picForDelete)
  const filePathVideo = path.join(config.mediadir, videoForDelete)

  // check if already deleted
  const deleteIsDone = file => {
    return deletedMedias.filter(med => med === file).length > 0
  }

  // **** exec sudo commands ****
  // delete both image and video
  if (fs.existsSync(filePathPic) && fs.existsSync(filePathVideo) && !deleteIsDone(picForDelete) && !deleteIsDone(videoForDelete)) {
    deletedMedias.push(picForDelete)
    deletedMedias.push(videoForDelete)
    let cmd = `sudo rm ${filePathPic} ${filePathVideo}`
    exec(cmd, (error, stdout, stderr) => {
      if (error) throw error
      if (stderr) console.log('stderr: ', stderr)
      console.log('stdout: ' + stdout)
      res.jsonp({deleted: picForDelete})
    })
  } else {
    res.jsonp({
      deleted: 'false'
    })
  }
})

// move medias

// get local streaming url
router.get('/streaming_url', (req, res) => {
  res.jsonp({ streaming: process.env.MOTION_STREAM_URL })
})

// mail to alert on new videos  ************* PREBACI~!!!!!! ***********
router.get('/mailme/:vid', (req, res) => {
  // res.jsonp({ mail: req.params.vid })
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASS
    }
  })
  const message = {
    from: process.env.SENDER_EMAIL, // Sender address
    to: '1978milan.babic@gmail.com',         // List of recipients
    subject: 'This is test message', // Subject line
    text: `This is where you are going to be alerted on new videos! ${req.params.vid}` // Plain text body
  }
  transporter.sendMail(message, (err, info) => {
    if (err) {
      res.jsonp({mail: err})
    } else {
      res.jsonp({mail: info})
    }
  })
})

exports = module.exports = router
