// module dependecies
const config = require('../components/config')
const chokidar = require('chokidar')
const { fileNameChanger } = require('./fileNameConventions')
const EventEmitter = require('events')

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
    if (event === 'change') return
    clearTimeout(refreshTimeout)
    refreshTimeout = setTimeout(() => {
      fileEmitter.emit('refresh', 'medias')
    }, 400)
  })
}

const killWatchers = () => {
  uploadWatcher.close()
  mediaFolderWatcher.close()
}

console.log(`\n\r*** Upload Watching on folder: *** \n\r${config.uploaddir}\n\r`)

exports = module.exports = { addFilesWatcherOnAddFile, addMediaFilesWatcher, killWatchers, fileEmitter }
