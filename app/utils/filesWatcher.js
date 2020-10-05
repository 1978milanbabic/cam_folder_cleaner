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
    to: process.env.RECIPIENT,         // List of recipients
    subject: 'This is test message', // Subject line
    text: `${params} - Alert message on new detection! ` // Plain text body
  }
  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log('mail error: ', err)
    } else {
      console.log('mail status: ', info && info.response)
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
            // starting new event
            // send mail
            // send email on new video
            sendMessage(moment().format('MMMM Do YYYY, h:mm:ss a') + ' --> ')
          }
          // check if in last log event ends
          let eventEnded = lastLog.indexOf('End of event')
          if (eventEnded > -1) {
            // event ended
            // move files to upload dir (standard timeout for meta on files)
            setTimeout(() => {
              console.log('Moving files to upload dir. -> ', `${config.motionmediadir}*.* ${config.uploaddir}`)
              let cmd = `sudo mv ${config.motionmediadir}*.* ${config.uploaddir}`
              exec(cmd, (error, stdout, stderr) => {
                if (error) throw error
                if (stderr) console.log('stderr: ', stderr)
                console.log('stdout: ' + stdout)
              })
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
