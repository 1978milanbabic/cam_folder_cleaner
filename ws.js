// dependencies
const socketIO = require('socket.io')
const { fileEmitter } = require('./app/utils/filesWatcher')

const socketServer = serverToBind => {
  const wsServer = socketIO(serverToBind, { 'destroy upgrade': false })
  fileEmitter.on('refresh', refresh => wsServer.emit('refresh', refresh))
  console.log('Socket Server initialized')
  wsServer.on('connection', clientSocket => {
    console.log('Socket Server connected')

    clientSocket.on('refresh', () => {
      wsServer.emit('refresh', 'refresh')
    })
  })

  return wsServer
}

exports = module.exports = socketServer
