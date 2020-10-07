// module dependecies
const config = require('../components/config')
const chokidar = require('chokidar')
const { fileNameChanger } = require('./fileNameConventions')
const EventEmitter = require('events')
const { mediaType } = require('./mediaFilesExtensions')
const { exec } = require('child_process')
const nodemailer = require('nodemailer')
const fs = require('fs')
const moment = require('moment')
const db = require('../components/db')

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

// file emitter
class FileEmitter extends EventEmitter {}
const fileEmitter = new FileEmitter()

// upload folder watcher
let uploadWatcher
const addFilesWatcherOnAddFile = () => {
  uploadWatcher = chokidar.watch(config.uploaddir)
  uploadWatcher.on('add', (event, path) => {
    setTimeout(() => {
      fileNameChanger(event)
    }, 400)
  })
}

// media folder watcher
let refreshTimeout
let mediaFolderWatcher
const addMediaFilesWatcher = () => {
  mediaFolderWatcher = chokidar.watch(config.mediadir)
  mediaFolderWatcher.on('all', (event, path) => {
    // file name & file ext
    let fileName = path.split('/')
    fileName = fileName[fileName.length - 1].toString()
    let ext = fileName.split('.')
    ext = ('.' + ext[ext.length -1])

    if (event === 'change' || mediaType(ext) === 'image') return
    clearTimeout(refreshTimeout)
    refreshTimeout = setTimeout(() => {
      if (event !== 'addDir'){
        // refresh medias on FE
        fileEmitter.emit('refresh', 'medias')
      }
    }, 400)
  })
}

// log watcher
let logWatcher
const addLogWatcher = () => {
  logWatcher = chokidar.watch(config.motionlogdir)
  logWatcher.on('all', (event, path) => {
    // ignore deletions and adding new file
    if (event === 'unlink' || event === 'add') return
    // watch on change log
    if (event === 'change') {
      // read file
      fs.readFile(path, {encoding:'utf8', flag:'r'}, (err, data) => {
        if (err) {
          console.log(err)
          return
        }
        if (data) {
          // refresh medias on FE
          fileEmitter.emit('refresh', 'logs')
          // read log file
          let lastLog = (data.split('\n').filter(row => row !== '').reverse())[0]
          lastLog.toString()
          // check if in last log event starts
          let eventStarted = lastLog.indexOf('starting event')
          if (eventStarted > -1) {
            // log
            db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Event started!`).write()
            // starting new event
            let doSendMail = db.get('mail_on_event').value()
            // send email on new video
            if (doSendMail) {
              db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Initiating sending mail...`).write()
              try {
                sendMessage(moment().format('MMMM Do YYYY, h:mm:ss a') + ' --> ')
                db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => New mail sent at`).write()
              } catch (err) {
                db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Error sending mail: ${err}`).write()
              }
            } else {
              db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Sending mail dissabled by user!`).write()
            }
          }
          // check if in last log event ends
          let eventEnded = lastLog.indexOf('End of event')
          if (eventEnded > -1) {
            // log
            db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Event Ended!`).write()
            // event ended
            // move files to upload dir (standard timeout for meta on files)
            setTimeout(() => {
              let cmd = `sudo mv ${config.motionmediadir}*.* ${config.uploaddir}`
              try {
                db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Moving files to Upload dir at the end of the event`).write()
                exec(cmd, (error, stdout, stderr) => {
                  if (error) db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Error moving files at the end of the event: ${error}`)
                  if (stderr) db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Error moving files at the end of the event: ${stderr}`)
                  db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Moving files to Upload dir at the end of the event: ${stdout}`).write()
                })
              } catch (err) {
                db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Error moving files at the end of the event: ${err}`)
              }
            }, 400);
          }
        } else {
          console.log('no data')
        }
      })

    }
  })
}

const killWatchers = () => {
  uploadWatcher.close()
  mediaFolderWatcher.close()
  logWatcher.close()
}

console.log(`\n\r*** New Motion Events Watching on log file: *** \n\r${config.motionlogdir}`)
console.log(`\n\r*** Upload Watching on folder: *** \n\r${config.uploaddir}\n\r`)

exports = module.exports = {
  addFilesWatcherOnAddFile,
  addMediaFilesWatcher,
  addLogWatcher,
  killWatchers,
  fileEmitter
}
