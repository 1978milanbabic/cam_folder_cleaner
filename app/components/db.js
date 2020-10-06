// module dependencies
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const config = require('./config')

const defaultAdapter = new FileSync(config.db)
const defaultDB = low(defaultAdapter)

// Set some defaults (required if your JSON file is empty)
defaultDB.defaults({
  user: {'user1@example.com': '1892eb34'},
  alert_email: 'user1@example.com',
  mail_on_event: false,
  seen_video: []
}).write()

exports = module.exports = defaultDB
