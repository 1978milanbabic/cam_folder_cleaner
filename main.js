// dependencies
const server = require('./server')
const socketServer = require('./ws')
const { addFilesWatcherOnAddFile, addMediaFilesWatcher } = require('./app/utils/filesWatcher')

// init server
const port = process.env.HTTP_PORT || 1337
server.listen(port, () => {
  console.log('server is listening on port %s', port)
})
// init WS
socketServer(server)

// init file watchers
addFilesWatcherOnAddFile()
addMediaFilesWatcher()
