// module dependencies
const express = require('express')
const fs = require('fs')
const { exec } = require('child_process')
const nodemailer = require('nodemailer')
const db = require('../../components/db')
const moment = require('moment')
const { fileEmitter } = require('../../utils/filesWatcher')
const config = require('../../components/config')

// initialize router
const router = express.Router()

// mail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASS
  }
})
const sendMessage = params => {
  const message = {
    from: process.env.SENDER_EMAIL, // Sender address
    to: db.get('alert_email').value(),         // List of recipients
    subject: 'This is test message', // Subject line
    text: `${params} - Alert message on new detection! ` // Plain text body
  }
  transporter.sendMail(message, (err, info) => {
    if (err) {
      db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Mail transporter error: ${err}`).write()
    } else {
      db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Mail status: ${info && info.response}`).write()
    }
  })
}

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

// event started
router.get('/start', (req, res) => {
  // log
  db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Event started!`).write()
  // starting new event
  let doSendMail = db.get('mail_on_event').value()
  // send email on new video
  if (doSendMail) {
    db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Initiating sending mail...`).write()
    try {
      sendMessage(moment().format('MMMM Do YYYY, h:mm:ss a') + ' --> ')
      db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => New mail sent.`).write()
    } catch (err) {
      db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Error sending mail: ${err}`).write()
    }
  } else {
    db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Sending mail dissabled by user!`).write()
  }
  // refresh FE
  setTimeout(() => {
    fileEmitter.emit('refresh', 'app logs')
  }, 50)

  res.jsonp({event: 'started'})
})

// event ended
router.get('/end', (req, res) => {
  // log
  db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Event Ended!`).write()
  // refresh FE
  setTimeout(() => {
    fileEmitter.emit('refresh', 'app logs')
  }, 50)
  // event ended
  // move files to upload dir (standard timeout for meta on files)
  setTimeout(() => {
    let cmd = `sudo mv ${config.motionmediadir}*.* ${config.uploaddir}`
    db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Moving files to Upload dir at the end of the event`).write()
    try {
      exec(cmd, (error, stdout, stderr) => {
        if (error) db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Error moving files at the end of the event: ${error}`)
        if (stderr) db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Error moving files at the end of the event: ${stderr}`)
        db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Moving files to Upload dir at the end of the event success ${stdout}`).write()
      })
    } catch (err) {
      db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Error moving files at the end of the event: ${err}`)
    }
    setTimeout(() => {
      // waiting for upload to media transport to ocure
      fileEmitter.emit('refresh', 'app logs')
    }, 1000)
  }, 2 * 1000)
  res.jsonp({event: 'ended'})
})

exports = module.exports = router
