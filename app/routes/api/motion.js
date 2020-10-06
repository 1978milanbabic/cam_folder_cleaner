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
const db = require('../../components/db')
const { getVideoDurationInSeconds } = require('get-video-duration')
const humanizeDuration = require('humanize-duration')

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
  // get list of seen videos
  let seen = await db.get('seen_video').value()
  // list files
  for await (const file of klaw(config.mediadir)) {
    if (file.stats.isDirectory()) continue
    let name = path.basename(file.path)
    // not recognized extension
    if (!isMedia(path.extname(name))) continue
    if (mediaType(path.extname(name)) === 'image') continue
    // search if seen
    let thisSeen
    seen.filter(s => s === name).length > 0 ? thisSeen = true : thisSeen = false
    // get video duration (in seconds)
    let duration
    await getVideoDurationInSeconds(file.path).then((dur) => {
      duration = humanizeDuration(dur * 1000)
    })
    // create response object
    medias.push({
      name: name.replace('.mp4', '-01.jpg'),
      type: mediaType(path.extname(name)),
      size: file.stats.size,
      created_at: file.stats.ctime,
      url: req.mediaUrl(name).replace('.mp4', '-01.jpg'),
      videoUrl: req.mediaUrl(name),
      seen: thisSeen,
      duration
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
  // delete from seen db
  let seen = db.get('seen_video')
  let seenArr = seen.value().filter(s => s !== videoForDelete)

  db.set('seen_video', seenArr).write()

  // **** exec sudo commands ****
  // delete both image and video
  if (fs.existsSync(filePathPic) && fs.existsSync(filePathVideo)) {
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

// push new seen video to seen list
router.get('/seen/:name', async (req, res) => {
  const seenToAdd = req.params.name
  // add to DB
  let seen = await db.get('seen_video')
  // if not already on seen list
  if (seen.value().filter(s => s === seenToAdd).length <= 0) seen.push(seenToAdd).write()

  res.jsonp({seen: 'seen'})
})

// delete seen list
router.delete('/seen', (req, res) => {
  db.set('seen_video', []).write()
  res.jsonp({seen: 'deleted all'})
})

// get local streaming url
router.get('/streaming_url', (req, res) => {
  res.jsonp({ streaming: process.env.MOTION_STREAM_URL })
})

exports = module.exports = router
