// module dependecies
const config = require('../components/config')
const chokidar = require('chokidar')
const { fileNameChanger } = require('./fileNameConventions')
const EventEmitter = require('events')
const { mediaType } = require('./mediaFilesExtensions')
const fs = require('fs')

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

    if (event !== 'addDir'){
      // refresh medias on FE
      setTimeout(() => {
        fileEmitter.emit('refresh', 'medias')
      }, 400)
    }
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
          setTimeout(() => {
            fileEmitter.emit('refresh', 'motion logs')
          }, 50)

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
