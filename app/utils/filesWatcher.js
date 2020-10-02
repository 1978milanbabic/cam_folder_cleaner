// module dependecies
const config = require('../components/config')
const chokidar = require('chokidar')
const { fileNameChanger } = require('./fileNameConventions')
const EventEmitter = require('events')
const { mediaType } = require('./mediaFilesExtensions')
const { exec } = require('child_process')
const nodemailer = require('nodemailer')

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
    text: `This is where you are going to be alerted on new videos! ${params}` // Plain text body
  }
  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err)
    } else {
      console.log(info)
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
        // send email on new video
        sendMessage(fileName)
      }
    }, 400)
  })
}

// watch motion media folder
let newMotionFilesWatcher
// check if changes of video file stoped
let videoBuildTimeout
let fileMoved = false
// watcher
const addNewMotionFilesWatcher = () => {
  newMotionFilesWatcher = chokidar.watch(config.motionmediadir)
  newMotionFilesWatcher.on('all', (event, path) => {
    console.log(event)
    // file name & file ext
    let fileName = path.split('/')
    fileName = fileName[fileName.length - 1].toString()
    let ext = fileName.split('.')
    ext = ('.' + ext[ext.length -1])
    // build timeout -> in order to wait for changes
    let setBuildTimeout = () => {
      clearTimeout(videoBuildTimeout)
      if (!fileMoved) {
        videoBuildTimeout = setTimeout(() => {
          // move video file
          fileMoved = true
          let cmd = `sudo mv ${path} ${config.uploaddir}`
          exec(cmd, (error, stdout, stderr) => {
            if (error) throw error
            if (stderr) console.log('stderr: ', stderr)
            console.log('stdout: ' + stdout)
          })
        }, 10 * 1000)
      }
    }
    // ignore deletions
    if (event === 'unlink') return
    // on add file
    if (event === 'add') {
      if (mediaType(ext) === 'image') {
        // standard timeout for meta, then move file
        setTimeout(() => {
          // move image
          let cmd = `sudo mv ${path} ${config.uploaddir}`
          exec(cmd, (error, stdout, stderr) => {
            if (error) throw error
            if (stderr) console.log('stderr: ', stderr)
            console.log('stdout: ' + stdout)
          })
        }, 400)
      } else if (mediaType(ext) === 'video') {
        fileMoved = false
        setBuildTimeout()
      } else {
        return
      }
    }
    // on change file -> prolong move video
    if (event === 'change') {
      if (!fileMoved) {
        setTimeout(() => {
          setBuildTimeout()
        }, 400);
      }
    }
  })
}

const killWatchers = () => {
  uploadWatcher.close()
  mediaFolderWatcher.close()
  newMotionFilesWatcher.close()
}

console.log(`\n\r*** New Motion Events Watching on folder: *** \n\r${config.motionmediadir}\n\r`)
console.log(`\n\r*** Upload Watching on folder: *** \n\r${config.uploaddir}\n\r`)

exports = module.exports = { addFilesWatcherOnAddFile, addMediaFilesWatcher, addNewMotionFilesWatcher, killWatchers, fileEmitter }
